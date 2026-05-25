import uuid
import base64
import json
import queue
import random
from locust import HttpUser, task, between, LoadTestShape
# Initialize a global pool of pre-seeded user indices (1 to 100)
user_pool = queue.Queue()
for i in range(1, 101):
    user_pool.put(i)
class APIUser(HttpUser):
    """
    Simulates a virtual user performing full operations:
    authentication, catalog browsing, progress tracking, 
    PDF certificate generation, community forum discussions,
    analytics logging, preferences management, notifications checking,
    sending support/feedback messages, sidebar navigation loading,
    purchased course listings, study stats checks, and course details fetching.
    """
    wait_time = between(1, 3)
    def on_start(self):
        """
        Runs when a simulated user starts.
        Pulls a pre-seeded user from the pool and logs in to get a JWT.
        """
        self.user_idx = None
        self.popped_from_pool = False
        
        try:
            self.user_idx = user_pool.get_nowait()
            self.popped_from_pool = True
        except queue.Empty:
            # Fallback if concurrent virtual users exceed the pre-seeded pool size
            self.user_idx = random.randint(1, 100)
            self.popped_from_pool = False
        self.username = f"loadtest_{self.user_idx}"
        self.email = f"{self.username}@uptoskills.com"
        self.password = "Password123!"
        self.token = None
        self.created_posts = []
        # 1. Login the pre-seeded user to get JWT token
        login_payload = {
            "email": self.email,
            "password": self.password
        }
        
        with self.client.post(
            "/api/users/login", 
            json=login_payload, 
            name="Setup: Login Pre-Seeded User", 
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("token")
                # Attach token to headers for subsequent authenticated requests
                self.client.headers.update({"Authorization": f"Bearer {self.token}"})
                response.success()
            else:
                response.failure(f"Failed to login pre-seeded user {self.email}: {response.text}")
                return
    def on_stop(self):
        """
        Runs when the simulated user finishes.
        Clears created community posts and returns the user to the pool.
        """
        # Cleanup: Delete any posts created by this user that haven't been deleted yet
        if self.token:
            for post_id in self.created_posts:
                self.client.delete(
                    f"/api/community/{post_id}", 
                    name="Cleanup: Delete Temporary Post",
                    headers={"Authorization": f"Bearer {self.token}"}
                )
            
        # Put the index back into the pool so other virtual users can reuse it
        if hasattr(self, 'popped_from_pool') and self.popped_from_pool and self.user_idx:
            user_pool.put(self.user_idx)
    # --- BASELINE ROUTING & READS ---
    @task(2)
    def test_healthcheck(self):
        """Baseline routing speed (health check)."""
        self.client.get("/", name="GET / (Health Check)")
    @task(3)
    def test_get_courses(self):
        """Baseline Database reads (loading catalog)."""
        self.client.get("/api/courses", name="GET /api/courses (Catalog Read)")
    # --- PHASE 2 AUTHENTICATION & SESSIONS ---
    @task(2)
    def test_login(self):
        """Benchmarks POST /api/users/login (CPU-bound bcrypt)."""
        login_payload = {
            "email": self.email,
            "password": self.password
        }
        self.client.post("/api/users/login", json=login_payload, name="POST /api/users/login (Auth Hashing)")
    @task(2)
    def test_google_login(self):
        """Benchmarks POST /api/auth/google-login (Firebase/Google Token decode)."""
        payload = {
            "sub": f"google_{self.username}",
            "email": self.email,
            "name": "Google Test User",
            "given_name": "Google",
            "family_name": "Test User",
            "picture": "https://lh3.googleusercontent.com/a/default-user"
        }
        payload_bytes = json.dumps(payload).encode('utf-8')
        payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode('utf-8').rstrip('=')
        id_token = f"eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.{payload_b64}.signature"
        
        self.client.post(
            "/api/auth/google-login", 
            json={"idToken": id_token}, 
            name="POST /api/auth/google-login (Firebase JWT)"
        )
    @task(4)
    def test_get_profile(self):
        """Benchmarks GET /api/users/profile."""
        if self.token:
            self.client.get("/api/users/profile", name="GET /api/users/profile (Session Check)")
    @task(3)
    def test_update_progress(self):
        """Benchmarks PUT /api/users/course-progress (Sequelize JSON writes)."""
        if self.token:
            progress_payload = {
                "courseId": 1,
                "currentLesson": {
                    "lessonId": "lesson-1"
                },
                "completedLesson": {
                    "lessonId": "lesson-1"
                }
            }
            self.client.put("/api/users/course-progress", json=progress_payload, name="PUT /api/users/course-progress (DB Write)")
    # --- PHASE 3 FILE UPLOAD & PDF DOWNLOAD ---
    @task(1)
    def test_download_certificate(self):
        """Benchmarks GET /api/certificate/generate."""
        if self.token:
            self.client.get("/api/certificate/generate?courseId=1", name="GET /api/certificate/generate (PDF Download)")
    @task(2)
    def test_get_certificates_list(self):
        """Benchmarks fetching user certificate completion stats."""
        if self.token:
            self.client.get("/api/certificate/list", name="GET /api/certificate/list (Certificate Stats)")
    # --- PHASE 5 EXPANDED ROUTE COVERAGE ---
    # 1. Community Forum Tasks
    @task(3)
    def test_get_global_community(self):
        """Benchmarks fetching global discussions feed."""
        if self.token:
            self.client.get("/api/community/global", name="GET /api/community/global (Forum Feed)")
    @task(2)
    def test_get_course_community(self):
        """Benchmarks fetching course-specific community feed."""
        if self.token:
            self.client.get("/api/community/course/1", name="GET /api/community/course/1 (Course Forum)")
    @task(1)
    def test_create_and_manage_post(self):
        """Benchmarks creating, replying to, liking, and deleting a community post."""
        if self.token:
            # Create a post
            post_payload = {
                "type": "global",
                "category": "General",
                "content": f"Automated load testing community post: {uuid.uuid4().hex}"
            }
            with self.client.post(
                "/api/community", 
                json=post_payload, 
                name="POST /api/community (Create Post)",
                catch_response=True
            ) as response:
                if response.status_code == 201:
                    post_data = response.json()
                    post_id = post_data.get("id")
                    if post_id:
                        self.created_posts.append(post_id)
                        response.success()
                        
                        # Add a reply
                        reply_payload = {"text": "Load testing reply text."}
                        self.client.post(
                            f"/api/community/{post_id}/reply", 
                            json=reply_payload, 
                            name="POST /api/community/:id/reply (Reply)"
                        )
                        
                        # Like the post
                        self.client.put(
                            f"/api/community/{post_id}/like", 
                            json={}, 
                            name="PUT /api/community/:id/like (Like)"
                        )
                        
                        # Dislike the post
                        self.client.put(
                            f"/api/community/{post_id}/dislike", 
                            json={}, 
                            name="PUT /api/community/:id/dislike (Dislike)"
                        )
                        
                        # Delete the post to check direct delete endpoints under load
                        self.client.delete(
                            f"/api/community/{post_id}", 
                            name="DELETE /api/community/:id (Delete Post)"
                        )
                        self.created_posts.remove(post_id)
                else:
                    response.failure(f"Failed to create community post: {response.text}")
    # 2. Preferences Tasks
    @task(2)
    def test_get_preferences(self):
        """Benchmarks fetching user study preferences."""
        if self.token:
            self.client.get("/api/preferences", name="GET /api/preferences (Read Preferences)")
    @task(1)
    def test_update_preferences(self):
        """Benchmarks updating user study preferences."""
        if self.token:
            pref_payload = {
                "explanation_type": "Practical",
                "learning_style": "Active",
                "teaching_pace": "Medium",
                "example_type": "Code-focused",
                "focus_area": "Full-Stack Development"
            }
            self.client.put("/api/preferences", json=pref_payload, name="PUT /api/preferences (Write Preferences)")
    # 3. Analytics Tasks
    @task(2)
    def test_get_analytics(self):
        """Benchmarks fetching user learning analytics dashboard metrics."""
        if self.token:
            self.client.get("/api/analytics", name="GET /api/analytics (Read Analytics)")
    @task(1)
    def test_record_study_session(self):
        """Benchmarks recording study hours in database."""
        if self.token:
            session_payload = {
                "hours": 1.5
            }
            self.client.post("/api/analytics/study-session", json=session_payload, name="POST /api/analytics/study-session (DB Write)")
    # 4. Notifications Tasks
    @task(2)
    def test_get_unread_notifications_count(self):
        """Benchmarks getting unread notifications badge count."""
        if self.token:
            self.client.get("/api/notifications/unread-count", name="GET /api/notifications/unread-count (Read Badge)")
    @task(2)
    def test_get_notifications(self):
        """Benchmarks retrieving full notification logs."""
        if self.token:
            self.client.get("/api/notifications", name="GET /api/notifications (Read Alerts)")
    # 5. Public Contact/Support & Course Feedback Tasks
    @task(1)
    def test_submit_contact_form(self):
        """Benchmarks submitting public contact query form (No Auth required)."""
        contact_payload = {
            "email": self.email,
            "subject": "Load test support ticket",
            "message": "This is an automated support query message of ten characters or more."
        }
        self.client.post("/api/contactus", json=contact_payload, name="POST /api/contactus (Support Form)")
    @task(1)
    def test_submit_course_report(self):
        """Benchmarks filing course feedback error report."""
        if self.token:
            report_payload = {
                "reportType": "Content Error",
                "subType": "Typo in lesson description",
                "description": "Found a typo on lesson 3 of course 1 during load testing.",
                "courseName": "Load Test Course",
                "email": self.email,
                "phone": "9999999999"
            }
            self.client.post("/api/coures-reports", json=report_payload, name="POST /api/coures-reports (Report Issue)")
    # 6. Sidebar & Course Details Navigation (Real-World UI Simulation)
    @task(3)
    def test_get_sidebar_navigation(self):
        """Benchmarks loading sidebar menu item configuration."""
        if self.token:
            self.client.get("/api/sidebar/navigation", name="GET /api/sidebar/navigation (Sidebar Load)")
    @task(3)
    def test_get_my_courses(self):
        """Benchmarks fetching user's purchased enrolled courses list."""
        if self.token:
            self.client.get("/api/courses/my-courses", name="GET /api/courses/my-courses (My Courses)")
    @task(3)
    def test_get_stats_cards(self):
        """Benchmarks loading study dashboard progress widgets."""
        if self.token:
            self.client.get("/api/courses/stats/cards", name="GET /api/courses/stats/cards (Stats Cards)")
    @task(3)
    def test_get_course_learning_details(self):
        """Benchmarks loading active course dashboard learning data (modules & lessons list)."""
        self.client.get("/api/courses/1/learning", name="GET /api/courses/:id/learning (Learn Modules)")
    @task(3)
    def test_get_course_detail(self):
        """Benchmarks fetching public details page for a specific course ID."""
        self.client.get("/api/courses/1", name="GET /api/courses/:id (Course Detail Page)")
    @task(2)
    def test_get_watched_videos(self):
        """Benchmarks retrieving user's video playback watch history logs."""
        if self.token:
            self.client.get("/api/users/watched-videos", name="GET /api/users/watched-videos (Watch Logs)")
