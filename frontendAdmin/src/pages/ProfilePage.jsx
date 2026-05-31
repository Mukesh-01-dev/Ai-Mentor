import React, { useMemo } from "react";
import { Camera } from "lucide-react";

const ProfilePage = () => {
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "Admin";
  const lastName = user?.lastName || user?.name?.split(" ")[1] || "";
  const email = user?.email || "admin@uptoskills.com";
  const role = user?.role || "Admin";
  const avatarUrl = user?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(firstName + " " + lastName)}`;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-main mb-2">Profile Settings</h1>
        <p className="text-sm text-muted">View your admin account information.</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          
          {/* Left Side: Avatar & Name */}
          <div className="flex flex-col items-center min-w-[200px]">
            <div className="relative mb-4 group">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-border/50 object-cover shadow-sm transition-colors"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-canvas-alt border border-border rounded-full flex items-center justify-center shadow-md">
                <Camera className="w-4 h-4 text-muted" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-main capitalize">
              {firstName} {lastName}
            </h2>
            <p className="text-sm text-teal-500 uppercase tracking-wider font-bold mt-1">
              {role}
            </p>
          </div>

          {/* Right Side: Floating Label Inputs (Read Only) */}
          <div className="flex-1 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-card px-1 text-xs text-muted font-bold">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  readOnly
                  className="w-full px-4 py-3 bg-transparent border border-border rounded-xl text-sm text-main opacity-80 cursor-not-allowed outline-none"
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-card px-1 text-xs text-muted font-bold">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  readOnly
                  className="w-full px-4 py-3 bg-transparent border border-border rounded-xl text-sm text-main opacity-80 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <label className="absolute -top-2 left-4 bg-card px-1 text-xs text-muted font-bold">Email Address</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-3 bg-transparent border border-border rounded-xl text-sm text-main opacity-80 cursor-not-allowed outline-none"
              />
            </div>

            <div className="relative">
              <label className="absolute -top-2 left-4 bg-card px-1 text-xs text-muted font-bold">Admin Permissions</label>
              <input
                type="text"
                value="Full Dashboard Access"
                readOnly
                className="w-full px-4 py-3 bg-transparent border border-border rounded-xl text-sm text-main opacity-80 cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Buttons (Disabled for now) */}
        <div className="flex justify-between items-center pt-6 border-t border-border/50">
          <p className="text-xs text-muted italic">
            *Admin details are managed by the system database.
          </p>
          <div className="flex gap-3">
            <button disabled className="px-6 py-2.5 rounded-xl border border-border bg-transparent text-muted text-sm font-bold opacity-50 cursor-not-allowed">
              Cancel
            </button>
            <button disabled className="px-6 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-bold opacity-50 cursor-not-allowed">
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;