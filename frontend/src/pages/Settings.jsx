import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../lib/api";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  UserX,
  Camera,
} from "lucide-react";

const NAV_KEYS = [
  { icon: User, key: "profile", label: "Profile" },
  { icon: Bell, key: "notifications", label: "Notifications" },
  { icon: Shield, key: "password", label: "Security" },
  { icon: Palette, key: "appearance", label: "Appearance" },
  { icon: Globe, key: "language", label: "Language" },
  { icon: UserX, key: "delete", label: "Delete" },
];

export default function Settings() {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  const [active, setActive] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // PROFILE SAVE
  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      const form = new FormData();
      Object.keys(formData).forEach((key) =>
        form.append(key, formData[key])
      );

      if (avatarFile) form.append("avatar", avatarFile);

      await API.put("/api/users/profile", form);

      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed!");
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD
  const handlePassword = async () => {
    try {
      await API.put("/api/users/change-password", passwordData);
      toast.success("Password updated!");
    } catch {
      toast.error("Failed!");
    }
  };

  // NOTIFICATIONS
  const handleNotifications = async () => {
    try {
      await API.put("/api/users/settings", { notifications });
      toast.success("Saved!");
    } catch {
      toast.error("Error!");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1">

      {/* SIDEBAR */}
      <aside className="hidden lg:block w-[260px] m-6 bg-white rounded-xl shadow">
        <div className="p-4 space-y-2">
          {NAV_KEYS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex gap-3 p-3 rounded-lg ${
                  active === item.key
                    ? "bg-teal-100 text-teal-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-4 py-4 max-w-2xl">

        {/* PROFILE */}
        {active === "profile" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Profile</h2>

            {/* IMAGE */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={
                    avatarFile
                      ? URL.createObjectURL(avatarFile)
                      : `https://ui-avatars.com/api/?name=${formData.firstName}`
                  }
                  className="w-24 h-24 rounded-full"
                />

                <label className="absolute bottom-0 right-0 bg-black p-2 rounded-full cursor-pointer">
                  <Camera size={14} color="white" />
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {/* INPUTS */}
            <label className="text-sm">First Name</label>
            <input
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <label className="text-sm">Last Name</label>
            <input
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <label className="text-sm">Email</label>
            <input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <label className="text-sm">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="border p-2 w-full mb-4 rounded"
            />

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="border px-5 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveProfile}
                className="bg-teal-500 text-white px-5 py-2 rounded"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {active === "notifications" && (
          <div>
            <h2 className="text-2xl mb-4">Notifications</h2>

            <label className="flex gap-2 mb-2">
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    emailNotifications: !notifications.emailNotifications,
                  })
                }
              />
              Email Notifications
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={notifications.pushNotifications}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    pushNotifications: !notifications.pushNotifications,
                  })
                }
              />
              Push Notifications
            </label>

            <button
              onClick={handleNotifications}
              className="bg-green-500 text-white px-5 py-2 mt-3 rounded"
            >
              Save
            </button>
          </div>
        )}

        {/* PASSWORD */}
        {active === "password" && (
          <div>
            <h2 className="text-2xl mb-4">Security</h2>

            <input
              type="password"
              placeholder="Current Password"
              className="border p-2 w-full mb-3"
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="New Password"
              className="border p-2 w-full mb-3"
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
            />

            <button
              onClick={handlePassword}
              className="bg-blue-500 text-white px-5 py-2 rounded"
            >
              Save
            </button>
          </div>
        )}

        {/* APPEARANCE */}
        {active === "appearance" && (
          <div>
            <h2 className="text-2xl mb-4">Appearance</h2>

            <button
              onClick={() => setTheme("light")}
              className="border px-4 py-2 mr-2"
            >
              Light
            </button>

            <button
              onClick={() => setTheme("dark")}
              className="border px-4 py-2"
            >
              Dark
            </button>
          </div>
        )}

        {/* DELETE */}
        {active === "delete" && (
          <div>
            <h2 className="text-xl text-red-500">Delete Account</h2>
            <p>This action cannot be undone.</p>
          </div>
        )}

      </main>
    </div>
  );
}