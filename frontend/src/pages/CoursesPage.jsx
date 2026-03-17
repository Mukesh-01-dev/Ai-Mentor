import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Star, Bookmark, X, BookOpen, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";

const CoursesPage = () => {
  const { t } = useTranslation();
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

  const [showExploreFilter, setShowExploreFilter] = useState(false);
  const [selectedExploreCategory, setSelectedExploreCategory] = useState("all");

  const exploreCategories = [
  "all",
  ...new Set(exploreCourses.map((course) => course.category))
  ];

  const filteredExploreCourses =
  selectedExploreCategory === "all"
    ? exploreCourses
    : exploreCourses.filter(
        (course) => course.category === selectedExploreCategory
      );

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        const [exploreRes, myRes] = await Promise.all([
          fetch(`/api/courses`),
          fetch(`/api/courses/my-courses`, {
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

      await fetch(`/api/users/purchase-course`, {
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
        fetch(`/api/courses`),
        fetch(`/api/courses/my-courses`, {
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
        className={`flex-1 flex flex-col transition-all duration-300 mt-10 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
        }`}
      >
        {/* ══════ HERO ══════ */}
        <div className="relative overflow-hidden bg-linear-to-br from-teal-700 via-teal-600 to-teal-800 pt-16 pb-12 px-4 sm:px-8">
          {/* grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10 max-w-5xl mx-auto space-y-6">
            {/* Profile photo + name */}
            <div className="flex items-center space-x-5">
              <img
                src={user?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email?.split('@')[0] || 'User')}`}
                alt="Profile"
                className="w-20 h-20 rounded-full border-3 border-white/80 object-cover shadow-lg"
              />
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email?.split('@')[0] || 'User')}
                </h1>
                <p className="text-teal-100 text-sm sm:text-base mt-1">
                  {t("courses.subtitle")}
                </p>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveTab("my-courses")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeTab === "my-courses"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-black/30 text-white hover:bg-black/40"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Enrolled Courses
              </button>
              <button
                onClick={() => setActiveTab("explore")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeTab === "explore"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-black/30 text-white hover:bg-black/40"
                }`}
              >
                <Search className="w-4 h-4" />
                {t("courses.explore")}
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-10">

            {/* ================= MY COURSES ================= */}
            {activeTab === "my-courses" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {myCourses.length === 0 && (
                  <p className="text-slate-500 col-span-full text-center">
                    {t("courses.not_enrolled")}
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
                          {hasStarted ? t("common.continue_learning") : t("common.start_learning")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= EXPLORE COURSES ================= */}
          {activeTab === "explore" && (
              <div className="space-y-6">

                  {/* FILTER BUTTON */}
                  <div className="relative flex justify-end text-slate-500">
                    <button
                      type="button"
                      onClick={() => setShowExploreFilter(!showExploreFilter)}
                      aria-label="Toggle explore filters"
                      aria-expanded={showExploreFilter}
                      aria-controls="explore-filter-menu"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-slate-500 cursor-pointer hover:text-teal-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4h18l-7 8v6l-4 2v-8L3 4z"
                        />
                      </svg>
                    </button>

                    {showExploreFilter && (
                      <div
                        id="explore-filter-menu"
                        className="absolute right-0 mt-10 bg-white border rounded-lg shadow-xl p-2 z-50 min-w-[150px]"
                      >
                        {exploreCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedExploreCategory(cat);
                              setShowExploreFilter(false);
                            }}
                            className={`block w-full text-left px-4 py-2 rounded hover:bg-teal-500 hover:text-white capitalize ${
                              selectedExploreCategory === cat
                                ? "font-bold text-teal-600"
                                : ""
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* COURSE GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {(() => {
                      const visibleExploreCourses = filteredExploreCourses.filter(
                        (course) => !myCourses.some((c) => c.id === course.id)
                      );

                      if (visibleExploreCourses.length === 0) {
                        return (
                          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-slate-500">
                            <p className="mb-4 text-sm">
                              No courses found for this category.
                            </p>
                            <button
                              type="button"
                              onClick={() => setSelectedExploreCategory(exploreCategories[0])}
                              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#2DD4BF] text-white"
                            >
                              Reset filters
                            </button>
                          </div>
                        );
                      }

                      return visibleExploreCourses.map((course) => (
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
                            <h3 className="text-sm font-semibold">{course.title}</h3>

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
                                onClick={() => navigate(`/course-preview/${course.id}`)}
                                className="px-4 py-2 rounded-lg bg-[#2DD4BF] text-white text-xs font-semibold"
                              >
                                {t("common.enroll")}
                              </button>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
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
              {t("courses.confirm_enrollment")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
