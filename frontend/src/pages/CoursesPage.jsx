import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";
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

  /* ================= NORMALIZE ================= */

  const normalize = (res) => {
    if (Array.isArray(res)) return res;

    if (res?.data && Array.isArray(res.data)) {
      return res.data;
    }

    if (res?.courses && Array.isArray(res.courses)) {
      return res.courses;
    }

    if (res?.data?.courses && Array.isArray(res.data.courses)) {
      return res.data.courses;
    }

    return [];
  };

  /* ================= FETCH COURSES ================= */

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [exploreRes, myRes] = await Promise.all([
          API.get("/api/courses"),
          API.get("/api/courses/my-courses"),
        ]);

        const exploreData = normalize(exploreRes.data);
        const myData = normalize(myRes.data);

        console.log("Explore Courses:", exploreData);
        console.log("My Courses:", myData);

        setExploreCourses(exploreData);
        setMyCourses(myData);
      } catch (err) {
        console.error("❌ Error fetching courses:", err);

        setExploreCourses([]);
        setMyCourses([]);
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
        <p className="text-gray-500 text-lg">
          Loading courses...
        </p>
      </div>
    );
  }

  /* ================= SEARCH FILTER ================= */

  const filteredMyCourses = (exploreCourses || []).filter((course) =>
  course?.title
    ?.trim()
    .toLowerCase()
    .includes(searchQuery.trim().toLowerCase())
);

  const filteredExploreCourses = (exploreCourses || []).filter((course) =>
    course?.title
      ?.trim()
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="w-full px-6 py-4">

      {/* ================= HERO ================= */}

      <div className="bg-teal-700 text-white p-6 rounded-xl w-full">
        <h1 className="text-3xl font-bold">
          {user?.name || "User"}
        </h1>

        <p className="text-sm opacity-80 mt-1">
          {t("courses.subtitle")}
        </p>

        <div className="flex flex-wrap gap-3 mt-4 items-center">

          {/* ===== MY COURSES BUTTON ===== */}

          <button
            onClick={() => setActiveTab("my-courses")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "my-courses"
                ? "bg-indigo-600"
                : "bg-black/30"
            }`}
          >
            My Courses
          </button>

          {/* ===== EXPLORE BUTTON ===== */}

          <button
            onClick={() => setActiveTab("explore")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "explore"
                ? "bg-indigo-600"
                : "bg-black/30"
            }`}
          >
            Explore
          </button>

          {/* ===== SEARCH ===== */}

          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-auto px-3 py-2 rounded text-black w-64 outline-none border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-300 transition"
          />
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      <main className="mt-6 w-full">

        {/* ================= MY COURSES ================= */}

        {activeTab === "my-courses" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredMyCourses.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <h2 className="text-xl font-semibold">
                  No Courses Found
                </h2>

                <button
                  onClick={() => setActiveTab("explore")}
                  className="mt-4 bg-teal-500 text-white px-4 py-2 rounded"
                >
                  Explore Courses
                </button>
              </div>
            ) : (
              filteredMyCourses.map((course) => (
                <div
                  key={course.id}
                  className="border rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-40 w-full object-cover"
                  />

                  <div className="p-4">
                    <h3 className="font-semibold text-lg">
                      {course.title}
                    </h3>

                    <button
                      onClick={() =>
                        navigate(`/learning/${course.id}`)
                      }
                      className="mt-3 w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= EXPLORE ================= */}

        {activeTab === "explore" && (
          <div className="w-full">

            <div className="mb-4">
              <h2 className="text-xl font-bold">
                Explore Courses
              </h2>

              <p className="text-gray-500 mt-1">
                {filteredExploreCourses.length} courses found
              </p>
            </div>

            {filteredExploreCourses.length === 0 ? (
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold">
                  No Courses Found
                </h2>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-2"
              >
                {filteredExploreCourses.map((course) => (
                  <div
                    key={course.id}
                    className="w-64 flex-shrink-0 border rounded-xl bg-white shadow-sm"
                  >
                    <img
                      src={course.image}
                      alt={course.title}
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
                        className="mt-2 w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded"
                      >
                        Enroll
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= POPUP ================= */}

      {showEnrollPopup && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-lg">

            <h2 className="font-bold text-lg">
              {selectedCourse.title}
            </h2>

            <button
  onClick={() => {
    setMyCourses((prev) => [...prev, selectedCourse]);

    setExploreCourses((prev) =>
      prev.filter((c) => c.id !== selectedCourse.id)
    );

    setShowEnrollPopup(false);

    alert("Course Enrolled Successfully!");
  }}
  className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
>
  Confirm Enroll
</button>

            <button
              onClick={() => setShowEnrollPopup(false)}
              className="mt-2 w-full text-gray-600"
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