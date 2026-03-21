import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Star } from "lucide-react";
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

  const [exploreCourses, setExploreCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);

  const location = useLocation();

  // Filter courses (not already enrolled)
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
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
        }`}
      >
        <main className="mt-16 p-8">

          {/* 💚 GREEN HEADER */}
          <div className="bg-gradient-to-r from-[#2DD4BF] to-[#22c55e] rounded-2xl p-6 shadow-lg mb-10 text-white">
            <h1 className="text-3xl font-bold">
              {t("courses.title")}
            </h1>
            <p className="mt-1 opacity-90">
              {t("courses.subtitle")}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("my-courses")}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                activeTab === "my-courses"
                  ? "bg-[#2DD4BF] text-white shadow"
                  : "bg-card text-muted border border-border hover:shadow-sm"
              }`}
            >
              {t("courses.my_courses")}
            </button>

            <button
              onClick={() => setActiveTab("explore")}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                activeTab === "explore"
                  ? "bg-[#2DD4BF] text-white shadow"
                  : "bg-card text-muted border border-border hover:shadow-sm"
              }`}
            >
              {t("courses.explore")}
            </button>
          </div>

          {/* ================= MY COURSES ================= */}
          {activeTab === "my-courses" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* EMPTY */}
              {myCourses.length === 0 && (
                <div className="col-span-full bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
                  <div className="text-4xl mb-3">📘</div>
                  <h2 className="text-xl font-semibold text-main">
                    No enrolled courses
                  </h2>
                  <p className="text-muted mt-2">
                    Start learning by exploring courses!
                  </p>
                </div>
              )}

              {/* CARDS */}
              {myCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300"
                >
                  <img
                    src={course.image}
                    className="h-44 w-full object-cover"
                    alt=""
                  />

                  <div className="p-5">
                    <h3 className="font-semibold text-main">
                      {course.title}
                    </h3>

                    <p className="text-sm text-muted mt-1">
                      {course.lessons}
                    </p>

                    <button
                      onClick={() => navigate(`/learning/${course.id}`)}
                      className="mt-4 w-full py-2 rounded-lg bg-[#2DD4BF] text-white font-semibold hover:opacity-90"
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= EXPLORE ================= */}
          {activeTab === "explore" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {/* EMPTY */}
              {filteredCourses.length === 0 ? (
                <div className="col-span-full bg-card border border-border p-10 rounded-2xl text-center shadow-sm">
                  <div className="text-5xl mb-4">📚</div>
                  <h2 className="text-xl font-semibold text-main">
                    No Courses Available
                  </h2>
                  <p className="text-muted mt-2">
                    Please check back later.
                  </p>
                </div>
              ) : (

                /* CARDS */
                filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300"
                  >
                    <div className="relative">
                      <img
                        src={course.image}
                        className="h-44 w-full object-cover"
                        alt=""
                      />

                      <div className="absolute top-3 right-3 bg-card px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {course.rating}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-main">
                        {course.title}
                      </h3>

                      <p className="text-sm text-muted mt-1">
                        {course.lessons} • {course.level}
                      </p>

                      <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-green-600">
                          Free
                        </span>

                        <button
                          onClick={() =>
                            navigate(`/course-preview/${course.id}`)
                          }
                          className="px-4 py-2 bg-[#2DD4BF] text-white rounded-lg text-sm hover:opacity-90"
                        >
                          Enroll
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default CoursesPage;