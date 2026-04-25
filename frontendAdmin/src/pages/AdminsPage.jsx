import { useEffect, useState } from "react";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "admin",
};

function AdminsPage({ api, isSuperAdmin, searchQuery, refreshKey, triggerRefresh }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    setError("");
    try {
      const response = await api(`/admins?search=${encodeURIComponent(searchQuery || "")}&limit=200`);
      setAdmins(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isSuperAdmin, searchQuery, refreshKey]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/admins", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(EMPTY_FORM);
      await load();
      triggerRefresh();
    } catch (err) {
      setError(err.message || "Failed to create admin");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    setBusy(true);
    try {
      await api(`/admins/${id}`, { method: "DELETE" });
      await load();
      triggerRefresh();
    } catch (err) {
      setError(err.message || "Failed to delete admin");
    } finally {
      setBusy(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-sm text-muted">Only super admin can manage admin accounts.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <h2 className="text-3xl font-semibold">Admin Management</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-4">
        <input
          className="rounded-xl border border-border bg-canvas-alt px-3 py-2 text-sm"
          placeholder="Name"
          value={form.name}
          required
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          className="rounded-xl border border-border bg-canvas-alt px-3 py-2 text-sm"
          placeholder="Email"
          type="email"
          value={form.email}
          required
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <input
          className="rounded-xl border border-border bg-canvas-alt px-3 py-2 text-sm"
          placeholder="Password"
          type="password"
          value={form.password}
          required
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
        <select
          className="rounded-xl border border-border bg-canvas-alt px-3 py-2 text-sm"
          value={form.role}
          onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
        >
          <option value="admin">admin</option>
          <option value="superAdmin">superAdmin</option>
        </select>
        <button
          type="submit"
          disabled={busy}
          className="md:col-span-4 rounded-xl bg-primary text-white px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60"
        >
          Create Admin
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted">Loading admins...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[620px]">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-border">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Created</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-border">
                  <td className="p-4">{admin.name}</td>
                  <td className="p-4">{admin.email}</td>
                  <td className="p-4">{admin.role}</td>
                  <td className="p-4">{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => remove(admin.id)}
                      className="h-8 px-3 rounded-lg border border-red-300 text-xs text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!admins.length && (
                <tr>
                  <td className="p-6 text-center text-sm text-muted" colSpan={5}>
                    No admins found.
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

export default AdminsPage;
