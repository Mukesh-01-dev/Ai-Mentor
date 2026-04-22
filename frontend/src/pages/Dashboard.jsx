import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
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
  Clock,
  Star,
  Award,
} from "lucide-react";
import Preferences from "../components/Preferences";

const Dashboard = () => {
  const { t } = useTranslation();
  const [coursesData, setCoursesData] = useState({
    statsCards: [],
    allCourses: [],
  });
  const searchQuery = "";
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
        await fetchUserProfile();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        console.log("Error details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

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
          icon: <Award className="w-5 h-5 text-purple-600" />,
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
      const courseInfo = coursesData.allCourses.find(
        (c) => c.id == purchasedCourse.courseId
      );
      if (courseInfo) {
        const totalLessons =
          courseInfo.lessonsCount ||
          (courseInfo.lessons
            ? courseInfo.lessons.includes(" of ")
              ? parseInt(courseInfo.lessons.split(" of ")[1])
              : parseInt(courseInfo.lessons.split(" ")[0])
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

  console.log("Creating myCourses with user:", user);
  console.log("coursesData.allCourses:", coursesData.allCourses);

  const myCourses = coursesData.allCourses
    .filter((course) =>
      user?.purchasedCourses?.some(
        (purchased) => purchased.courseId == course.id
      )
    )
    .map((course) => {
      const purchasedCourse = user?.purchasedCourses?.find(
        (p) => p.courseId == course.id
      );
      const totalLessons =
        course.lessonsCount ||
        (course.lessons
          ? course.lessons.includes(" of ")
            ? parseInt(course.lessons.split(" of ")[1])
            : parseInt(course.lessons.split(" ")[0])
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

  console.log("Creating continueLearning");

  const continueLearning = coursesData.allCourses
    .filter((course) =>
      user?.purchasedCourses?.some(
        (purchased) => purchased.courseId == course.id
      )
    )
    .filter((course) => {
      const purchasedCourse = user?.purchasedCourses?.find(
        (p) => p.courseId == course.id
      );
      const totalLessons =
        course.lessonsCount ||
        (course.lessons
          ? course.lessons.includes(" of ")
            ? parseInt(course.lessons.split(" of ")[1])
            : parseInt(course.lessons.split(" ")[0])
          : 0);
      const completedLessons =
        purchasedCourse?.progress?.completedLessons?.length || 0;
      return completedLessons > 0 && completedLessons < totalLessons;
    })
    .slice(0, 3)
    .map((course) => {
      const purchasedCourse = user?.purchasedCourses?.find(
        (p) => p.courseId === course.id
      );
      const totalLessons =
        course.lessonsCount ||
        (course.lessons
          ? course.lessons.includes(" of ")
            ? parseInt(course.lessons.split(" of ")[1])
            : parseInt(course.lessons.split(" ")[0])
          : 0);
      const completedLessons =
        purchasedCourse?.progress?.completedLessons?.length || 0;
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

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

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredMyCourses = myCourses.filter((course) => {
    if (!normalizedSearchQuery) return true;
    return (
      course.title?.toLowerCase().includes(normalizedSearchQuery) ||
      course.subtitle?.toLowerCase().includes(normalizedSearchQuery) ||
      course.level?.toLowerCase().includes(normalizedSearchQuery)
    );
  });

  const filteredContinueLearning = continueLearning.filter((course) => {
    if (!normalizedSearchQuery) return true;
    return (
      course.title?.toLowerCase().includes(normalizedSearchQuery) ||
      course.lesson?.toLowerCase().includes(normalizedSearchQuery)
    );
  });

  const filteredAllCourses = coursesData.allCourses.filter((course) => {
    if (!normalizedSearchQuery) return false;
    return (
      course.title?.toLowerCase().includes(normalizedSearchQuery) ||
      course.category?.toLowerCase().includes(normalizedSearchQuery) ||
      course.level?.toLowerCase().includes(normalizedSearchQuery)
    );
  });

  console.log("Final continueLearning:", continueLearning);

  const handleBrowseCourses = () => {
    navigate("/courses", { state: { activeTab: "explore" } });
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-canvas-alt p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted">{t("dashboard.loading")}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-canvas-alt p-6">
      <Preferences 
        key={localStorage.getItem("token")} 
        mode="modal" 
        onSuccess={() => { console.log('Preferences saved') }} 
      />
      <div className="max-w-7xl pt-16 mx-auto space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dynamicStatsCards.map((card, index) => {
                const statLabelKeys = ["ongoing_courses", "completed", "certificates", "hours_spent"];
                return (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 hover:border-teal-500/40 transition-all duration-300 cursor-pointer"
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
                  <div className="text-sm text-muted">{t(`dashboard.${statLabelKeys[index]}`)}</div>
                </div>
              );
              })}
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Popular Courses */}
              
<div>
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold text-main">
      {t("dashboard.popular_courses")}
    </h2>

    {/* Buttons */}
   <div className="flex gap-2">
  <button
    onClick={() => {
      document.getElementById("courseSlider").scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }}
    className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
  >
    <ChevronLeft className="w-4 h-4" />
  </button>

  <button
    onClick={() => {
      document.getElementById("courseSlider").scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }}
    className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
  >
    <ChevronRight className="w-4 h-4" />
  </button>
</div>
</div>


  {/* Slider */}
  <div
    id="courseSlider"
    className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
  >
    {coursesData.allCourses.slice(0, 10).map((course, index) => (
      <div
        key={index}
        className="bg-card rounded-xl border border-border w-64 flex-shrink-0 shadow-sm"
      >
        {/* Image */}
        <div className="relative h-40">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover rounded-t-xl"
          />

          {/* Rating */}
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-white font-semibold">
              {course.rating}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-main line-clamp-2">
            {course.title}
          </h3>

          <p className="text-xs text-muted">
            {course.lessons} • {course.level}
          </p>

          <div className="flex justify-between items-center mt-2">
            <span className="font-bold text-green-500">₹0</span>

            <button
              onClick={() => navigate(`/course-preview/${course.id}`)}
              className="px-3 py-1.5 text-xs bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              {t("dashboard.enroll")}
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
              

              

              

              {/* My Courses Table */}
              <div className="xl:col-span-2 flex flex-col">
                <h2 className="text-xl font-bold text-main mb-6">{t("dashboard.my_courses")}</h2>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    {filteredMyCourses.length !== 0 ? (
                      <table className="w-full">
                        <thead className="bg-canvas-alt">
                          <tr>
                            <th className="px-4 py-4 text-left text-sm font-medium text-muted">
                              {t("dashboard.course")}
                            </th>
                            <th className="px-4 py-4 text-left text-sm font-medium text-muted">
                              {t("dashboard.progress")}
                            </th>
                            <th className="px-4 py-4 text-left text-sm font-medium text-muted">
                              {t("dashboard.lessons")}
                            </th>
                            <th className="px-4 py-4 text-left text-sm font-medium text-muted">
                              {t("dashboard.level")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredMyCourses.map((course, index) => (
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
                    ) : normalizedSearchQuery && filteredAllCourses.length > 0 ? (
                      <div className="p-6">
                        <p className="text-center text-muted mb-4">
                          {t("dashboard.fallbackMatchingCourses")}
                        </p>
                        <div className="space-y-3">
                          {filteredAllCourses.slice(0, 6).map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-border bg-canvas-alt"
                            >
                              <div className="flex items-center min-w-0">
                                <img
                                  src={course.image}
                                  alt={course.title}
                                  className="w-12 h-12 rounded-lg mr-4"
                                />
                                <div className="min-w-0">
                                  <div className="font-medium text-main truncate">
                                    {course.title}
                                  </div>
                                  <div className="text-sm text-muted truncate">
                                    {course.category} • {course.level}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => navigate(`/course-preview/${course.id}`)}
                                className="ml-3 px-3 py-2 bg-teal-500 text-white text-xs font-medium rounded-lg hover:bg-teal-600"
                              >
                                {t("dashboard.view")}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted">
                        <p>
                          {normalizedSearchQuery
                            ? t("dashboard.no_courses_search")
                            : t("dashboard.no_courses_enrolled")}
                        </p>
                        <button
                          className="mt-4 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600"
                          onClick={handleBrowseCourses}
                        >
                          {t("dashboard.browse_courses")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Continue Learning */}
                {filteredContinueLearning.length !== 0 ? (
                  <div>
                    <h2 className="text-xl font-bold text-main mt-6 mb-6">
                      {t("dashboard.continue_learning")}
                    </h2>
                    <div className="space-y-4">
                      {filteredContinueLearning.map((item, index) => (
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
                              {t("dashboard.continue")}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  null
                  // <div className="p-6  text-muted">
                  //   <p>
                  //     {normalizedSearchQuery
                  //       ? "No in-progress courses match your search."
                  //       : "Start Learning to get your progress tracked!"}
                  //   </p>
                  //   <button
                  //     className="mt-4 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600"
                  //     onClick={() => navigate("/courses")}
                  //   >
                  //     My Courses
                  //   </button>
                  // </div>
              )}
              </div>

            </div>

          </div>
    </main>
  );
};

export default Dashboard;