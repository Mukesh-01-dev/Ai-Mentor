import { courses } from "../data/adminData";

function CoursesPage() {
  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Active Courses</h2>
        <div className="flex gap-2">
          <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Filter</button>
          <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[225px]">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Course Detail</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Enrolled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {courses.map(([name, category, price, enrolled, status]) => (
              <tr key={name} className="border-b border-border">
                <td className="p-5">
                  <div className="font-semibold">{name}</div>
                  <div className="text-muted">Last updated recently</div>
                </td>
                <td><span className="px-3 py-1 rounded-full bg-canvas-alt border border-border">{category}</span></td>
                <td className="font-semibold">{price}</td>
                <td>{enrolled}</td>
                <td className={status === "Published" ? "text-green-600" : "text-orange-500"}>{status}</td>
                <td className="text-lg">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default CoursesPage;
