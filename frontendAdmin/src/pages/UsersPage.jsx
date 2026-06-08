import { useEffect, useState, useRef } from "react";
import { MoreVertical, Trash2, ShieldAlert, CheckCircle2, UserX, UserCheck } from "lucide-react";
import { callApi } from "../utils/api";
import { useToast } from "../context/ToastContext";

function ActionMenu({ account, onAction, isSuperAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    if (!buttonRef.current) return;

    const rect =
      buttonRef.current.getBoundingClientRect();

    const menuWidth = 220;
    const menuHeight = 180;

    let left = rect.right - menuWidth;
    let top = rect.bottom + 10;

    // prevent left overflow
    if (left < 10) {
      left = 10;
    }

    // open upward if no space below
    if (
      window.innerHeight - rect.bottom <
      menuHeight
    ) {
      top =
        rect.top -
        menuHeight -
        10;
    }

    setPosition({ top, left });

    setIsOpen((prev) => !prev);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex justify-end pr-2 opacity-20">
        <MoreVertical className="w-5 h-5 text-muted" />
      </div>
    );
  }

  const status = account.status || "active";

  return (
    <>
      <button
        className="p-2 rounded-xl hover:bg-canvas-alt transition-all text-muted hover:text-main"
        ref={buttonRef}
        onClick={toggleMenu}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: "220px",
          }}
          className="
            z-[9999]
            rounded-2xl
            bg-card
            border
            border-border
            shadow-2xl
            overflow-hidden
            py-2
            animate-in
            fade-in
            zoom-in-95
            duration-200
          "
        >
          <div className="text-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted border-b border-border/50">
            Actions
          </div>
          {status === "active" ? (
            <button
              onClick={() => {
                onAction(account, "on-hold");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-orange-500 hover:bg-orange-500/5"
            >
              <UserX className="w-4 h-4" />
               Dismiss
            </button>
          ) : (
            <button
              onClick={() => {
                onAction(account, "active");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-teal-500 hover:bg-teal-500/5"
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
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/5"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      )}
    </>
  );
}

function UsersPage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [deleteModal, setDeleteModal] = useState({
  open: false,
  account: null,
});
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");

  const currentAdmin = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = currentAdmin?.role === "superadmin";

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const [usersResult, adminsResult] = await Promise.allSettled([
        callApi(`/admin/users?page=${page}&limit=10&search=${debouncedSearch}&status=${statusFilter}`),
        callApi("/admin/admins"),
      ]);

      const usersList = usersResult.status === "fulfilled"
   ? (Array.isArray(usersResult.value?.data)
      ? usersResult.value.data
      : [])
  : [];
  if (usersResult.status === "fulfilled") {
  setTotalPages(usersResult.value?. totalPages || 1);
}
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
        status: admin.status || "active",
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

  // Debounce — wait 500ms after user stops typing
// But clear instantly when search is empty
useEffect(() => {
  if (search === "") {
    setDebouncedSearch("");
    setPage(1);
    return;
  }
  // Clear results immediately and show loading
  setAccounts([]);
  setLoading(true);
  
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, 500);
  return () => clearTimeout(timer);
}, [search]);

useEffect(() => {
  fetchAccounts();
}, [page, debouncedSearch, statusFilter]);

useEffect(() => {
  setPage(1);
}, [statusFilter]);

  const handleAction = async (account, action) => {
    if (!isSuperAdmin) return;

   if (action === "delete") {
       setDeleteModal({
       open: true,
       account,
      });
    return;
} else if (action === "active" || action === "on-hold") {
      try {
        if (account.type === "admin") {
          if (currentAdmin?.id && account.rawId === currentAdmin.id) {
            showToast("You cannot suspend yourself.", "warning");
            return;
          }
          if (account.role === "superadmin") {
            showToast("Super admin status cannot be changed.", "warning");
            return;
          }
        }
        const endpoint =
          account.type === "admin"
            ? `/admin/admins/${account.rawId}/status`
            : `/admin/users/${account.rawId}/status`;

        await callApi(endpoint, {
          method: "PATCH",
          body: JSON.stringify({ status: action }),
        });
        showToast(`Account status updated to ${action}`, "success");
        fetchAccounts();
      } catch (err) {
        showToast("Failed to update status: " + err.message, "error");
      }
    }
  };
  const confirmDelete = async () => {
  const account = deleteModal.account;
  if (!account) return;
  try {
    // Prevent self delete
    if (
      currentAdmin?.id &&
      account.rawId === currentAdmin.id
    ) {
      showToast("You cannot delete yourself.", "warning");
      return;
    }
    // Prevent deleting superadmin
    if (account.role === "superadmin") {
      showToast("Super Admin cannot be deleted.", "warning");
      return;
    }
    const endpoint =
      account.type === "admin"
        ? `/admin/${account.rawId}`
        : `/admin/users/${account.rawId}`;

    await callApi(endpoint, {
      method: "DELETE",
    });
    showToast(
      `${account.name} deleted successfully`,
      "success"
    );
    setDeleteModal({
      open: false,
      account: null,
    });
    await fetchAccounts();
  } catch (err) {
    showToast(
      "Failed to delete account: " + err.message,
      "error"
    );
  }
};
  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAdminForm = () => {
    const { name, email, password } = formData;

    if (!name || name.trim().length < 2) {
      return "Name must be at least 2 characters.";
    }
    if (/\d/.test(name)) {
      return "Name must not contain numbers.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!password || password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    return null;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score, label: "Fair", color: "bg-orange-500" };
    if (score === 3) return { score, label: "Good", color: "bg-yellow-500" };
    return { score, label: "Strong", color: "bg-teal-500" };
  };

  const onCreateAdmin = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    if (!isSuperAdmin) {
      setSubmitError("Only superadmin can add other admins.");
      return;
    }

    const validationError = validateAdminForm();
    if (validationError) {
      setSubmitError(validationError);
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

  const visibleAccounts = accounts.filter((item) => {
  // Type filter (Admins/Users toggle)
  if (activeFilter && item.type !== activeFilter) return false;

  // Status filter — hide admins when "dismissed" selected
  if (statusFilter === "on-hold" && item.type === "admin") return false;

  // Search filter — also apply to admins on frontend
  if (search && item.type === "admin") {
    const q = search.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(q);
    const emailMatch = item.email?.toLowerCase().includes(q);
    if (!nameMatch && !emailMatch) return false;
  }

  return true;
});

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
      <div className="px-8 py-4 border-b border-border flex items-center gap-3 justify-between">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-10 px-4 rounded-xl border border-border bg-canvas text-sm font-medium text-main focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-4 rounded-xl border border-border bg-canvas text-sm font-bold text-muted focus:border-teal-500 outline-none transition-all"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on-hold">Dismissed</option>
        </select>
        {search && (
          <button
            onClick={() => { 
              setSearch(""); 
              setDebouncedSearch("");
              setPage(1); 
            }}
            className="h-10 px-4 rounded-xl border border-border text-sm font-bold text-muted hover:bg-canvas-alt transition-all"
          >
            ✕ Clear
          </button>
        )}

        {/* Count Summary */}
        <div className="flex items-center gap-4 ml-auto text-[11px] font-black uppercase tracking-widest text-muted">
          <span>
            Total: <span className="text-main">{visibleAccounts.length}</span>
          </span>
          <span className="text-border">|</span>
          <span>
            Users: <span className="text-blue-500">
              {visibleAccounts.filter(a => a.type === "user").length}
            </span>
          </span>
          <span className="text-border">|</span>
          <span>
            Admins: <span className="text-teal-500">
              {visibleAccounts.filter(a => a.type === "admin").length}
            </span>
          </span>
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
                {loading ? (
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-black uppercase tracking-widest">Searching...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <ShieldAlert className="w-12 h-12" />
                    <p className="text-lg font-black uppercase tracking-widest">No accounts matched.</p>
                  </div>
                )}
              </td>
            </tr>
            )}
          </tbody>
        </table>

      </div>
      <div className="flex items-center justify-center gap-4 py-6">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="px-4 py-2 rounded-lg border border-border disabled:opacity-50"
  >
    Prev
  </button>

  <span className="font-bold">
    Page {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="px-4 py-2 rounded-lg border border-border disabled:opacity-50"
  >
    Next
  </button>
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
                  minLength={8}
                  className="w-full h-12 px-5 rounded-2xl bg-canvas border border-border focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-hidden transition-all font-bold text-main"
                />
                {formData.password && (() => {
                  const strength = getPasswordStrength(formData.password);
                  return (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              strength.score >= i ? strength.color : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${
                        strength.score <= 1 ? "text-red-500" :
                        strength.score === 2 ? "text-orange-500" :
                        strength.score === 3 ? "text-yellow-500" :
                        "text-teal-500"
                      }`}>
                        {strength.label} password
                      </p>
                    </div>
                  );
                })()}
                <p className="text-[10px] text-muted font-medium ml-1">
                  Min 8 chars · Uppercase · Number · Special character
                </p>
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
      {deleteModal.open && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-6 border-b border-border bg-linear-to-r from-red-500/5 to-transparent flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-main">
            Delete Account
          </h2>
          <p className="text-xs text-muted mt-1 font-medium">
            This action cannot be undone.
          </p>
        </div>
        <button
          onClick={() =>
            setDeleteModal({
              open: false,
              account: null,
            })
          }
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
        >
          <XIcon />
        </button>
      </div>
      {/* Body */}
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-main tracking-tight">
              Are you sure you want to delete{" "}
              <span className="text-red-500">
                {deleteModal.account?.name}
              </span>
              ?
            </h3>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Deleting this account will permanently remove
              access and related data. This action cannot
              be undone.
            </p>
          </div>
        </div>
        {/* User Info */}
        <div className="rounded-2xl border border-border bg-canvas p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted font-bold uppercase text-[10px] tracking-widest">
              Email
            </span>
            <span className="text-main font-semibold">
              {deleteModal.account?.email}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted font-bold uppercase text-[10px] tracking-widest">
              Role
            </span>
            <span className="text-main font-semibold uppercase">
              {deleteModal.account?.role}
            </span>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() =>
              setDeleteModal({
                open: false,
                account: null,
              })
            }
            className="flex-1 h-14 rounded-2xl border border-border font-black uppercase tracking-widest text-[11px] hover:bg-canvas-alt transition-all"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 h-14 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[11px] hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>
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
