import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, X } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { Plus, X, ChevronDown, SlidersHorizontal, ArrowUpDown, Check, BookOpen } from "lucide-react";
import { callApi } from "../utils/api";
import CourseStatusDropdown from "../components/CourseStatusDropdown";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useToast } from "../context/ToastContext";

// ─── MultiSelect Dropdown ─────────────────────────────────────────────────────
function MultiSelectDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  const count = selected.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-9 pl-3.5 pr-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap
          ${count > 0
            ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
            : "border-border bg-canvas hover:bg-canvas-alt text-muted hover:text-main"
          }`}
      >
        <span>{label}</span>
        {count > 0 && (
          <span className="bg-teal-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
            {count}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-11 left-0 min-w-[160px] bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-1.5 space-y-0.5">
            {options.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted italic">No options</p>
            ) : (
              options.map((opt) => {
                const active = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150
                      ${active ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "hover:bg-canvas-alt text-main"}`}
                  >
                    <span>{opt}</span>
                    {active && <Check className="w-3 h-3 text-teal-500" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = SORT_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-9 pl-3.5 pr-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap
          ${value !== "newest"
            ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
            : "border-border bg-canvas hover:bg-canvas-alt text-muted hover:text-main"
          }`}
      >
        <ArrowUpDown className="w-3 h-3" />
        <span className="hidden sm:inline">{current?.label ?? "Sort"}</span>
        <span className="sm:hidden">Sort</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-11 right-0 min-w-[180px] bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-1.5 space-y-0.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150
                  ${value === opt.value ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "hover:bg-canvas-alt text-main"}`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check className="w-3 h-3 text-teal-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase tracking-tight animate-in fade-in zoom-in-95 duration-150">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="w-3.5 h-3.5 rounded-full hover:bg-teal-500/20 flex items-center justify-center transition-colors"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function CoursesPage() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", category: "", priceValue: "", currency: "INR" });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    courseId: null,
    courseTitle: "",
    enrolledCount: 0,
    isDeleting: false,
  });

  // ── Filter panel toggle ───────────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceTypes, setSelectedPriceTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // ── Derived option lists from real API data ───────────────────────────────
  const categories = useMemo(
    () => [...new Set(courses.map((c) => c.category).filter(Boolean))].sort(),
    [courses]
  );

  // ── Fetch ─────────────────────────────────────────────────────────────────
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

  useEffect(() => { fetchCourses(); }, []);

  // ── Filtered + sorted courses ─────────────────────────────────────────────
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (selectedCategories.length > 0)
      result = result.filter((c) => selectedCategories.includes(c.category));

    // Status filter
    if (selectedStatuses.length > 0) {
      result = result.filter((c) =>
        selectedStatuses.includes(c.status || "Published")
      );
    }

    // Paid price range filter
    if (selectedPriceTypes.includes("Paid")) {
      result = result.filter((c) => {
        const price = Number(c.priceValue) || 0;

        if (price === 0) return false;

        const meetsMin =
          minPrice === "" || price >= Number(minPrice);

        const meetsMax =
          maxPrice === "" || price <= Number(maxPrice);

        return meetsMin && meetsMax;
      });
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "price_asc") return (Number(a.priceValue) || 0) - (Number(b.priceValue) || 0);
      if (sortBy === "price_desc") return (Number(b.priceValue) || 0) - (Number(a.priceValue) || 0);
      return 0;
    });

    return result;
  }, [
    courses,
    selectedCategories,
    selectedPriceTypes,
    selectedStatuses,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  // ── Active chips ──────────────────────────────────────────────────────────
  const chips = [
    ...selectedCategories.map((v) => ({ label: v, onRemove: () => setSelectedCategories((p) => p.filter((x) => x !== v)) })),
    ...selectedPriceTypes.map((v) => ({ label: v, onRemove: () => setSelectedPriceTypes((p) => p.filter((x) => x !== v)) })),
    ...selectedStatuses.map((v) => ({
      label: v,
      onRemove: () =>
        setSelectedStatuses((p) =>
          p.filter((x) => x !== v)
        ),
    })),
    ...(minPrice || maxPrice
      ? [{
        label: `₹${minPrice || 0} - ₹${maxPrice || "∞"}`,
        onRemove: () => {
          setMinPrice("");
          setMaxPrice("");
        }
      }]
      : []),
    ...(sortBy !== "newest" ? [{ label: SORT_OPTIONS.find((o) => o.value === sortBy)?.label, onRemove: () => setSortBy("newest") }] : []),
  ];

  const hasActiveFilters = chips.length > 0;
  const activeFilterCount =
    selectedCategories.length +
    selectedPriceTypes.length +
    selectedStatuses.length +
    (minPrice || maxPrice ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedPriceTypes([]);
    setSelectedStatuses([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };
  // ── Add course ────────────────────────────────────────────────────────────
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await callApi("/admin/courses", {
        method: "POST",
        body: JSON.stringify(newCourse),
      });
      setShowAddModal(false);
      setNewCourse({
        title: "",
        category: "",
        priceValue: "",
        currency: "INR",
      });
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
 */
const handleStatusChange = useCallback(async (courseId, newStatus) => {
  const prevCourses = [...coursesRef.current];

  // Optimistic update
  setCourses((prev) =>
    prev.map((c) =>
      c.id === courseId
        ? { ...c, status: newStatus, deletedAt: null }
        : c
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
 * Opens the delete confirmation modal.
 */
const handleDeleteRequest = useCallback(async (courseId) => {
  const course = coursesRef.current.find((c) => c.id === courseId);

  if (!course) return;

  let enrolledCount = 0;

  try {
    const data = await callApi(
      `/admin/courses/${courseId}/enrollments`
    );

    enrolledCount = data.enrolledCount || 0;
  } catch {
    // Ignore fetch failure
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
 * Permanently delete a course.
 */
const handleConfirmDelete = useCallback(async () => {
  const { courseId } = deleteModal;

  if (!courseId) return;

  setDeleteModal((prev) => ({
    ...prev,
    isDeleting: true,
  }));

  try {
    await callApi(`/admin/courses/${courseId}?force=true`, {
      method: "DELETE",
    });

    // Remove from local state
    setCourses((prev) =>
      prev.filter((c) => c.id !== courseId)
    );

    setDeleteModal({
      open: false,
      courseId: null,
      courseTitle: "",
      enrolledCount: 0,
      isDeleting: false,
    });
  } catch (err) {
    showToast("Failed to delete course: " + err.message, "error");

    setDeleteModal((prev) => ({
      ...prev,
      isDeleting: false,
    }));
  }
}, [deleteModal]);

const closeDeleteModal = useCallback(() => {
  if (!deleteModal.isDeleting) {
    setDeleteModal({
      open: false,
      courseId: null,
      courseTitle: "",
      enrolledCount: 0,
      isDeleting: false,
    });
  }
}, [deleteModal.isDeleting]);

/**
 * Status badge color helper.
 */
const getRowClass = (status) => {
  if (status === "deleted") return "opacity-50";
  if (status === "disabled") return "opacity-75";
  return "";
};

if (loading && courses.length === 0)
  return (
    <div className="p-10 text-center text-muted">
      Loading courses...
    </div>
  );

if (error && courses.length === 0)
  return (
    <div className="p-10 text-center text-red-500">
      Error: {error}
    </div>
  );

return (
  <>
    {/* ── Header ──────────────────────────────────────────────────────────── */}
    <div className="border-b border-border px-4 py-4 sm:px-6 md:px-8 sm:py-6 flex flex-wrap gap-3 items-center justify-between">
      <h2 className="text-2xl sm:text-3xl font-semibold">
        Active Courses
      </h2>
      <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-colors flex items-center gap-2 font-semibold text-sm shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Course</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Filter toggle button */}
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className={`h-9 sm:h-10 px-3 sm:px-4 rounded-xl border font-semibold text-sm flex items-center gap-2 transition-all duration-200
              ${showFilters || activeFilterCount > 0
                ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                : "border-border hover:bg-canvas-alt text-muted hover:text-main"
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="bg-teal-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors text-sm text-muted hover:text-main"
          >
            Export
          </button>
        </div>
      </div>

      {/* ── Collapsible Filter Panel ─────────────────────────────────────────── */}
      <div
        className={`transition-all duration-300 ease-in-out border-b border-border
          ${showFilters ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 overflow-hidden border-b-0"}`}
      >
        <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-canvas-alt/40 space-y-3">

          {/* Filter controls row */}
          <div className="flex flex-wrap lg:flex-nowrap gap-2 items-center">

            <MultiSelectDropdown
              label="Category"
              options={categories}
              selected={selectedCategories}
              onChange={setSelectedCategories}
            />

            <MultiSelectDropdown
              label="Price Type"
              options={["Free", "Paid"]}
              selected={selectedPriceTypes}
              onChange={setSelectedPriceTypes}
            />

            <MultiSelectDropdown
              label="Status"
              options={["Published", "Draft", "Archived"]}
              selected={selectedStatuses}
              onChange={setSelectedStatuses}
            />

            {/* Price Range */}
            {selectedPriceTypes.includes("Paid") && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 w-24 px-3 rounded-xl border border-border bg-canvas text-xs font-medium outline-none focus:border-teal-500"
                />

                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 w-24 px-3 rounded-xl border border-border bg-canvas text-xs font-medium outline-none focus:border-teal-500"
                />
              </div>
            )}

            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
          {/* Active chips + Clear All */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {chips.map((chip, i) => (
                <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="ml-1 text-[10px] font-bold text-muted hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X className="w-2.5 h-2.5" />
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Results summary bar ──────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="px-4 sm:px-6 md:px-8 py-2 flex items-center gap-2 text-[10px] text-muted font-semibold uppercase tracking-wider border-b border-border bg-canvas-alt/20">
          <span className="text-teal-500 font-black">{filteredCourses.length}</span>
          <span>of {courses.length} courses match</span>
        </div>
      )}

      {/* ── Table — desktop / Card list — mobile ────────────────────────────── */}

      {/* Desktop table (hidden on mobile) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Course Title</th>
              <th className="pr-4">Category</th>
              <th className="pr-4">Price</th>
              <th className="pr-4">Currency</th>
              <th className="pr-4">Added On</th>
              <th className="pr-4">Status</th>
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
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-border hover:bg-canvas-alt transition-colors group"
                >
                  <td className="p-5">
                    <div className="font-semibold text-main group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {course.title}
                    </div>
                    <div className="text-muted text-[10px] uppercase tracking-tighter mt-0.5">
                      ID: {course.id}
                    </div>
                  </td>
                  <td className="pr-4">
                    <span className="px-2.5 py-1 rounded-lg bg-canvas-alt border border-border text-[11px] font-bold uppercase tracking-tight text-muted">
                      {course.category || "—"}
                    </span>
                  </td>
                  <td className="pr-4 font-black text-main tracking-tight">
                    {course.priceValue != null && course.priceValue !== "" ? (
                      Number(course.priceValue) === 0
                        ? <span className="text-teal-500 text-[11px] font-black uppercase tracking-widest">Free</span>
                        : course.priceValue
                    ) : "—"}
                  </td>
                  <td className="pr-4 text-muted font-bold text-[11px]">{course.currency || "INR"}</td>
                  <td className="pr-4 text-muted text-[11px] font-medium">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="pr-4">
                    <span className="text-teal-500 font-black text-[10px] uppercase tracking-widest">Published</span>
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
                <td colSpan="6">
                  <EmptyState onClear={clearAll} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Course Modal */}
      {/* Mobile card list (hidden on desktop) */}
      <div className="sm:hidden divide-y divide-border">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="px-4 py-4 hover:bg-canvas-alt transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-main text-sm leading-tight truncate">{course.title}</p>
                  <p className="text-muted text-[10px] uppercase tracking-tighter mt-0.5">ID: {course.id}</p>
                </div>
                <span className="text-teal-500 font-black text-[9px] uppercase tracking-widest shrink-0 mt-0.5">
                  Published
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5 items-center">
                {course.category && (
                  <span className="px-2 py-0.5 rounded-md bg-canvas-alt border border-border text-[10px] font-bold uppercase tracking-tight text-muted">
                    {course.category}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest
                  ${Number(course.priceValue) === 0
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    : "bg-canvas-alt border border-border text-muted"
                  }`}>
                  {Number(course.priceValue) === 0
                    ? "Free"
                    : `${course.priceValue} ${course.currency || "INR"}`}
                </span>
                <span className="ml-auto text-[10px] text-muted font-medium">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <EmptyState onClear={clearAll} />
        )}
      </div>

      {/* ── Add Course Modal ─────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-teal-500/5 to-transparent">
              <h3 className="text-lg sm:text-xl font-bold text-main tracking-tight uppercase">Add New Course</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCourse} className="p-5 sm:p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium text-main"
                  placeholder="e.g. Advanced React Architecture"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium text-main"
                  placeholder="e.g. Web Development"
                  value={newCourse.category}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, category: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
                    Price
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold text-main"
                    placeholder="0"
                    value={newCourse.priceValue}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, priceValue: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
                    Currency
                  </label>
                  <select
                    className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold text-main appearance-none"
                    value={newCourse.currency}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, currency: e.target.value })
                    }
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-border font-bold uppercase tracking-widest text-[11px] hover:bg-canvas-alt transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] h-12 rounded-2xl bg-teal-500 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Adding…" : "Confirm & Save"}
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

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-3 text-center animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-2xl bg-canvas-alt border border-border flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-muted" />
      </div>
      <div>
        <p className="text-main font-bold">No courses match your filters</p>
        <p className="text-muted text-sm mt-1">Try adjusting or clearing the active filters above.</p>
      </div>
    </div>
  );
}

export default CoursesPage;