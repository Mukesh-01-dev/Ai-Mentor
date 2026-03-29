import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronRight, CreditCard, GraduationCap, LayoutDashboard, LogOut, Settings, ShieldAlert, Users, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../lib/api";
import Header from "../components/Header";

const NAV = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["courses", "Courses", BookOpen],
  ["users", "Users", Users],
  ["enrollments", "Enrollments", GraduationCap],
  ["payments", "Payments", CreditCard],
  ["reports", "Reports", ShieldAlert],
];

const NEW_COURSE = { title: "", category: "", level: "Beginner", priceValue: "", image: "" };

const Metric = ({ label, value }) => (
  <article className="rounded-xl border border-border bg-card p-4">
    <p className="text-xs text-muted">{label}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </article>
);

const DataTable = ({ headers, rows, empty = "No data" }) => (
  <div className="overflow-auto rounded-xl border border-border bg-card">
    <table className="min-w-full text-sm">
      <thead className="bg-canvas-alt text-left">
        <tr>{headers.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length ? rows : (
          <tr><td colSpan={headers.length} className="px-3 py-6 text-center text-muted">{empty}</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = useMemo(() => {
    try { const raw = localStorage.getItem("user"); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }, []);

  const page = useMemo(() => {
    const key = location.pathname.split("/").filter(Boolean)[0] || "dashboard";
    return NAV.some(([id]) => id === key) ? key : "dashboard";
  }, [location.pathname]);

  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const profileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [learning, setLearning] = useState({});

  const [courseForm, setCourseForm] = useState(NEW_COURSE);
  const [manageCourse, setManageCourse] = useState(null);
  const [moduleForm, setModuleForm] = useState({ id: "", title: "" });
  const [lessonForm, setLessonForm] = useState({ id: "", title: "", duration: "10 min", type: "video", youtubeUrl: "" });
  const [subtopicForm, setSubtopicForm] = useState({ title: "", goal: "", topics: "", tools: "", activities: "" });
  const [videoForm, setVideoForm] = useState({ lessonId: "", youtubeUrl: "" });
  const [moduleId, setModuleId] = useState("");

  const callApi = async (path, options = {}) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    let data = null;
    try { data = await res.json(); } catch { data = null; }
    if (!res.ok) throw new Error(data?.message || "Request failed");
    return data;
  };

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const fetchAll = async () => {
    setBusy(true); setError("");
    try {
      const [c, u, r] = await Promise.all([
        callApi("/api/courses"),
        callApi("/api/admin/users"),
        callApi("/api/community/reports"),
      ]);
      setCourses(c || []);
      setUsers(u || []);
      setReports(r || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "admin") fetchAll();
  }, []);

  useEffect(() => {
    if (!manageCourse) return;
    callApi(`/api/courses/${manageCourse.id}/learning`)
      .then((data) => setLearning((prev) => ({ ...prev, [manageCourse.id]: data })))
      .catch(() => setLearning((prev) => ({ ...prev, [manageCourse.id]: { modules: [] } })));
  }, [manageCourse?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfilePopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!token) return <GateCard title="Admin login required" body="Please login first." />;
  if (user?.role !== "admin") return <GateCard title="Access denied" body="Admin role is required for this panel." />;

  const enrollmentRows = users.flatMap((u) => (u.purchasedCourses || []).map((p) => {
    const course = courses.find((c) => Number(c.id) === Number(p.courseId));
    return {
      id: `${u.id}-${p.courseId}-${p.purchaseDate || ""}`,
      user: u.name,
      email: u.email,
      course: p.courseTitle || course?.title || `Course ${p.courseId}`,
      amount: Number(course?.priceValue || 0),
      date: p.purchaseDate,
    };
  }));

  const summary = {
    courses: courses.length,
    users: users.length,
    enrollments: enrollmentRows.length,
    reports: reports.length,
    revenue: enrollmentRows.reduce((a, b) => a + b.amount, 0),
  };

  const navTo = (id) => { navigate(`/${id}`); setMobileNav(false); };
  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";
  const avatarUrl = user?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutConfirm(false);
    setProfilePopupOpen(false);
    navigate("/login", { replace: true });
  };

  const addCourse = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await callApi("/api/courses", {
        method: "POST",
        body: JSON.stringify({
          title: courseForm.title,
          category: courseForm.category,
          level: courseForm.level,
          price: `INR ${courseForm.priceValue || 0}`,
          priceValue: Number(courseForm.priceValue || 0),
          image: courseForm.image,
          lessons: "0 lessons",
          students: "0 students",
        }),
      });
      setCourseForm(NEW_COURSE);
      notify("Course added");
      await fetchAll();
    } catch (e2) { setError(e2.message); } finally { setBusy(false); }
  };

  const removeCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try { setBusy(true); await callApi(`/api/courses/${id}`, { method: "DELETE" }); notify("Course deleted"); await fetchAll(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const updateRole = async (userId, role) => {
    try { setBusy(true); await callApi(`/api/admin/users/${userId}/role`, { method: "PUT", body: JSON.stringify({ role }) }); await fetchAll(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try { setBusy(true); await callApi(`/api/admin/users/${userId}`, { method: "DELETE" }); notify("User deleted"); await fetchAll(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const reportAction = async (id, action) => {
    try { setBusy(true); await callApi(`/api/community/reports/${id}`, { method: "PUT", body: JSON.stringify({ action }) }); notify(`Report ${action}`); await fetchAll(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const activeLearning = manageCourse ? learning[manageCourse.id] : null;
  const modules = activeLearning?.modules || [];
  const lessons = modules.flatMap((m) => m.lessons || []);

  return (
    <div className="min-h-screen bg-canvas-alt text-main">
      {mobileNav && <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-60 lg:hidden" onClick={() => setMobileNav(false)} />}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border/50 rounded-4xl shadow-2xl p-8 w-80 text-center">
            <LogOut className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-sm font-black uppercase tracking-tight text-main mb-2">Logout</h3>
            <p className="text-xs text-muted mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border border-border hover:bg-canvas-alt transition-all">Cancel</button>
              <button onClick={confirmLogout} className="flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all">Logout</button>
            </div>
          </div>
        </div>
      )}

      <aside className={`fixed top-0 left-0 z-[70] bg-card/70 backdrop-blur-2xl border-r border-border/50 transform transition-all duration-500 ease-out lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sidebarCollapsed ? "lg:w-24" : "lg:w-80"} w-80 h-screen overflow-visible`}>
        <div className="h-16 border-b border-border/50 px-4 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <p className="text-sm font-black uppercase tracking-tight">UptoSkills</p>
              <p className="text-[9px] text-muted uppercase tracking-widest">Admin Portal</p>
            </div>
          )}
          <button onClick={() => setMobileNav(false)} className="lg:hidden w-9 h-9 rounded-xl border border-border bg-card" type="button">
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>

        <button onClick={() => setSidebarCollapsed((prev) => !prev)} className="hidden lg:flex absolute -right-5 top-8 w-10 h-10 bg-card border border-border rounded-xl items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-xl z-80" type="button">
          <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${sidebarCollapsed ? "" : "rotate-180"}`} />
        </button>

        <nav className={`mt-8 px-4 h-[calc(100vh-16rem)] scrollbar-hide ${sidebarCollapsed ? "overflow-visible" : "overflow-y-auto"}`}>
          <div className="space-y-3">
            {NAV.map(([id, label, Icon]) => (
              <div key={id} onClick={() => navTo(id)} className={`group relative flex items-center px-4 py-4 rounded-3xl cursor-pointer transition-all duration-300 ${sidebarCollapsed ? "justify-center" : ""} ${page === id ? "bg-teal-500 text-white shadow-xl shadow-teal-500/30" : "text-muted hover:bg-canvas-alt"}`}>
                <div className={`w-5 h-5 shrink-0 rounded-md flex items-center justify-center ${page === id ? "text-white" : "text-main"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {!sidebarCollapsed && <span className={`ml-4 text-sm font-black uppercase tracking-tight ${page === id ? "text-white" : ""}`}>{label}</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50 uppercase tracking-widest">
                    {label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-4" ref={profileRef}>
          {profilePopupOpen && (
            <div className={`absolute bottom-full mb-6 left-4 right-4 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-[0_-20px_80px_rgba(0,0,0,0.3)] overflow-hidden z-90 ${sidebarCollapsed ? "w-52 -left-2" : ""}`}>
              <div className="p-6 border-b border-border/50 bg-linear-to-tr from-teal-500/10 to-transparent text-center">
                <img src={avatarUrl} className="w-16 h-16 rounded-3xl mx-auto mb-3 shadow-2xl border-2 border-card" alt="User" />
                <h4 className="text-xs font-black text-main uppercase tracking-tighter">{displayName}</h4>
              </div>
              <div className="p-2">
                <button onClick={() => { navigate("/dashboard"); setProfilePopupOpen(false); }} className="flex items-center w-full px-4 py-4 text-[10px] font-black uppercase text-main hover:bg-teal-500 hover:text-white rounded-3xl transition-all">
                  <Settings className="w-4 h-4 mr-3" />
                  Dashboard
                </button>
                <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center w-full px-4 py-4 text-[10px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white rounded-3xl transition-all mt-1">
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}

          <div onClick={() => setProfilePopupOpen((prev) => !prev)} className={`cursor-pointer group relative p-0.5 rounded-4xl bg-linear-to-br from-teal-500/30 via-blue-500/20 to-transparent transition-all duration-500 shadow-lg hover:shadow-teal-500/10 ${profilePopupOpen ? "ring-2 ring-teal-500" : ""}`}>
            <div className={`bg-card dark:bg-slate-900 rounded-[1.9rem] transition-all duration-300 ${sidebarCollapsed ? "p-1" : "p-4 flex items-center"}`}>
              <img src={avatarUrl} className={`${sidebarCollapsed ? "w-12 h-12" : "w-10 h-10"} rounded-[1.2rem] shadow-md border-2 border-white dark:border-slate-800 transition-all`} alt="Avatar" />
              {!sidebarCollapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-[11px] font-black text-main truncate uppercase tracking-tight">{displayName}</div>
                  <div className="text-[9px] text-muted font-bold opacity-50 uppercase tracking-widest mt-0.5">Account</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-24" : "lg:ml-80"}`}>
        <Header title={page} onMenuClick={() => setMobileNav(true)} />

        <section className="space-y-4 p-4 md:p-6">
          {busy && <p className="text-xs text-muted">Loading...</p>}
          {toast && <p className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</p>}
          {error && <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          {page === "dashboard" && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <Metric label="Courses" value={summary.courses} />
              <Metric label="Users" value={summary.users} />
              <Metric label="Enrollments" value={summary.enrollments} />
              <Metric label="Revenue" value={summary.revenue} />
              <Metric label="Reports" value={summary.reports} />
            </div>
          )}

          {page === "courses" && (
            <>
              <form onSubmit={addCourse} className="grid gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-5">
                <input className="rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Title" required value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} />
                <input className="rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Category" required value={courseForm.category} onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))} />
                <select className="rounded border border-border bg-input px-2 py-1 text-sm" value={courseForm.level} onChange={(e) => setCourseForm((p) => ({ ...p, level: e.target.value }))}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
                <input className="rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Price" type="number" min="0" value={courseForm.priceValue} onChange={(e) => setCourseForm((p) => ({ ...p, priceValue: e.target.value }))} />
                <button className="rounded bg-primary px-2 py-1 text-sm text-white">Add</button>
                <input className="rounded border border-border bg-input px-2 py-1 text-sm md:col-span-5" placeholder="Image URL" value={courseForm.image} onChange={(e) => setCourseForm((p) => ({ ...p, image: e.target.value }))} />
              </form>
              <DataTable
                headers={["Title", "Category", "Lessons", "Price", "Actions"]}
                rows={courses.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-3 py-2">{c.title}</td><td className="px-3 py-2">{c.category}</td><td className="px-3 py-2">{c.lessonsCount}</td><td className="px-3 py-2">{c.priceValue}</td>
                    <td className="px-3 py-2 space-x-2"><button className="rounded border border-border px-2 py-1 text-xs" onClick={() => setManageCourse(c)}>Manage</button><button className="rounded border border-red-300 px-2 py-1 text-xs text-red-700" onClick={() => removeCourse(c.id)}>Delete</button></td>
                  </tr>
                ))}
              />
            </>
          )}

          {page === "users" && (
            <DataTable
              headers={["Name", "Email", "Role", "Courses", "Actions"]}
              rows={users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-3 py-2">{u.name}</td><td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2"><select className="rounded border border-border bg-input px-2 py-1 text-xs" value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}><option value="user">user</option><option value="admin">admin</option></select></td>
                  <td className="px-3 py-2">{u.purchasedCoursesCount || 0}</td>
                  <td className="px-3 py-2"><button className="rounded border border-red-300 px-2 py-1 text-xs text-red-700" onClick={() => deleteUser(u.id)}>Delete</button></td>
                </tr>
              ))}
            />
          )}

          {page === "enrollments" && (
            <DataTable
              headers={["User", "Course", "Amount", "Date"]}
              rows={enrollmentRows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2"><div>{r.user}</div><div className="text-xs text-muted">{r.email}</div></td>
                  <td className="px-3 py-2">{r.course}</td><td className="px-3 py-2">{r.amount}</td><td className="px-3 py-2">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              empty="No enrollments"
            />
          )}

          {page === "payments" && (
            <DataTable
              headers={["User", "Course", "Amount", "Date"]}
              rows={enrollmentRows.map((r) => (
                <tr key={`${r.id}-p`} className="border-t border-border">
                  <td className="px-3 py-2">{r.user}</td><td className="px-3 py-2">{r.course}</td><td className="px-3 py-2">+ {r.amount}</td><td className="px-3 py-2">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              empty="No payments"
            />
          )}

          {page === "reports" && (
            <div className="space-y-3">
              {reports.map((r) => {
                const reply = r.replyId ? (r.post?.replies || []).find((x) => String(x.id) === String(r.replyId)) : null;
                return (
                  <article key={r.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm font-semibold">{r.replyId ? "Reported reply" : "Reported post"}</p>
                    <p className="text-xs text-muted">Reporter: {r.reporter?.name} ({r.reporter?.email}) | Reason: {r.reason}</p>
                    <p className="mt-2 rounded bg-canvas-alt p-2 text-sm">{reply?.text || r.post?.content || "-"}</p>
                    <div className="mt-3 flex gap-2">
                      <button className="rounded border border-amber-300 px-2 py-1 text-xs text-amber-700" onClick={() => reportAction(r.id, "hidden")}>Hide</button>
                      <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-700" onClick={() => reportAction(r.id, "deleted")}>Delete</button>
                      <button className="rounded border border-border px-2 py-1 text-xs" onClick={() => reportAction(r.id, "dismissed")}>Dismiss</button>
                    </div>
                  </article>
                );
              })}
              {!reports.length && <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted">No pending reports.</p>}
            </div>
          )}
        </section>
      </main>

      {manageCourse && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-3">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Manage: {manageCourse.title}</h2><button className="rounded border border-border p-1" onClick={() => setManageCourse(null)}><X size={14} /></button></div>
            <div className="grid gap-3 md:grid-cols-2">
              <form onSubmit={async (e) => { e.preventDefault(); try { setBusy(true); await callApi(`/api/courses/${manageCourse.id}/modules`, { method: "POST", body: JSON.stringify({ modules: [moduleForm] }) }); setModuleForm({ id: "", title: "" }); notify("Module added"); const data = await callApi(`/api/courses/${manageCourse.id}/learning`); setLearning((p) => ({ ...p, [manageCourse.id]: data })); await fetchAll(); } catch (e2) { setError(e2.message); } finally { setBusy(false); } }} className="space-y-2 rounded border border-border p-3">
                <p className="text-sm font-semibold">Add module</p>
                <input className="w-full rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Module id" value={moduleForm.id} onChange={(e) => setModuleForm((p) => ({ ...p, id: e.target.value }))} />
                <input className="w-full rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Module title" required value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} />
                <button className="rounded bg-primary px-2 py-1 text-xs text-white">Save</button>
              </form>
              <form onSubmit={async (e) => { e.preventDefault(); if (!moduleId) return; try { setBusy(true); await callApi(`/api/courses/${manageCourse.id}/modules/${moduleId}/lessons`, { method: "POST", body: JSON.stringify({ lessons: [lessonForm] }) }); setLessonForm({ id: "", title: "", duration: "10 min", type: "video", youtubeUrl: "" }); notify("Lesson added"); const data = await callApi(`/api/courses/${manageCourse.id}/learning`); setLearning((p) => ({ ...p, [manageCourse.id]: data })); await fetchAll(); } catch (e2) { setError(e2.message); } finally { setBusy(false); } }} className="space-y-2 rounded border border-border p-3">
                <p className="text-sm font-semibold">Add lesson</p>
                <select className="w-full rounded border border-border bg-input px-2 py-1 text-sm" value={moduleId} onChange={(e) => setModuleId(e.target.value)}><option value="">Select module</option>{modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
                <input className="w-full rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Lesson title" required value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} />
                <input className="w-full rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Duration" value={lessonForm.duration} onChange={(e) => setLessonForm((p) => ({ ...p, duration: e.target.value }))} />
                <button className="rounded bg-primary px-2 py-1 text-xs text-white">Save</button>
              </form>
              <form onSubmit={async (e) => { e.preventDefault(); try { setBusy(true); await callApi(`/api/courses/${manageCourse.id}/lessons/${videoForm.lessonId}/video`, { method: "PUT", body: JSON.stringify({ youtubeUrl: videoForm.youtubeUrl }) }); setVideoForm({ lessonId: "", youtubeUrl: "" }); notify("Video updated"); } catch (e2) { setError(e2.message); } finally { setBusy(false); } }} className="space-y-2 rounded border border-border p-3">
                <p className="text-sm font-semibold">Update lesson video</p>
                <select className="w-full rounded border border-border bg-input px-2 py-1 text-sm" value={videoForm.lessonId} onChange={(e) => setVideoForm((p) => ({ ...p, lessonId: e.target.value }))}><option value="">Select lesson</option>{lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
                <input className="w-full rounded border border-border bg-input px-2 py-1 text-sm" placeholder="YouTube URL" value={videoForm.youtubeUrl} onChange={(e) => setVideoForm((p) => ({ ...p, youtubeUrl: e.target.value }))} />
                <button className="rounded bg-primary px-2 py-1 text-xs text-white">Update</button>
              </form>
              <form onSubmit={async (e) => { e.preventDefault(); try { setBusy(true); await callApi(`/api/courses/${manageCourse.id}/subtopics`, { method: "POST", body: JSON.stringify({ subtopics: [{ title: subtopicForm.title, goal: subtopicForm.goal, topics: subtopicForm.topics.split(",").map((s) => s.trim()).filter(Boolean), tools: subtopicForm.tools.split(",").map((s) => s.trim()).filter(Boolean), activities: subtopicForm.activities.split(",").map((s) => s.trim()).filter(Boolean) }] }) }); setSubtopicForm({ title: "", goal: "", topics: "", tools: "", activities: "" }); notify("Subtopic added"); await fetchAll(); } catch (e2) { setError(e2.message); } finally { setBusy(false); } }} className="space-y-2 rounded border border-border p-3">
                <p className="text-sm font-semibold">Add subtopic</p>
                <input className="w-full rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Title" required value={subtopicForm.title} onChange={(e) => setSubtopicForm((p) => ({ ...p, title: e.target.value }))} />
                <input className="w-full rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Goal" value={subtopicForm.goal} onChange={(e) => setSubtopicForm((p) => ({ ...p, goal: e.target.value }))} />
                <input className="w-full rounded border border-border bg-input px-2 py-1 text-sm" placeholder="Topics (comma)" value={subtopicForm.topics} onChange={(e) => setSubtopicForm((p) => ({ ...p, topics: e.target.value }))} />
                <button className="rounded bg-primary px-2 py-1 text-xs text-white">Save</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GateCard({ title, body }) {
  return (
    <main className="min-h-screen grid place-items-center bg-canvas-alt px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted">{body}</p>
      </section>
    </main>
  );
}
