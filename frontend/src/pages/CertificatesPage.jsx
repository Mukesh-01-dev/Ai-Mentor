import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Download,
  BookOpen,
  CheckCircle,
  Clock,
  ChevronRight,
  FileText,
} from "lucide-react";
import API_BASE_URL from "../lib/api";
import { useAuth } from "../context/AuthContext";

const CertificatesPage = () => {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/certificate/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCertificates();
  }, [user]);

  const handleDownload = async (courseId, courseTitle) => {
    try {
      setDownloadingId(courseId);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/certificate/generate?courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Failed to generate certificate");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = courseTitle.replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `Certificate_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Certificate download error:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const stats = data?.stats || {
    totalEnrolled: 0,
    completed: 0,
    certificatesEarned: 0,
    inProgress: 0,
  };
  const courses = data?.courses || [];

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-canvas-alt p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2D3436] dark:text-white">
                  My Certificates
                </h1>
                <p className="text-[#2D3436]/60 dark:text-gray-400 text-sm mt-0.5">
                  Track your achievements and download certificates
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-[#2D3436]/60 dark:text-gray-400 text-sm">
                  Loading certificates...
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  {
                    label: "Enrolled Courses",
                    value: stats.totalEnrolled,
                    icon: <BookOpen className="w-5 h-5 text-[#00bea3]" />,
                    bg: "bg-[#00bea3]/10 dark:bg-[#00bea3]/20",
                    color: "text-[#00bea3]",
                  },
                  {
                    label: "Courses Completed",
                    value: stats.completed,
                    icon: <CheckCircle className="w-5 h-5 text-[#28A745]" />,
                    bg: "bg-[#28A745]/10 dark:bg-[#28A745]/20",
                    color: "text-[#28A745]",
                  },
                  {
                    label: "Certificates Earned",
                    value: stats.certificatesEarned,
                    icon: <Award className="w-5 h-5 text-amber-500" />,
                    bg: "bg-amber-500/10 dark:bg-amber-500/20",
                    color: "text-amber-500",
                  },
                  {
                    label: "In Progress",
                    value: stats.inProgress,
                    icon: <Clock className="w-5 h-5 text-blue-500" />,
                    bg: "bg-blue-500/10 dark:bg-blue-500/20",
                    color: "text-blue-500",
                  },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#2D3436] rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-[#2D3436]/60 dark:text-gray-400 font-medium">
                        {s.label}
                      </span>
                      <div
                        className={`${s.bg} p-2.5 rounded-xl`}
                      >
                        {s.icon}
                      </div>
                    </div>
                    <span className={`text-3xl font-bold ${s.color}`}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Certificates Grid */}
              {courses.length === 0 ? (
                <div className="bg-white dark:bg-[#2D3436] rounded-2xl p-16 text-center shadow-md border border-gray-100 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-5">
                    <Award className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2D3436] dark:text-gray-200 mb-2">
                    No courses enrolled yet
                  </h3>
                  <p className="text-[#2D3436]/60 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Enroll in courses and complete them to earn your certificates!
                  </p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    <BookOpen className="w-5 h-5" />
                    Browse Courses
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.courseId}
                      className={`relative bg-white dark:bg-[#2D3436] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                        course.isCompleted
                          ? "border-amber-400/60 hover:border-amber-400"
                          : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                      }`}
                    >
                      {/* Completed badge */}
                      {course.isCompleted && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                            <CheckCircle className="w-3.5 h-3.5" />
                            COMPLETED
                          </div>
                        </div>
                      )}

                      {/* Course Image */}
                      <div className="relative h-44 overflow-hidden">
                        {course.courseImage || course.image ? (
                          <img
                            src={course.courseImage || course.image}
                            alt={course.courseTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {course.category && (
                          <span className="absolute bottom-3 left-3 px-2.5 py-1 text-xs font-semibold text-white bg-white/20 backdrop-blur-sm rounded-full">
                            {course.category}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-[#2D3436] dark:text-gray-200 mb-1.5 line-clamp-2">
                          {course.courseTitle}
                        </h3>
                        <p className="text-xs text-[#2D3436]/60 dark:text-gray-400 mb-3">
                          {course.lessons || `${course.totalLessons || 0} lessons`}
                        </p>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-[#2D3436]/60 dark:text-gray-400 font-medium">
                              Progress
                            </span>
                            <span
                              className={`font-bold ${
                                course.isCompleted
                                  ? "text-[#28A745]"
                                  : "text-blue-500"
                              }`}
                            >
                              {course.totalLessons > 0
                                ? Math.round(
                                    (course.completedLessons /
                                      course.totalLessons) *
                                      100
                                  )
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                course.isCompleted
                                  ? "bg-gradient-to-r from-[#28A745] to-emerald-400"
                                  : "bg-gradient-to-r from-blue-400 to-blue-600"
                              }`}
                              style={{
                                width: `${
                                  course.totalLessons > 0
                                    ? Math.round(
                                        (course.completedLessons /
                                          course.totalLessons) *
                                          100
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-[#2D3436]/50 dark:text-gray-500">
                            <FileText className="w-3 h-3" />
                            {course.completedLessons}/{course.totalLessons}{" "}
                            lessons
                          </div>
                        </div>

                        {/* Certificate Info or CTA */}
                        {course.isCompleted ? (
                          <div>

                            <button
                              onClick={() =>
                                handleDownload(
                                  course.courseId,
                                  course.courseTitle
                                )
                              }
                              disabled={downloadingId === course.courseId}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-yellow-600 disabled:opacity-60 disabled:cursor-wait transition-all shadow-md hover:shadow-lg"
                            >
                              {downloadingId === course.courseId ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Download className="w-5 h-5" />
                                  Download Certificate
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-sm text-[#2D3436]/50 dark:text-gray-500 mb-2">
                              Complete this course to earn your certificate
                            </p>
                            <Link
                              to={`/learning/${course.courseId}`}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                            >
                              Continue Learning
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
      </div>
    </main>
  );
};

export default CertificatesPage;
