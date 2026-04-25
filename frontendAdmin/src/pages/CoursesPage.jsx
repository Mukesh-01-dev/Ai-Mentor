import { useEffect, useMemo, useState } from "react";

const EMPTY_FORM = {
  title: "",
  category: "",
  level: "Beginner",
  priceValue: "",
  image: "",
};

function CoursesPage({ api, searchQuery, refreshKey, triggerRefresh }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api(`/courses?search=${encodeURIComponent(searchQuery || "")}&limit=200`);
      setCourses(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [searchQuery, refreshKey]);

  const submitCourse = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const payload = {
        title: form.title,
        category: form.category,
        level: form.level,
        priceValue: Number(form.priceValue || 0),
        image: form.image,
      };

      if (editing) {
        await api(`/courses/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setForm(EMPTY_FORM);
      setEditing(null);
      await loadCourses();
      triggerRefresh();
    } catch (err) {
      setError(err.message || "Failed to save course");
    } finally {
      setBusy(false);
    }
  };

  const onEdit = (course) => {
    setEditing(course);
    setForm({
      title: course.title || "",
      category: course.category || "",
      level: course.level || "Beginner",
      priceValue: String(course.priceValue || ""),
      image: course.image || "",
    });
  };

  const onDelete = async (courseId) => {
    if (!window.confirm("Delete this course?")) return;
    setBusy(true);
    try {
      await api(`/courses/${courseId}`, { method: "DELETE" });
      await loadCourses();
      triggerRefresh();
    } catch (err) {
      setError(err.message || "Failed to delete course");
    } finally {
      setBusy(false);
    }
  };

  const visibleCourses = useMemo(() => courses || [], [courses]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Courses Management</h2>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm(EMPTY_FORM);
          }}
          className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors"
        >
          Reset
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={submitCourse} className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-5">
        <input
          className="rounded-xl border border-border bg-canvas-alt px-3 py-2 text-sm"
          placeholder="Course title"
          required
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        />
        <input
          className="rounded-xl border border-border bg-canvas-alt px-3 py-2 text-sm"
          placeholder="Category"
          required
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
        />
        <select
          className="rounded-xl border border-border bg-canvas-alt px-3 py-2 text-sm"
          value={form.level}
          onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <input
          type="number"
          min="0"
          className="rounded-xl border border-border bg-canvas-alt px-3 py-2 text-sm"
          placeholder="Price"
          value={form.priceValue}
          onChange={(event) => setForm((prev) => ({ ...prev, priceValue: event.target.value }))}
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-primary text-white px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60"
        >
          {editing ? "Update Course" : "Create Course"}
        </button>
        <input
          className="rounded-xl border border-border bg-canvas-alt px-3 py-2 text-sm md:col-span-5"
          placeholder="Image URL"
          value={form.image}
          onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
        />
      </form>

      {loading ? (
        <p className="text-sm text-muted">Loading courses...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[760px]">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-border">
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Level</th>
                <th className="p-4">Lessons</th>
                <th className="p-4">Price</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {visibleCourses.map((course) => (
                <tr key={course.id} className="border-b border-border">
                  <td className="p-4">
                    <p className="font-semibold">{course.title}</p>
                    <p className="text-xs text-muted">ID: {course.id}</p>
                  </td>
                  <td className="p-4">{course.category || "-"}</td>
                  <td className="p-4">{course.level || "-"}</td>
                  <td className="p-4">{course.lessonsCount || 0}</td>
                  <td className="p-4">{course.priceValue || 0}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(course)}
                        className="h-8 px-3 rounded-lg border border-border text-xs hover:bg-canvas-alt"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(course.id)}
                        className="h-8 px-3 rounded-lg border border-red-300 text-xs text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!visibleCourses.length && (
                <tr>
                  <td className="p-6 text-center text-sm text-muted" colSpan={6}>
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CoursesPage;
