import React, { useState, useMemo } from "react";
import { ShieldAlert } from "lucide-react";

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  //  Check if they are the Super Admin
  const isSuperAdmin = user?.role === "superadmin";
    // const isSuperAdmin = user?.role === "false";
  
  const handlePasswordChange = (e) => {
    e.preventDefault();
    console.log("Submit clicked:", { currentPassword, newPassword });
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
              Super Admin passwords cannot be changed from this dashboard. Please contact the system architect to update root credentials.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-main mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-main mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-main mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                required
              />
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