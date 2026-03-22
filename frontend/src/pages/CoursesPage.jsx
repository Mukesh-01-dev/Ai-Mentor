import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Star, Bookmark, X, BookOpen, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../lib/api";
import { useTranslation } from "react-i18next";

const CoursesPage = () => {
  const { t } = useTranslation();
  const { sidebarCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState("my-courses");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [exploreCourses, setExploreCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);

  const [showExploreFilter, setShowExploreFilter] = useState(false);
  const [selectedExploreCategory, setSelectedExploreCategory] = useState("all");

  const exploreCategories = [
    "all",
    ...new Set(exploreCourses.map((course) => course.category)),
  ];

  const filteredExploreCourses =
    selectedExploreCategory === "all"
      ? exploreCourses
      : exploreCourses.filter(
          (course) => course.category === selectedExploreCategory
        );

  const filteredCourses = exploreCourses.filter(
    (course) => !myCourses.some((c) => c.id === course.id)
  );

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");

      const [exploreRes, myRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/courses`),
        fetch(`${API_BASE_URL}/api/courses/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setExploreCourses(await exploreRes.json());
      setMyCourses(myRes.ok ? await myRes.json() : []);
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (location?.state?.activeTab === "explore") {
      setActiveTab("explore");
    }
  }, [location]);

  if (!user)
    return <h1 className="text-center mt-20 text-main">Please Login</h1>;

  return (
    <div className="min-h-screen bg-canvas-alt flex flex-col">
      <Header />
      <Sidebar activePage="courses" />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 mt-10 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
        }`}
      >
        {/* HERO */}
        <div className="relative overflow-hidden bg-linear-to-br from-teal-700 via-teal-600 to-teal-800 pt-16 pb-12 px-4 sm:px-8">
          <div className="relative z-10 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center space-x-5">
              <img
                src={
                  user?.avatar_url ||
                  `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
                    user?.name ||
                      user?.email?.split("@")[0] ||
                      "User"
                  )}`
                }
                alt="Profile"
                className="w-20 h-20 rounded-full border-3 border-white/80 object-cover shadow-lg"
              />
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {user?.name || user?.email?.split("@")[0]}
                </h1>
                <p className="text-teal-100 mt-1">
                  {t("courses.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveTab("my-courses")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold ${
                  activeTab === "my-courses"
                    ? "bg-indigo-600 text-white"
                    : "bg-black/30 text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Enrolled Courses
              </button>

              <button
                onClick={() => setActiveTab("explore")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold ${
                  activeTab === "explore"
                    ? "bg-indigo-600 text-white"
                    : "bg-black/30 text-white"
                }`}
              >
                <Search className="w-4 h-4" />
                {t("courses.explore")}
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 p-8">
          {/* MY COURSES */}
          {activeTab === "my-courses" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {myCourses.length === 0 && (
                <p className="text-slate-500 col-span-full text-center">
                  {t("courses.not_enrolled")}
                </p>
              )}

              {myCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow"
                >
                  <img
                    src={course.image}
                    className="h-44 w-full object-cover"
                    alt=""
                  />
                  <div className="p-5">
                    <h3 className="font-semibold">{course.title}</h3>
                    <button
                      onClick={() =>
                        navigate(`/learning/${course.id}`)
                      }
                      className="mt-4 w-full py-2 rounded-lg bg-[#2DD4BF] text-white"
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EXPLORE */}
          {activeTab === "explore" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow"
                >
                  <img
                    src={course.image}
                    className="h-44 w-full object-cover"
                    alt=""
                  />
                  <div className="p-5">
                    <h3 className="font-semibold">{course.title}</h3>
                    <button
                      onClick={() =>
                        navigate(`/course-preview/${course.id}`)
                      }
                      className="mt-4 w-full py-2 rounded-lg bg-[#2DD4BF] text-white"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursesPage;