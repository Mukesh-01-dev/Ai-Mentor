import React, { useState, useEffect, useRef } from "react";
import { Star, X, BookOpen, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../lib/api";
import { useTranslation } from "react-i18next";
import CourseFilter from "../components/CourseFilter";

const CoursesPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("my-courses");
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  /* ================= STATE ================= */
  const [exploreCourses, setExploreCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEnrollPopup, setShowEnrollPopup] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    level: "",
    category: "",
    price: "",
    rating: "",
    duration: "",
  });

  /* ================= FETCH COURSES ================= */
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
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const location = useLocation();
  useEffect(() => {
    if (location?.state?.activeTab === "explore") {
      setActiveTab("explore");
    }
  }, [location]);

  /* ================= SCROLL ================= */
  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });

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

  /* ================= FILTER LOGIC ================= */
  const applyFilters = (courses) => {
    return courses.filter((course) => {
      if (
        filters.level &&
        course.level?.toLowerCase() !== filters.level.toLowerCase()
      ) return false;

      if (
        filters.category &&
        course.category?.toLowerCase() !== filters.category.toLowerCase()
      ) return false;

      if (filters.price) {
        const price = parseFloat(course.priceValue ?? course.price ?? 0);
        if (filters.price === "Free" && price > 0) return false;
        if (filters.price === "Paid" && price === 0) return false;
      }

      if (filters.rating && course.rating) {
        const minRating = parseFloat(filters.rating);
        if (parseFloat(course.rating) < minRating) return false;
      }

      if (filters.duration && course.duration) {
        const dur = parseFloat(course.duration);
        if (filters.duration === "< 2 hours" && dur >= 2) return false;
        if (filters.duration === "2–5 hours" && (dur < 2 || dur > 5)) return false;
        if (filters.duration === "5–10 hours" && (dur < 5 || dur > 10)) return false;
        if (filters.duration === "> 10 hours" && dur <= 10) return false;
      }

      return true;
    });
  };

  /* ================= DERIVED LISTS ================= */
  const baseExploreCourses = exploreCourses.filter(
    (course) => !myCourses.some((c) => c.id === course.id)
  );

  const filteredExploreCourses = applyFilters(
    baseExploreCourses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredMyCourses = myCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  /* ================= GUARD ================= */
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

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {/* ══════ HERO ══════ */}
      <div className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 pt-16 pb-12 px-4 sm:px-8">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          {/* User info row */}
          <div className="flex items-center space-x-5">
            <img
              src={
                user?.avatar_url ||
                (user?.isGoogleUser || !!user?.googleId
                  ? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
                    user?.name || user?.email?.split("@")[0] || "User"
                  )}`
                  : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`)
              }
              alt="Profile"
              className={`w-20 h-20 rounded-full border-3 border-white/80 object-cover shadow-lg ${!user?.avatar_url && !(user?.isGoogleUser || !!user?.googleId)
                ? "p-3 bg-white/20"
                : ""
                }`}
              onError={(e) => {
                const isGoogle = user?.isGoogleUser || !!user?.googleId;
                const fallback = isGoogle
                  ? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
                    user?.name || user?.email?.split("@")[0] || "User"
                  )}`
                  : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;
                e.target.src = fallback;
                if (!isGoogle) e.target.className += " p-3 bg-white/20";
              }}
            />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {user?.name ||
                  (user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email?.split("@")[0] || "User")}
              </h1>
              <p className="text-teal-100 text-sm sm:text-base mt-1">
                {t("courses.subtitle")}
              </p>
            </div>
          </div>

          {/* Nav + Filter + Search row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setActiveTab("my-courses")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === "my-courses"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-black/30 text-white hover:bg-black/40"
                  }`}
              >
                <BookOpen className="w-4 h-4" />
                Enrolled Courses
              </button>

              <button
                onClick={() => setActiveTab("explore")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === "explore"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-black/30 text-white hover:bg-black/40"
                  }`}
              >
                <Search className="w-4 h-4" />
                {t("courses.explore")}
              </button>

              {activeTab === "explore" && (
                <CourseFilter
                  filters={filters}
                  onChange={setFilters}
                  onClear={() =>
                    setFilters({
                      level: "",
                      category: "",
                      price: "",
                      rating: "",
                      duration: "",
                    })
                  }
                />
              )}
            </div>

            <div className="relative group w-60 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-teal-300 transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder={t("header.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/20 rounded-full text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══════ MAIN CONTENT ══════ */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* MY COURSES */}
          {activeTab === "my-courses" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredMyCourses.length === 0 && (
                <p className="text-slate-500">{t("courses.not_enrolled")}</p>
              )}
              {filteredMyCourses.map((course) => {
                const purchasedEntry = user?.purchasedCourses?.find(
                  (c) => Number(c.courseId) === Number(course.id)
                );
                const progress = purchasedEntry?.progress;
                const hasStarted =
                  progress?.completedLessons?.length > 0 ||
                  progress?.currentLesson != null;
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
                        {hasStarted
                          ? t("common.continue_learning")
                          : t("common.start_learning")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* EXPLORE COURSES */}
          {activeTab === "explore" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-main">
                    Explore Courses
                  </h2>
                  <span className="text-sm text-muted bg-gray-100 px-3 py-1 rounded-full">
                    {filteredExploreCourses.length} course
                    {filteredExploreCourses.length !== 1 ? "s" : ""}
                    {activeFilterCount > 0 && (
                      <span className="ml-1 text-indigo-500 font-medium">
                        (filtered)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={scrollLeft}
                    className="p-2 rounded-full bg-card border border-border hover:bg-teal-50 hover:border-teal-400 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5 text-main" />
                  </button>
                  <button
                    onClick={scrollRight}
                    className="p-2 rounded-full bg-card border border-border hover:bg-teal-50 hover:border-teal-400 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 text-main" />
                  </button>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                {filteredExploreCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center w-full py-16 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-slate-500 font-medium">
                      No courses match your filters
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Try adjusting or clearing your filters
                    </p>
                    <button
                      onClick={() =>
                        setFilters({
                          level: "",
                          category: "",
                          price: "",
                          rating: "",
                          duration: "",
                        })
                      }
                      className="mt-4 px-5 py-2 bg-indigo-600 text-white text-sm rounded-full font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  filteredExploreCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex-shrink-0 w-64"
                    >
                      <div className="relative h-40">
                        <img
                          src={course.image}
                          className="w-full h-full object-cover"
                          alt={course.title}
                        />
                        <div className="absolute bottom-3 right-3 bg-white text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {course.rating}
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-main line-clamp-2">
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
                            onClick={() => navigate(`/course-preview/${course.id}`)}
                            className="px-4 py-2 rounded-lg bg-[#2DD4BF] text-white text-xs font-semibold hover:bg-teal-500 transition-colors"
                          >
                            {t("common.enroll")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ENROLL POPUP */}
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
              <span className="text-lg font-bold text-green-600">
                {selectedCourse.price}
              </span>
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
    </>
  );
};

export default CoursesPage;