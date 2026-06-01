import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  CheckCircle,
  TrendingUp,
  Flame,
  Play,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import API_BASE_URL from "../lib/api";
import FloatingAssistant from "../components/common/FloatingAssistant";

const WatchedVideos = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [videoData, setVideoData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalHours: "0.0",
    videosCompleted: 0,
    avgSession: "0min",
    learningStreak: "0 days",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchWatchedVideos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/watched-videos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setVideoData(data.videos);
        setMetrics(data.metrics);
        setCourses(data.courses || []);
      } else {
        console.error("Error fetching watched videos:", data.message);
        setError("Failed to load watched videos.");
      }
    } catch (err) {
      console.error("Error fetching watched videos:", err);
      setError("Failed to load watched videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchedVideos();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted">{t("watched.loading")}</p>
        </div>
      </main>
    );
  }

  // Format last watched date
  const formatLastWatched = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""
        } ago`;
    return date.toLocaleDateString();
  };

 const handleResume = (video) => {
    navigate(`/learning/${video.courseId}`, {
      state: { lessonId: video.lessonId },
    });
  };

  const continueWatching = [...videoData]
    .filter((v) => v.status === "in-progress")
    .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
    .slice(0, 6);

  // Filtered videos based on search and filters
  const filteredVideos = videoData.filter((video) => {
    const matchesSearch =
  video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (video.course || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      courseFilter === "All Courses" || video.course === courseFilter;
    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Completed" && video.status === "completed") ||
      (statusFilter === "In Progress" && video.status === "in-progress");
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case "Most Recent":
        return new Date(b.lastWatched) - new Date(a.lastWatched);
      case "Oldest First":
        return new Date(a.lastWatched) - new Date(b.lastWatched);
      case "Title A-Z":
        return a.title.localeCompare(b.title);
      case "Title Z-A":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  const MetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Hours */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-sm font-normal mb-1">
              {t("watched.total_hours")}
            </p>
            <p className="text-main text-2xl font-bold">
              {metrics.totalHours}h
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Videos Completed */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-sm font-normal mb-1">
              {t("watched.videos_completed")}
            </p>
            <p className="text-main text-2xl font-bold">
              {metrics.videosCompleted}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        </div>
      </div>

      {/* Avg Session */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-sm font-normal mb-1">
              {t("watched.avg_session")}
            </p>
            <p className="text-main text-2xl font-bold">
              {metrics.avgSession}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Learning Streak */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-sm font-normal mb-1">
              {t("watched.learning_streak")}
            </p>
            <p className="text-main text-2xl font-bold">
              {metrics.learningStreak}
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );


  // ── Continue Watching horizontal strip ────────────────────────────────────
  const ContinueWatchingSection = () => {
    if (continueWatching.length === 0) return null;
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-main text-xl font-bold flex items-center gap-2">
            <Play className="w-5 h-5 text-orange-500 fill-orange-500" />
            Continue Watching
          </h2>
          {continueWatching.length >= 4 && (
            <button
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              onClick={() => setStatusFilter("In Progress")}
            >
              See all <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {continueWatching.map((video) => (
            <div
              key={video.id}
              className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                 className="w-full h-48 object-cover"
                />
                {/* Play overlay */}
                <button
                  onClick={() => handleResume(video)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </button>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-300 dark:bg-gray-700">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${video.progress}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col">
                <h3 className="text-main text-sm font-semibold mb-0.5 line-clamp-1">{video.title}</h3>
                <p className="text-muted text-xs mb-3">{video.course}</p>
                <div className="flex justify-between text-xs text-muted mb-3">
                  <span className="text-orange-500 font-medium"> {Number(video.progress).toFixed(1)}% complete</span>
                  <span>{formatLastWatched(video.lastWatched)}</span>
                </div>
                <button
                  onClick={() => handleResume(video)}
                  className="mt-auto w-full h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const SearchAndFilters = () => (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm mb-6 lg:mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full lg:flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder={t("watched.search_placeholder")}
            className="w-full h-[42px] pl-10 pr-4 border border-border rounded-lg bg-input text-main placeholder-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            className="h-[43px] px-3 pr-8 border border-border rounded-lg bg-card text-main w-full sm:min-w-[160px]"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="All Courses">{t("watched.all_courses")}</option>
            {courses.map((course) => (
              <option key={course.id} value={course.title}>
                {course.title}
              </option>
            ))}
          </select>
          <select
            className="h-[43px] px-3 pr-8 border border-border rounded-lg bg-card text-main w-full sm:min-w-[120px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">{t("watched.all_status")}</option>
            <option value="Completed">{t("analytics.completed")}</option>
            <option value="In Progress">{t("watched.in_progress")}</option>
          </select>
          <select
            className="h-[43px] px-3 pr-8 border border-border rounded-lg bg-card text-main w-full sm:min-w-[140px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Most Recent">{t("watched.most_recent")}</option>
            <option value="Oldest First">{t("watched.oldest_first")}</option>
            <option value="Title A-Z">{t("watched.title_az")}</option>
            <option value="Title Z-A">{t("watched.title_za")}</option>
          </select>
          <button
            onClick={() => { setLoading(true); fetchWatchedVideos(); }}
            title="Refresh history"
            className="h-[43px] w-[43px] flex items-center justify-center border border-border rounded-lg bg-card text-muted hover:text-main hover:bg-canvas-alt transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const VideoCard = ({ video }) => (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Video Thumbnail */}
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300 dark:bg-gray-700">
          <div
            className={`h-full ${video.status === "completed"
                ? "bg-green-500"
                : video.status === "in-progress"
                  ? "bg-orange-500"
                  : "bg-gray-400"
              }`}
            style={{ width: `${video.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="text-main text-base font-semibold mb-1 line-clamp-1">
          {video.title}
        </h3>
        <p className="text-muted text-sm mb-3">{video.course}</p>

        <div className="flex justify-between items-center text-xs text-muted mb-4">
          <span
            className={
              video.status === "completed" ? "text-green-600 font-medium" : ""
            }
          >
            {video.status === "completed"
              ? t("analytics.completed")
              : `${Number(video.progress).toFixed(1)}${t("watched.percent_complete")}`}
          </span>
          <span>{formatLastWatched(video.lastWatched)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
        <button
            className={`flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
              video.status === "completed"
                ? "bg-canvas text-main hover:bg-canvas-alt"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
            onClick={() => handleResume(video)}
          >
            {video.status === "completed" ? (
              <>{t("watched.rewatch")}</>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                {t("watched.resume")}
              </>
            )}
          </button>
          <button
            className="w-7 h-10 flex items-center justify-center text-muted hover:text-main"
            onClick={() => console.log("More options for", video.title)}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-6 lg:mb-8">
            <h1
              className="text-main text-2xl md:text-3xl font-bold mb-1"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {t("watched.title")}
            </h1>
            <p
              className="text-muted text-sm md:text-base"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {t("watched.subtitle")}
            </p>
          </div>

        <MetricsCards />
        {/* <ContinueWatchingSection /> */}
        <SearchAndFilters />
        <h2 className="text-main text-lg font-bold mb-4">
          All Watch History
          <span className="ml-2 text-sm font-normal text-muted">
            ({sortedVideos.length} video{sortedVideos.length !== 1 ? "s" : ""})
          </span>
        </h2>

        {sortedVideos.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No watch history yet</p>
            <p className="text-sm mt-1">Start watching a course to see your history here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
            {sortedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
        <FloatingAssistant />
        </main>
    </>
  );
};

export default WatchedVideos;
