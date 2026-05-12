import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { callApi } from "../utils/api";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "",
    priceValue: "",
    currency: "INR",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await callApi("/admin/courses");
      const coursesList = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      setCourses(coursesList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await callApi("/admin/courses", {
        method: "POST",
        body: JSON.stringify(newCourse),
      });
      setShowAddModal(false);
      setNewCourse({ title: "", category: "", priceValue: "", currency: "INR" });
      fetchCourses();
    } catch (err) {
      alert("Failed to add course: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && courses.length === 0) return <div className="p-10 text-center text-muted">Loading courses...</div>;
  if (error && courses.length === 0) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Active Courses</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-colors flex items-center gap-2 font-semibold shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add Course</span>
          </button>
          <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Filter</button>
          <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[225px]">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Course Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Currency</th>
              <th>Added On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.id} className="border-b border-border hover:bg-canvas-alt transition-colors">
                  <td className="p-5">
                    <div className="font-semibold text-main">{course.title}</div>
                    <div className="text-muted text-[10px] uppercase tracking-tighter">ID: {course.id}</div>
                  </td>
                  <td>
                    <span className="px-3 py-1 rounded-full bg-canvas-alt border border-border text-[11px] font-bold uppercase tracking-tight text-muted">
                      {course.category || "—"}
                    </span>
                  </td>
                  <td className="font-black text-main tracking-tight">
                    {course.priceValue != null ? course.priceValue : "—"}
                  </td>
                  <td className="text-muted font-bold text-[11px]">{course.currency || "INR"}</td>
                  <td className="text-muted text-[11px] font-medium">{new Date(course.createdAt).toLocaleDateString()}</td>
                  <td className="text-teal-500 font-black text-[10px] uppercase tracking-widest">Published</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-10 text-center text-muted italic">No courses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-linear-to-r from-teal-500/5 to-transparent">
              <h3 className="text-xl font-bold text-main tracking-tight uppercase">Add New Course</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCourse} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Course Title</label>
                <input
                  type="text"
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-hidden transition-all font-medium text-main"
                  placeholder="e.g. Advanced React Architecture"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Category</label>
                <input
                  type="text"
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-hidden transition-all font-medium text-main"
                  placeholder="e.g. Web Development"
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Price</label>
                  <input
                    type="number"
                    required
                    className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-hidden transition-all font-bold text-main"
                    placeholder="0"
                    value={newCourse.priceValue}
                    onChange={(e) => setNewCourse({ ...newCourse, priceValue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Currency</label>
                  <select
                    className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-hidden transition-all font-bold text-main appearance-none"
                    value={newCourse.currency}
                    onChange={(e) => setNewCourse({ ...newCourse, currency: e.target.value })}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-14 rounded-2xl border border-border font-bold uppercase tracking-widest text-[11px] hover:bg-canvas-alt transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-2 h-14 rounded-2xl bg-teal-500 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Adding..." : "Confirm & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CoursesPage;
