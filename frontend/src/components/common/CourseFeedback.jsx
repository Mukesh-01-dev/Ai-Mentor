import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from "../../lib/api";
import toast from "react-hot-toast";
import { Star, Trash2, Edit3, Send, X, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

/* ── label for each star ── */
const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

/* ────────────────────────────
   Interactive / display stars
──────────────────────────────*/
function Stars({ value = 0, max = 5, size = 18, interactive = false, onRate, color = "#F59E0B" }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const idx = i + 1;
        const filled = interactive ? idx <= (hovered || value) : idx <= Math.round(value);
        return (
          <svg
            key={idx}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`transition-transform duration-100 ${interactive ? "cursor-pointer select-none" : ""} ${interactive && idx <= (hovered || value) ? "scale-110" : ""}`}
            onClick={() => interactive && onRate?.(idx)}
            onMouseEnter={() => interactive && setHovered(idx)}
            onMouseLeave={() => interactive && setHovered(0)}
          >
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={filled ? color : "none"}
              stroke={filled ? color : "#D1D5DB"}
              strokeWidth="1.5"
              strokeLinejoin="round"
              style={{ transition: "fill .15s, stroke .15s" }}
            />
          </svg>
        );
      })}
    </div>
  );
}

/* ────────────────────────────
   Breakdown bar row
──────────────────────────────*/
function BreakdownBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-2 text-right shrink-0 font-medium text-slate-500 dark:text-slate-400">{star}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 text-right shrink-0 text-slate-400 dark:text-slate-500">{pct}%</span>
    </div>
  );
}

/* ────────────────────────────
   Single review card
──────────────────────────────*/
function ReviewCard({ review, isOwn, onEdit, onDelete }) {
  const initial = (review.userName || "U")[0].toUpperCase();
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-rose-500 to-pink-500",
    "from-orange-500 to-amber-500",
  ];
  const colorIdx = initial.charCodeAt(0) % colors.length;
  const date = review.updatedAt
    ? new Date(review.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 p-4 hover:border-amber-300 dark:hover:border-amber-600/50 hover:shadow-md transition-all duration-200">
      {/* Own badge */}
      {isOwn && (
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
          Your review
        </span>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        {review.userAvatar ? (
          <img src={review.userAvatar} alt={review.userName} className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-white dark:border-slate-700 shadow-sm" onError={e => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
            {initial}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{review.userName || "Anonymous"}</span>
            <Stars value={review.rating} size={13} />
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{date}</span>
          </div>

          {review.review && (
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.review}</p>
          )}

          {/* Edit / Delete — only for own review */}
          {isOwn && (
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => onEdit?.(review)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                <Edit3 className="w-3 h-3" /> Edit
              </button>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <button onClick={() => onDelete?.()} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────
   Main export
──────────────────────────────*/
export default function CourseFeedback({ courseId, formOnly = false, onSubmitSuccess, onDeleteSuccess }) {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [data, setData] = useState(null);
  const [myFeedback, setMyFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const [draftRating, setDraftRating] = useState(0);
  const [draftReview, setDraftReview] = useState("");

  const isEnrolled =
    user && Array.isArray(user.purchasedCourses) &&
    user.purchasedCourses.some((c) => Number(c.courseId) === Number(courseId));

  /* ── fetch all reviews ── */
  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/feedback`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error("fetchFeedback:", e);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  /* ── fetch user's own review ── */
  const fetchMyFeedback = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/feedback/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.exists) {
          setMyFeedback(json.feedback);
          setDraftRating(json.feedback.rating);
          setDraftReview(json.feedback.review || "");
        }
      }
    } catch (e) {
      console.error("fetchMyFeedback:", e);
    }
  }, [courseId, user, token]);

  useEffect(() => {
    fetchFeedback();
    fetchMyFeedback();
  }, [fetchFeedback, fetchMyFeedback]);

  const openEdit = (review) => {
    setDraftRating(review.rating);
    setDraftReview(review.review || "");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draftRating) { toast.error("Please select a star rating."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: draftRating, review: draftReview }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed");
      toast.success(json.message || "Review submitted!");
      setShowForm(false);
      await Promise.all([fetchFeedback(), fetchMyFeedback()]);
      window.dispatchEvent(new CustomEvent("courseFeedbackUpdated", { detail: { courseId } }));
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/feedback`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      toast.success("Review deleted");
      setMyFeedback(null);
      setDraftRating(0);
      setDraftReview("");
      setShowForm(false);
      await fetchFeedback();
      window.dispatchEvent(new CustomEvent("courseFeedbackUpdated", { detail: { courseId } }));
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const avg = parseFloat(data?.avgRating || 0);
  const total = data?.totalReviews || 0;
  const breakdown = data?.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const reviews = data?.reviews || [];

  if (formOnly) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden bg-white dark:bg-slate-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
        {/* ── Header ── */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-400/20 ring-1 ring-amber-400/30">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Rate this Course</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {myFeedback ? "Update your submitted feedback" : "Share your feedback to help others"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ) : !isEnrolled ? (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-300">
              <Star className="w-4 h-4 fill-blue-400 text-blue-400 shrink-0" />
              Enrol in this course to leave a review.
            </div>
          ) : (
            <div className="relative rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50 p-5">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 text-sm">
                {myFeedback ? "Update your review" : "Share your experience"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">Your rating *</p>
                  <div className="flex items-center gap-3">
                    <Stars value={draftRating} size={30} interactive onRate={setDraftRating} />
                    {draftRating > 0 && (
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        {STAR_LABELS[draftRating]}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">Your review <span className="font-normal normal-case">(optional)</span></p>
                  <textarea
                    value={draftReview}
                    onChange={e => setDraftReview(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="What did you enjoy? What could be better?"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition-shadow"
                  />
                  <p className="text-right text-xs text-slate-400 mt-1">{draftReview.length}/1000</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting || !draftRating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold shadow-md hover:shadow-amber-200 dark:hover:shadow-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? "Saving…" : myFeedback ? "Update" : "Submit"}
                  </button>
                  {myFeedback && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ml-auto"
                    >
                      Delete Review
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">

      {/* ── Header ── */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5">
        {/* decorative dots */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 ring-1 ring-amber-400/30">
              <MessageSquare className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Student Reviews</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {total > 0 ? `${total} review${total !== 1 ? "s" : ""}` : "No reviews yet — be the first!"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEnrolled && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold transition-all active:scale-95 shadow"
              >
                <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
                {myFeedback ? "Edit Review" : "Write Review"}
              </button>
            )}
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">

          {/* ── Aggregate section ── */}
          {!loading && total > 0 && (
            <div className="flex flex-col sm:flex-row gap-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              {/* Big score */}
              <div className="flex flex-col items-center justify-center gap-2 sm:w-32 shrink-0">
                <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">{avg.toFixed(1)}</span>
                <Stars value={avg} size={16} />
                <span className="text-xs text-slate-400 mt-0.5">out of 5</span>
              </div>
              {/* Bars */}
              <div className="flex-1 space-y-2 py-1 min-w-0">
                {[5, 4, 3, 2, 1].map(s => (
                  <BreakdownBar key={s} star={s} count={breakdown[s] || 0} total={total} />
                ))}
              </div>
            </div>
          )}

          {/* ── Review form ── */}
          {showForm && isEnrolled && (
            <div className="relative rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50 p-5">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 text-sm">
                {myFeedback ? "Update your review" : "Share your experience"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star picker */}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">Your rating *</p>
                  <div className="flex items-center gap-3">
                    <Stars value={draftRating} size={30} interactive onRate={setDraftRating} />
                    {draftRating > 0 && (
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        {STAR_LABELS[draftRating]}
                      </span>
                    )}
                  </div>
                </div>
                {/* Text area */}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">Your review <span className="font-normal normal-case">(optional)</span></p>
                  <textarea
                    value={draftReview}
                    onChange={e => setDraftReview(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="What did you enjoy? What could be better?"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition-shadow"
                  />
                  <p className="text-right text-xs text-slate-400 mt-1">{draftReview.length}/1000</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting || !draftRating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold shadow-md hover:shadow-amber-200 dark:hover:shadow-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? "Saving…" : myFeedback ? "Update" : "Submit"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Prompt for non-enrolled / guests ── */}
          {!isEnrolled && user && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-300">
              <Star className="w-4 h-4 fill-blue-400 text-blue-400 shrink-0" />
              Enrol in this course to leave a review.
            </div>
          )}
          {!user && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm text-slate-500 dark:text-slate-400">
              <Star className="w-4 h-4 fill-slate-300 text-slate-300 shrink-0" />
              Log in and enrol to share your rating and review.
            </div>
          )}

          {/* ── Reviews list ── */}
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isOwn={!!(user && myFeedback && review.id === myFeedback.id)}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
