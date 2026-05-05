import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Download,
  BookOpen,
  CheckCircle,
  Clock,
  ChevronRight,
  FileText,
  Eye,
  X,
  Sparkles,
} from "lucide-react";
import API_BASE_URL from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const CertificatesPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleClosePreview = useCallback((e) => {
    if (e.key === "Escape") setShowPreview(false);
  }, []);

  useEffect(() => {
    if (!showPreview) {
      document.removeEventListener("keydown", handleClosePreview);
      return () => {
        document.removeEventListener("keydown", handleClosePreview);
      };
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleClosePreview);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleClosePreview);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [showPreview, handleClosePreview]);

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

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted">{t("certificates.loading")}</p>
        </div>
      </main>
    );
  }

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
                  {t("certificates.title")}
                </h1>
                <p className="text-[#2D3436]/60 dark:text-gray-400 text-sm mt-0.5">
                  {t("certificates.subtitle")}
                </p>
              </div>
            </div>
          </div>
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  {
                    label: t("certificates.enrolled_courses"),
                    value: stats.totalEnrolled,
                    icon: <BookOpen className="w-5 h-5 text-[#00bea3]" />,
                    bg: "bg-[#00bea3]/10 dark:bg-[#00bea3]/20",
                    color: "text-[#00bea3]",
                  },
                  {
                    label: t("certificates.courses_completed"),
                    value: stats.completed,
                    icon: <CheckCircle className="w-5 h-5 text-[#28A745]" />,
                    bg: "bg-[#28A745]/10 dark:bg-[#28A745]/20",
                    color: "text-[#28A745]",
                  },
                  {
                    label: t("certificates.certificates_earned"),
                    value: stats.certificatesEarned,
                    icon: <Award className="w-5 h-5 text-amber-500" />,
                    bg: "bg-amber-500/10 dark:bg-amber-500/20",
                    color: "text-amber-500",
                  },
                  {
                    label: t("certificates.in_progress"),
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
                <div className="bg-white dark:bg-[#2D3436] rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px]">
                    {/* Left: Empty State */}
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-5">
                        <Award className="w-10 h-10 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold text-[#2D3436] dark:text-gray-200 mb-2">
                        {t("certificates.no_courses_title")}
                      </h3>
                      <p className="text-[#2D3436]/60 dark:text-gray-400 mb-6 max-w-sm">
                        {t("certificates.no_courses_desc")}
                      </p>
                      <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
                      >
                        <BookOpen className="w-5 h-5" />
                        {t("certificates.browse_courses")}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Right: Certificate Preview */}
                    <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-blue-950/40 flex flex-col items-center justify-center p-8 border-l border-gray-100 dark:border-gray-700">
                      {/* Label */}
                      <p className="text-xs font-semibold tracking-widest uppercase text-indigo-400 dark:text-indigo-300 mb-4">
                        {t("certificates.certificate_preview", {
                          defaultValue: "🏆 Certificate Preview",
                        })}
                      </p>

                      {/* Certificate Card */}
                      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 border-indigo-300 dark:border-indigo-600 overflow-hidden relative">
                        {/* Top color bar */}
                        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

                        <div className="p-6 text-center">
                          {/* Logo placeholder */}
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                              <Award className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-black text-sm tracking-tight">
                              <span className="text-[#00bea3]">UPTO</span>
                              <span className="text-orange-500">SKILLS</span>
                            </span>
                          </div>
                          <p className="text-[10px] text-indigo-400 italic mb-4">Learn and Earn Platform</p>

                          {/* Title */}
                          <h4 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide mb-0.5">
                            Certificate of Completion
                          </h4>
                          <div className="h-0.5 w-16 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto mb-4 rounded-full" />

                          <p className="text-[11px] text-gray-400 mb-1">This is to certify that</p>
                          <p className="text-base font-extrabold text-gray-800 dark:text-white mb-0.5 italic">
                            Your Name
                          </p>
                          <div className="h-px w-28 bg-gray-300 dark:bg-gray-600 mx-auto mb-3" />

                          <p className="text-[11px] text-gray-400 mb-1">has successfully completed</p>
                          <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 mb-3">
                            "Course Name"
                          </p>

                          {/* Bottom bar */}
                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                            <div className="text-left">
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Issue Date</p>
                              <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full border-2 border-indigo-300 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30">
                                <CheckCircle className="w-4 h-4 text-indigo-500" />
                              </div>
                              <p className="text-[8px] text-indigo-400 mt-0.5">VERIFIED</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Certificate ID</p>
                              <p className="text-[11px] font-mono font-semibold text-gray-700 dark:text-gray-300">
                                UTS-XXXXX
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
                          <span className="text-6xl font-black text-gray-900 dark:text-white rotate-[-30deg] tracking-widest">
                            UPTOSKILLS
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500 text-center max-w-xs">
                        Complete any course to earn your personalized certificate like this one!
                      </p>

                      {/* Preview Button */}
                      <button
                        onClick={() => setShowPreview(true)}
                        className="mt-5 group relative inline-flex items-center gap-2.5 px-7 py-3 rounded-2xl font-semibold text-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-indigo-400/40"
                        style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)", color: "white" }}
                      >
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <Eye className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Preview Full Certificate</span>
                        <Sparkles className="w-3.5 h-3.5 relative z-10 opacity-80" />
                      </button>
                    </div>
                  </div>
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
                            {t("certificates.completed_badge")}
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
                              {t("certificates.progress")}
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
                            {t("certificates.lessons")}
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
                                  {t("certificates.generating")}
                                </>
                              ) : (
                                <>
                                  <Download className="w-5 h-5" />
                                  {t("certificates.download")}
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-sm text-[#2D3436]/50 dark:text-gray-500 mb-2">
                              {t("certificates.complete_to_earn")}
                            </p>
                            <Link
                              to={`/learning/${course.courseId}`}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                            >
                              {t("certificates.continue_learning")}
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
      </div>

      {/* ── Full-Screen Certificate Preview Modal ── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(10,10,30,0.85)", backdropFilter: "blur(12px)" }}
          onClick={() => setShowPreview(false)}
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse"
              style={{ background: "radial-gradient(circle, #6366f1, transparent)", filter: "blur(60px)" }} />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 animate-pulse"
              style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", filter: "blur(60px)", animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-10 animate-pulse"
              style={{ background: "radial-gradient(circle, #a78bfa, transparent)", filter: "blur(80px)", animationDelay: "0.5s" }} />
          </div>

          {/* Close button */}
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-5 right-5 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ESC hint */}
          <p className="absolute top-6 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-widest uppercase">
            Press ESC or click outside to close
          </p>

          {/* Certificate wrapper — stops propagation so clicking cert doesn't close */}
          <div
            className="relative w-full max-w-2xl mx-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "certZoomIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            {/* Glow ring */}
            <div className="absolute -inset-1 rounded-3xl opacity-60 blur-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)" }} />

            {/* The certificate card */}
            <div
              className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-300 transition-all duration-500"
              style={{ transformStyle: "preserve-3d" }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                card.__tiltRect = card.getBoundingClientRect();
                card.style.willChange = "transform";
              }}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                card.__tiltPointer = { clientX: e.clientX, clientY: e.clientY };

                if (!card.__tiltRect) {
                  card.__tiltRect = card.getBoundingClientRect();
                }

                if (card.__tiltFrame) {
                  return;
                }

                card.__tiltFrame = requestAnimationFrame(() => {
                  const rect = card.__tiltRect;
                  const pointer = card.__tiltPointer;

                  if (!rect || !pointer) {
                    card.__tiltFrame = null;
                    return;
                  }

                  const x = ((pointer.clientX - rect.left) / rect.width - 0.5) * 18;
                  const y = ((pointer.clientY - rect.top) / rect.height - 0.5) * -18;
                  card.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
                  card.__tiltFrame = null;
                });
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;

                if (card.__tiltFrame) {
                  cancelAnimationFrame(card.__tiltFrame);
                  card.__tiltFrame = null;
                }

                card.__tiltRect = null;
                card.__tiltPointer = null;
                card.style.willChange = "";
                card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
              }}
            >
              {/* Top gradient bar */}
              <div className="h-3" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)" }} />

              <div className="p-10 text-center relative">
                {/* Corner brackets */}
                <div className="absolute top-5 left-5 w-7 h-7 border-t-2 border-l-2 border-indigo-300 rounded-tl-md" />
                <div className="absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 border-indigo-300 rounded-tr-md" />
                <div className="absolute bottom-5 left-5 w-7 h-7 border-b-2 border-l-2 border-indigo-300 rounded-bl-md" />
                <div className="absolute bottom-5 right-5 w-7 h-7 border-b-2 border-r-2 border-indigo-300 rounded-br-md" />

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-xl tracking-tight">
                    <span style={{ color: "#00bea3" }}>UPTO</span>
                    <span style={{ color: "#f97316" }}>SKILLS</span>
                  </span>
                </div>
                <p className="text-xs italic mb-6" style={{ color: "#6366f1" }}>Learn and Earn Platform</p>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-800 mb-1 tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
                  Certificate of Completion
                </h2>
                <div className="h-0.5 w-24 mx-auto mb-6 rounded-full"
                  style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />

                <p className="text-sm text-gray-400 mb-2">This is to certify that</p>
                <p className="text-2xl font-extrabold text-gray-800 mb-1 italic" style={{ fontFamily: "Georgia, serif" }}>
                  Your Name
                </p>
                <div className="h-px w-48 bg-gray-300 mx-auto mb-4" />

                <p className="text-sm text-gray-400 mb-2">has successfully completed the comprehensive</p>
                <p className="text-lg font-bold mb-1" style={{ color: "#6366f1" }}>"Course Name"</p>
                <p className="text-xs text-gray-400 mb-4">Program</p>

                <p className="text-xs text-gray-400 italic max-w-md mx-auto mb-6 leading-relaxed">
                  This certificate acknowledges the successful completion of all required coursework and assessments.
                  The recipient has demonstrated proficiency in the subject matter.
                </p>

                {/* Bottom section */}
                <div className="mt-4 pt-5 border-t border-gray-100 flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Issue Date</p>
                    <p className="text-sm font-bold text-gray-700">
                      {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-2 border-indigo-300 flex items-center justify-center bg-indigo-50 shadow-inner">
                      <CheckCircle className="w-7 h-7 text-indigo-500" />
                    </div>
                    <p className="text-[9px] font-bold text-indigo-400 mt-1 tracking-widest uppercase">Verified & Authentic</p>
                    <p className="text-[9px] text-gray-400">Official Seal</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Certificate ID</p>
                    <p className="text-sm font-bold font-mono text-gray-700">UTS-XXXXX</p>
                    {/* Mini QR placeholder */}
                    <div className="mt-1.5 w-10 h-10 ml-auto border border-gray-200 rounded flex items-center justify-center bg-gray-50">
                      <div className="grid grid-cols-3 gap-px w-6 h-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className={`rounded-[1px] ${[0,1,3,5,7,8].includes(i) ? "bg-gray-700" : "bg-transparent"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[8px] text-gray-300 mt-0.5">Scan to verify</p>
                  </div>
                </div>
              </div>

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.035]">
                <span className="text-8xl font-black text-gray-900 rotate-[-30deg] tracking-widest">
                  UPTOSKILLS
                </span>
              </div>
            </div>

            {/* Caption below */}
            <p className="text-center text-white/40 text-xs mt-4 tracking-wide">
              🏆 This is a preview of the certificate you&apos;ll receive upon completing a course
            </p>
          </div>

          <style>{`
            @keyframes certZoomIn {
              from { opacity: 0; transform: scale(0.80) translateY(30px); }
              to   { opacity: 1; transform: scale(1)    translateY(0px); }
            }
          `}</style>
        </div>
      )}
    </main>
  );
};

export default CertificatesPage;