// frontend/src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/index.js";

const NAV_KEYS = [
  { icon: User, key: "profile", labelKey: "settings.nav.profile" },
  { icon: Bell, key: "notifications", labelKey: "settings.nav.notifications" },
  { icon: Shield, key: "password_security", labelKey: "settings.nav.password_security" },
  { icon: Palette, key: "appearance", labelKey: "settings.nav.appearance" },
  { icon: Globe, key: "language", labelKey: "settings.nav.language" },
];

export default function Settings() {
  const { t } = useTranslation();
  const [originalNotifications, setOriginalNotifications] = useState(null);
  const { theme, setTheme } = useTheme();
  const [avatarFile, setAvatarFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSetting, setActiveSetting] = useState("profile");
  const { user, updateUser, fetchUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
  });
  const [settingsData, setSettingsData] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      courseUpdates: true,
      discussionReplies: true,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
    },
    appearance: {
      theme: "light",
      language: "en",
    },
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [profilepopup, setProfilePopup] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeletePopup, setshowDeletePopup] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);

      const token = localStorage.getItem("token");
      await axios.delete("/api/users/delete-account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Delete error", error);
    } finally {
      setDeleting(false);
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("firstName", formData.firstName);
      form.append("lastName", formData.lastName);
      form.append("email", formData.email);
      form.append("bio", formData.bio);

      if (avatarFile) {
        form.append("avatar", avatarFile);
      }

      const response = await axios.put("/api/users/profile", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Backend response:", response.data);

      // 🔥 FIX 1: Update context FIRST with fresh data
      updateUser(response.data);

      // 🔥 FIX 2: Wait for state to update, THEN fetch (or skip fetch entirely)
      setTimeout(async () => {
        await fetchUserProfile(); // This will now return avatar_url!
        console.log("🔄 Refetched user:", JSON.parse(localStorage.getItem("user")));
      }, 500);

      setAvatarFile(null);
      toast.success("Profile updated successfully!");
      setProfilePopup(true);
    } catch (error) {
      console.error("❌ Error updating profile:", error.response?.data || error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio:
          user.bio ||
          "Passionate about AI and machine learning. Currently pursuing advanced courses in data science.",
      });
    }
  }, [user]);

  // Fetch current settings on mount
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/users/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSettingsData(data);
        if (data?.appearance?.language) {
          i18n.changeLanguage(data.appearance.language);
        }
      } catch (err) {
        console.error("Failed to fetch notification settings:", err);
      }
    };

    fetchNotificationSettings();
  }, [user]);

  return (
    <div className="min-h-screen bg-canvas-alt flex flex-col">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activePage="settings"
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 mt-3 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
          }`}
      >
        <div className="flex flex-1 mt-15">
          {/* Settings Sidebar */}
          <aside className="w-[280px] bg-card rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] m-6 mr-0">
            <nav className="p-6">
              <div className="space-y-2">
                {NAV_KEYS.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      onClick={() => setActiveSetting(item.key)}
                      key={item.key}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-colors ${activeSetting === item.label
                        ? "bg-teal-50 dark:bg-teal-900/20 text-main"
                        : "text-muted hover:bg-canvas-alt"
                        }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 ${activeSetting === item.label
                          ? "text-[#00BEA5]"
                          : "text-[#00BEA5]"
                          }`}
                      />
                      <span className="font-medium text-[16px] font-[Inter]">
                        {t(item.labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 mt-5">
            {activeSetting === "profile" && (
              <div className="max-w-[896px]">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-[30px] font-bold text-main font-[Inter] mb-2">
                    {t("settings.profile.title")}
                  </h1>
                  <p className="text-[16px] text-muted font-[Inter]">
                    {t("settings.profile.subtitle")}
                  </p>
                </div>

                {/* Settings Card */}
                <div className="bg-card rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-8">
                  <div className="flex gap-8 mb-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-6">
                        <img
                          src={
                            avatarFile
                              ? URL.createObjectURL(avatarFile)
                              : user?.avatar_url
                                ? user.avatar_url
                                : `https://api.dicebear.com/8.x/initials/svg?seed=${formData.firstName}%20${formData.lastName}`
                          }
                          alt="Profile"
                          className="w-32 h-32 rounded-full border-4 border-[rgba(255,135,89,0.65)] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)]"
                        />

                        <label className="absolute bottom-2 right-2 w-10 h-10 bg-[#475569] rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)]">
                          <Camera className="w-[14px] h-[14px] text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => setAvatarFile(e.target.files[0])}
                          />
                        </label>
                      </div>
                      <h2 className="text-[20px] font-semibold text-main font-[Inter] mb-1">
                        {formData.firstName} {formData.lastName}
                      </h2>
                      <p className="text-[16px] text-muted font-[Inter]">
                        {t("common.premium_member")}
                      </p>
                    </div>

                    {/* Form Section */}
                    <div className="flex-1 space-y-6">
                      {/* First and Last Name */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="relative">
                          <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">
                            {t("settings.profile.first_name")}
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className="w-full h-[50px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main"
                          />
                        </div>
                        <div className="relative">
                          <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">
                            {t("settings.profile.last_name")}
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className="w-full h-[50px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">
                          {t("settings.profile.email")}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full h-[50px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main"
                        />
                      </div>

                      {/* Bio */}
                      <div className="relative">
                        <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">
                          {t("settings.profile.bio")}
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          className="w-full min-h-[122px] px-4 py-3 rounded-xl border border-border text-[16px] font-[Inter] resize-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main"
                        />

                      </div>
                      <div className="flex justify-end ">
                        <button className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium font-[Inter] transition"
                          onClick={() => setshowDeletePopup(true)}>
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-border">
                    <button
                      type="button"
                      className="h-[50px] px-6 rounded-xl border border-border bg-card text-main text-[16px] font-medium font-[Inter] hover:bg-canvas-alt"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="h-[50px] px-6 rounded-xl bg-gradient-to-r from-primary to-primary text-white text-[16px] font-medium font-[Inter] hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? t("common.saving") : t("common.save_changes")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Button Popup */}
            {showDeletePopup && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-[420px] text-center shadow-xl">
                  <div className="mb-4 text-red-500 text-5xl">⚠</div>

                  <h2 className="text-xl font-bold mb-2 text-main">
                    Delete Account?
                  </h2>

                  <p className="text-muted mb-6 text-sm">
                    This action will permanently delete your profile, courses,
                    and progress. This cannot be undone.
                  </p>

                  <div className="flex justify-center gap-4">

                    <button
                      onClick={() => setshowDeletePopup(false)}
                      className="px-6 py-2 border rounded-lg hover:bg-gray-200">
                      Cancel
                    </button>

                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 "
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                </div>
              </div>
            )}
            
            {activeSetting === "notifications" && (
              <div className="max-w-[896px]">
                <div className="mb-8">
                  <h1 className="text-[30px] font-bold text-main font-[Inter] mb-2">
                    {t("settings.notifications.title")}
                  </h1>
                  <p className="text-[16px] text-muted font-[Inter]">
                    {t("settings.notifications.subtitle")}
                  </p>
                </div>
                <div className="bg-card rounded-[24px] shadow p-8">
                  <div className="space-y-6">
                    {[
                      { labelKey: "settings.notifications.email", key: "emailNotifications", descKey: "settings.notifications.email_desc" },
                      { labelKey: "settings.notifications.push", key: "pushNotifications", descKey: "settings.notifications.push_desc" },
                      { labelKey: "settings.notifications.course_updates", key: "courseUpdates", descKey: "settings.notifications.course_updates_desc" },
                      { labelKey: "settings.notifications.discussion_replies", key: "discussionReplies", descKey: "settings.notifications.discussion_replies_desc" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <h3 className="text-[16px] font-semibold text-main">{t(item.labelKey)}</h3>
                          <p className="text-[14px] text-muted">{t(item.descKey)}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsData.notifications[item.key]}
                            onChange={(e) =>
                              setSettingsData((prev) => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  [item.key]: e.target.checked,
                                },
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        if (originalNotifications)
                          setSettingsData((prev) => ({ ...prev, notifications: originalNotifications }));
                      }}
                      className="h-[50px] px-6 rounded-xl border border-border bg-card text-main hover:bg-canvas-alt"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const token = localStorage.getItem("token");

                          await axios.put(
                            "/api/users/settings",
                            {
                              notifications: { ...settingsData.notifications },
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );


                          toast.success("Notification settings updated successfully!");
                          setOriginalNotifications({ ...settingsData.notifications });
                        } catch (error) {
                          console.error("Error updating settings:", error);
                          toast.error("Failed to update settings. Please try again.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="h-[50px] px-6 rounded-xl bg-gradient-to-r from-primary to-primary text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? t("common.saving") : t("common.save_changes")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSetting === "password_security" && (
              <div className="max-w-[896px]">
                <div className="mb-8">
                  <h1 className="text-[30px] font-bold text-main font-[Inter] mb-2">
                    {t("settings.security.title")}
                  </h1>
                  <p className="text-[16px] text-muted font-[Inter]">
                    {t("settings.security.subtitle")}
                  </p>
                </div>
                <div className="bg-card rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[16px] font-semibold text-main font-[Inter]">
                          {t("settings.security.two_factor")}
                        </h3>
                        <p className="text-[14px] text-muted font-[Inter]">
                          {t("settings.security.two_factor_desc")}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsData.security.twoFactorAuth}
                          onChange={(e) =>
                            setSettingsData((prev) => ({
                              ...prev,
                              security: {
                                ...prev.security,
                                twoFactorAuth: e.target.checked,
                              },
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[16px] font-semibold text-main font-[Inter]">
                          {t("settings.security.login_alerts")}
                        </h3>
                        <p className="text-[14px] text-muted font-[Inter]">
                          {t("settings.security.login_alerts_desc")}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsData.security.loginAlerts}
                          onChange={(e) =>
                            setSettingsData((prev) => ({
                              ...prev,
                              security: {
                                ...prev.security,
                                loginAlerts: e.target.checked,
                              },
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="text-[18px] font-semibold text-main font-[Inter]  mb-4">
                        {t("settings.security.change_password")}
                      </h3>
                      <div className="space-y-5">
                        <div className="relative">
                          <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">
                            {t("settings.security.current_password")}
                          </label>
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            className="w-full h-[50px] px-4 pr-12 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-main"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">
                            {t("settings.security.new_password")}
                          </label>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            className="w-full h-[50px] px-4 pr-12 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowNewPassword(!showNewPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-main"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>

                        </div>

                        <div className="relative">
                          <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">
                            {t("settings.security.confirm_password")}
                          </label>
                          
<input
  type="password"
  autoComplete="new-password"
  value={passwordData.confirmPassword}
  onChange={(e) =>
    setPasswordData((prev) => ({
      ...prev,
      confirmPassword: e.target.value,
    }))
  }
  className="w-full h-[50px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main"
/>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6">
                    <button
                      type="button"
                      className="h-[50px] px-6 rounded-xl border border-border bg-card text-main text-[16px] font-medium font-[Inter] hover:bg-canvas-alt"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={async () => {

  if (!passwordData.currentPassword || !passwordData.newPassword) {
    toast.error("Please fill all fields!");
    return;
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    toast.error("New passwords do not match!");
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    await axios.put(
      "/api/users/change-password",
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    toast.success("Password updated successfully!");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

  } catch (error) {
    console.error("Password update error:", error);
    toast.error(error.response?.data?.message || "Failed to update password");
  } finally {
    setLoading(false);
  }
}}
                      disabled={loading}
                      className="h-[50px] px-6 rounded-xl bg-gradient-to-r from-primary to-primary text-white text-[16px] font-medium font-[Inter] hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? t("common.saving") : t("common.save_changes")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSetting === "appearance" && (
              <div className="max-w-[896px]">
                <div className="mb-8">
                  <h1 className="text-[30px] font-bold text-main font-[Inter] mb-2">
                    {t("settings.appearance.title")}
                  </h1>
                  <p className="text-[16px] text-muted font-[Inter]">
                    {t("settings.appearance.subtitle")}
                  </p>
                </div>
                <div className="bg-card rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[16px] font-semibold text-main font-[Inter] mb-3">
                        {t("settings.appearance.theme")}
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: "light", labelKey: "settings.appearance.light", icon: "☀️" },
                          { value: "dark", labelKey: "settings.appearance.dark", icon: "🌙" },
                          { value: "auto", labelKey: "settings.appearance.auto", icon: "⚙️" },
                        ].map((themeOption) => (
                          <button
                            key={themeOption.value}
                            onClick={() => setTheme(themeOption.value)}
                            className={`p-4 rounded-xl border-2 transition-colors ${theme === theme.value
                              ? "border-primary bg-teal-50 dark:bg-teal-900/20 text-main"
                              : "border-border hover:border-primary text-muted hover:text-main"
                              }`}
                          >
                            <div className="text-2xl mb-2">{themeOption.icon}</div>
                            <div className="text-[14px] font-medium font-[Inter]">
                              {t(themeOption.labelKey)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* <div>
                      <h3 className="text-[16px] font-semibold text-main font-[Inter] mb-3">
                        {t("settings.appearance.language")}
                      </h3>
                      <select
                        value={settingsData.appearance.language}
                        onChange={(e) =>
                          setSettingsData((prev) => ({
                            ...prev,
                            appearance: {
                              ...prev.appearance,
                              language: e.target.value,
                            },
                          }))
                        }
                        className="w-full h-[50px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="zh">Chinese (Mandarin)</option>
                        <option value="hi">Hindi</option>
                        <option value="ar">Arabic</option>
                        <option value="pt">Portuguese</option>
                        <option value="fr">French</option>
                        <option value="ru">Russian</option>
                        <option value="ja">Japanese</option>
                        <option value="de">German</option>
                      </select>
                    </div> */}
                  </div>

                  {/* <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6">
                    <button
                      type="button"
                      className="h-[50px] px-6 rounded-xl border border-border bg-card text-main text-[16px] font-medium font-[Inter] hover:bg-canvas-alt"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const token = localStorage.getItem("token");
                          await axios.put(
                            "/api/users/settings",
                            { appearance: settingsData.appearance },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          i18n.changeLanguage(settingsData.appearance.language);
                          toast.success("Appearance settings updated successfully!");
                        } catch (error) {
                          console.error("Error updating settings:", error);
                          toast.error("Failed to update settings. Please try again.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="h-[50px] px-6 rounded-xl bg-gradient-to-r from-primary to-primary text-white text-[16px] font-medium font-[Inter] hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? t("common.saving") : t("common.save_changes")}
                    </button>
                  </div> */}
                </div>
              </div>
            )}

            {activeSetting === "language" && (
              <div className="max-w-[896px]">
                <div className="mb-8">
                  <h1 className="text-[30px] font-bold text-main font-[Inter] mb-2">
                    {t("settings.language.title")}
                  </h1>
                  <p className="text-[16px] text-muted font-[Inter]">
                    {t("settings.language.subtitle")}
                  </p>
                </div>
                <div className="bg-card rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[16px] font-semibold text-main font-[Inter] mb-3">
                        {t("settings.language.interface_language")}
                      </h3>
                      <select
                        value={settingsData.appearance.language}
                        onChange={(e) =>
                          setSettingsData((prev) => ({
                            ...prev,
                            appearance: {
                              ...prev.appearance,
                              language: e.target.value,
                            },
                          }))
                        }
                        className="w-full h-[50px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="zh">Chinese (Mandarin)</option>
                        <option value="hi">Hindi</option>
                        <option value="ar">Arabic</option>
                        <option value="pt">Portuguese</option>
                        <option value="fr">French</option>
                        <option value="ru">Russian</option>
                        <option value="ja">Japanese</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6">
                    <button
                      type="button"
                      className="h-[50px] px-6 rounded-xl border border-border bg-card text-main text-[16px] font-medium font-[Inter] hover:bg-canvas-alt"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const token = localStorage.getItem("token");
                          await axios.put(
                            "/api/users/settings",
                            {
                              appearance: {
                                language: settingsData.appearance.language,
                              },
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          i18n.changeLanguage(settingsData.appearance.language);
                          toast.success("Language settings updated successfully!");
                        } catch (error) {
                          console.error("Error updating settings:", error);
                          toast.error("Failed to update settings. Please try again.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="h-[50px] px-6 rounded-xl bg-gradient-to-r from-[#00BEA5] to-[#00BEA5] text-white text-[16px] font-medium font-[Inter] hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? t("common.saving") : t("common.save_changes")}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* //=== Profile Popup======// */}
            {profilepopup && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-55 animate-fadeIn">

                <div className="relative bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 
                   rounded-3xl p-10 w-[420px] text-center shadow-2xl border border-slate-200 
                   dark:border-slate-700 transform transition-all duration-300 scale-100 animate-popup">

                  {/* Animated Success Circle */}
                  <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center 
                     rounded-full bg-gradient-to-r from-emerald-400 to-green-500 
                     shadow-lg animate-bounce">
                    <span className="text-4xl text-white">✓</span>
                  </div>

                  {/* Heading */}
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 
                    bg-clip-text text-transparent mb-3">
                    Profile Updated Successfully!
                  </h2>

                  {/* Action Button */}
                  <button
                    onClick={() => setProfilePopup(false)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 
                  text-white rounded-2xl font-semibold 
                  shadow-lg hover:scale-105 hover:shadow-emerald-400/40 
                  transition-all duration-300"
                  >
                    Ok
                  </button>

                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
