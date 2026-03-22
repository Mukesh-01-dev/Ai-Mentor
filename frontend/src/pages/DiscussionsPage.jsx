import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  RefreshCw,
  X,
  Send,
  Smile,
  Flag,
  Users,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Edit,
  Clock,
  EyeOff,
  Trash2,
  XCircle,
  Shield,
  Ban,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";

//helpers
const getRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
};

const Avatar = ({ src, name, size = "w-10 h-10" }) => {
  const imgSrc =
    src ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name || "User")}`;
  return (
    <img
      src={imgSrc}
      alt={name || "User"}
      className={`${size} rounded-full object-cover shrink-0`}
    />
  );
};

const GLOBAL_CATEGORIES = [
  "Course Discussion",
  "General",
  "Help & Support",
  "Feedback",
  "Off-Topic",
];

const CATEGORY_KEY_MAP = {
  "Course Discussion": "cat_course_discussion",
  General: "cat_general",
  "Help & Support": "cat_help_support",
  Feedback: "cat_feedback",
  "Off-Topic": "cat_off_topic",
};

const categoryColorMap = {
  "Course Discussion": "border-purple-500 text-purple-400",
  General: "border-blue-500 text-blue-400",
  "Help & Support": "border-green-500 text-green-400",
  Feedback: "border-yellow-500 text-yellow-400",
  "Off-Topic": "border-gray-500 text-gray-400",
};

//main component
const DiscussionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const getCategoryLabel = (cat) =>
    t(`discussions.${CATEGORY_KEY_MAP[cat]}`, cat);
  const { user } = useAuth();
  const { sidebarCollapsed } = useSidebar();
  const token = localStorage.getItem("token");

  //top level state
  const [activeView, setActiveView] = useState("courseCommunity"); // "courseCommunity" | "global"
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Course community state
  const [coursePosts, setCoursePosts] = useState([]);
  const [coursePostsLoading, setCoursePostsLoading] = useState(false);
  const [courseSort, setCourseSort] = useState("Recent");
  const [selectedCourse, setSelectedCourse] = useState(null); // { courseId, courseName }
  const [panelPosts, setPanelPosts] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelSort, setPanelSort] = useState("Recent");
  const [panelReplyText, setPanelReplyText] = useState("");
  const [panelReplyingTo, setPanelReplyingTo] = useState(null);
  const [panelReplyInputText, setPanelReplyInputText] = useState("");
  const [allCourses, setAllCourses] = useState([]);

  // Global community state
  const [globalPosts, setGlobalPosts] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalSort, setGlobalSort] = useState("Recent");
  const [globalCategoryFilter, setGlobalCategoryFilter] =
    useState("All Categories");
  const [globalContent, setGlobalContent] = useState("");
  const [globalCategory, setGlobalCategory] = useState("");
  const [expandedGlobalPost, setExpandedGlobalPost] = useState(null);
  const [globalReplyText, setGlobalReplyText] = useState("");

  // Reporting & moderation state
  const [reportModal, setReportModal] = useState({ open: false, postId: null, replyId: null });
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reports, setReports] = useState([]);
  const [activeModeration, setActiveModeration] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportAlreadyExists, setReportAlreadyExists] = useState(false); // reportId currently showing actions
  const [popupModal, setPopupModal] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: null,
    onConfirm: null,
  });

  // Editing state
  const [editingReply, setEditingReply] = useState({ postId: null, replyId: null });
  const [editReplyText, setEditReplyText] = useState("");

  // postId of the post being edited (only for global posts, course panel posts are edited inline with a textarea)
  const [editingPost, setEditingPost] = useState(null); // postId being edited
  const [editPostText, setEditPostText] = useState("");

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null); // stores postId or replyId of open dropdown

  const isAdmin = user?.role === "admin";

  const panelRef = useRef(null);
  const lastHandledFocusKeyRef = useRef("");

  const closePopupModal = () => {
    setPopupModal({
      open: false,
      title: "",
      message: "",
      confirmText: "OK",
      cancelText: null,
      onConfirm: null,
    });
  };

  const showInfoModal = (message, title = "Notice") => {
    setPopupModal({
      open: true,
      title,
      message,
      confirmText: "OK",
      cancelText: null,
      onConfirm: null,
    });
  };

  const showConfirmModal = (
    message,
    onConfirm,
    title = "Confirm Action",
    confirmText = "Confirm"
  ) => {
    setPopupModal({
      open: true,
      title,
      message,
      confirmText,
      cancelText: "Cancel",
      onConfirm,
    });
  };

  const handlePopupConfirm = async () => {
    const confirmAction = popupModal.onConfirm;
    closePopupModal();
    if (typeof confirmAction === "function") {
      await confirmAction();
    }
  };

  // Helper to get auth headers easily for API calls
  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // Fetch all courses (from courses.json via API)
  const fetchAllCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      // courses.json has popularCourses
      const list = data.popularCourses || data.courseCards || data || [];
      setAllCourses(Array.isArray(list) ? list : []);
    } catch {
      /* ignore */
    }
  }, [token]);

  // Course community - all posts across courses
  const fetchCoursePosts = useCallback(
    async (sort) => {
      setCoursePostsLoading(true);
      try {
        const q = sort === "Popular" ? "?sort=popular" : "";
        const res = await fetch(`/api/community/course-posts${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setCoursePosts(await res.json());
      } catch {
        setCoursePosts([]);
      } finally {
        setCoursePostsLoading(false);
      }
    },
    [token]
  );

  // Course panel - posts for a specific course
  const fetchPanelPosts = useCallback(
    async (courseId, sort) => {
      setPanelLoading(true);
      try {
        const q = sort === "Popular" ? "?sort=popular" : "";
        const res = await fetch(`/api/community/course/${courseId}${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setPanelPosts(await res.json());
      } catch {
        setPanelPosts([]);
      } finally {
        setPanelLoading(false);
      }
    },
    [token]
  );

  // Global posts
  const fetchGlobalPosts = useCallback(
    async (cat, sort) => {
      setGlobalLoading(true);
      try {
        const params = new URLSearchParams();
        if (cat && cat !== "All Categories") params.set("category", cat);
        if (sort === "Popular") params.set("sort", "popular");
        const res = await fetch(`/api/community/global?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setGlobalPosts(await res.json());
      } catch {
        setGlobalPosts([]);
      } finally {
        setGlobalLoading(false);
      }
    },
    [token]
  );

  // Create post
  const createPost = async (body) => {
    const res = await fetch("/api/community", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to create post");
    return res.json();
  };

  // Like / dislike / reply
  const doAction = async (id, action, body) => {
    const method = action === "reply" ? "POST" : "PUT";
    const res = await fetch(`/api/community/${id}/${action}`, {
      method,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error();
    return res.json();
  };

  // Report a post or reply
  const handleReport = async () => {
    if (!reportDescription.trim() || !reportModal.postId) return;
    setReportSubmitting(true);
    try {
      const res = await fetch(`/api/community/${reportModal.postId}/report`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          replyId: reportModal.replyId || undefined,
          reason: "other",
          description: reportDescription,
        }),
      });
      await res.json();
      if (!res.ok) {
        setReportModal({ open: false, postId: null, replyId: null });
        setReportDescription("");
        setReportAlreadyExists(true);
        return;
      }
      setReportModal({ open: false, postId: null, replyId: null });
      setReportDescription("");
      setReportSuccess(true);
    } catch {
      setReportModal({ open: false, postId: null, replyId: null });
      setReportDescription("");
      setReportAlreadyExists(true);
    } finally {
      setReportSubmitting(false);
    }
  };

  // Edit a reply
  const handleEditReply = async (postId, replyId, newText) => {
    if (!newText.trim()) return;
    try {
      const res = await fetch(`/api/community/${postId}/reply/${replyId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ text: newText }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();

      // Update the appropriate post list
      if (activeView === "courseCommunity") {
        if (selectedCourse) {
          setPanelPosts((prev) =>
            prev.map((p) => (p.id === postId ? updated : p))
          );
        } else {
          setCoursePosts((prev) =>
            prev.map((p) => (p.id === postId ? updated : p))
          );
        }
      } else {
        setGlobalPosts((prev) =>
          prev.map((p) => (p.id === postId ? updated : p))
        );
      }

      setEditingReply({ postId: null, replyId: null });
      setEditReplyText("");
    } catch (err) {
      console.error("Edit reply error:", err);
    }
  };

  // Delete a reply
  const handleDeleteReply = async (postId, replyId) => {
    try {
      const res = await fetch(`/api/community/${postId}/reply/${replyId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();

      // Update the appropriate post list
      if (activeView === "courseCommunity") {
        if (selectedCourse) {
          setPanelPosts((prev) =>
            prev.map((p) => (p.id === postId ? updated : p))
          );
        } else {
          setCoursePosts((prev) =>
            prev.map((p) => (p.id === postId ? updated : p))
          );
        }
      } else {
        setGlobalPosts((prev) =>
          prev.map((p) => (p.id === postId ? updated : p))
        );
      }
    } catch (err) {
      console.error("Delete reply error:", err);
    }
  };

  // Edit a post
  const handleEditPost = async (postId, newContent) => {
    if (!newContent.trim()) return;
    try {
      const res = await fetch(`/api/community/${postId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();

      // Update the appropriate post list
      if (activeView === "courseCommunity") {
        if (selectedCourse) {
          setPanelPosts((prev) =>
            prev.map((p) => (p.id === postId ? updated : p))
          );
        }
        setCoursePosts((prev) =>
          prev.map((p) => (p.id === postId ? updated : p))
        );
      } else {
        setGlobalPosts((prev) =>
          prev.map((p) => (p.id === postId ? updated : p))
        );
      }

      setEditingPost(null);
      setEditPostText("");
    } catch (err) {
      console.error("Edit post error:", err);
      showInfoModal("Failed to edit post");
    }
  };

  // Delete a post
  const handleDeletePost = async (postId) => {
    try {
      const res = await fetch(`/api/community/${postId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();

      // Remove from the appropriate post list
      if (activeView === "courseCommunity") {
        if (selectedCourse) {
          setPanelPosts((prev) => prev.filter((p) => p.id !== postId));
        }
        setCoursePosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        setGlobalPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Delete post error:", err);
      showInfoModal("Failed to delete post");
    }
  };

  // Fetch reports (admin only)
  const fetchReports = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch("/api/community/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReports(await res.json());
    } catch {
      /* ignore */
    }
  }, [token, isAdmin]);

  const executeModeration = async (reportId, action) => {
    try {
      const res = await fetch(`/api/community/reports/${reportId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showInfoModal(data.message || "Failed to moderate report");
        return;
      }

      await fetchReports();
      setActiveModeration(null);
      // Refresh posts to reflect changes
      if (activeView === "global") fetchGlobalPosts(globalCategoryFilter, globalSort);
      if (activeView === "courseCommunity") {
        fetchCoursePosts(courseSort);
        if (selectedCourse) fetchPanelPosts(selectedCourse.courseId, panelSort);
      }
    } catch {
      showInfoModal("Failed to moderate report");
    }
  };

  // Moderate a report (admin only)
  const handleModerate = async (reportId, action) => {
    if (!reportId) return;
    if (action === "deleted") {
      showConfirmModal(
        "Are you sure you want to delete this content?",
        () => executeModeration(reportId, action),
        "Confirm Delete",
        "Delete"
      );
      return;
    }
    await executeModeration(reportId, action);
  };

  const handleUnhide = async (postId, replyId = null) => {
    try {
      const res = await fetch(`/api/community/${postId}/unhide`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(replyId ? { replyId } : {}),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showInfoModal(data.message || "Failed to unhide content");
        return;
      }

      const updatedPost = data.post;
      if (updatedPost?.id) {
        setCoursePosts((prev) =>
          prev.map((p) => (String(p.id) === String(updatedPost.id) ? updatedPost : p))
        );
        setPanelPosts((prev) =>
          prev.map((p) => (String(p.id) === String(updatedPost.id) ? updatedPost : p))
        );
        setGlobalPosts((prev) =>
          prev.map((p) => (String(p.id) === String(updatedPost.id) ? updatedPost : p))
        );
      }

      await fetchReports();
    } catch {
      showInfoModal("Failed to unhide content");
    }
  };

  // Helper: get reports for a specific post/reply
  const getReportsForContent = (postId, replyId = null) =>
    reports.filter((r) =>
      String(r.postId) === String(postId) &&
      (replyId ? String(r.replyId) === String(replyId) : !r.replyId)
    );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusPostId = params.get("focusPost");
    const focusReplyId = params.get("focusReply");
    const postType = params.get("postType");
    const courseId = params.get("courseId");
    const courseName = params.get("courseName");

    if (!focusPostId) {
      lastHandledFocusKeyRef.current = "";
      return;
    }

    if (postType === "global") {
      setActiveView("global");
      if (focusReplyId) {
        setExpandedGlobalPost(focusPostId);
      }
      return;
    }

    if (postType === "course") {
      setActiveView("courseCommunity");
      if (courseId) {
        const normalizedCourseId = Number(courseId);
        if (!Number.isNaN(normalizedCourseId)) {
          setSelectedCourse((prev) => {
            if (prev?.courseId === normalizedCourseId) return prev;
            return {
              courseId: normalizedCourseId,
              courseName: courseName || prev?.courseName || "Course",
            };
          });
        }
      }
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusPostId = params.get("focusPost");
    const focusReplyId = params.get("focusReply");
    const focusKey = `${focusPostId || ""}:${focusReplyId || ""}`;
    if (!focusPostId || lastHandledFocusKeyRef.current === focusKey) return;

    const selector = focusReplyId
      ? `[data-reply-id="${focusReplyId}"][data-parent-post-id="${focusPostId}"]`
      : `[data-post-id="${focusPostId}"]`;

    const target = document.querySelector(selector);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("ring-2", "ring-orange-500", "ring-offset-2", "ring-offset-card");
    window.setTimeout(() => {
      target.classList.remove("ring-2", "ring-orange-500", "ring-offset-2", "ring-offset-card");
    }, 2500);

    lastHandledFocusKeyRef.current = focusKey;

    // Make notification deep-link one-time: remove focus params after successful focus.
    const cleanedParams = new URLSearchParams(location.search);
    cleanedParams.delete("focusPost");
    cleanedParams.delete("focusReply");
    cleanedParams.delete("postType");
    cleanedParams.delete("courseId");
    cleanedParams.delete("courseName");
    const nextSearch = cleanedParams.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true }
    );
  }, [
    location.search,
    location.pathname,
    navigate,
    activeView,
    selectedCourse,
    expandedGlobalPost,
    globalPosts,
    panelPosts,
    coursePosts,
  ]);

  // Initial fetch of all courses for dropdowns and course name lookups
  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  useEffect(() => {
    if (activeView === "courseCommunity") fetchCoursePosts(courseSort);
  }, [activeView, courseSort, fetchCoursePosts]);

  useEffect(() => {
    if (activeView === "global")
      fetchGlobalPosts(globalCategoryFilter, globalSort);
  }, [activeView, globalCategoryFilter, globalSort, fetchGlobalPosts]);

  useEffect(() => {
    if (selectedCourse) fetchPanelPosts(selectedCourse.courseId, panelSort);
  }, [selectedCourse, panelSort, fetchPanelPosts]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  // Handlers for like, dislike, and reply actions that update the appropriate post list on success
  const handleLike = async (postId, source) => {
    try {
      const updated = await doAction(postId, "like");
      patchPost(updated, source);
    } catch {
      /* ignore */
    }
  };

  const handleDislike = async (postId, source) => {
    try {
      const updated = await doAction(postId, "dislike");
      patchPost(updated, source);
    } catch {
      /* ignore */
    }
  };

  const handleReplySubmit = async (postId, text, source) => {
    if (!text.trim()) return;
    try {
      const updated = await doAction(postId, "reply", { text });
      patchPost(updated, source);
    } catch {
      /* ignore */
    }
  };

  const patchPost = (updated, source) => {
    const replace = (list) =>
      list.map((p) => (p.id === updated.id ? updated : p));
    if (source === "courseGrid") setCoursePosts(replace);
    if (source === "panel") setPanelPosts(replace);
    if (source === "global") setGlobalPosts(replace);
  };

  // Post in course panel
  const handlePanelPost = async (text) => {
    if (!text.trim() || !selectedCourse) return;
    try {
      const newPost = await createPost({
        type: "course",
        courseId: selectedCourse.courseId,
        courseName: selectedCourse.courseName,
        content: text,
      });
      setPanelPosts((prev) => [newPost, ...prev]);
      setCoursePosts((prev) => [newPost, ...prev]);
      setPanelReplyText("");
    } catch {
      /* ignore */
    }
  };

  // Post in global
  const handleGlobalPost = async (e) => {
    e.preventDefault();
    if (!globalContent.trim() || !globalCategory) return;
    try {
      const newPost = await createPost({
        type: "global",
        category: globalCategory,
        content: globalContent,
      });
      setGlobalPosts((prev) => [newPost, ...prev]);
      setGlobalContent("");
      setGlobalCategory("");
    } catch {
      /* ignore */
    }
  };

  /* helper: find course name from coursePosts for display */
  const courseNameForPost = (post) =>
    post.courseName || `Course #${post.courseId}`;

  //Render
  return (
    <div className="min-h-screen bg-canvas-alt flex flex-col">
      <Header />
      <Sidebar activePage="discussions" />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 mt-10 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
        }`}
      >
        <div className="relative overflow-hidden bg-linear-to-br from-teal-700 via-teal-600 to-teal-800 pt-16 pb-12 px-4 sm:px-8">
          {/* grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
              {activeView === "courseCommunity" ? (
                <>
                  {t("discussions.course_communities").split(" ")[0]}{" "}
                  <span className="text-yellow-400">
                    {t("discussions.course_communities")
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                  </span>
                </>
              ) : (
                <span className="text-orange-400">
                  {t("discussions.global_title")}
                </span>
              )}
            </h1>
            <p className="text-teal-100 text-sm sm:text-base max-w-xl mx-auto">
              {t("discussions.global_subtitle")}
            </p>
            {/* Tabs */}
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveView("courseCommunity")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeView === "courseCommunity"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-black/30 text-white hover:bg-black/40"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                {t("discussions.course_communities")}
              </button>
              <button
                onClick={() => setActiveView("global")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeView === "global"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-black/30 text-white hover:bg-black/40"
                }`}
              >
                <Users className="w-4 h-4" />
                {t("discussions.global_btn")}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex relative">
          {activeView === "courseCommunity" && (
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div
                className={`max-w-5xl mx-auto ${
                  selectedCourse ? "xl:mr-105" : ""
                }`}
              >
                {/* header row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-bold text-main">
                      {t("discussions.recent")}{" "}
                      <span className="text-muted font-normal text-base">
                        ({coursePosts.length})
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted" />
                    {["Recent", "Popular"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setCourseSort(s)}
                        className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
                          courseSort === s
                            ? "bg-red-500 text-white"
                            : "bg-card border border-border text-muted hover:text-main"
                        }`}
                      >
                        {s === "Recent"
                          ? t("discussions.sort_recent")
                          : t("discussions.sort_popular")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* grid of discussion cards */}
                {coursePostsLoading ? (
                  <div className="text-center py-12 text-muted">
                    {t("discussions.loading")}
                  </div>
                ) : coursePosts.length === 0 ? (
                  <div className="text-center py-12 text-muted">
                    {t("discussions.no_course")}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allCourses.map((c) => (
                        <button
                          key={c.id}
                          onClick={() =>
                            setSelectedCourse({
                              courseId: c.id,
                              courseName: c.title,
                            })
                          }
                          className="bg-card border border-border rounded-xl p-4 text-left hover:border-indigo-500 transition-colors"
                        >
                          <h3 className="font-semibold text-main">{c.title}</h3>
                          <p className="text-xs text-muted mt-1">
                            {c.category}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coursePosts
                        .filter((post) => isAdmin || !post.hiddenAt)
                        .map((post) => (
                        <div
                          key={post.id}
                          onClick={() =>
                            setSelectedCourse({
                              courseId: post.courseId,
                              courseName: courseNameForPost(post),
                            })
                          }
                          className={`bg-card border border-border rounded-xl p-5 shadow-sm hover:border-indigo-500/50 cursor-pointer transition-colors ${
                            post.hiddenAt ? "opacity-60" : ""
                          }`}
                        >
                          {isAdmin && post.hiddenAt && (
                            <div className="flex items-center gap-2 text-xs text-yellow-500 mb-2">
                              <EyeOff className="w-3 h-3" />
                              Hidden by moderator
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnhide(post.id);
                                }}
                                className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                              >
                                Unhide
                              </button>
                            </div>
                          )}
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar src={post.author?.avatar_url} name={post.author?.name} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-main text-sm">
                                  {post.author?.name || "Unknown"}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-600 text-white truncate max-w-35">
                                  {courseNameForPost(post)}
                                </span>
                              </div>
                              <span className="text-xs text-muted">
                                {getRelativeTime(post.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted line-clamp-2 mb-3">
                            {post.content}
                          </p>
                          <div className="border-t border-border pt-3 flex items-center gap-4 text-muted text-xs">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              {post.likes?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {post.replies?.length || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* quick-start: select a course to start new discussion */}
                    <div className="mt-8">
                      <h3 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">
                        {t("discussions.start_in_course")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {allCourses.map((c) => (
                          <button
                            key={c.id}
                            onClick={() =>
                              setSelectedCourse({
                                courseId: c.id,
                                courseName: c.title,
                              })
                            }
                            className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-main hover:border-indigo-500 transition-colors"
                          >
                            {c.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {selectedCourse && (
                <div
                  ref={panelRef}
                  className="fixed top-18 right-0 h-[calc(100%-72px)] w-full sm:w-100 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
                >
                  {/* panel header */}
                  <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-bold text-main">Community</h3>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {selectedCourse.courseName} &bull; {panelPosts.length}{" "}
                        messages
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          fetchPanelPosts(selectedCourse.courseId, panelSort)
                        }
                        className="p-1.5 rounded-lg hover:bg-canvas-alt text-muted"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedCourse(null)}
                        className="p-1.5 rounded-lg hover:bg-canvas-alt text-muted"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* panel sort tabs */}
                  <div className="flex border-b border-border shrink-0">
                    {["Recent", "Popular"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPanelSort(s)}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                          panelSort === s
                            ? "bg-indigo-600/10 text-indigo-500 border-b-2 border-indigo-500"
                            : "text-muted hover:text-main"
                        }`}
                      >
                        {s === "Recent" ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5" />
                        )}
                        {s === "Recent"
                          ? t("discussions.sort_recent")
                          : t("discussions.sort_popular")}
                      </button>
                    ))}
                  </div>

                  {/* panel messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {panelLoading ? (
                      <div className="text-center py-8 text-muted text-sm">
                        {t("common.loading")}
                      </div>
                    ) : panelPosts.length === 0 ? (
                      <div className="text-center py-8 text-muted text-sm">
                        {t("discussions.no_messages")}
                      </div>
                    ) : (
                      panelPosts
                        .filter((post) => isAdmin || !post.hiddenAt)
                        .map((post) => (
                        <div
                          key={post.id}
                          data-post-id={post.id}
                          className={`space-y-2 ${post.hiddenAt ? "opacity-50" : ""}`}
                        >
                          {/* Admin: hidden badge */}
                          {isAdmin && post.hiddenAt && (
                            <div className="flex items-center gap-2 text-xs text-yellow-500">
                              <EyeOff className="w-3 h-3" />
                              Hidden by moderator
                              <button
                                onClick={() => handleUnhide(post.id)}
                                className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                              >
                                Unhide
                              </button>
                            </div>
                          )}
                          {/* Admin: report badge for panel post */}
                          {isAdmin && getReportsForContent(post.id).length > 0 && (
                            <div>
                              <button
                                onClick={() => setActiveModeration(activeModeration === `panel-post-${post.id}` ? null : `panel-post-${post.id}`)}
                                className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-medium rounded-md hover:bg-orange-500/30 transition-colors"
                              >
                                <Shield className="w-2.5 h-2.5" />
                                {getReportsForContent(post.id).length} report{getReportsForContent(post.id).length > 1 ? "s" : ""}
                              </button>
                              {activeModeration === `panel-post-${post.id}` && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-muted">
                                    {getReportsForContent(post.id).length} pending reports
                                  </span>
                                  <button onClick={() => handleModerate(getReportsForContent(post.id)[0]?.id, "hidden")} className="p-0.5 text-yellow-500 hover:bg-yellow-500/20 rounded disabled:opacity-50" title="Hide" disabled={!getReportsForContent(post.id)[0]?.id}>
                                    <EyeOff className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => handleModerate(getReportsForContent(post.id)[0]?.id, "deleted")} className="p-0.5 text-red-500 hover:bg-red-500/20 rounded disabled:opacity-50" title="Delete" disabled={!getReportsForContent(post.id)[0]?.id}>
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => handleModerate(getReportsForContent(post.id)[0]?.id, "dismissed")} className="p-0.5 text-gray-400 hover:bg-gray-500/20 rounded disabled:opacity-50" title="Dismiss" disabled={!getReportsForContent(post.id)[0]?.id}>
                                    <XCircle className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <Avatar src={post.author?.avatar_url} name={post.author?.name} size="w-9 h-9" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-main text-sm">
                                    {post.author?.name || "Unknown"}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-600/20 text-indigo-400 flex items-center gap-0.5">
                                    <Users className="w-2.5 h-2.5" />
                                    {courseNameForPost(post)}
                                  </span>
                                  <span className="text-[11px] text-muted">
                                    {getRelativeTime(post.createdAt)}
                                  </span>
                                </div>
                                {/* Three dots menu for all users */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdown(openDropdown === `post-${post.id}` ? null : `post-${post.id}`);
                                    }}
                                    className="text-muted hover:text-orange-500 p-0.5 transition-colors"
                                    title="More options"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  {/* Dropdown Menu */}
                                  {openDropdown === `post-${post.id}` && (
                                    <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-30">
                                      {post.userId === user?.id ? (
                                        <>
                                          {/* Edit and Delete options for post owner */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingPost(post.id);
                                              setEditPostText(post.content || "");
                                              setOpenDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-main hover:bg-surface-light transition-colors flex items-center gap-2"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeletePost(post.id);
                                              setOpenDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-surface-light transition-colors flex items-center gap-2"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                          </button>
                                        </>
                                      ) : (
                                        /* Report option for other users */
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setReportModal({ open: true, postId: post.id, replyId: null });
                                            setOpenDropdown(null);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm text-main hover:bg-surface-light transition-colors flex items-center gap-2"
                                        >
                                          <Flag className="w-3.5 h-3.5" />
                                          Report
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {editingPost === post.id ? (
                                <div className="mt-1">
                                  <textarea
                                    value={editPostText}
                                    onChange={(e) => setEditPostText(e.target.value)}
                                    rows={3}
                                    className="w-full px-2 py-1 text-sm bg-surface-light border border-border-light rounded focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 mt-1">
                                    <button
                                      onClick={() => handleEditPost(post.id, editPostText)}
                                      className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingPost(null);
                                        setEditPostText("");
                                      }}
                                      className="px-3 py-1 text-xs bg-surface-light hover:bg-surface-lighter rounded"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-muted mt-1">{post.content}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLike(post.id, "panel");
                                  }}
                                  className={`flex items-center gap-1 hover:text-indigo-500 ${
                                    post.likes?.some(
                                      (l) => l.userId === user?.id
                                    )
                                      ? "text-indigo-500"
                                      : ""
                                  }`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  {post.likes?.length || 0}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDislike(post.id, "panel");
                                  }}
                                  className={`flex items-center gap-1 hover:text-red-500 ${
                                    post.dislikes?.some(
                                      (d) => d.userId === user?.id
                                    )
                                      ? "text-red-500"
                                      : ""
                                  }`}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  {post.dislikes?.length || 0}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPanelReplyingTo(
                                      panelReplyingTo === post.id
                                        ? null
                                        : post.id
                                    );
                                    setPanelReplyInputText("");
                                  }}
                                  className="hover:text-main cursor-pointer bg-transparent p-0 border-0"
                                  aria-expanded={panelReplyingTo === post.id}
                                  aria-controls={`panel-reply-${post.id}`}
                                >
                                  {t("discussions.reply")} (
                                  {post.replies?.length || 0})
                                </button>
                              </div>

                              {/* Reply Input */}
                              {panelReplyingTo === post.id && (
                                <div
                                  className="mt-2 flex items-center gap-2"
                                  id={`panel-reply-${post.id}`}
                                >
                                  <input
                                    type="text"
                                    placeholder="Write a reply..."
                                    value={panelReplyInputText}
                                    onChange={(e) =>
                                      setPanelReplyInputText(e.target.value)
                                    }
                                    onKeyDown={async (e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        const text = panelReplyInputText.trim();
                                        if (!text) {
                                          return;
                                        }
                                        try {
                                          await handleReplySubmit(
                                            post.id,
                                            text,
                                            "panel"
                                          );
                                          setPanelReplyInputText("");
                                          setPanelReplyingTo(null);
                                        } catch (err) {
                                          // Keep input/UI open so the user doesn't lose their text
                                          console.error(
                                            "Failed to submit reply from panel input:",
                                            err
                                          );
                                        }
                                      }
                                    }}
                                    className="flex-1 px-3 py-1.5 bg-input border border-border rounded-lg text-xs text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={async () => {
                                      const text = panelReplyInputText.trim();
                                      if (!text) {
                                        return;
                                      }
                                      try {
                                        await handleReplySubmit(
                                          post.id,
                                          text,
                                          "panel"
                                        );
                                        setPanelReplyInputText("");
                                        setPanelReplyingTo(null);
                                      } catch (err) {
                                        // Keep input/UI open so the user doesn't lose their text
                                        console.error(
                                          "Failed to submit reply from panel button:",
                                          err
                                        );
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                                  >
                                    <Send className="w-3 h-3" />
                                    Reply
                                  </button>
                                </div>
                              )}

                              {/* Replies */}
                              {post.replies?.length > 0 && (
                                <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
                                  {post.replies.filter((r) => isAdmin || !r.hidden).map((r) => (
                                    <div
                                      key={r.id}
                                      data-reply-id={r.id}
                                      data-parent-post-id={post.id}
                                      className="flex items-start gap-2 group/panelreply"
                                    >
                                      <Avatar src={r.userAvatar} name={r.userName} size="w-6 h-6" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs font-medium text-main">
                                            {r.userName || "Unknown"}
                                          </span>
                                          <span className="text-[10px] text-muted ml-1">
                                            {getRelativeTime(r.createdAt)}
                                          </span>
                                          {r.edited && (
                                            <span className="text-[9px] text-muted italic">(edited)</span>
                                          )}
                                          {isAdmin && r.hidden && (
                                            <>
                                              <span className="text-[9px] text-yellow-500">Hidden</span>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUnhide(post.id, r.id);
                                                }}
                                                className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                              >
                                                Unhide
                                              </button>
                                            </>
                                          )}
                                          {/* Three dots menu for all users */}
                                          <div className="relative inline-block">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdown(openDropdown === `reply-${r.id}` ? null : `reply-${r.id}`);
                                              }}
                                              className="text-muted hover:text-orange-500 transition-all p-0.5 ml-1"
                                              title="More options"
                                            >
                                              <MoreVertical className="w-2.5 h-2.5" />
                                            </button>
                                            {/* Dropdown Menu */}
                                            {openDropdown === `reply-${r.id}` && (
                                              <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-30">
                                                {r.userId === user?.id ? (
                                                  <>
                                                    {/* Edit and Delete options for reply owner */}
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingReply({ postId: post.id, replyId: r.id });
                                                        setEditReplyText(r.text);
                                                        setOpenDropdown(null);
                                                      }}
                                                      className="w-full px-3 py-2 text-left text-xs text-main hover:bg-surface-light transition-colors flex items-center gap-2"
                                                    >
                                                      <Edit className="w-3 h-3" />
                                                      Edit
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteReply(post.id, r.id);
                                                        setOpenDropdown(null);
                                                      }}
                                                      className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-surface-light transition-colors flex items-center gap-2"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                      Delete
                                                    </button>
                                                  </>
                                                ) : (
                                                  /* Report option for other users */
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setReportModal({ open: true, postId: post.id, replyId: r.id });
                                                      setOpenDropdown(null);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-xs text-main hover:bg-surface-light transition-colors flex items-center gap-2"
                                                  >
                                                    <Flag className="w-3 h-3" />
                                                    Report
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {editingReply.postId === post.id && editingReply.replyId === r.id ? (
                                          <div className="mt-1">
                                            <input
                                              type="text"
                                              value={editReplyText}
                                              onChange={(e) => setEditReplyText(e.target.value)}
                                              className="w-full px-2 py-1 text-xs bg-surface-light border border-border-light rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                              autoFocus
                                            />
                                            <div className="flex gap-1 mt-1">
                                              <button
                                                onClick={() => handleEditReply(post.id, r.id, editReplyText)}
                                                className="px-2 py-0.5 text-[10px] bg-purple-600 hover:bg-purple-700 rounded"
                                              >
                                                Save
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setEditingReply({ postId: null, replyId: null });
                                                  setEditReplyText("");
                                                }}
                                                className="px-2 py-0.5 text-[10px] bg-surface-light hover:bg-surface-lighter rounded"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-muted mt-0.5">
                                            {r.text}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* panel input */}
                  <div className="p-3 border-t border-border shrink-0">
                    <div className="flex items-center gap-2">
                      <Smile className="w-5 h-5 text-muted shrink-0" />
                      <input
                        type="text"
                        placeholder={t("discussions.share_thoughts")}
                        value={panelReplyText}
                        onChange={(e) => {
                          if (e.target.value.length <= 1000)
                            setPanelReplyText(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handlePanelPost(panelReplyText);
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handlePanelPost(panelReplyText)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {t("discussions.send")}
                      </button>
                    </div>
                    <div className="text-right text-[11px] text-muted mt-1">
                      {panelReplyText.length}/1000 characters
                    </div>
                  </div>
                </div>
              )}
            </main>
          )}

          {activeView === "global" && (
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Welcome Banner */}
                {showWelcome && (
                  <div className="relative bg-linear-to-r from-red-900/30 to-orange-900/30 border border-orange-500/30 rounded-xl p-5">
                    {/* Close Button */}
                    <button
                      onClick={() => setShowWelcome(false)}
                      className="absolute top-3 right-3 text-orange-300 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>

                      <div>
                        <h3 className="font-bold text-main text-lg">
                          Welcome to Global Discussion!
                        </h3>

                        <p className="text-muted text-sm mt-1">
                          Connect, share insights, find partners, and discuss
                          anything globally.
                        </p>

                        <div className="relative group inline-block">
                          <button
                            onClick={() => setShowGuidelines(!showGuidelines)}
                            className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                          >
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                            Community Guidelines
                          </button>

                          <div
                            className={`
              absolute left-0 top-full mt-2 md:w-96 w-60 bg-[#1E1E24] border border-orange-500/30 rounded-lg p-3
              text-xs text-gray-300 shadow-lg z-50 transition-all duration-200
              ${showGuidelines ? "opacity-100 visible" : "opacity-0 invisible"}
            `}
                          >
                            <ul className="space-y-1">
                              <li>
                                - Be respectful and courteous to all members.
                              </li>
                              <li>
                                - Avoid spam, promotions, or irrelevant links.
                              </li>
                              <li>
                                - Keep discussions related to learning and
                                courses.
                              </li>
                              <li>
                                - Respect different opinions and perspectives.
                              </li>
                              <li>
                                - Do not share personal or sensitive
                                information.
                              </li>
                              <li>
                                - Help maintain a positive and supportive
                                community.
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Post Composer */}
                <form
                  onSubmit={handleGlobalPost}
                  className="bg-card border border-border rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Avatar src={user?.avatar_url} name={user?.name} />
                    <textarea
                      value={globalContent}
                      onChange={(e) => {
                        if (e.target.value.length <= 1000)
                          setGlobalContent(e.target.value);
                      }}
                      placeholder={t("discussions.post_placeholder")}
                      rows={4}
                      className="flex-1 px-4 py-3 bg-input border border-border rounded-lg text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <select
                          value={globalCategory}
                          onChange={(e) => setGlobalCategory(e.target.value)}
                          className="
    appearance-none
    pl-4 pr-10 py-2
    bg-[#ff6d34]
    hover:bg-[#e65f2c]
    text-white
    font-semibold
    rounded-lg
    shadow-md
    border border-[#ff6d34]
    focus:outline-none
    focus:ring-2
    focus:ring-[#00bea3]
    cursor-pointer
    transition
    duration-200
  "
                        >
                          <option value="" className="bg-white text-[#2D3436]">
                            Select Category *
                          </option>

                          {GLOBAL_CATEGORIES.map((c) => (
                            <option
                              key={c}
                              value={c}
                              className="bg-white text-[#2D3436]"
                            >
                              {c}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-white/80 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <span
                        className={`text-sm ${
                          globalContent.length > 900
                            ? "text-red-400"
                            : "text-muted"
                        }`}
                      >
                        {globalContent.length}/1000
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={!globalContent.trim() || !globalCategory}
                      className="px-6 py-2.5 bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      {t("discussions.post_btn")}
                    </button>
                  </div>
                </form>

                {/* Global Discussions List Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-bold text-main">
                      {t("discussions.global_list")}{" "}
                      <span className="text-muted font-normal text-base">
                        ({globalPosts.length})
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={globalCategoryFilter}
                        onChange={(e) =>
                          setGlobalCategoryFilter(e.target.value)
                        }
                        className="appearance-none pl-3 pr-8 py-1.5 bg-card border border-border rounded-lg text-sm text-muted focus:outline-none cursor-pointer"
                      >
                        <option>{t("discussions.all_categories")}</option>
                        {GLOBAL_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {getCategoryLabel(c)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-muted" />
                    {["Recent", "Popular"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setGlobalSort(s)}
                        className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
                          globalSort === s
                            ? "bg-red-500 text-white"
                            : "bg-card border border-border text-muted hover:text-main"
                        }`}
                      >
                        {s === "Recent"
                          ? t("discussions.sort_recent")
                          : t("discussions.sort_popular")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Global Posts */}
                {globalLoading ? (
                  <div className="text-center py-12 text-muted">
                    {t("discussions.loading")}
                  </div>
                ) : globalPosts.length === 0 ? (
                  <div className="text-center py-12 text-muted">
                    {t("discussions.no_global")}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {globalPosts
                      .filter((post) => isAdmin || !post.hiddenAt)
                      .map((post) => (
                      <div
                        key={post.id}
                        data-post-id={post.id}
                        className={`bg-card border border-border rounded-xl p-5 shadow-sm ${post.hiddenAt ? "opacity-50" : ""}`}
                      >
                        {/* Admin: hidden badge */}
                        {isAdmin && post.hiddenAt && (
                          <div className="flex items-center gap-2 text-xs text-yellow-500 mb-2">
                            <EyeOff className="w-3 h-3" />
                            Hidden by moderator
                            <button
                              onClick={() => handleUnhide(post.id)}
                              className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            >
                              Unhide
                            </button>
                          </div>
                        )}
                        {/* Admin: report badge for post */}
                        {isAdmin && getReportsForContent(post.id).length > 0 && (
                          <div className="mb-2">
                            <button
                              onClick={() => setActiveModeration(activeModeration === `post-${post.id}` ? null : `post-${post.id}`)}
                              className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-md hover:bg-orange-500/30 transition-colors"
                            >
                              <Shield className="w-3 h-3" />
                              {getReportsForContent(post.id).length} report{getReportsForContent(post.id).length > 1 ? "s" : ""}
                            </button>
                            {activeModeration === `post-${post.id}` && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-muted">
                                  {getReportsForContent(post.id).length} pending reports
                                </span>
                                <button onClick={() => handleModerate(getReportsForContent(post.id)[0]?.id, "hidden")} className="p-1 text-yellow-500 hover:bg-yellow-500/20 rounded disabled:opacity-50" title="Hide" disabled={!getReportsForContent(post.id)[0]?.id}>
                                  <EyeOff className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleModerate(getReportsForContent(post.id)[0]?.id, "deleted")} className="p-1 text-red-500 hover:bg-red-500/20 rounded disabled:opacity-50" title="Delete" disabled={!getReportsForContent(post.id)[0]?.id}>
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleModerate(getReportsForContent(post.id)[0]?.id, "dismissed")} className="p-1 text-gray-400 hover:bg-gray-500/20 rounded disabled:opacity-50" title="Dismiss" disabled={!getReportsForContent(post.id)[0]?.id}>
                                  <XCircle className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <Avatar src={post.author?.avatar_url} name={post.author?.name} />
                            <div>
                              <div className="font-semibold text-main text-sm">
                                {post.author?.name || "Unknown"}
                              </div>
                              <div className="text-xs text-muted">
                                {getRelativeTime(post.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {post.category && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                  categoryColorMap[post.category] ||
                                  "border-gray-500 text-gray-400"
                                }`}
                              >
                                {post.category}
                              </span>
                            )}
                            {/* Three dots menu for all users */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(openDropdown === `global-post-${post.id}` ? null : `global-post-${post.id}`);
                                }}
                                className="text-muted hover:text-orange-500 p-0.5 transition-colors"
                                title="More options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {/* Dropdown Menu */}
                              {openDropdown === `global-post-${post.id}` && (
                                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-30">
                                  {post.userId === user?.id ? (
                                    <>
                                      {/* Edit and Delete options for post owner */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingPost(post.id);
                                          setEditPostText(post.content || "");
                                          setOpenDropdown(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-main hover:bg-surface-light transition-colors flex items-center gap-2"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeletePost(post.id);
                                          setOpenDropdown(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-surface-light transition-colors flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                      </button>
                                    </>
                                  ) : (
                                    /* Report option for other users */
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReportModal({ open: true, postId: post.id, replyId: null });
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full px-3 py-2 text-left text-sm text-main hover:bg-surface-light transition-colors flex items-center gap-2"
                                    >
                                      <Flag className="w-3.5 h-3.5" />
                                      Report
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {editingPost === post.id ? (
                          <div className="mb-4">
                            <textarea
                              value={editPostText}
                              onChange={(e) => setEditPostText(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 text-sm bg-surface-light border border-border-light rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                              autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleEditPost(post.id, editPostText)}
                                className="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPost(null);
                                  setEditPostText("");
                                }}
                                className="px-3 py-1 text-xs bg-surface-light hover:bg-surface-lighter rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className={`text-sm text-muted mb-4 ${
                              expandedGlobalPost === post.id ? "" : "line-clamp-2"
                            }`}
                          >
                            {post.content}
                          </p>
                        )}

                        <div className="border-t border-border pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-5 text-xs text-muted">
                            <button
                              onClick={() => handleLike(post.id, "global")}
                              className={`flex items-center gap-1 hover:text-indigo-500 transition-colors ${
                                post.likes?.some((l) => l.userId === user?.id)
                                  ? "text-indigo-500"
                                  : ""
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              {post.likes?.length || 0}
                            </button>
                            <button
                              onClick={() => handleDislike(post.id, "global")}
                              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                                post.dislikes?.some(
                                  (d) => d.userId === user?.id
                                )
                                  ? "text-red-500"
                                  : ""
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              {post.dislikes?.length || 0}
                            </button>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {post.replies?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setExpandedGlobalPost(
                                  expandedGlobalPost === post.id
                                    ? null
                                    : post.id
                                )
                              }
                              className="px-3 py-1.5 border border-purple-500 text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-500/10 transition-colors flex items-center gap-1"
                            >
                              <ArrowRight className="w-3 h-3" />
                              {expandedGlobalPost === post.id
                                ? "Collapse"
                                : "View Replies"}
                            </button>
                          </div>
                        </div>

                        {/* Expanded: show replies + reply input */}
                        {expandedGlobalPost === post.id && (
                          <div className="mt-4 space-y-3 border-t border-border pt-4">
                            {post.replies?.length > 0 && (
                              <div className="space-y-3 pl-3 border-l-2 border-border">
                                {post.replies.filter((r) => isAdmin || !r.hidden).map((r) => (
                                  <div
                                    key={r.id}
                                    data-reply-id={r.id}
                                    data-parent-post-id={post.id}
                                    className="flex items-start gap-2 group/reply"
                                  >
                                    <Avatar src={r.userAvatar} name={r.userName} size="w-7 h-7" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-main">
                                          {r.userName || "Unknown"}
                                        </span>
                                        <span className="text-[10px] text-muted">
                                          {getRelativeTime(r.createdAt)}
                                        </span>
                                        {r.edited && (
                                          <span className="text-[9px] text-muted italic">(edited)</span>
                                        )}
                                        {isAdmin && r.hidden && (
                                          <>
                                            <span className="text-[9px] text-yellow-500">Hidden</span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnhide(post.id, r.id);
                                              }}
                                              className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                            >
                                              Unhide
                                            </button>
                                          </>
                                        )}
                                        {/* Three dots menu for all users */}
                                        <div className="relative inline-block">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenDropdown(openDropdown === `global-reply-${r.id}` ? null : `global-reply-${r.id}`);
                                            }}
                                            className="text-muted hover:text-orange-500 transition-all p-0.5 ml-1"
                                            title="More options"
                                          >
                                            <MoreVertical className="w-3 h-3" />
                                          </button>
                                          {/* Dropdown Menu */}
                                          {openDropdown === `global-reply-${r.id}` && (
                                            <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-30">
                                              {r.userId === user?.id ? (
                                                <>
                                                  {/* Edit and Delete options for reply owner */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingReply({ postId: post.id, replyId: r.id });
                                                      setEditReplyText(r.text);
                                                      setOpenDropdown(null);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-xs text-main hover:bg-surface-light transition-colors flex items-center gap-2"
                                                  >
                                                    <Edit className="w-3 h-3" />
                                                    Edit
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteReply(post.id, r.id);
                                                      setOpenDropdown(null);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-surface-light transition-colors flex items-center gap-2"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                  </button>
                                                </>
                                              ) : (
                                                /* Report option for other users */
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReportModal({ open: true, postId: post.id, replyId: r.id });
                                                    setOpenDropdown(null);
                                                  }}
                                                  className="w-full px-3 py-2 text-left text-xs text-main hover:bg-surface-light transition-colors flex items-center gap-2"
                                                >
                                                  <Flag className="w-3 h-3" />
                                                  Report
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        {/* Admin: report badge for reply */}
                                        {isAdmin && getReportsForContent(post.id, r.id).length > 0 && (
                                          <span className="flex items-center gap-0.5 text-[10px] text-orange-400">
                                            <Shield className="w-2.5 h-2.5" />
                                            {getReportsForContent(post.id, r.id).length}
                                          </span>
                                        )}
                                      </div>
                                      {editingReply.postId === post.id && editingReply.replyId === r.id ? (
                                        <div className="mt-1">
                                          <input
                                            type="text"
                                            value={editReplyText}
                                            onChange={(e) => setEditReplyText(e.target.value)}
                                            className="w-full px-2 py-1 text-xs bg-surface-light border border-border-light rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            autoFocus
                                          />
                                          <div className="flex gap-1 mt-1">
                                            <button
                                              onClick={() => handleEditReply(post.id, r.id, editReplyText)}
                                              className="px-2 py-0.5 text-[10px] bg-purple-600 hover:bg-purple-700 rounded"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => {
                                                setEditingReply({ postId: null, replyId: null });
                                                setEditReplyText("");
                                              }}
                                              className="px-2 py-0.5 text-[10px] bg-surface-light hover:bg-surface-lighter rounded"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-xs text-muted mt-0.5">
                                          {r.text}
                                        </p>
                                      )}
                                      {/* Admin: moderation actions for reply */}
                                      {isAdmin && getReportsForContent(post.id, r.id).length > 0 && activeModeration === `reply-${r.id}` && (
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] text-muted">
                                            {getReportsForContent(post.id, r.id).length} pending reports
                                          </span>
                                          <button onClick={() => handleModerate(getReportsForContent(post.id, r.id)[0]?.id, "hidden")} className="p-0.5 text-yellow-500 hover:bg-yellow-500/20 rounded disabled:opacity-50" title="Hide" disabled={!getReportsForContent(post.id, r.id)[0]?.id}>
                                            <EyeOff className="w-3 h-3" />
                                          </button>
                                          <button onClick={() => handleModerate(getReportsForContent(post.id, r.id)[0]?.id, "deleted")} className="p-0.5 text-red-500 hover:bg-red-500/20 rounded disabled:opacity-50" title="Delete" disabled={!getReportsForContent(post.id, r.id)[0]?.id}>
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                          <button onClick={() => handleModerate(getReportsForContent(post.id, r.id)[0]?.id, "dismissed")} className="p-0.5 text-gray-400 hover:bg-gray-500/20 rounded disabled:opacity-50" title="Dismiss" disabled={!getReportsForContent(post.id, r.id)[0]?.id}>
                                            <XCircle className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                      {isAdmin && getReportsForContent(post.id, r.id).length > 0 && activeModeration !== `reply-${r.id}` && (
                                        <button
                                          onClick={() => setActiveModeration(`reply-${r.id}`)}
                                          className="mt-1 text-[10px] text-orange-400 hover:underline"
                                        >
                                          Moderate
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={globalReplyText}
                                onChange={(e) =>
                                  setGlobalReplyText(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleReplySubmit(
                                      post.id,
                                      globalReplyText,
                                      "global"
                                    );
                                    setGlobalReplyText("");
                                  }
                                }}
                                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                              <button
                                onClick={() => {
                                  handleReplySubmit(
                                    post.id,
                                    globalReplyText,
                                    "global"
                                  );
                                  setGlobalReplyText("");
                                }}
                                className="px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          )}
        </div>
      </div>

      {/* Popup Modal */}
      {popupModal.open && (
        <div className="fixed inset-0 z-160 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-bold text-main text-base">{popupModal.title || "Notice"}</h3>
              <button
                onClick={closePopupModal}
                className="text-muted hover:text-main transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-5">
              <p className="text-sm text-muted">{popupModal.message}</p>
            </div>

            <div className="flex items-center justify-end gap-3 px-4 pb-4">
              {popupModal.cancelText && (
                <button
                  onClick={closePopupModal}
                  className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:text-main hover:border-main/30 transition-colors"
                >
                  {popupModal.cancelText}
                </button>
              )}
              <button
                onClick={handlePopupConfirm}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  popupModal.cancelText
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {popupModal.confirmText || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
      {reportModal.open && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="px-5 pt-5 pb-1">
              <h3 className="font-bold text-main text-lg">Report Content</h3>
              <p className="text-muted text-sm mt-1">
                Help us maintain a safe community. Please provide a reason for reporting.
              </p>
            </div>

            {/* Body */}
            
            <div className="px-5 py-4">
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the issue (spam, harassment, inappropriate content, etc.)"
                rows={4}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 pb-5">
              <button
                onClick={() => {
                  setReportModal({ open: false, postId: null, replyId: null });
                  setReportDescription("");
                }}
                className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:text-main hover:border-main/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportDescription.trim() || reportSubmitting}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {reportSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {reportSuccess && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-bold text-main text-base">Report</h3>
              <button
                onClick={() => setReportSuccess(false)}
                className="text-muted hover:text-main transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-5 text-center space-y-3">
              {/* Illustration */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Flag className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <h4 className="text-base font-bold text-main">
                Thanks for helping our community
              </h4>
              <p className="text-xs text-muted">
                Your report helps us protect the community from harmful content.
              </p>
              <p className="text-xs text-muted">
                If you think someone is in immediate danger, please contact local law enforcement.
              </p>

              {/* What you can expect */}
              <div className="text-left mt-3">
                <h5 className="text-xs font-bold text-main mb-2">What you can expect</h5>
                <div className="flex items-start gap-2.5 bg-canvas-alt rounded-lg p-2.5">
                  <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                    <Ban className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    If this commenter has serious or repeated violations, we may temporarily restrict their ability to leave comments.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setReportSuccess(false)}
                className="w-full py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {reportAlreadyExists && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm">
            <div className="px-5 py-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-yellow-500" />
                </div>
              </div>
              <h4 className="text-base font-bold text-main">
                Already Reported
              </h4>
              <p className="text-sm text-muted">
                You have already reported this content. Our team will review it shortly.
              </p>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => setReportAlreadyExists(false)}
                className="w-full py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsPage;

