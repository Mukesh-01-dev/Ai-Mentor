import React, { useState, useEffect, useRef } from "react";
import { Star, X, BookOpen, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../lib/api";
import { useTranslation } from "react-i18next";

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

  const [filters, setFilters] = useState({ category: [], level: [], price: [] });
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (field, value) => {
    setFilters(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const getActiveFilterCount = () => {
    return filters.category.length + filters.level.length + filters.price.length;
  };

  const [showEnrollPopup, setShowEnrollPopup] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract unique filter options dynamically
  const availableCategories = ["All", ...new Set(exploreCourses.map(c => c.category === "Databases" ? "Database" : c.category).filter(Boolean))];
  const availableLevels = [...new Set(exploreCourses.map(c => c.level).filter(Boolean))];
  const availablePrices = [...new Set(exploreCourses.map(c => {
    const isFree = c.priceValue === 0 || c.price === "₹0" || c.price === "Free" || !c.price;
    return isFree ? "Free" : "Paid";
  }).filter(Boolean))];

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

  const location = useLocation();
  useEffect(() => {
    if (location?.state?.activeTab === "explore") {
      setActiveTab("explore");
    }
  }, [location]);

  /* ================= SCROLL HANDLERS ================= */
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

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

  const filteredExploreCourses = exploreCourses
    .filter((course) =>
      !myCourses.some((c) => String(c.id) === String(course.id))
    )
    .filter((course) => {
      if (searchQuery.trim() !== "") {
        return course.title.toLowerCase().includes(searchQuery.toLowerCase());
      }

      const cat = course.category === "Databases" ? "Database" : course.category;
      const matchesCategory = filters.category.length === 0 || filters.category.includes(cat);
      const matchesLevel = filters.level.length === 0 || filters.level.includes(course.level);

      const isFree = course.priceValue === 0 || course.price === "₹0" || course.price === "Free" || !course.price;
      const type = isFree ? "Free" : "Paid";
      const matchesPrice = filters.price.length === 0 || filters.price.includes(type);

      return matchesCategory && matchesLevel && matchesPrice;
    });

  const filteredMyCourses = myCourses
    .filter((course) => {
      if (searchQuery.trim() !== "") {
        return course.title.toLowerCase().includes(searchQuery.toLowerCase());
      }

      const cat = course.category === "Databases" ? "Database" : course.category;
      const matchesCategory = filters.category.length === 0 || filters.category.includes(cat);
      const matchesLevel = filters.level.length === 0 || filters.level.includes(course.level);

      const isFree = course.priceValue === 0 || course.price === "₹0" || course.price === "Free" || !course.price;
      const type = isFree ? "Free" : "Paid";
      const matchesPrice = filters.price.length === 0 || filters.price.includes(type);

      return matchesCategory && matchesLevel && matchesPrice;
    });

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted">{t("courses.loading")}</p>
        </div>
      </main>
    );
  }
  return (
    <>
      {/* ══════ HERO ══════ */}
      <div className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 pt-10 sm:pt-12 lg:pt-16 pb-8 sm:pb-10 lg:pb-12 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
            <img
              src={user?.avatar_url || (user?.isGoogleUser || !!user?.googleId
                ? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email?.split('@')[0] || 'User')}`
                : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`
              )}
              alt="Profile"
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-white/80 object-cover shadow-lg ${!user?.avatar_url && !(user?.isGoogleUser || !!user?.googleId) ? 'p-2 sm:p-3 bg-white/20' : ''}`}
              onError={(e) => {
                const isGoogle = user?.isGoogleUser || !!user?.googleId;
                const fallback = isGoogle
                  ? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email?.split('@')[0] || 'User')}`
                  : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;
                e.target.src = fallback;
                if (!isGoogle) e.target.className += " p-3 bg-white/20";
              }}
            />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                {user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email?.split('@')[0] || 'User')}
              </h1>
              <p className="text-teal-100 text-sm sm:text-base mt-1">
                {t("courses.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative w-full z-40">
            {/* Top Row / Left Section */}
            <div className="flex items-center justify-between gap-2.5 w-full md:w-auto">

              {/* Scrollable Tabs */}
              <div className="courses-tabs-scroll-container flex justify-between items-center gap-2 sm:gap-3 flex-nowrap overflow-x-auto pb-1 sm:pb-0 scroll-smooth flex-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <style>{`.courses-tabs-scroll-container::-webkit-scrollbar { display: none; }`}</style>
                <button
                  onClick={() => setActiveTab("my-courses")}
                  className={`flex-1 basis-0 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all ${activeTab === "my-courses"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-black/30 text-white hover:bg-black/40"
                    }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0 hidden sm:block" />
                  <span className="hidden sm:inline truncate">{t("courses.enrolled_courses")}</span>
                  <span className="sm:hidden truncate">{t("courses.enrolled_short")}</span>
                </button>
                <button
                  onClick={() => setActiveTab("explore")}
                  className={`flex-1 basis-0 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all ${activeTab === "explore"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-black/30 text-white hover:bg-black/40"
                    }`}
                >
                  <Search className="w-4 h-4 shrink-0 hidden sm:block" />
                  <span className="hidden sm:inline truncate">{t("courses.explore")}</span>
                  <span className="sm:hidden truncate">{t("courses.explore_short")}</span>
                </button>
              </div>

              {/* Action Icons (Filter) */}
              <div className="flex items-center flex-shrink-0 relative">

                {/* Filter Icon & Dropdown */}
                <div ref={filterRef}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`relative flex items-center justify-center flex-shrink-0 w-10 h-10 sm:w-auto sm:px-5 sm:py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 shadow-xl ${showFilters || getActiveFilterCount() > 0
                      ? "bg-gradient-to-r from-teal-500/80 to-cyan-500/80 border-transparent text-white shadow-teal-500/20"
                      : "bg-black/40 border-white/20 text-white hover:bg-black/60 hover:border-white/40 backdrop-blur-md"
                      }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    <span className="hidden sm:inline ml-2">{t("courses.filters")}</span>
                    {getActiveFilterCount() > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-1.5 bg-white text-teal-700 text-[11px] leading-none rounded-full w-5 h-5 flex items-center justify-center font-black shadow-md border-2 border-teal-700 z-10">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>

                  {/* Filter Panel */}
                  {showFilters && (
                    <>
                      {/* Dark overlay for mobile */}
                      <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] md:hidden"
                        onClick={() => setShowFilters(false)}
                      />

                      {/* Form panel */}
                      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[26rem] md:absolute md:top-full md:left-auto md:right-0 md:translate-x-0 md:translate-y-0 md:mt-4 max-h-[85vh] overflow-y-auto bg-black/60 md:bg-black/40 backdrop-blur-3xl border border-teal-500/20 rounded-3xl shadow-[0_30px_60px_-15px_rgba(13,148,136,0.3)] p-6 z-[100] animate-in fade-in zoom-in-95 md:slide-in-from-top-6 duration-300">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            {getActiveFilterCount() > 0 && (
                              <button
                                onClick={() => setFilters({ category: [], level: [], price: [] })}
                                className="text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-full"
                              >
                                {t("courses.clear_all")}
                              </button>
                            )}
                            <button
                              onClick={() => setShowFilters(false)}
                              className="md:hidden p-2 text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Categories */}
                          <div>
                            <label className="block text-[10px] font-black text-teal-200/70 uppercase tracking-widest mb-4">{t("courses.category")}</label>
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => setFilters({ ...filters, category: [] })}
                                className={`px-4 py-2 text-xs rounded-xl font-bold transition-all duration-300 ${filters.category.length === 0
                                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-[1.03]"
                                  : "bg-teal-900/30 text-teal-100 hover:bg-teal-500/20 border border-teal-500/30"
                                  }`}
                              >
                                {t("courses.all_categories")}
                              </button>
                              {availableCategories.filter(cat => cat !== "All").map(cat => (
                                <button
                                  key={cat}
                                  onClick={() => toggleFilter("category", cat)}
                                  className={`px-4 py-2 text-xs rounded-xl font-bold transition-all duration-300 ${filters.category.includes(cat)
                                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-[1.03]"
                                    : "bg-teal-900/30 text-teal-100 hover:bg-teal-500/20 border border-teal-500/30"
                                    }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Skill Level */}
                          <div>
                            <label className="block text-[10px] font-black text-teal-200/70 uppercase tracking-widest mb-4">{t("courses.skill_level")}</label>
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => setFilters({ ...filters, level: [] })}
                                className={`px-4 py-2 text-xs rounded-xl font-bold transition-all duration-300 ${filters.level.length === 0
                                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-[1.03]"
                                  : "bg-teal-900/30 text-teal-100 hover:bg-teal-500/20 border border-teal-500/30"
                                  }`}
                              >
                                {t("courses.any_level")}
                              </button>
                              {availableLevels.map(lvl => (
                                <button
                                  key={lvl}
                                  onClick={() => toggleFilter("level", lvl)}
                                  className={`px-4 py-2 text-xs rounded-xl font-bold transition-all duration-300 ${filters.level.includes(lvl)
                                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-[1.03]"
                                    : "bg-teal-900/30 text-teal-100 hover:bg-teal-500/20 border border-teal-500/30"
                                    }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Pricing */}
                          <div>
                            <label className="block text-[10px] font-black text-teal-200/70 uppercase tracking-widest mb-4">{t("courses.pricing")}</label>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setFilters({ ...filters, price: [] })}
                                className={`flex-1 py-2 text-xs rounded-xl font-bold transition-all duration-300 ${filters.price.length === 0
                                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-[1.03]"
                                  : "bg-teal-900/30 text-teal-100 hover:bg-teal-500/20 border border-teal-500/30"
                                  }`}
                              >
                                {t("courses.any_price")}
                              </button>
                              {availablePrices.map(p => (
                                <button
                                  key={p}
                                  onClick={() => toggleFilter("price", p)}
                                  className={`flex-1 py-2 text-xs rounded-xl font-bold transition-all duration-300 ${filters.price.includes(p)
                                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-[1.03]"
                                    : "bg-teal-900/30 text-teal-100 hover:bg-teal-500/20 border border-teal-500/30"
                                    }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Apply Filters Button (Mobile Friendly UX) */}
                        <button
                          onClick={() => setShowFilters(false)}
                          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-teal-500/25 hover:scale-[1.02] transition-all"
                        >
                          {t("courses.apply_filters")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row / Search Container (Permanently shown on second row) */}
            <div className="relative group w-full md:w-60 md:max-w-xs z-40 transition-all duration-300 block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-teal-300 transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder={t("header.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/20 rounded-full text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all outline-none shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* ================= MY COURSES ================= */}
          {activeTab === "my-courses" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 auto-rows-fr
">




              {myCourses.length === 0 && (
                <p className="text-slate-500">
                  {t("courses.not_enrolled")}
                </p>
              )}
              {myCourses.length > 0 && filteredMyCourses.length === 0 && (
                <p className="text-slate-500 col-span-full">
                  {t("courses.no_match_filters")}
                </p>
              )}

              {filteredMyCourses.map((course) => {
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
                    className="
    bg-card rounded-3xl border border-border overflow-hidden shadow-sm 
    flex flex-col h-full
   w-full
  "
                  >

                    <div className="relative h-32 sm:h-40">

                      <img
                        src={course.image}
                        className="w-full h-full object-cover"
                        alt={course.title}
                      />
                    </div>

                    <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">


                      <div className="space-y-2 min-h-[72px]">

                        <h3 className="text-sm font-semibold text-main line-clamp-2">
                          {course.title}
                        </h3>

                        <p className="text-xs text-muted">
                          {course.lessons} lessons • {course.level}
                        </p>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => navigate(`/learning/${course.id}`)}
                          className="w-full py-2 rounded-lg bg-[#2DD4BF] text-white text-xs font-semibold"
                        >
                          {hasStarted ? t("common.continue_learning") : t("common.start_learning")}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= EXPLORE COURSES — Horizontal Scroll ================= */}
          {activeTab === "explore" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-main">Explore Courses</h2>
                {/* Prev / Next Buttons */}
                <div className="flex items-center gap-2 md:hidden">

                  <button
                    onClick={scrollLeft}
                    className="p-2 rounded-full bg-card border border-border hover:bg-teal-500/10 hover:border-teal-500/50 dark:hover:bg-teal-500/20 dark:hover:border-teal-500/40 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5 text-main" />
                  </button>
                  <button
                    onClick={scrollRight}
                    className="p-2 rounded-full bg-card border border-border hover:bg-teal-500/10 hover:border-teal-500/50 dark:hover:bg-teal-500/20 dark:hover:border-teal-500/40 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 text-main" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scroll Row */}
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory"
              >





                {filteredExploreCourses.length === 0 && (
                  <p className="text-slate-500">{t("courses.no_courses")}</p>
                )}

                {filteredExploreCourses.map((course) => (
                  <div
                    key={course.id}
                    className="
      min-w-[220px] sm:min-w-[260px] md:min-w-[280px]
    snap-start
    bg-card rounded-3xl border border-border overflow-hidden shadow-sm
    flex flex-col
"




                  >
                    <div className="relative h-32 sm:h-40">

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

                    <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">


                      {/* Top content (same as My Courses) */}
                      <div className="space-y-2 min-h-[72px]">
                        <h3 className="text-sm font-semibold text-main line-clamp-2">
                          {course.title}
                        </h3>

                        <p className="text-xs text-muted">
                          {course.lessons} lessons • {course.level}
                        </p>
                      </div>

                      {/* Bottom content */}
                      <div className="mt-4 flex justify-between items-center">
                        <span className="font-bold text-green-600">
                          {course?.priceValue === 0
                            ? "Free"
                            : `₹${course?.priceValue || 0}`}
                        </span>

                        <button
                          onClick={() => navigate(`/course-preview/${course.id}`)}
                          className="px-4 py-2 rounded-lg bg-[#2DD4BF] text-white text-xs font-semibold hover:bg-teal-500 transition-colors"
                        >
                          {t("common.enroll")}
                        </button>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= ENROLL POPUP ================= */}
      {showEnrollPopup && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 relative mx-4">
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
                {selectedCourse.priceValue > 0 ? `₹${selectedCourse.priceValue}` : "Free"}
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