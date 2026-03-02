import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Star, Bookmark, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../lib/api";

const CoursesPage = () => {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useSidebar();
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
          <h1 className="text-2xl font-bold text-main mb-4">
            Please Login
          </h1>
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
        className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
          }`}
      >
        <main className="mt-16 p-8">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* HEADER */}
            <div>
              <h1 className="text-3xl font-bold text-main">
                Learning Hub
              </h1>
              <p className="text-muted mt-1">
                Discover and continue your learning journey
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-card rounded-xl p-2 inline-flex border border-border shadow-sm">
              <button
                onClick={() => setActiveTab("my-courses")}
                className={`px-6 py-2 rounded-lg font-semibold ${activeTab === "my-courses"
                    ? "bg-[#2DD4BF] text-white shadow"
                    : "text-muted"
                  }`}
              >
                My Courses
              </button>
              <button
                onClick={() => setActiveTab("explore")}
                className={`px-6 py-2 rounded-lg font-semibold ${activeTab === "explore"
                    ? "bg-[#2DD4BF] text-white shadow"
                    : "text-muted"
                  }`}
              >
                Explore Courses
              </button>
            </div>

            {/* ================= MY COURSES ================= */}
            {activeTab === "my-courses" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {myCourses.length === 0 && (
                  <p className="text-slate-500">
                    You have not enrolled in any courses yet.
                  </p>
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
                      className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm"
                    >
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-40 w-full object-cover"
                      />

                      <div className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-main">
                          {course.title}
                        </h3>

                        <p className="text-sm text-slate-400">{course.lessons}</p>

                        <button
                          onClick={() => navigate(`/learning/${course.id}`)}
                          className="w-full py-3 rounded-xl bg-[#2DD4BF] text-white font-semibold"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {exploreCourses
                  .filter(
                    (course) => !myCourses.some((c) => c.id === course.id)
                  )
                  .map((course) => (
                    <div
                      key={course.id}
                      className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm"
                    >
                      <div className="relative h-40">
                        <img
                          src={course.image}
                          className="w-full h-full object-cover"
                          alt={course.title}
                        />
                        <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {course.rating}
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <h3 className="text-sm font-semibold">
                          {course.title}
                        </h3>

                        <p className="text-xs text-muted">
                          {course.lessons} lessons • {course.level}
                        </p>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="line-through text-sm text-slate-400 mr-2">
                              {course.price}
                            </span>
                            <span className="font-bold text-green-600">₹0</span>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowEnrollPopup(true);
                            }}
                            className="px-4 py-2 rounded-lg bg-[#2DD4BF] text-white text-xs font-semibold"
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
