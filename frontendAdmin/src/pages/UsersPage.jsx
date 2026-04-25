import { users } from "../data/adminData";

function UsersPage() {
  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">All Users</h2>
        <div className="flex gap-2">
          <button type="button" className="h-10 px-4 rounded-xl border border-border hover:bg-canvas-alt transition-colors">Filter</button>
          <button type="button" className="h-10 px-4 rounded-xl text-white bg-primary hover:opacity-90 transition-opacity">+ Add User</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[225px]">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">User</th>
              <th>Email</th>
              <th>Enrolled Courses</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {users.map(([name, mail, enrolled, joinDate, status]) => (
              <tr key={mail} className="border-b border-border">
                <td className="p-5 font-medium">{name}</td>
                <td>{mail}</td>
                <td>{enrolled}</td>
                <td>{joinDate}</td>
                <td className={status === "Active" ? "text-green-600" : "text-red-600"}>{status}</td>
                <td className="text-lg">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default UsersPage;
