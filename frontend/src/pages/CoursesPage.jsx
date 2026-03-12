import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Star, Bookmark, X, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../lib/api";

const CoursesPage = () => {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } =
    useSidebar();
  const [activeTab, setActiveTab] = useState("my-courses");
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [exploreCourses, setExploreCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEnrollPopup, setShowEnrollPopup] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        const [exploreRes, myRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/courses`),
          fetch(`${API_BASE_URL}/api/courses/my-courses`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const exploreData = await exploreRes.json();
        const myData = myRes.ok ? await myRes.json() : [];

        setExploreCourses(exploreData);
        setMyCourses(myData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // If navigated here with state (e.g. from Dashboard), apply requested tab
  const location = useLocation();
  useEffect(() => {
    if (location?.state?.activeTab === "explore") {
      setActiveTab("explore");
    }
  }, [location]);

  /* ================= ENROLL ================= */
  const handleEnroll = async () => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE_URL}/api/users/purchase-course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          courseTitle: selectedCourse.title,
        }),
      });

      const [exploreRes, myRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/courses`),
        fetch(`${API_BASE_URL}/api/courses/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setExploreCourses(await exploreRes.json());
      setMyCourses(await myRes.json());

      setShowEnrollPopup(false);
      setSelectedCourse(null);
      setActiveTab("my-courses");
    } catch (error) {
      console.error("Enroll error:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-canvas-alt flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-main mb-4">Please Login</h1>
          <p className="text-muted">
            You need to be logged in to access the courses page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-alt flex flex-col">
      <Header />

      <Sidebar activePage="courses" />

      <div
        className={`flex-1 transition-all duration-500 ease-in-out ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
        }`}
      >
        <main className="mt-[4.5rem] p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-10">
            {/* HEADER */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-main uppercase tracking-tight">Learning Hub</h1>
              <p className="text-xs sm:text-sm text-muted font-bold opacity-60 uppercase tracking-widest">
                Discover and continue your learning journey
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-card rounded-2xl p-1.5 inline-flex border border-border/50 shadow-sm w-full sm:w-auto overflow-hidden">
              <button
                onClick={() => setActiveTab("my-courses")}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "my-courses"
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                    : "text-muted hover:bg-canvas-alt"
                }`}
              >
                My Courses
              </button>
              <button
                onClick={() => setActiveTab("explore")}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "explore"
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                    : "text-muted hover:bg-canvas-alt"
                }`}
              >
                Explore
              </button>
            </div>

            {/* ================= MY COURSES ================= */}
            {activeTab === "my-courses" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
                {myCourses.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <div className="inline-flex p-6 rounded-full bg-canvas-alt text-muted mb-4">
                      <BookOpen className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">
                      You have not enrolled in any courses yet.
                    </p>
                    <button 
                      onClick={() => setActiveTab("explore")}
                      className="mt-6 px-8 py-3 bg-teal-500 text-white text-[11px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all"
                    >
                      Explore Courses
                    </button>
                  </div>
                )}

                {myCourses.map((course) => {
                  const purchasedEntry = user?.purchasedCourses?.find(
                    (c) => Number(c.courseId) === Number(course.id)
                  );
                  const progress = purchasedEntry?.progress;
                  const hasStarted =
                    (progress?.completedLessons?.length > 0) ||
                    (progress?.currentLesson != null);

                  return (
                    <div
                      key={course.id}
                      className="group bg-card rounded-[2.5rem] border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.image}
                          alt=""
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      <div className="p-6 sm:p-8 space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-black text-main uppercase tracking-tight group-hover:text-teal-500 transition-colors line-clamp-1">
                            {course.title}
                          </h3>
                          <p className="text-[10px] text-muted font-bold uppercase tracking-widest opacity-60">{course.lessons} Lessons</p>
                        </div>

                        <button
                          onClick={() => navigate(`/learning/${course.id}`)}
                          className="w-full py-4 rounded-2xl bg-teal-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 hover:-translate-y-1 transition-all"
                        >
                          {hasStarted ? "Continue Learning" : "Start Learning"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= EXPLORE COURSES ================= */}
            {activeTab === "explore" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
                {exploreCourses
                  .filter(
                    (course) => !myCourses.some((c) => Number(c.id) === Number(course.id))
                  )
                  .map((course) => (
                    <div
                      key={course.id}
                      className="group bg-card rounded-[2.5rem] border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt=""
                        />
                        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-xl border border-border/50">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      <div className="p-6 sm:p-8 space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-black text-main uppercase tracking-tight group-hover:text-teal-500 transition-colors line-clamp-1">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-3 text-[10px] text-muted font-bold uppercase tracking-widest opacity-60">
                            <span>{course.lessons} Lessons</span>
                            <span className="w-1 h-1 rounded-full bg-muted/40" />
                            <span>{course.level}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted font-bold line-through uppercase tracking-tighter opacity-50">
                              {course.price}
                            </span>
                            <span className="text-xl font-black text-green-600 leading-none">FREE</span>
                          </div>

                          <button
                            onClick={() => navigate(`/course-preview/${course.id}`)}
                            className="px-6 py-3 rounded-xl bg-teal-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all"
                          >
                            Enroll
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ================= ENROLL POPUP ================= */}
      {showEnrollPopup && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
            <button
              onClick={() => setShowEnrollPopup(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <img
              src={selectedCourse.image}
              alt={selectedCourse.title}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />

            <h2 className="text-xl font-bold">{selectedCourse.title}</h2>

            <p className="text-sm text-slate-500 mt-1">
              {selectedCourse.category} • {selectedCourse.level}
            </p>

            <div className="flex justify-between items-center mt-4">
              <span className="line-through text-slate-400">
                {selectedCourse.price}
              </span>
              <span className="text-lg font-bold text-green-600">₹0</span>
            </div>

            <button
              onClick={handleEnroll}
              className="w-full mt-6 py-3 rounded-xl bg-[#2DD4BF] text-white font-semibold"
            >
              Confirm Enrollment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
