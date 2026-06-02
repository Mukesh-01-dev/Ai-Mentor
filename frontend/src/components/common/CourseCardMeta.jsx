/**
 * CourseCardMeta.jsx
 *
 * Reusable pill that sits on course cards.
 * - Fetches live rating + review count from /api/courses/:id/feedback
 * - Shows ⭐ avg  💬 count
 * - Clicking the 💬 icon opens a full reviews modal
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Star, MessageSquare, X, ChevronDown, ChevronUp } from "lucide-react";
import CourseFeedback from "./CourseFeedback";
import API_BASE_URL from "../../lib/api";

/* ── simple in-memory cache so we don't re-fetch on every render ── */
const _cache = {};

function useLiveRating(courseId) {
  const [state, setState] = useState(() =>
    _cache[courseId] || { avg: null, total: null, loading: true }
  );

  const fetchLiveRating = useCallback(async (isMountedRef) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/feedback`);
      if (!res.ok) throw new Error("not ok");
      const json = await res.json();
      const next = { avg: parseFloat(json.avgRating), total: json.totalReviews, loading: false };
      _cache[courseId] = next;
      if (isMountedRef.current) setState(next);
    } catch {
      const next = { avg: null, total: 0, loading: false };
      _cache[courseId] = next;
      if (isMountedRef.current) setState(next);
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    const isMounted = { current: true };

    if (_cache[courseId] && _cache[courseId].loading === false) {
      setState(_cache[courseId]);
    } else {
      fetchLiveRating(isMounted);
    }

    const handleUpdate = (e) => {
      if (String(e.detail?.courseId) === String(courseId)) {
        delete _cache[courseId];
        fetchLiveRating(isMounted);
      }
    };

    window.addEventListener("courseFeedbackUpdated", handleUpdate);
    return () => {
      isMounted.current = false;
      window.removeEventListener("courseFeedbackUpdated", handleUpdate);
    };
  }, [courseId, fetchLiveRating]);

  return state;
}

/* ── Reviews modal ── */
function ReviewsModal({ courseId, onClose }) {
  const overlayRef = useRef(null);

  /* close on overlay click */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow"
        >
          <X className="w-4 h-4" />
        </button>
        {/* CourseFeedback renders with its own header + content */}
        <div className="p-1">
          <CourseFeedback courseId={courseId} />
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Main exported component ── */
export default function CourseCardMeta({ courseId, variant = "dark" }) {
  const { avg, total, loading } = useLiveRating(courseId);
  const [showModal, setShowModal] = useState(false);

  const openModal = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => setShowModal(false), []);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
        <div className="w-10 h-3 bg-white/20 rounded animate-pulse" />
      </div>
    );
  }

  const isDark = variant === "dark";
  const pillBase = isDark
    ? "bg-black/65 backdrop-blur-sm text-white"
    : "bg-white/90 backdrop-blur-sm text-slate-800 shadow";

  return (
    <>
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${pillBase} text-xs font-semibold`}>
        {/* Star + avg */}
        <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
        <span className={isDark ? "text-white" : "text-slate-800"}>
          {total && total > 0 && avg && avg > 0 ? avg.toFixed(1) : "4.5"}
        </span>

        {/* Divider */}
        <span className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-300"}`}>·</span>

        {/* Review count + icon — clickable */}
        <button
          onClick={openModal}
          title="View reviews"
          className={`flex items-center gap-1 rounded-full transition-colors ${
            isDark
              ? "hover:text-amber-300"
              : "hover:text-amber-600"
          }`}
        >
          <MessageSquare className="w-3 h-3 shrink-0" />
          <span>{total > 0 ? total : "0"}</span>
        </button>
      </div>

      {showModal && <ReviewsModal courseId={courseId} onClose={closeModal} />}
    </>
  );
}
