import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Zap,
  BarChart3,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Moon,
  Sun,
  Menu
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";

const Analytics = () => {
  const { t, i18n } = useTranslation();
  const { sidebarCollapsed } = useSidebar();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState("");
  const [streak, setStreak] = useState(0);
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Initialize dark mode from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const statusEmojis = {
    Completed: "✅",
    Ongoing: "🔄",
    Upcoming: "📅",
  };

  const statusIcons = {
    Completed: <CheckCircle className="w-4 h-4 text-[#28A745]" />,
    Ongoing: <Clock className="w-4 h-4 text-[#FFC107]" />,
    Upcoming: <AlertCircle className="w-4 h-4 text-[#CCCCCC]" />,
  };

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // Fetch courses and analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const coursesRes = await fetch("/api/courses", { headers });
        const analyticsRes = await fetch("/api/analytics", { headers });

        const coursesData = await coursesRes.json();
        const analyticsData = await analyticsRes.json();

        setCourses(coursesData);
        setStudySessions(analyticsData.studySessions || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) fetchData();
  }, [user]);

  // Streak calculation
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastLoginStr = localStorage.getItem("lastLogin");
    let currentStreak = parseInt(localStorage.getItem("streak")) || 0;

    if (lastLoginStr !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastLoginStr === yesterday.toDateString()) currentStreak += 1;
      else currentStreak = 1;

      localStorage.setItem("streak", currentStreak);
      localStorage.setItem("lastLogin", todayStr);
      setStreak(currentStreak);
    } else setStreak(currentStreak);
  }, []);

  // Load tasks
  useEffect(() => {
    const saved = localStorage.getItem("calendarTasks");
    if (saved) setTasks(JSON.parse(saved));
    setSelectedDate(formatDateKey(new Date()));
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarTasks", JSON.stringify(tasks));
  }, [tasks]);


  const totalCourses = user?.purchasedCourses?.length || 0;

  const certificates =
    user?.purchasedCourses?.filter((course) => {
      const courseInfo = courses.find((c) => c.id == course.courseId);
      const totalLessons = courseInfo?.lessonsCount || 0;
      const completedLessons = course.progress?.completedLessons?.length || 0;
      return totalLessons > 0 && completedLessons === totalLessons;
    }).length || 0;

  const calculateAttendance = () => {
    const today = new Date();
    const last30 = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      last30.push(d.toDateString());
    }
    const studiedDays = studySessions.map((s) =>
      new Date(s.date).toDateString(),
    );
    const uniqueDays = [...new Set(studiedDays)];
    const attended = uniqueDays.filter((d) => last30.includes(d)).length;
    return Math.round((attended / 30) * 100);
  };

  const attendance = calculateAttendance();

  const addTask = () => {
    if (!newTask.trim()) return;
    const dateKey = selectedDate || formatDateKey(new Date());
    setTasks((prev) => ({
      ...prev,
      [dateKey]: [
        ...(prev[dateKey] || []),
        { text: newTask.trim(), status: "Upcoming" },
      ],
    }));
    setNewTask("");
  };

  const updateTaskStatus = (index, status) => {
    if (!tasks[selectedDate]) return;
    setTasks((prev) => {
      const updated = [...prev[selectedDate]];
      updated[index].status = status;
      return { ...prev, [selectedDate]: updated };
    });
  };

  const deleteTask = (index) => {
    if (!tasks[selectedDate]) return;
    const updated = [...tasks[selectedDate]];
    updated.splice(index, 1);
    setTasks({ ...tasks, [selectedDate]: updated });
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const getDateKey = (day) =>
    formatDateKey(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
    );

  const myCourses =
    user?.purchasedCourses?.map((c) => {
      const courseInfo = courses.find((course) => course.id == c.courseId);
      const completedLessons = c.progress?.completedLessons?.length || 0;
      const totalLessons = courseInfo?.lessonsCount || 0;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const remaining = totalLessons - completedLessons;
      return {
        id: c.courseId,
        title: courseInfo?.title || "Course",
        level: courseInfo?.level || "Beginner",
        image: courseInfo?.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        category: courseInfo?.category || "Education",
        completedLessons,
        totalLessons,
        progress,
        remaining,
      };
    }) || [];

  // Filter courses based on search
  const filteredCourses = myCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total study time
  const totalStudyTime = studySessions.reduce((acc, session) => acc + (session.duration || 0), 0);
  const averageProgress = myCourses.length > 0 
    ? Math.round(myCourses.reduce((acc, c) => acc + c.progress, 0) / myCourses.length) 
    : 0;

  // Calculate ongoing courses (courses with progress > 0)
  const ongoingCourses = myCourses.filter(c => c.progress > 0).length;

  return (
    <>
        <main className="p-4 md:p-6 lg:p-8">
          {/* Dark Mode Toggle Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-full bg-white dark:bg-[#1A1A1A] shadow-lg hover:shadow-xl transition-all duration-300 border border-[#CCCCCC] dark:border-gray-700"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-[#ff6d34]" />
              ) : (
                <Moon className="w-5 h-5 text-[#ff6d34]" />
              )}
            </button>
          </div>

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2D3436] dark:text-white">
              {t('analytics.welcome_back_user', { name: user?.name || 'Learner' })}
            </h1>
            <p className="text-[#2D3436]/70 dark:text-gray-400 mt-2 text-lg">
              {t('analytics.analytics_subtitle')}
            </p>
          </div>

          {/* METRICS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: t('analytics.enrolled_courses'),
                value: totalCourses,
                icon: <BookOpen className="w-6 h-6 text-[#00bea3]" />,
                bgColor: "bg-[#00bea3]/10 dark:bg-[#00bea3]/20",
                trend: t('dashboard.ongoing_courses_progress', { count: ongoingCourses, defaultValue: `${ongoingCourses} in progress` })
              },
              {
                label: t('analytics.attendance_rate'),
                value: `${attendance}%`,
                icon: <BarChart3 className="w-6 h-6 text-[#28A745]" />,
                bgColor: "bg-[#28A745]/10 dark:bg-[#28A745]/20",
                trend: attendance > 70 ? t('analytics.great_consistency', { defaultValue: '👍 Great consistency' }) : t('analytics.needs_improvement', { defaultValue: '👀 Needs improvement' })
              },
              {
                label: t('analytics.current_streak_label'),
                value: streak,
                icon: <Zap className="w-6 h-6 text-[#FFC107]" />,
                bgColor: "bg-[#FFC107]/10 dark:bg-[#FFC107]/20",
                trend: t('analytics.streak_days', { count: streak })
              },
              {
                label: t('analytics.certificates'),
                value: certificates,
                icon: <Award className="w-6 h-6 text-[#ff6d34]" />,
                bgColor: "bg-[#ff6d34]/10 dark:bg-[#ff6d34]/20",
                trend: certificates > 0 ? t('analytics.achievements_unlocked') : t('analytics.complete_to_earn')
              },
            ].map((metric, idx) => (
              <div
                key={idx}
                className="group relative bg-white dark:bg-[#27272A] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#2D3436]/60 dark:text-gray-400 mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold text-[#2D3436] dark:text-white">
                      {metric.value}
                    </p>
                  </div>
                  <div className={`${metric.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    {metric.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-[#2D3436]/60 dark:text-gray-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-[#27272A] rounded-xl p-4 shadow-sm">
              <div className="text-sm text-[#2D3436]/60 dark:text-gray-400">{t('analytics.average_progress')}</div>
              <div className="text-xl font-bold text-[#00bea3]">{averageProgress}%</div>
              <div className="w-full bg-[#F5F5F5] dark:bg-gray-700 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-[#00bea3] to-[#ff6d34] h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${averageProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#27272A] rounded-xl p-4 shadow-sm">
              <div className="text-sm text-[#2D3436]/60 dark:text-gray-400">{t('analytics.completed_lessons_count')}</div>
              <div className="text-xl font-bold text-[#28A745]">
                {myCourses.reduce((acc, c) => acc + c.completedLessons, 0)}
              </div>
              <div className="text-xs text-[#2D3436]/50 dark:text-gray-500 mt-2">{t('analytics.across_all_courses')}</div>
            </div>
            <div className="bg-white dark:bg-[#27272A] rounded-xl p-4 shadow-sm">
              <div className="text-sm text-[#2D3436]/60 dark:text-gray-400">{t('analytics.total_study_time_label')}</div>
              <div className="text-xl font-bold text-[#ff6d34]">
                {Math.round(totalStudyTime / 60)} {t('analytics.hours_unit', { defaultValue: 'hrs' })}
              </div>
              <div className="text-xs text-[#2D3436]/50 dark:text-gray-500 mt-2">{t('analytics.this_month')}</div>
            </div>
            <div className="bg-white dark:bg-[#27272A] rounded-xl p-4 shadow-sm">
              <div className="text-sm text-[#2D3436]/60 dark:text-gray-400">{t('analytics.upcoming_tasks_count')}</div>
              <div className="text-xl font-bold text-[#FFC107]">
                {Object.values(tasks).flat().filter(t => t.status === "Upcoming").length}
              </div>
              <div className="text-xs text-[#2D3436]/50 dark:text-gray-500 mt-2">{t('analytics.need_attention')}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-[#CCCCCC] dark:border-gray-700">
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === "courses"
                  ? "text-[#ff6d34] dark:text-[#ff6d34]"
                  : "text-[#2D3436]/60 hover:text-[#2D3436] dark:text-gray-400"
              }`}
            >
              {t('analytics.my_courses_tab')}
              {activeTab === "courses" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6d34]"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === "calendar"
                  ? "text-[#ff6d34] dark:text-[#ff6d34]"
                  : "text-[#2D3436]/60 hover:text-[#2D3436] dark:text-gray-400"
              }`}
            >
              {t('analytics.calendar_tasks_tab')}
              {activeTab === "calendar" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6d34]"></span>
              )}
            </button>
          </div>

          {activeTab === "courses" && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2D3436] dark:text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-[#00bea3]" />
                  {t('analytics.my_courses_tab')}
                  <span className="text-sm font-normal text-[#2D3436]/60 dark:text-gray-400 bg-[#F5F5F5] dark:bg-gray-700 px-2 py-1 rounded-full">
                    {filteredCourses.length}
                  </span>
                </h2>
                <Link
                  to="/courses"
                  className="text-[#ff6d34] hover:text-[#ff6d34]/80 text-sm font-medium flex items-center gap-1"
                >
                  {t('analytics.browse_all_courses')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-lg overflow-hidden border border-[#CCCCCC]/30 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F5F5] dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-[#2D3436]/70 dark:text-gray-300 uppercase tracking-wider">{t('analytics.table_course')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-[#2D3436]/70 dark:text-gray-300 uppercase tracking-wider">{t('analytics.table_progress')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-[#2D3436]/70 dark:text-gray-300 uppercase tracking-wider">{t('analytics.table_lessons')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-[#2D3436]/70 dark:text-gray-300 uppercase tracking-wider">{t('analytics.table_level')}</th>
                        <th className="px-6 py-4 text-xs font-semibold text-[#2D3436]/70 dark:text-gray-300 uppercase tracking-wider">{t('analytics.table_action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CCCCCC]/50 dark:divide-gray-700">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                          <tr 
                            key={course.id} 
                            className="hover:bg-[#F5F5F5] dark:hover:bg-gray-700/30 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <Link to={`/learning/${course.id}`} className="flex items-center gap-4">
                                <div className="relative">
                                  <img 
                                    src={course.image} 
                                    alt="" 
                                    className="w-12 h-12 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300" 
                                  />
                                  <div className="absolute inset-0 rounded-xl bg-[#ff6d34] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                </div>
                                <div>
                                  <div className="font-semibold text-[#2D3436] dark:text-white line-clamp-1">
                                    {course.title}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-[#F5F5F5] dark:bg-gray-700 rounded-full text-[#2D3436]/70 dark:text-gray-300">
                                      {course.category}
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-40">
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs font-medium text-[#2D3436] dark:text-gray-300">
                                    {course.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-[#F5F5F5] dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-[#00bea3] to-[#ff6d34] h-2 rounded-full transition-all duration-500 relative"
                                    style={{ width: `${course.progress}%` }}
                                  >
                                    <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-[#28A745]" />
                                <span className="text-sm text-[#2D3436]/70 dark:text-gray-300">
                                  <span className="font-semibold text-[#00bea3]">{course.completedLessons}</span>
                                  <span className="mx-1 text-gray-300">/</span>
                                  <span>{course.totalLessons}</span>
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                course.level === 'Beginner' 
                                  ? 'bg-green-100 text-[#28A745] dark:bg-green-900/30 dark:text-[#28A745]' 
                                  : course.level === 'Intermediate' 
                                  ? 'bg-blue-100 text-[#00bea3] dark:bg-blue-900/30 dark:text-[#00bea3]' 
                                  : 'bg-orange-100 text-[#ff6d34] dark:bg-orange-900/30 dark:text-[#ff6d34]'
                              }`}>
                                {course.level}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                to={`/learning/${course.id}`}
                                className="inline-flex items-center gap-1 text-[#ff6d34] hover:text-[#ff6d34]/80 text-sm font-medium"
                              >
                                {t('analytics.continue_btn')}
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                              <p className="text-[#2D3436]/60 dark:text-gray-400">
                                {searchQuery ? t('analytics.no_courses_match') : t('analytics.no_courses_enrolled')}
                              </p>
                              {!searchQuery && (
                                <Link 
                                  to="/courses" 
                                  className="px-4 py-2 bg-[#ff6d34] text-white rounded-lg hover:bg-[#ff6d34]/90 transition"
                                >
                                  {t('analytics.browse_courses_btn')}
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CALENDAR */}
              <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-lg">
                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition group"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#2D3436]/60 dark:text-gray-400 group-hover:text-[#ff6d34]" />
                  </button>
                  <span className="text-xl font-bold text-[#2D3436] dark:text-white">
                    {currentDate.toLocaleString(i18n.language, {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition group"
                  >
                    <ChevronRight className="w-5 h-5 text-[#2D3436]/60 dark:text-gray-400 group-hover:text-[#ff6d34]" />
                  </button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                    const date = new Date(2021, 0, 3 + d); // 2021-01-03 was a Sunday
                    return (
                      <div key={d} className="text-center text-sm font-medium text-[#2D3436]/60 dark:text-gray-400">
                        {date.toLocaleString(i18n.language, { weekday: 'short' })}
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    
                    const prevMonthDays = new Date(year, month, 0).getDate();
                    const prevMonth = new Date(year, month - 1);
                    const nextMonth = new Date(year, month + 1);
                    
                    const allDays = [];
                    
                    // Track if we've already shown the month name for previous month
                    let hasShownPrevMonthName = false;
                    let hasShownNextMonthName = false;
                    
                    // Add previous month's days
                    for (let i = firstDay - 1; i >= 0; i--) {
                      const dayNum = prevMonthDays - i;
                      allDays.push({
                        day: dayNum,
                        month: prevMonth.getMonth(),
                        year: prevMonth.getFullYear(),
                        isCurrentMonth: false,
                        isClickable: false,
                        showMonthName: !hasShownPrevMonthName && i === 0
                      });
                      if (i === 0) hasShownPrevMonthName = true;
                    }
                    
                    // Add current month's days
                    for (let i = 1; i <= daysInMonth; i++) {
                      allDays.push({
                        day: i,
                        month: month,
                        year: year,
                        isCurrentMonth: true,
                        isClickable: true,
                        showMonthName: false
                      });
                    }
                    
                    // Add next month's days
                    const remainingCells = 42 - allDays.length;
                    for (let i = 1; i <= remainingCells; i++) {
                      allDays.push({
                        day: i,
                        month: nextMonth.getMonth(),
                        year: nextMonth.getFullYear(),
                        isCurrentMonth: false,
                        isClickable: false,
                        showMonthName: !hasShownNextMonthName && i === 1
                      });
                      if (i === 1) hasShownNextMonthName = true;
                    }
                    
                    return allDays.map((dayInfo, index) => {
                      const key = formatDateKey(new Date(dayInfo.year, dayInfo.month, dayInfo.day));
                      const isToday = key === formatDateKey(new Date());
                      const taskList = tasks[key] || [];
                      const displayTasks = taskList.slice(0, 2);
                      const remainingCount = Math.max(taskList.length - displayTasks.length, 0);
                      
                      const allTasksCompleted = taskList.length > 0 && taskList.every(task => task.status === "Completed");
                      const hasAnyTask = taskList.length > 0;
                      const hasIncompleteTasks = hasAnyTask && !allTasksCompleted;
                      
                      const monthName = dayInfo.showMonthName 
                        ? new Date(dayInfo.year, dayInfo.month, 1).toLocaleString(i18n.language, { month: 'short' })
                        : '';
                      
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (dayInfo.isClickable) {
                              setSelectedDate(key);
                            }
                          }}
                          className={`relative h-24 rounded-xl p-2 transition-all duration-300
                            ${dayInfo.isClickable && selectedDate === key 
                              ? 'ring-2 ring-[#ff6d34] shadow-lg scale-105 z-10' 
                              : dayInfo.isClickable 
                              ? 'hover:ring-1 hover:ring-[#CCCCCC] dark:hover:ring-gray-600 cursor-pointer'
                              : 'cursor-default opacity-70'
                            }
                            ${isToday && dayInfo.isCurrentMonth
                              ? 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-[#ff6d34]/30 dark:to-[#FFC107]/30 border-2 border-[#ff6d34]' 
                              : allTasksCompleted && dayInfo.isCurrentMonth
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-[#28A745]/40 dark:to-[#28A745]/40 border border-[#28A745] dark:border-[#28A745]'
                              : hasIncompleteTasks && dayInfo.isCurrentMonth
                              ? 'bg-white dark:bg-[#0F0F0F] border-l-4 border-l-[#FFC107]'
                              : dayInfo.isCurrentMonth 
                              ? 'bg-white dark:bg-[#0F0F0F]'
                              : 'bg-[#F5F5F5] dark:bg-[#0F0F0F]/50'
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className={`text-sm font-semibold ${
                                isToday && dayInfo.isCurrentMonth 
                                  ? 'text-[#ff6d34] dark:text-[#ff6d34]' 
                                  : dayInfo.isCurrentMonth
                                  ? 'text-[#2D3436] dark:text-gray-300'
                                  : 'text-[#2D3436]/50 dark:text-gray-500'
                              }`}>
                                {dayInfo.day}
                              </span>
                              {monthName && (
                                <span className="text-[10px] font-medium text-[#2D3436]/50 dark:text-gray-500 mt-0.5">
                                  {monthName}
                                </span>
                              )}
                            </div>
                            {hasAnyTask && dayInfo.isCurrentMonth && (
                              <div className="flex gap-1">
                                {allTasksCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-[#28A745]" />
                                ) : (
                                  <span className="text-xs bg-[#ff6d34]/10 text-[#ff6d34] dark:bg-[#ff6d34]/30 dark:text-[#ff6d34] px-1.5 rounded-full">
                                    {taskList.length}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {hasAnyTask && dayInfo.isCurrentMonth && (
                            <>
                              <div className="mt-1 space-y-0.5">
                                {displayTasks.map((task, idx) => (
                                  <div key={idx} className="flex items-center gap-1 text-[10px]">
                                    <span>{statusEmojis[task.status]}</span>
                                    <span className="truncate text-[#2D3436]/70 dark:text-gray-400">{task.text}</span>
                                  </div>
                                ))}
                                {remainingCount > 0 && (
                                  <div className="text-[9px] text-[#2D3436]/50 dark:text-gray-500">
                                    +{remainingCount} {t('common.more', { defaultValue: 'more' })}
                                  </div>
                                )}
                              </div>
                              
                              {hasIncompleteTasks && taskList.length > 1 && (
                                <div className="absolute bottom-1 left-2 right-2 h-0.5 bg-[#F5F5F5] dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#28A745] rounded-full transition-all duration-300"
                                    style={{ width: `${(taskList.filter(t => t.status === "Completed").length / taskList.length) * 100}%` }}
                                  ></div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {!dayInfo.isClickable && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-full h-full bg-white/50 dark:bg-black/30 rounded-xl"></div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-[#CCCCCC] dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-[#ff6d34]"></div>
                    <span className="text-xs text-[#2D3436]/70 dark:text-gray-400">{t('analytics.legend_today')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 border border-[#28A745]"></div>
                    <span className="text-xs text-[#2D3436]/70 dark:text-gray-400">{t('analytics.legend_all_completed')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white dark:bg-[#0F0F0F] border-l-4 border-l-[#FFC107]"></div>
                    <span className="text-xs text-[#2D3436]/70 dark:text-gray-400">{t('analytics.legend_tasks_pending')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#F5F5F5] dark:bg-[#0F0F0F]/50 border border-[#CCCCCC] dark:border-gray-600"></div>
                    <span className="text-xs text-[#2D3436]/70 dark:text-gray-400">{t('analytics.legend_other_month')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span className="text-xs text-[#2D3436]/70 dark:text-gray-400">{t('analytics.status_completed')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔄</span>
                    <span className="text-xs text-[#2D3436]/70 dark:text-gray-400">{t('analytics.status_ongoing')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span className="text-xs text-[#2D3436]/70 dark:text-gray-400">{t('analytics.status_upcoming')}</span>
                  </div>
                </div>
              </div>

              {/* TASK PANEL */}
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#2D3436] dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#ff6d34]" />
                    {t('analytics.tasks_for_date', { date: selectedDate })}
                  </h3>
                </div>

                <div className="flex gap-2 mb-6">
                  <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    className="flex-1 border border-[#CCCCCC] dark:border-gray-700 dark:bg-gray-900 dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6d34] transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder={t('analytics.add_task_placeholder')}
                  />

                  <button
                    onClick={addTask}
                    className="bg-[#ff6d34] hover:bg-[#ff6d34]/90 text-white px-4 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {t('analytics.add_btn')}
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {(tasks[selectedDate] || []).length > 0 ? (
                    (tasks[selectedDate] || []).map((task, i) => (
                      <div
                        key={i}
                        className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all
                          ${task.status === "Completed" 
                            ? 'bg-[#28A745]/10 dark:bg-[#28A745]/20' 
                            : 'bg-[#F5F5F5] dark:bg-gray-700/50 hover:bg-[#CCCCCC]/30 dark:hover:bg-gray-700'
                          }`}
                      >
                        <div className="flex-shrink-0">
                          {statusIcons[task.status]}
                        </div>
                        <span className={`flex-1 text-sm line-clamp-2 ${
                          task.status === "Completed" 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-[#2D3436] dark:text-gray-300'
                        }`}>
                          {task.text}
                        </span>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(i, e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-[#CCCCCC] dark:border-gray-600 rounded-lg p-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#ff6d34] text-[#2D3436] dark:text-gray-300"
                          >
                            <option value="Upcoming">📅 Upcoming</option>
                            <option value="Ongoing">🔄 Ongoing</option>
                            <option value="Completed">✅ Done</option>
                          </select>
                          <button
                            onClick={() => deleteTask(i)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                          >
                            ✕
                          </button>
                        </div>

                        {task.status === "Completed" && (
                          <div className="absolute bottom-0 left-0 h-0.5 bg-[#28A745] rounded-full w-full"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F5F5F5] dark:bg-gray-800 rounded-full mb-3">
                        <Target className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-[#2D3436]/60 dark:text-gray-400 text-sm">No tasks for this day</p>
                      <p className="text-xs text-[#2D3436]/50 dark:text-gray-500 mt-1">Add a task to get started</p>
                    </div>
                  )}
                </div>

                {tasks[selectedDate] && tasks[selectedDate].length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#CCCCCC] dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2D3436]/60 dark:text-gray-400">Completed:</span>
                      <span className="font-medium text-[#28A745]">
                        {tasks[selectedDate].filter(t => t.status === "Completed").length}/{tasks[selectedDate].length}
                      </span>
                    </div>
                    <div className="w-full bg-[#F5F5F5] rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-[#28A745] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(tasks[selectedDate].filter(t => t.status === "Completed").length / tasks[selectedDate].length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
};

export default Analytics;