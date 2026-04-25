import { enrollments } from "../data/adminData";

function EnrollmentsPage() {
  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">All Enrollments</h2>
        <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Export Report</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-215">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Student</th>
              <th>Course</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {enrollments.map(([name, course, date, amount, status]) => (
              <tr key={`${name}-${course}`} className="border-b border-border">
                <td className="p-5 font-medium">{name}</td>
                <td>{course}</td>
                <td>{date}</td>
                <td className="font-semibold">{amount}</td>
                <td className={status === "Completed" ? "text-green-600" : status === "Pending" ? "text-amber-500" : "text-red-600"}>{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default EnrollmentsPage;
