import { useEffect, useState, useRef } from "react";
import { MoreVertical, Trash2, ShieldAlert, CheckCircle2, UserX, UserCheck } from "lucide-react";
import { callApi } from "../utils/api";

function ActionMenu({ account, onAction, isSuperAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isSuperAdmin) return <div className="text-muted opacity-20"><MoreVertical className="w-5 h-5" /></div>;

  const status = account.status || "active";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-canvas-alt transition-all text-muted hover:text-main"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-card border border-border shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted border-b border-border/50 mb-1">
            Actions
          </div>
          
          {status === "active" ? (
            <button
              onClick={() => {
                onAction(account, "on-hold");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-orange-500 hover:bg-orange-500/5 transition-all"
            >
              <UserX className="w-4 h-4" />
              Put On Hold
            </button>
          ) : (
            <button
              onClick={() => {
                onAction(account, "active");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-teal-500 hover:bg-teal-500/5 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              Activate
            </button>
          )}

          <button
            onClick={() => {
              onAction(account, "delete");
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
}

function UsersPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const currentAdmin = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = currentAdmin?.role === "superadmin";

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const [usersResult, adminsResult] = await Promise.allSettled([
        callApi("/admin/users"),
        callApi("/admin/admins"),
      ]);

      const usersList = usersResult.status === "fulfilled"
        ? (Array.isArray(usersResult.value?.data) ? usersResult.value.data : [])
        : [];
      const adminsList = adminsResult.status === "fulfilled"
        ? (Array.isArray(adminsResult.value?.data) ? adminsResult.value.data : [])
        : [];

      if (usersResult.status === "rejected" && adminsResult.status === "rejected") {
        throw new Error(usersResult.reason?.message || adminsResult.reason?.message || "Unable to load accounts");
      }

      const normalizedUsers = usersList.map((user) => ({
        id: `user-${user.id}`,
        rawId: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        type: "user",
        status: user.status || "active",
        createdAt: user.createdAt,
      }));

      const normalizedAdmins = adminsList.map((admin) => ({
        id: `admin-${admin.id}`,
        rawId: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role || "admin",
        type: "admin",
        status: "active", // Admins are always active for now
        createdAt: admin.createdAt,
      }));

      const merged = [...normalizedAdmins, ...normalizedUsers].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      setAccounts(merged);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAction = async (account, action) => {
    if (!isSuperAdmin) return;

    if (action === "delete") {
      if (!window.confirm(`Are you sure you want to delete ${account.name}? This action cannot be undone.`)) return;
      try {
        const endpoint = account.type === "admin" ? `/admin/${account.rawId}` : `/admin/users/${account.rawId}`;
        await callApi(endpoint, { method: "DELETE" });
        fetchAccounts();
      } catch (err) {
        alert("Failed to delete account: " + err.message);
      }
    } else if (action === "active" || action === "on-hold") {
      try {
        if (account.type === "admin") {
          alert("Admin status cannot be changed yet.");
          return;
        }
        await callApi(`/admin/users/${account.rawId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: action }),
        });
        fetchAccounts();
      } catch (err) {
        alert("Failed to update status: " + err.message);
      }
    }
  };

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onCreateAdmin = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    if (!isSuperAdmin) {
      setSubmitError("Only superadmin can add other admins.");
      return;
    }

    try {
      setIsSubmitting(true);
      await callApi("/admin/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      setFormData({ name: "", email: "", password: "" });
      setIsAddAdminOpen(false);
      await fetchAccounts();
    } catch (err) {
      setSubmitError(err.message || "Unable to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleAccounts = activeFilter
    ? accounts.filter((item) => item.type === activeFilter)
    : accounts;

  if (loading && accounts.length === 0) return <div className="p-10 text-center text-muted italic">Fetching accounts...</div>;
  if (error && accounts.length === 0) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex flex-wrap items-center justify-between gap-3 bg-linear-to-r from-canvas-alt/30 to-transparent">
        <h2 className="text-3xl font-black uppercase tracking-tight text-main">Manage Users</h2>

        <div className="flex items-center gap-2 p-1 bg-canvas rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => setActiveFilter((prev) => (prev === "admin" ? null : "admin"))}
            className={`h-10 px-6 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] ${
              activeFilter === "admin"
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                : "text-muted hover:bg-canvas-alt"
            }`}
          >
            Admins
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter((prev) => (prev === "user" ? null : "user"))}
            className={`h-10 px-6 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] ${
              activeFilter === "user"
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                : "text-muted hover:bg-canvas-alt"
            }`}
          >
            Users
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsAddAdminOpen(true)}
            disabled={!isSuperAdmin}
            className="h-12 px-6 rounded-2xl text-white bg-teal-500 font-black uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-xl shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <PlusIcon />
            Add Admin
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="text-left text-[10px] font-black uppercase tracking-widest text-muted border-b border-border bg-canvas-alt/10">
            <tr>
              <th className="p-6">Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Role</th>
              <th>Created</th>
              <th>Status</th>
              <th className="pr-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {visibleAccounts.length > 0 ? (
              visibleAccounts.map((account) => (
                <tr key={account.id} className="border-b border-border hover:bg-canvas-alt/50 transition-all group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black uppercase text-[10px] ${
                        account.type === "admin" ? "bg-teal-500/10 text-teal-500" : "bg-blue-500/10 text-blue-500"
                      }`}>
                        {account.name.charAt(0)}
                      </div>
                      <div className="font-bold text-main tracking-tight">{account.name}</div>
                    </div>
                  </td>
                  <td className="text-muted font-medium">{account.email}</td>
                  <td>
                    <span className={`inline-flex h-7 items-center px-3 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                      account.type === "admin"
                        ? "border-teal-500/30 bg-teal-500/5 text-teal-500"
                        : "border-border text-muted"
                    }`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="uppercase text-[10px] font-black tracking-widest text-muted">{account.role}</td>
                  <td className="text-muted font-bold text-[11px]">{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "-"}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${account.status === "on-hold" ? "bg-orange-500" : "bg-green-500"} animate-pulse`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${account.status === "on-hold" ? "text-orange-500" : "text-green-500"}`}>
                        {account.status || "active"}
                      </span>
                    </div>
                  </td>
                  <td className="pr-8 text-right">
                    <ActionMenu account={account} isSuperAdmin={isSuperAdmin} onAction={handleAction} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-20 text-center text-muted italic">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <ShieldAlert className="w-12 h-12" />
                    <p className="text-lg font-black uppercase tracking-widest">No accounts matched.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddAdminOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-linear-to-r from-teal-500/5 to-transparent">
              <h3 className="text-xl font-bold text-main tracking-tight uppercase">Create Admin</h3>
              <button
                onClick={() => setIsAddAdminOpen(false)}
                className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <XIcon />
              </button>
            </div>

            <form className="p-8 space-y-6" onSubmit={onCreateAdmin}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onFieldChange}
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-hidden transition-all font-medium text-main"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onFieldChange}
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-hidden transition-all font-medium text-main"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onFieldChange}
                  required
                  minLength={6}
                  className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-hidden transition-all font-bold text-main"
                />
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                <ShieldAlert className="w-5 h-5 text-teal-500 shrink-0" />
                <p className="text-[10px] text-muted font-bold leading-relaxed uppercase tracking-tight">This will create a regular admin account. Only Super Admins can manage other accounts.</p>
              </div>

              {submitError && <p className="text-red-500 text-xs font-bold uppercase tracking-tight">{submitError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAdminOpen(false);
                    setSubmitError(null);
                  }}
                  className="flex-1 h-14 rounded-2xl border border-border font-bold uppercase tracking-widest text-[11px] hover:bg-canvas-alt transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 h-14 rounded-2xl bg-teal-500 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default UsersPage;
