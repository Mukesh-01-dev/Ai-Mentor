import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import {
  Search,
  Bell,
  BarChart3,
  BookOpen,
  MessageCircle,
  Settings,
  Play,
  Calendar,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  CheckCircle,
  Bookmark,
  Clock,
  Star,
} from "lucide-react";

const Dashboard = () => {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } =
    useSidebar();
  const [coursesData, setCoursesData] = useState({
    statsCards: [],
    allCourses: [],
  });
  const [loading, setLoading] = useState(true);
  const { user, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [coursesRes, statsRes] = await Promise.all([
          fetch("/api/courses", { headers }),
          fetch("/api/courses/stats/cards", { headers }),
        ]);

        if (!coursesRes.ok) throw new Error(`Courses API failed: ${coursesRes.status}`);
        if (!statsRes.ok) throw new Error(`Stats API failed: ${statsRes.status}`);

        const allCourses = await coursesRes.json();
        const { statsCards } = await statsRes.json();

        setCoursesData({ allCourses: allCourses || [], statsCards: statsCards || [] });
        await fetchUserProfile(); 
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [fetchUserProfile]);

  // Calculate dynamic stats based on user's actual progress
  const calculateStats = () => {
    try {
      console.log("Calculating stats with user:", user);
      console.log("coursesData:", coursesData);

      if (
        !user?.purchasedCourses ||
        !coursesData?.statsCards ||
        coursesData.statsCards.length === 0
      ) {
        return [
          {
            icon: <Play className="w-5 h-5 text-blue-600" />,
            value: "0",
            label: "Ongoing Courses",
            change: "+0%",
            bgColor: "bg-blue-50",
            iconBg: "bg-blue-100",
          },
          {
            icon: <CheckCircle className="w-5 h-5 text-green-600" />,
            value: "0",
            label: "Completed",
            change: "+0",
            bgColor: "bg-green-50",
            iconBg: "bg-green-100",
          },
          {
            icon: <Bookmark className="w-5 h-5 text-purple-600" />,
            value: "0",
            label: "Certificates",
            change: "+0",
            bgColor: "bg-purple-50",
            iconBg: "bg-purple-100",
          },
          {
            icon: <Clock className="w-5 h-5 text-orange-600" />,
            value: "0h",
            label: "Hours Spent",
            change: "+0h",
            bgColor: "bg-orange-50",
            iconBg: "bg-orange-100",
          },
        ];
      }

      let coursesInProgress = 0;
      let completedCourses = 0;
      const certificates = user.analytics?.certificates || 0;
      const totalHours = user.analytics?.totalHours || 0;

      user.purchasedCourses.forEach((purchasedCourse) => {
        const courseInfo = coursesData.allCourses?.find(
          (c) => Number(c.id) === Number(purchasedCourse.courseId)
        );
        if (courseInfo) {
          const totalLessons = courseInfo.lessonsCount || 0;
          const completedLessons = purchasedCourse.progress?.completedLessons?.length || 0;

          if (completedLessons === totalLessons && totalLessons > 0) {
            completedCourses++;
          } else if (completedLessons > 0) {
            coursesInProgress++;
          }
        }
      });

      const result = [
        {
          ...coursesData.statsCards[0],
          value: coursesInProgress.toString(),
        },
        {
          ...coursesData.statsCards[1],
          value: completedCourses.toString(),
        },
        {
          ...coursesData.statsCards[2],
          value: certificates.toString(),
        },
        {
          ...coursesData.statsCards[3],
          value: `${totalHours}h`,
        },
      ];

      console.log("Calculated stats result:", result);
      return result;
    } catch (err) {
      console.error("Error in calculateStats:", err);
      return [];
    }
  };

  const dynamicStatsCards = calculateStats() || [];
  console.log("Rendering Dashboard, dynamicStatsCards:", dynamicStatsCards);
  console.log("Loading state:", loading);
  console.log("User state:", user);

  if (!user && !loading) {
    return <Navigate to="/login" replace />;
  }

  // Create dynamic myCourses from user data
  console.log("Creating myCourses with user:", user);
  console.log("coursesData.allCourses:", coursesData.allCourses);

  const myCourses = (() => {
    try {
      if (!coursesData.allCourses) return [];
      return coursesData.allCourses
        .filter((course) =>
          user?.purchasedCourses?.some(
            (purchased) => Number(purchased.courseId) === Number(course.id)
          )
        )
        .map((course) => {
          const purchasedCourse = user?.purchasedCourses?.find(
            (p) => Number(p.courseId) === Number(course.id)
          );
          const totalLessons = course.lessonsCount || 0;
          const completedLessons = purchasedCourse?.progress?.completedLessons?.length || 0;

          return {
            id: course.id,
            title: course.title,
            subtitle: course.category,
            progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
            lessons: `${completedLessons}/${totalLessons}`,
            level: course.level,
            levelColor: course.level === "Beginner" ? "bg-blue-100 text-blue-800" : course.level === "Intermediate" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800",
            image: course.image,
            progressColor: "bg-indigo-600",
          };
        });
    } catch (err) {
      console.error("Error creating myCourses:", err);
      return [];
    }
  })();

  const continueLearning = (() => {
    try {
      if (!coursesData.allCourses) return [];
      return coursesData.allCourses
        .filter((course) =>
          user?.purchasedCourses?.some(
            (purchased) => Number(purchased.courseId) === Number(course.id)
          )
        )
        .filter((course) => {
          const purchasedCourse = user?.purchasedCourses?.find(
            (p) => Number(p.courseId) === Number(course.id)
          );
          const totalLessons = course.lessonsCount || 0;
          const completedLessons = purchasedCourse?.progress?.completedLessons?.length || 0;
          return completedLessons > 0 && completedLessons < totalLessons;
        })
        .slice(0, 3)
        .map((course) => {
          const purchasedCourse = user?.purchasedCourses?.find(
            (p) => Number(p.courseId) === Number(course.id)
          );
          const totalLessons = course.lessonsCount || 0;
          const completedLessons = purchasedCourse?.progress?.completedLessons?.length || 0;
          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          const currentLesson = purchasedCourse?.progress?.currentLesson;
          const lessonTitle = currentLesson
            ? `Lesson ${currentLesson.lessonId}: ${currentLesson.moduleTitle}`
            : `Continue from Lesson ${completedLessons + 1}`;

          return {
            id: course.id,
            title: course.title,
            lesson: lessonTitle,
            progress: progress,
            image: course.image,
            progressColor: progress > 75 ? "bg-cyan-600" : "bg-orange-400",
          };
        });
    } catch (err) {
      console.error("Error creating continueLearning:", err);
      return [];
    }
  })();

  const schedule = [
    {
      title: "Machine Learning",
      time: "10:00 AM - 11:30 AM",
      color: "bg-blue-50 border-l-blue-500",
    },
    {
      title: "React Development",
      time: "2:00 PM - 3:30 PM",
      color: "bg-green-50 border-l-green-500",
    },
  ];

  const handleBrowseCourses = () => {
    // Navigate to courses page
    navigate("/courses", { state: { activeTab: "explore" } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-alt flex flex-col items-center justify-center">
        <Header />
        <Sidebar activePage="dashboard" />
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-black text-main uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-alt flex flex-col">
      <Header />

      <Sidebar activePage="dashboard" />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
        }`}
      >
        {/* Dashboard Content */}
        <main className="flex-1 mt-[4.5rem] bg-canvas-alt p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {dynamicStatsCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-4 sm:p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl ${card.iconBg}`}>
                      {React.cloneElement(card.icon, { className: "w-5 h-5" })}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      {card.change}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-main mb-1">
                    {card.value}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-widest">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {/* My Courses Table - Full width on mobile/tablet, 2/3 on desktop */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-main uppercase tracking-tight">My Courses</h2>
                  <button 
                    onClick={handleBrowseCourses}
                    className="text-xs font-bold text-teal-500 hover:text-teal-600 uppercase tracking-widest"
                  >
                    View All
                  </button>
                </div>
                
                <div className="bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto scrollbar-hide">
                    {myCourses.length !== 0 ? (
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="bg-canvas-alt/50 border-b border-border/50">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-muted uppercase tracking-widest">Course</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-muted uppercase tracking-widest">Progress</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-muted uppercase tracking-widest">Lessons</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-muted uppercase tracking-widest">Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {myCourses.map((course, index) => (
                            <tr key={index} className="group hover:bg-canvas-alt/30 transition-colors">
                              <td className="px-6 py-4">
                                <Link to={`/learning/${course.id}`} className="flex items-center group">
                                  <div className="relative shrink-0">
                                    <img src={course.image} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />
                                  </div>
                                  <div className="ml-4 min-w-0">
                                    <div className="text-xs sm:text-sm font-black text-main truncate group-hover:text-teal-500 transition-colors uppercase tracking-tight">{course.title}</div>
                                    <div className="text-[10px] text-muted font-bold truncate opacity-60 uppercase">{course.subtitle}</div>
                                  </div>
                                </Link>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center text-[10px] font-black text-muted">
                                    <span>{course.progress}%</span>
                                  </div>
                                  <div className="w-24 sm:w-32 bg-border/30 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${course.progressColor}`} style={{ width: `${course.progress}%` }} />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-[11px] font-bold text-muted uppercase">{course.lessons}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${course.levelColor}`}>
                                  {course.level}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center">
                        <div className="inline-flex p-4 rounded-full bg-teal-50 text-teal-500 mb-4">
                          <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-sm font-black text-main uppercase mb-2">No courses yet</h3>
                        <p className="text-xs text-muted font-medium mb-6">Start your learning journey by exploring our AI courses.</p>
                        <button onClick={handleBrowseCourses} className="px-6 py-2.5 bg-teal-500 text-white text-[11px] font-black rounded-xl hover:bg-teal-600 transition-all uppercase tracking-widest shadow-lg shadow-teal-500/20">
                          Browse Courses
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Continue Learning - Mobile Friendly Cards */}
                {continueLearning.length !== 0 && (
                  <div className="space-y-6">
                    <h2 className="text-lg sm:text-xl font-black text-main uppercase tracking-tight">Continue Learning</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {continueLearning.map((item, index) => (
                        <div key={index} className="bg-card rounded-3xl p-4 sm:p-5 border border-border/50 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-start gap-4">
                            <img src={item.image} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 shadow-sm" />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs sm:text-sm font-black text-main truncate uppercase tracking-tight group-hover:text-teal-500 transition-colors mb-1">{item.title}</h3>
                              <p className="text-[10px] text-muted font-bold truncate opacity-60 mb-3">{item.lesson}</p>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-[9px] font-black text-muted uppercase">
                                  <span>Progress</span>
                                  <span>{item.progress}%</span>
                                </div>
                                <div className="w-full bg-border/30 rounded-full h-1.5 overflow-hidden">
                                  <div className={`h-full rounded-full transition-all duration-1000 ${item.progressColor}`} style={{ width: `${item.progress}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <Link to={`/learning/${item.id}`} className="flex items-center justify-center py-2.5 bg-teal-500 text-white text-[10px] font-black rounded-xl hover:bg-teal-600 transition-all uppercase tracking-widest shadow-lg shadow-teal-500/10">
                              Resume
                            </Link>
                            <Link to={`/course-preview/${item.id}`} className="flex items-center justify-center py-2.5 bg-canvas-alt text-main text-[10px] font-black rounded-xl hover:bg-border/50 transition-all uppercase tracking-widest">
                              Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar/Widgets Column */}
              <div className="space-y-6 sm:space-y-8">
                {/* Course Topics Chart */}
                <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-border/50">
                  <h2 className="text-lg sm:text-xl font-black text-main uppercase tracking-tight mb-8">Course Topics</h2>
                  <div className="relative flex flex-col items-center">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 relative mb-8">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="25" className="text-border/20" />
                        <circle cx="100" cy="100" r="85" fill="none" stroke="#FF885A" strokeWidth="25" strokeDasharray="534" strokeDashoffset="160" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="85" fill="none" stroke="#FFA988" strokeWidth="25" strokeDasharray="534" strokeDashoffset="420" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="85" fill="none" stroke="#FFD0BD" strokeWidth="25" strokeDasharray="534" strokeDashoffset="500" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-main">15</span>
                        <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Courses</span>
                      </div>
                    </div>
                    
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-canvas-alt/50 border border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF885A]" />
                          <span className="text-[11px] font-black text-main uppercase tracking-tight">Code & AI</span>
                        </div>
                        <span className="text-[11px] font-black text-muted">70%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-canvas-alt/50 border border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FFA988]" />
                          <span className="text-[11px] font-black text-main uppercase tracking-tight">Data Science</span>
                        </div>
                        <span className="text-[11px] font-black text-muted">20%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-canvas-alt/50 border border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FFD0BD]" />
                          <span className="text-[11px] font-black text-main uppercase tracking-tight">Design</span>
                        </div>
                        <span className="text-[11px] font-black text-muted">10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Widget - Optional but good for UI */}
                <div className="bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-border/50">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg sm:text-xl font-black text-main uppercase tracking-tight">Schedule</h2>
                    <Calendar className="w-5 h-5 text-teal-500" />
                  </div>
                  <div className="space-y-4">
                    {schedule.map((item, index) => (
                      <div key={index} className={`p-4 rounded-3xl border-l-4 ${item.color} shadow-sm`}>
                        <h4 className="text-xs font-black text-main uppercase mb-1">{item.title}</h4>
                        <div className="flex items-center text-[10px] text-muted font-bold uppercase tracking-tighter">
                          <Clock className="w-3 h-3 mr-1.5" /> {item.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
