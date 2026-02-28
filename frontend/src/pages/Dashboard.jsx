import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const [coursesData, setCoursesData] = useState({
    statsCards: [],
    allCourses: [],
  });
  const [loading, setLoading] = useState(true);
  const { user, fetchUserProfile } = useAuth();

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

        if (!coursesRes.ok) {
          throw new Error(`Courses API failed: ${coursesRes.status}`);
        }
        if (!statsRes.ok) {
          throw new Error(`Stats API failed: ${statsRes.status}`);
        }

        const allCourses = await coursesRes.json();
        const { statsCards } = await statsRes.json();

        console.log("Fetched allCourses:", allCourses);
        console.log("Fetched statsCards:", statsCards);

        setCoursesData({ allCourses, statsCards });
        await fetchUserProfile(); // Ensure user data is up to date
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        console.log("Error details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // Remove fetchUserProfile dependency to prevent re-fetching on every render

  // Calculate dynamic stats based on user's actual progress
  const calculateStats = () => {
    console.log("Calculating stats with user:", user);
    console.log("coursesData:", coursesData);

    if (
      !user?.purchasedCourses ||
      !coursesData.statsCards ||
      coursesData.statsCards.length < 4
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
      // Find the course in allCourses to get lesson count
      const courseInfo = coursesData.allCourses.find(
        (c) => c.id == purchasedCourse.courseId,
      );
      if (courseInfo) {
        const totalLessons = courseInfo.lessonsCount ||
          (courseInfo.lessons ?
            (courseInfo.lessons.includes(" of ")
              ? parseInt(courseInfo.lessons.split(" of ")[1])
              : parseInt(courseInfo.lessons.split(" ")[0]))
            : 0);
        const completedLessons =
          purchasedCourse.progress?.completedLessons?.length || 0;

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
  };

  const dynamicStatsCards = calculateStats();

  // Create dynamic myCourses from user data
  console.log("Creating myCourses with user:", user);
  console.log("coursesData.allCourses:", coursesData.allCourses);

  const myCourses = coursesData.allCourses
    .filter((course) =>
      user?.purchasedCourses?.some(
        (purchased) => purchased.courseId == course.id,
      ),
    )
    .map((course) => {
      const purchasedCourse = user?.purchasedCourses?.find(
        (p) => p.courseId == course.id,
      );
      const totalLessons = course.lessonsCount ||
        (course.lessons ?
          (course.lessons.includes(" of ")
            ? parseInt(course.lessons.split(" of ")[1])
            : parseInt(course.lessons.split(" ")[0]))
          : 0);
      const completedLessons =
        purchasedCourse?.progress?.completedLessons?.length || 0;

      const courseData = {
        id: course.id,
        title: course.title,
        subtitle: course.category,
        progress:
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
        lessons: `${completedLessons}/${totalLessons}`,
        level: course.level,
        levelColor:
          course.level === "Beginner"
            ? "bg-blue-100 text-blue-800"
            : course.level === "Intermediate"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800",
        image: course.image,
        progressColor: "bg-indigo-600",
      };

      console.log("Mapped course:", courseData);
      return courseData;
    });

  console.log("Final myCourses:", myCourses);

  // Create dynamic continueLearning from user data
  console.log("Creating continueLearning");

  const continueLearning = coursesData.allCourses
    .filter((course) =>
      user?.purchasedCourses?.some(
        (purchased) => purchased.courseId == course.id,
      ),
    )
    .filter((course) => {
      const purchasedCourse = user?.purchasedCourses?.find(
        (p) => p.courseId == course.id,
      );
      const totalLessons = course.lessonsCount ||
        (course.lessons ?
          (course.lessons.includes(" of ")
            ? parseInt(course.lessons.split(" of ")[1])
            : parseInt(course.lessons.split(" ")[0]))
          : 0);
      const completedLessons =
        purchasedCourse?.progress?.completedLessons?.length || 0;
      return completedLessons > 0 && completedLessons < totalLessons;
    })
    .slice(0, 3) // Limit to 3 courses
    .map((course) => {
      const purchasedCourse = user?.purchasedCourses?.find(
        (p) => p.courseId === course.id,
      );
      const totalLessons = course.lessonsCount ||
        (course.lessons ?
          (course.lessons.includes(" of ")
            ? parseInt(course.lessons.split(" of ")[1])
            : parseInt(course.lessons.split(" ")[0]))
          : 0);
      const completedLessons =
        purchasedCourse?.progress?.completedLessons?.length || 0;
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      // Get current lesson info
      const currentLesson = purchasedCourse?.progress?.currentLesson;
      const lessonTitle = currentLesson
        ? `Lesson ${currentLesson.lessonId}: ${currentLesson.moduleTitle}`
        : `Continue from Lesson ${completedLessons + 1}`;

      const continueData = {
        id: course.id,
        title: course.title,
        lesson: lessonTitle,
        progress: progress,
        image: course.image,
        progressColor: progress > 75 ? "bg-cyan-600" : "bg-orange-400",
      };

      console.log("Mapped continueLearning item:", continueData);
      return continueData;
    });

  console.log("Final continueLearning:", continueLearning);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-alt flex flex-col">
        <Header />
        <Sidebar activePage="dashboard" />
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
            }`}
        >
          <main className="flex-1 mt-10 overflow-x-hidden overflow-y-auto bg-canvas-alt p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted">Loading dashboard...</div>
            </div>
          </main>
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
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
          }`}
      >
        {/* Header */}

        {/* Dashboard Content */}
        <main className="flex-1 mt-3 overflow-x-hidden overflow-y-auto bg-canvas-alt p-6">
          <div className="max-w-7xl pt-16 mx-auto space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dynamicStatsCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${card.iconBg}`}>
                      {card.icon}
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {card.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-main mb-1">
                    {card.value}
                  </div>
                  <div className="text-sm text-muted">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Popular Courses */}
              <div className="xl:col-span-2">
                <h2 className="text-xl font-bold text-main mb-6">
                  Popular Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coursesData.allCourses.slice(0, 3).map((course, index) => (
                    <Link to={`/learning/${course.id}`} key={index}>
                      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm h-full">
                        <div className="relative">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-card rounded-full p-2">
                            <Bookmark className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="absolute bottom-3 right-3 bg-card rounded-full px-2 py-1 flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">
                              {course.rating}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${course.categoryColor}`}
                          >
                            {course.category}
                          </div>
                          <h3 className="font-semibold text-main mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted mb-4">
                            {course.lessons}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-main">
                              {course.price}
                            </span>
                            <span className="text-xs text-muted">
                              {course.students}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Course Topics Chart */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-xl font-bold text-main mb-6">
                  Course Topics
                </h2>
                <div className="relative flex items-center justify-center mb-6">
                  <div className="w-48 h-48 relative">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      {/* Pie chart segments */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#FF885A"
                        strokeWidth="40"
                        strokeDasharray="351.86 351.86"
                        strokeDashoffset="87.97"
                        transform="rotate(-90 100 100)"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#FFD0BD"
                        strokeWidth="40"
                        strokeDasharray="70.37 281.49"
                        strokeDashoffset="263.89"
                        transform="rotate(-90 100 100)"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#FFA988"
                        strokeWidth="40"
                        strokeDasharray="140.74 211.12"
                        strokeDashoffset="193.52"
                        transform="rotate(-90 100 100)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold">15</div>
                      <div className="text-xs text-muted">Total course</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-400 mr-3"></div>
                    <span className="text-sm text-muted">Code (70%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-200 mr-3"></div>
                    <span className="text-sm text-muted">Data (20%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-300 mr-3"></div>
                    <span className="text-sm text-muted">Design (10%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* My Courses Table */}
              <div className="xl:col-span-2">
                <h2 className="text-xl font-bold text-main mb-6">
                  My Courses
                </h2>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-canvas-alt">
                        <tr>
                          <th className="px-4 py-4 text-left text-sm font-medium text-muted">
                            Course
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-medium text-muted">
                            Progress
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-medium text-muted">
                            Lessons
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-medium text-muted">
                            Level
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {myCourses.map((course, index) => (
                          <tr key={index} className="hover:bg-canvas-alt">
                            <td className="px-4 py-4">
                              <Link
                                to={`/learning/${course.id}`}
                                className="flex items-center"
                              >
                                <img
                                  src={course.image}
                                  alt={course.title}
                                  className="w-12 h-12 rounded-lg mr-4"
                                />
                                <div>
                                  <div className="font-medium text-main hover:text-indigo-600">
                                    {course.title}
                                  </div>
                                  <div className="text-sm text-muted">
                                    {course.subtitle}
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td className="px-4 py-4">
                              <div className="w-20 bg-border rounded-full h-2 mb-1">
                                <div
                                  className={`h-2 rounded-full ${course.progressColor}`}
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                              <div className="text-sm text-muted">
                                {course.progress}%
                              </div>
                            </td>
                            <td className="px-4 py-4 text-muted">
                              {course.lessons}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${course.levelColor}`}
                              >
                                {course.level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Continue Learning */}
              <div>
                <h2 className="text-xl font-bold text-main mb-6">
                  Continue Learning
                </h2>
                <div className="space-y-4">
                  {continueLearning.map((item, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <Link
                          to={`/course-preview/${item.id}`}
                          className="flex items-center flex-1"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg mr-4"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-main mb-1 hover:text-teal-600">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted mb-2">
                              {item.lesson}
                            </p>
                            <div className="w-full bg-border rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full ${item.progressColor}`}
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </Link>
                        <Link
                          to={`/learning/${item.id}`}
                          className="ml-4 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600"
                        >
                          Continue
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Calendar */}
              <div className="xl:col-span-3 bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-main">
                    Class Calendar
                  </h2>
                  <div className="flex items-center space-x-4">
                    <button className="p-2 bg-gray-100 text-black rounded-lg">
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-medium">December 2024</span>
                    <button className="p-2 bg-gray-100 text-black rounded-lg">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-3 text-center text-sm font-medium text-muted"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                <div className="grid grid-cols-7 gap-px">
                  {Array.from({ length: 31 }, (_, i) => (
                    <div
                      key={i + 1}
                      className={`p-3 text-center text-sm ${[3, 5, 9, 12, 16, 19, 23].includes(i + 1)
                        ? "bg-blue-50 dark:bg-blue-100 text-blue-900 rounded-lg"
                        : "text-main hover:bg-canvas-alt rounded-lg"
                        }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-6 mt-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-muted">Upcoming</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-muted">Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-muted">Missed</span>
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-main mb-4">
                  Today's Schedule
                </h3>
                <div className="space-y-3">
                  {schedule.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${item.color}`}
                    >
                      <h4 className="font-medium text-black mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted">{item.time}</p>
                    </div>
                  ))}
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
