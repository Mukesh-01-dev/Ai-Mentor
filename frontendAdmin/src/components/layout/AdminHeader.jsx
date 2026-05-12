function AdminHeader({ title }) {
  return (
    <header className="h-20 bg-white border-b px-4 md:px-8 flex items-center justify-between gap-3" style={{ borderColor: "var(--neutral-100)" }}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-full px-4 py-2 min-w-64" style={{ backgroundColor: "var(--neutral-50)" }}>
          <span className="text-sm" style={{ color: "rgba(51,51,51,0.6)" }}>Search courses...</span>
        </div>
        <button type="button" className="relative h-10 w-10 rounded-xl" style={{ backgroundColor: "var(--neutral-50)", color: "var(--neutral-800)" }}>
          B
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button type="button" className="h-11 px-4 md:px-6 rounded-xl text-white font-semibold" style={{ backgroundColor: "var(--admin-primary)" }}>
          + Add Course
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;