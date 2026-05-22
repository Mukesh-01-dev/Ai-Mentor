//Install k6 globally using npm: npm install -g k6
/**Run the test with : k6 run --env BACKEND_URL=http://localhost:5001 `
  --env TEST_USER_EMAIL=your_email@example.com `
  --env TEST_USER_PASSWORD=your_password `
  loadtest_script_v2.js
  **/

//Or download from https://k6.io/docs/getting-started/installation msi for Windows in Program Files
/**Run the test with : & "C:\Program Files\k6\k6.exe" run --env BACKEND_URL=http://localhost:5000 `
  --env TEST_USER_EMAIL=your_email@example.com `
  --env TEST_USER_PASSWORD=your_password `
  loadtest_script_v2.js**/
/* global __ENV */
import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
    thresholds: {
        http_req_failed: ['rate<0.01'], 
        http_req_duration: ['p(95)<1500'], 
    },
    stages: [
        { duration: '1m', target: 20 },   // Warm up
        { duration: '1m', target: 100 },  // Ramp up to Max 100 VUs
        { duration: '2m', target: 100 },  // Hold peak load
        { duration: '1m', target: 0 },    // Cool down
    ],
};

const BACKEND_URL = __ENV.BACKEND_URL || 'http://localhost:5000';
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'testuser@example.com';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'testpass123';

let authToken = '';

export function setup() {
    const loginPayload = JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
    });

    const loginParams = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const loginRes = http.post(`${BACKEND_URL}/api/auth/login`, loginPayload, loginParams);
    
    if (loginRes.status === 200) {
        const loginData = JSON.parse(loginRes.body);
        authToken = loginData.token;
        console.log('Setup complete: Token acquired');
        return { token: authToken };
    } else {
        console.error('Setup failed: Could not authenticate');
        return { token: null };
    }
}

export default function (data) {
    const token = data.token;
    if (!token) {
        console.warn('No token available, skipping tests');
        return;
    }
    
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    // 1. GET USER PROFILE
    let profileRes = http.get(`${BACKEND_URL}/api/users/profile`, params);
    check(profileRes, { 'Profile status is 200': (r) => r.status === 200 });
    sleep(1);

    // 2. GET ALL COURSES (public)
    let coursesRes = http.get(`${BACKEND_URL}/api/courses`, params);
    let courseId = null;
    if (check(coursesRes, { 'Get courses status is 200': (r) => r.status === 200 })) {
        try {
            const coursesData = JSON.parse(coursesRes.body);
            if (Array.isArray(coursesData) && coursesData.length > 0) {
                courseId = coursesData[0].id || coursesData[0]._id;
            }
        } catch (e) {
            console.warn('Failed to parse courses response',e);
        }
    }
    sleep(1);

    // 3. GET MY COURSES (protected)
    let myCoursesRes = http.get(`${BACKEND_URL}/api/courses/my-courses`, params);
    check(myCoursesRes, { 'Get my courses status is 200': (r) => r.status === 200 });
    sleep(1);

    // 4. GET STATS CARDS (protected)
    let statsRes = http.get(`${BACKEND_URL}/api/courses/stats/cards`, params);
    check(statsRes, { 'Stats cards status is 200': (r) => r.status === 200 });
    sleep(1);

    // 5. GET USER SETTINGS (protected)
    let settingsRes = http.get(`${BACKEND_URL}/api/users/settings`, params);
    check(settingsRes, { 'User settings status is 200': (r) => r.status === 200 });
    sleep(1);

    // 6. GET PREFERENCES (protected)
    let preferencesRes = http.get(`${BACKEND_URL}/api/preferences`, params);
    check(preferencesRes, { 'Preferences status is 200': (r) => r.status === 200 });
    sleep(1);

    // 7. GET COMMUNITY - COURSE STATS (protected)
    let communityStatsRes = http.get(`${BACKEND_URL}/api/community/courses`, params);
    check(communityStatsRes, { 'Community stats status is 200': (r) => r.status === 200 });
    sleep(1);

    // 8. GET COMMUNITY - GLOBAL DISCUSSIONS (protected)
    let globalCommunityRes = http.get(`${BACKEND_URL}/api/community/global`, params);
    check(globalCommunityRes, { 'Global community status is 200': (r) => r.status === 200 });
    sleep(1);

    // 9. GET COMMUNITY - COURSE POSTS (protected)
    let coursePostsRes = http.get(`${BACKEND_URL}/api/community/course-posts`, params);
    check(coursePostsRes, { 'Community course posts status is 200': (r) => r.status === 200 });
    sleep(1);

    // 10. PURCHASE COURSE (protected) - Only if we have a valid course ID
    if (courseId) {
        let purchasePayload = JSON.stringify({ courseId: courseId });
        let purchaseRes = http.post(`${BACKEND_URL}/api/users/purchase-course`, purchasePayload, params);
        check(purchaseRes, { 
            'Purchase course status is 200/201/400/409': (r) => r.status === 200 || r.status === 201 || r.status === 400 || r.status === 409
        });
        sleep(2);
    } else {
        console.warn('No valid course ID found, skipping purchase test');
    }

    // 11. GET WATCHED VIDEOS (protected)
    let watchedVideosRes = http.get(`${BACKEND_URL}/api/users/watched-videos`, params);
    check(watchedVideosRes, { 'Watched videos status is 200': (r) => r.status === 200 });
    sleep(1);
}