import React, { useState, useMemo } from "react";
import { ShieldAlert, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

// ── Password validation helper ──────────────────────────────────────────
  const pw =newPassword;
  const pwChecks = {
    minLength: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  };
  const allPwValid = Object.values(pwChecks).every(Boolean);

  // Single step-by-step hint — first failing rule in priority order
  const pwHint =
    pw.length === 0 ? null :
      !pwChecks.minLength ? "Password must be at least 8 characters" :
        !pwChecks.uppercase ? "Password must contain an uppercase letter" :
          !pwChecks.lowercase ? "Password must contain a lowercase letter" :
            !pwChecks.number ? "Password must contain a number" :
              !pwChecks.symbol ? "Password must contain a special character" :
                null;

  //  Check if they are the Super Admin
  const isSuperAdmin = user?.role === "superadmin";
  // const isSuperAdmin = user?.role === "false";

  const handlePasswordChange = async(e) => {
    e.preventDefault();

     if(newPassword!==confirmPassword){
        toast.error("New passwords do not match!");
        return;
    }
    if (!allPwValid) {
        toast.error(pwHint);
        return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put("/api/admin/change-password",
      { currentPassword:currentPassword, newPassword:newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword(""); 
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update password");
      }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-main mb-6">Settings</h1>

      <div className="bg-card border border-border/50 rounded-2xl p-6 max-w-xl shadow-sm">
        <h2 className="text-xl font-bold text-main mb-1">Change Password</h2>
        <p className="text-sm text-muted mb-6">
          Update your admin account password.
        </p>

        {isSuperAdmin ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/50 rounded-xl bg-canvas/50 text-center">
            <ShieldAlert className="w-12 h-12 text-orange-500 mb-3 opacity-80" />
            <h3 className="text-lg font-bold text-main">Action Restricted</h3>
            <p className="text-sm text-muted mt-2 max-w-sm">
              Super Admin passwords cannot be changed from this dashboard. Please
              contact the system architect to update root credentials.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-main mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 pr-11 bg-canvas border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
                  tabIndex={-1}
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-main mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 pr-11 bg-canvas border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-main mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 pr-11 bg-canvas border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-4 py-3 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;