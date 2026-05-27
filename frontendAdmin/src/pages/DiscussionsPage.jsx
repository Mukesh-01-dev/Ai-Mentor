import { useEffect, useState } from "react";
import {
  MessageSquare,
  Globe,
  BookOpen,
  ThumbsUp,
  MessageCircle,
  Clock,
  Search,
  Trash2,
  EyeOff,
  User,
  ChevronDown,
} from "lucide-react";
import { callApi } from "../utils/api";

// ─── Type Badge ───────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const isGlobal = type === "global";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
        isGlobal
          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
          : "bg-teal-500/10 text-teal-400 border-teal-500/20"
      }`}
    >
      {isGlobal ? (
        <Globe className="w-3 h-3" />
      ) : (
        <BookOpen className="w-3 h-3" />
      )}
      {isGlobal ? "Global" : "Course"}
    </span>
  );
}

// ─── Expanded Detail Modal ───────────────────────────────────────────────────
function DiscussionModal({ post, onClose }) {
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-xl relative overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-canvas-alt border border-border flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all z-10"
        >
          ✕
        </button>

        <div className="p-7 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <div className="font-black text-main text-sm uppercase tracking-tight">
                {post.author?.name || "Unknown"}
              </div>
              <div className="text-[10px] text-muted">{post.author?.email}</div>
            </div>
            <div className="ml-auto">
              <TypeBadge type={post.type} />
            </div>
          </div>

          {/* Course name (if course post) */}
          {post.type === "course" && post.courseName && (
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-500/5 border border-teal-500/20 rounded-xl">
              <BookOpen className="w-3.5 h-3.5 text-teal-500" />
              <span className="text-xs text-teal-400 font-semibold">{post.courseName}</span>
            </div>
          )}

          {/* Content */}
          <div className="p-4 bg-canvas-alt border border-border rounded-2xl text-sm text-main leading-relaxed">
            {post.content}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-canvas-alt border border-border rounded-2xl">
              <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Likes</div>
              <div className="font-black text-main">{post.likes?.length ?? 0}</div>
            </div>
            <div className="p-3 bg-canvas-alt border border-border rounded-2xl">
              <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Replies</div>
              <div className="font-black text-main">{post.replies?.length ?? 0}</div>
            </div>
            <div className="p-3 bg-canvas-alt border border-border rounded-2xl">
              <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Posted</div>
              <div className="font-black text-main text-xs">
                {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </div>
            </div>
          </div>

          {/* Replies list (if any) */}
          {post.replies?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Replies</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {post.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-3 bg-canvas-alt border border-border rounded-xl text-sm text-main"
                  >
                    <span className="font-semibold text-teal-400 mr-2">{reply.userName}:</span>
                    {reply.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons — interns can wire these up */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <button
              disabled
              title="Coming soon — interns will implement this"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 opacity-60 cursor-not-allowed"
            >
              <EyeOff className="w-4 h-4" />
              Hide Post
            </button>
            <button
              disabled
              title="Coming soon — interns will implement this"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 opacity-60 cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Delete Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function DiscussionsPage() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "global" | "course"
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await callApi("/admin/discussions");
        const data = Array.isArray(res?.data) ? res.data : [];
        setDiscussions(data);
      } catch (err) {
        setError(err.message || "Failed to load discussions");
      } finally {
        setLoading(false);
      }
    };
    fetchDiscussions();
  }, []);

  const filtered = discussions.filter((d) => {
    const matchType = filter === "all" || d.type === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.content?.toLowerCase().includes(q) ||
      d.author?.name?.toLowerCase().includes(q) ||
      d.courseName?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const globalCount = discussions.filter((d) => d.type === "global").length;
  const courseCount = discussions.filter((d) => d.type === "course").length;

  if (loading) {
    return (
      <div className="p-10 text-center text-muted flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        Loading discussions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      {selected && (
        <DiscussionModal post={selected} onClose={() => setSelected(null)} />
      )}

      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Discussion Reviews</h2>
            <p className="text-muted text-sm mt-1">
              View all community discussions — global and course-specific
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-400">Global: {globalCount}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-teal-400">Course: {courseCount}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-canvas-alt border border-border flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted" />
              <span className="text-xs font-bold text-muted">Total: {discussions.length}</span>
            </div>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Type filter tabs */}
          <div className="flex border border-border rounded-xl overflow-hidden shrink-0">
            {["all", "global", "course"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                  filter === t
                    ? "bg-teal-500 text-white"
                    : "text-muted hover:bg-canvas-alt"
                }`}
              >
                {t === "all" ? "All" : t === "global" ? "Global" : "Course"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by content, author, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-canvas-alt border border-border text-sm text-main placeholder:text-muted focus:outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border overflow-hidden bg-canvas-alt/20 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="text-left text-[11px] uppercase tracking-widest text-muted bg-black/20">
              <tr className="border-b border-border">
                <th className="p-5">Author</th>
                <th>Content</th>
                <th>Type</th>
                <th>Course</th>
                <th>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> Likes
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> Replies
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Date
                  </div>
                </th>
                <th className="pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-border hover:bg-white/5 transition-all"
                  >
                    {/* Author */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-teal-500" />
                        </div>
                        <div>
                          <div className="font-bold text-main text-sm">
                            {post.author?.name || "Unknown"}
                          </div>
                          <div className="text-[10px] text-muted truncate max-w-[100px]">
                            {post.author?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Content */}
                    <td className="max-w-[220px]">
                      <p className="text-sm text-main truncate">{post.content}</p>
                    </td>

                    {/* Type */}
                    <td>
                      <TypeBadge type={post.type} />
                    </td>

                    {/* Course name */}
                    <td className="text-xs text-muted max-w-[120px] truncate">
                      {post.courseName || "—"}
                    </td>

                    {/* Likes */}
                    <td className="text-sm text-main font-semibold">
                      {post.likes?.length ?? 0}
                    </td>

                    {/* Replies */}
                    <td className="text-sm text-main font-semibold">
                      {post.replies?.length ?? 0}
                    </td>

                    {/* Date */}
                    <td className="text-xs text-muted whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action */}
                    <td className="pr-6 text-right">
                      <button
                        onClick={() => setSelected(post)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-20 text-center text-muted">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No discussions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DiscussionsPage;
