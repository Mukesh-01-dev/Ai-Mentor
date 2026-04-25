import { useEffect, useState } from "react";

function UsersPage({ api, searchQuery, refreshKey, triggerRefresh }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [busy, setBusy] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api(
        `/users?search=${encodeURIComponent(searchQuery || "")}&role=${encodeURIComponent(roleFilter)}&limit=200`
      );
      setUsers(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter, refreshKey]);

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    setBusy(true);
    try {
      await api(`/users/${userId}`, { method: "DELETE" });
      await loadUsers();
      triggerRefresh();
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setBusy(false);
    }
  };

  const updateRole = async (userId, role) => {
    setBusy(true);
    try {
      await api(`/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      await loadUsers();
      triggerRefresh();
    } catch (err) {
      setError(err.message || "Failed to update role");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Users Management</h2>
        <select
          className="h-10 px-3 rounded-xl border border-border bg-canvas-alt text-sm"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="">All Roles</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
          <option value="superAdmin">superAdmin</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading users...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[760px]">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-border">
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Enrolled</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      disabled={busy}
                      onChange={(event) => updateRole(user.id, event.target.value)}
                      className="h-8 px-2 rounded-lg border border-border bg-canvas-alt text-xs"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="superAdmin">superAdmin</option>
                    </select>
                  </td>
                  <td className="p-4">{user.purchasedCoursesCount || 0}</td>
                  <td className="p-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => deleteUser(user.id)}
                      className="h-8 px-3 rounded-lg border border-red-300 text-xs text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td className="p-6 text-center text-sm text-muted" colSpan={6}>
                    No users found.
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

export default UsersPage;
