import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../lib/api";
import { useTranslation } from "react-i18next";

const CoursesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [activeTab, setActiveTab] = useState("my-courses");
  const [exploreCourses, setExploreCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showEnrollPopup, setShowEnrollPopup] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        const [exploreRes, myRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/courses`),
          fetch(`${API_BASE_URL}/api/courses/my-courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const exploreData = await exploreRes.json();
        const myData = myRes.ok ? await myRes.json() : [];

        setExploreCourses(exploreData);
        setMyCourses(myData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <p className="text-gray-500">Loading courses...</p>
      </div>
    );
  }

  /* ================= FILTER ================= */
  const filteredMyCourses = myCourses
    .filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5); // ✅ ONLY 5 MY COURSES

  const filteredExploreCourses = exploreCourses
    .filter((c) => !myCourses.some((mc) => mc.id === c.id))
    .filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 10); // ✅ ONLY 10 EXPLORE COURSES

  return (
    <div className="w-full px-6">

      {/* ================= HERO ================= */}
      <div className="bg-teal-700 text-white p-6 rounded-xl w-full">
        <h1 className="text-3xl font-bold">
          {user?.name || "User"}
        </h1>

        <p className="text-sm opacity-80">
          {t("courses.subtitle")}
        </p>

        {/* Tabs + Search */}
        <div className="flex flex-wrap gap-3 mt-4 items-center">

          <button
            onClick={() => setActiveTab("my-courses")}
            className={`px-4 py-2 rounded ${
              activeTab === "my-courses"
                ? "bg-indigo-600"
                : "bg-black/30"
            }`}
          >
            My Courses
          </button>

          <button
            onClick={() => setActiveTab("explore")}
            className={`px-4 py-2 rounded ${
              activeTab === "explore"
                ? "bg-indigo-600"
                : "bg-black/30"
            }`}
          >
            Explore
          </button>

          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-auto px-3 py-2 rounded text-black w-64"
          />
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <main className="mt-6 w-full">

        {/* ===== MY COURSES ===== */}
        {activeTab === "my-courses" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">

            {filteredMyCourses.length === 0 && (
              <div className="col-span-full text-center py-10">
                <h2>No Courses Found</h2>
                <button
                  onClick={() => setActiveTab("explore")}
                  className="mt-3 bg-teal-500 text-white px-4 py-2 rounded"
                >
                  Explore Courses
                </button>
              </div>
            )}

            {filteredMyCourses.map((course) => (
              <div
                key={course.id}
                className="border rounded-xl overflow-hidden bg-white"
              >
                <img
                  src={course.image}
                  className="h-40 w-full object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold">
                    {course.title}
                  </h3>

                  <button
                    onClick={() =>
                      navigate(`/learning/${course.id}`)
                    }
                    className="mt-3 w-full bg-teal-500 text-white py-2 rounded"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== EXPLORE ===== */}
        {activeTab === "explore" && (
          <div className="w-full">

            <div className="mb-4">
              <h2 className="text-xl font-bold">
                Explore Courses
              </h2>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-2 w-full"
            >
              {filteredExploreCourses.map((course) => (
                <div
                  key={course.id}
                  className="w-64 flex-shrink-0 border rounded-xl bg-white"
                >
                  <img
                    src={course.image}
                    className="h-40 w-full object-cover"
                  />

                  <div className="p-3">
                    <h3 className="text-sm font-semibold">
                      {course.title}
                    </h3>

                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowEnrollPopup(true);
                      }}
                      className="mt-2 w-full bg-teal-500 text-white py-1 rounded"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================= POPUP ================= */}
      {showEnrollPopup && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-80">
            <h2 className="font-bold">
              {selectedCourse.title}
            </h2>

            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full">
              Confirm Enroll
            </button>

            <button
              onClick={() => setShowEnrollPopup(false)}
              className="mt-2 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;