import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, X } from "lucide-react";
import { callApi } from "../utils/api";
import CourseStatusDropdown from "../components/CourseStatusDropdown";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useToast } from "../context/ToastContext";

function CoursesPage() {
  const { showToast } = useToast();
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

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    courseId: null,
    courseTitle: "",
    enrolledCount: 0,
    isDeleting: false,
  });

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
      showToast("Failed to add course: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Ref always holds the latest courses — prevents stale closures in callbacks
  const coursesRef = useRef(courses);
  useEffect(() => {
    coursesRef.current = courses;
  }, [courses]);

  /**
   * Optimistic status update with rollback on failure.
   * Uses coursesRef to avoid stale closure — callback identity stays stable.
   */
  const handleStatusChange = useCallback(async (courseId, newStatus) => {
    const prevCourses = [...coursesRef.current];

    // Optimistic update
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, status: newStatus, deletedAt: null } : c
      )
    );

    try {
      await callApi(`/admin/courses/${courseId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      // Rollback on failure
      setCourses(prevCourses);
      showToast("Failed to update status: " + err.message, "error");
    }
  }, []);

  /**
   * Opens the delete confirmation modal after fetching enrollment count.
   * Uses coursesRef to avoid stale closure.
   */
  const handleDeleteRequest = useCallback(async (courseId) => {
    const course = coursesRef.current.find((c) => c.id === courseId);
    if (!course) return;

    // Fetch enrolled user count
    let enrolledCount = 0;
    try {
      const data = await callApi(`/admin/courses/${courseId}/enrollments`);
      enrolledCount = data.enrolledCount || 0;
    } catch {
      // If fetch fails, show modal anyway with 0 count
    }

    setDeleteModal({
      open: true,
      courseId,
      courseTitle: course.title || "Untitled Course",
      enrolledCount,
      isDeleting: false,
    });
  }, []);

  /**
   * Permanently delete a course (hard delete).
   */
  const handleConfirmDelete = useCallback(async () => {
    const { courseId } = deleteModal;
    if (!courseId) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      await callApi(`/admin/courses/${courseId}?force=true`, {
        method: "DELETE",
      });
      // Remove from local state
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setDeleteModal({ open: false, courseId: null, courseTitle: "", enrolledCount: 0, isDeleting: false });
    } catch (err) {
      showToast("Failed to delete course: " + err.message, "error");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  }, [deleteModal]);

  const closeDeleteModal = useCallback(() => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ open: false, courseId: null, courseTitle: "", enrolledCount: 0, isDeleting: false });
    }
  }, [deleteModal.isDeleting]);

  /**
   * Status badge color helper for the row styling.
   */
  const getRowClass = (status) => {
    if (status === "deleted") return "opacity-50";
    if (status === "disabled") return "opacity-75";
    return "";
  };

  if (loading && courses.length === 0) return <div className="p-10 text-center text-muted">Loading courses...</div>;
  if (error && courses.length === 0) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Course Management</h2>
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
                <tr key={course.id} className={`border-b border-border hover:bg-canvas-alt transition-colors ${getRowClass(course.status)}`}>
                  <td className="p-5">
                    <div className={`font-semibold text-main ${course.status === "deleted" ? "line-through" : ""}`}>
                      {course.title}
                    </div>
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
                  <td>
                    <CourseStatusDropdown
                      courseId={course.id}
                      currentStatus={course.status || "published"}
                      onStatusChange={handleStatusChange}
                      onDeleteRequest={handleDeleteRequest}
                    />
                  </td>
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

      {/* Add Course Modal */}
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

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        courseTitle={deleteModal.courseTitle}
        enrolledCount={deleteModal.enrolledCount}
        isDeleting={deleteModal.isDeleting}
      />
    </>
  );
}

export default CoursesPage;
