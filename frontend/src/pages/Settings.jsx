// frontend/src/pages/Settings.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User, Bell, Shield, Palette, Globe, Camera,
  Eye, EyeOff, UserX, Sparkles, ArrowLeft, X, ChevronRight,
} from "lucide-react";
import axios from "axios";
import Preferences from "../components/Preferences";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/index.js";

const NAV_KEYS = [
  { icon: User,     key: "profile",           labelKey: "settings.nav.profile" },
  { icon: Bell,     key: "notifications",      labelKey: "settings.nav.notifications" },
  { icon: Shield,   key: "password_security",  labelKey: "settings.nav.password_security" },
  { icon: Sparkles, key: "preferences",        labelKey: "preferences.nav_title" },
  { icon: Palette,  key: "appearance",         labelKey: "settings.nav.appearance" },
  { icon: Globe,    key: "language",           labelKey: "settings.nav.language" },
  { icon: UserX,    key: "delete_account",     labelKey: "settings.nav.delete_account" },
];

/* ───────────────────────────────────────────────
   Mobile bottom-sheet drawer (settings menu list)
─────────────────────────────────────────────── */
function MobileSettingsDrawer({ open, onClose, onSelect, t }) {
  const startY = useRef(null);
  const currentY = useRef(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handleTouchStart = (e) => { startY.current = e.touches[0].clientY; };
  const handleTouchMove  = (e) => {
    if (startY.current === null) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) { currentY.current = diff; setDragOffset(diff); }
  };
  const handleTouchEnd = () => {
    if (currentY.current > 120) onClose();
    setDragOffset(0);
    startY.current = null;
    currentY.current = null;
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[200] transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      />

      {/* Sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="fixed bottom-0 left-0 right-0 z-[210] bg-card rounded-t-[28px] shadow-[0_-8px_48px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out"
        style={{ transform: open ? `translateY(${dragOffset}px)` : "translateY(100%)", maxHeight: "88vh", willChange: "transform" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-border opacity-60" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-[18px] font-bold text-main font-[Inter]">Settings</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas-alt hover:bg-border transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* List */}
        <nav className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "calc(88vh - 100px)" }}>
          {NAV_KEYS.map((item) => {
            const Icon = item.icon;
            const isDanger = item.key === "delete_account";
            return (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all active:scale-[0.98] mb-1 ${isDanger ? "hover:bg-red-50 dark:hover:bg-red-900/20" : "hover:bg-teal-50 dark:hover:bg-teal-900/15"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDanger ? "bg-red-50 dark:bg-red-900/20" : "bg-teal-50 dark:bg-teal-900/20"}`}>
                  <Icon className={`w-5 h-5 ${isDanger ? "text-red-500" : "text-[#00BEA5]"}`} />
                </div>
                <span className={`flex-1 font-semibold text-[15px] font-[Inter] ${isDanger ? "text-red-500" : "text-main"}`}>
                  {t(item.labelKey)}
                </span>
                <ChevronRight className="w-4 h-4 text-muted opacity-40" />
              </button>
            );
          })}
          <div className="h-6" />
        </nav>
      </div>
    </>
  );
}

/* ───────────────────────────────────────────────
   Mobile full-screen modal (individual setting)
─────────────────────────────────────────────── */
function MobileModal({ open, onBack, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[220] flex flex-col bg-canvas transition-all duration-300 ease-out ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 border-b border-border bg-card shadow-sm flex-shrink-0"
        style={{ paddingTop: "max(14px, env(safe-area-inset-top))", paddingBottom: "14px" }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-canvas-alt transition-colors active:scale-90">
          <ArrowLeft className="w-5 h-5 text-main" />
        </button>
        <h2 className="text-[17px] font-bold text-main font-[Inter] flex-1 truncate">{title}</h2>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-canvas-alt transition-colors active:scale-90">
          <X className="w-5 h-5 text-muted" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-5" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Main Settings Component
─────────────────────────────────────────────── */
export default function Settings() {
  const { t } = useTranslation();
  const [originalNotifications, setOriginalNotifications] = useState(null);
  const { theme, setTheme } = useTheme();
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [activeSetting, setActiveSetting] = useState("profile");
  const { user, updateUser, fetchUserProfile } = useAuth();

  // Mobile state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileModalKey, setMobileModalKey] = useState(null);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", bio: "" });
  const [settingsData, setSettingsData] = useState({
    notifications: { emailNotifications: true, pushNotifications: true, courseUpdates: true, discussionReplies: true },
    security: { twoFactorAuth: false, loginAlerts: true },
    appearance: { theme: "light", language: "en" },
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [profilepopup, setProfilePopup] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showDeletePopup, setshowDeletePopup] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  /* handlers */
  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      await axios.delete("/api/users/delete-account", { headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) { console.error("Delete error", error); }
    finally { setDeleting(false); }
  };

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("firstName", formData.firstName);
      form.append("lastName", formData.lastName);
      form.append("email", formData.email);
      form.append("bio", formData.bio);
      if (avatarFile) form.append("avatar", avatarFile);
      const response = await axios.put("/api/users/profile", form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      updateUser(response.data);
      setTimeout(async () => { await fetchUserProfile(); }, 500);
      setAvatarFile(null);
      toast.success("Profile updated successfully!");
      setProfilePopup(true);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error);
      toast.error("Failed to update profile.");
    } finally { setLoading(false); }
  };

  const handleContactSubmit = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) { toast.error("Please enter subject and message"); return; }
    if (!user?.email) { toast.error("User email not found. Please login again."); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/contactus",
        { email: user.email, subject: contactForm.subject.trim(), message: contactForm.message.trim() },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (response.data.success) { toast.success(response.data.message); setContactForm({ subject: "", message: "" }); }
    } catch (error) { toast.error(error.response?.data?.message || "Failed to send message"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      bio: user.bio || "Passionate about AI and machine learning. Currently pursuing advanced courses in data science.",
    });
  }, [user]);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/users/settings", { headers: { Authorization: `Bearer ${token}` } });
        const notifications = data?.notifications
          ? JSON.parse(JSON.stringify(data.notifications))
          : null;
        setSettingsData(data);
        setOriginalNotifications(notifications);
        if (data?.appearance?.language) i18n.changeLanguage(data.appearance.language);
      } catch (err) { console.error("Failed to fetch notification settings:", err); }
    };
    fetchNotificationSettings();
  }, [user]);

  /* mobile navigation helpers */
  const handleMobileSelect = (key) => {
    if (key === "delete_account") {
      setMobileDrawerOpen(false);
      setTimeout(() => setshowDeletePopup(true), 300);
      return;
    }
    setMobileModalKey(key);
    setMobileDrawerOpen(false);
    setTimeout(() => setMobileModalOpen(true), 220);
  };

  const closeMobileModal = () => {
    setMobileModalOpen(false);
    setTimeout(() => setMobileModalKey(null), 300);
  };

  const backToDrawer = () => {
    setMobileModalOpen(false);
    setTimeout(() => { setMobileModalKey(null); setMobileDrawerOpen(true); }, 260);
  };

  const activeMobileNav = NAV_KEYS.find((n) => n.key === mobileModalKey);

  /* ── shared panel renderers ── */
  const ProfilePanel = () => (
    <div className="max-w-3xl">
      <div className="hidden lg:block mb-8">
        <h1 className="text-xl sm:text-2xl md:text-[30px] font-bold text-main font-[Inter] mb-2">{t("settings.profile.title")}</h1>
        <p className="text-sm sm:text-[16px] text-muted font-[Inter]">{t("settings.profile.subtitle")}</p>
      </div>
      <div className="bg-card rounded-2xl sm:rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-4 sm:p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar_url ? user.avatar_url : `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(`${formData.firstName} ${formData.lastName}`)}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(`${formData.firstName} ${formData.lastName}`)}`;
                }}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-[rgba(255,135,89,0.65)] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)]"
              />
              <label className="absolute bottom-2 right-2 w-10 h-10 bg-[#475569] rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)]">
                <Camera className="w-[14px] h-[14px] text-white" />
                <input type="file" accept="image/*" hidden onChange={(e) => setAvatarFile(e.target.files[0])} />
              </label>
            </div>
            <h2 className="text-[20px] font-semibold text-main font-[Inter] mb-1">{formData.firstName} {formData.lastName}</h2>
            <p className="text-[16px] text-muted font-[Inter]">{t("common.premium_member")}</p>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">{t("settings.profile.first_name")}</label>
                <input type="text" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className="w-full h-[42px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main" />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">{t("settings.profile.last_name")}</label>
                <input type="text" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="w-full h-[42px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main" />
              </div>
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">{t("settings.profile.email")}</label>
              <input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full h-[42px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main" />
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">{t("settings.profile.bio")}</label>
              <textarea value={formData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} className="w-full min-h-[80px] px-4 py-3 rounded-xl border border-border text-[16px] font-[Inter] resize-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main" />
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border">
          <button type="button" className="h-[42px] px-6 rounded-xl border border-border bg-card text-main text-[16px] font-medium font-[Inter] hover:bg-canvas-alt">{t("common.cancel")}</button>
          <button onClick={handleSaveChanges} disabled={loading} className="h-[42px] px-6 rounded-xl bg-[#00BEA5] text-white text-[16px] font-medium font-[Inter] hover:opacity-90 disabled:opacity-50">
            {loading ? t("common.saving") : t("common.save_changes")}
          </button>
        </div>
      </div>
    </div>
  );

  const NotificationsPanel = () => (
    <div className="w-full">
      <div className="hidden lg:block mb-8">
        <h1 className="text-xl sm:text-2xl md:text-[30px] font-bold text-main font-[Inter] mb-2">{t("settings.notifications.title")}</h1>
        <p className="text-sm sm:text-[16px] text-muted font-[Inter]">{t("settings.notifications.subtitle")}</p>
      </div>
      <div className="bg-card rounded-2xl sm:rounded-[24px] shadow p-4 sm:p-6 md:p-8">
        <div className="space-y-6">
          {[
            { labelKey: "settings.notifications.email", key: "emailNotifications", descKey: "settings.notifications.email_desc" },
            { labelKey: "settings.notifications.push", key: "pushNotifications", descKey: "settings.notifications.push_desc" },
            { labelKey: "settings.notifications.course_updates", key: "courseUpdates", descKey: "settings.notifications.course_updates_desc" },
            { labelKey: "settings.notifications.discussion_replies", key: "discussionReplies", descKey: "settings.notifications.discussion_replies_desc" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-[16px] font-semibold text-main">{t(item.labelKey)}</h3>
                <p className="text-xs sm:text-[14px] text-muted">{t(item.descKey)}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settingsData.notifications[item.key]}
                  onChange={(e) => setSettingsData((prev) => ({ ...prev, notifications: { ...prev.notifications, [item.key]: e.target.checked } }))}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          ))}
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-border mt-6">
          <button type="button" onClick={() => { if (originalNotifications) setSettingsData((prev) => ({ ...prev, notifications: originalNotifications })); }} className="h-[50px] px-6 rounded-xl border border-border bg-card text-main hover:bg-canvas-alt">{t("common.cancel")}</button>
          <button onClick={async () => {
            setLoading(true);
            try {
              const token = localStorage.getItem("token");
              await axios.put("/api/users/settings", { notifications: { ...settingsData.notifications } }, { headers: { Authorization: `Bearer ${token}` } });
              toast.success("Notification settings updated successfully!");
              setOriginalNotifications({ ...settingsData.notifications });
            } catch { toast.error("Failed to update settings. Please try again."); }
            finally { setLoading(false); }
          }} disabled={loading} className="h-[50px] px-6 rounded-xl bg-[#00BEA5] text-white hover:opacity-90 disabled:opacity-50">
            {loading ? t("common.saving") : t("common.save_changes")}
          </button>
        </div>
      </div>
    </div>
  );

  const PasswordSecurityPanel = () => (
    <div className="w-full">
      <div className="hidden lg:block mb-8">
        <h1 className="text-xl sm:text-2xl md:text-[30px] font-bold text-main font-[Inter] mb-2">{t("settings.security.title")}</h1>
        <p className="text-sm sm:text-[16px] text-muted font-[Inter]">{t("settings.security.subtitle")}</p>
      </div>
      <div className="bg-card rounded-2xl sm:rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-4 sm:p-6 md:p-8">
        <div className="space-y-6">
          {[
            { key: "twoFactorAuth", labelKey: "settings.security.two_factor", descKey: "settings.security.two_factor_desc" },
            { key: "loginAlerts", labelKey: "settings.security.login_alerts", descKey: "settings.security.login_alerts_desc" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-[16px] font-semibold text-main font-[Inter]">{t(item.labelKey)}</h3>
                <p className="text-xs sm:text-[14px] text-muted font-[Inter]">{t(item.descKey)}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settingsData.security[item.key]}
                  onChange={(e) => setSettingsData((prev) => ({ ...prev, security: { ...prev.security, [item.key]: e.target.checked } }))}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
          <div className="border-t border-border pt-6">
            <h3 className="text-[18px] font-semibold text-main font-[Inter] mb-4">{t("settings.security.change_password")}</h3>
            <div className="space-y-5">
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">{t("settings.security.current_password")}</label>
                <input type={showCurrentPassword ? "text" : "password"} value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full h-[50px] px-4 pr-12 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main" />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-main">
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">{t("settings.security.new_password")}</label>
                <input type={showNewPassword ? "text" : "password"} value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full h-[50px] px-4 pr-12 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-main">
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-card px-2 text-[14px] text-muted font-medium font-[Inter]">{t("settings.security.confirm_password")}</label>
                <input type="password" autoComplete="new-password" value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full h-[50px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 border-t border-border mt-6">
          <button type="button" className="h-[50px] px-6 rounded-xl border border-border bg-card text-main text-[16px] font-medium font-[Inter] hover:bg-canvas-alt">{t("common.cancel")}</button>
          <button onClick={async () => {
            if (!passwordData.currentPassword || !passwordData.newPassword) { toast.error("Please fill all fields!"); return; }
            if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error("New passwords do not match!"); return; }
            setLoading(true);
            try {
              const token = localStorage.getItem("token");
              await axios.put("/api/users/change-password", { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }, { headers: { Authorization: `Bearer ${token}` } });
              toast.success("Password updated successfully!");
              setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } catch (error) { toast.error(error.response?.data?.message || "Failed to update password"); }
            finally { setLoading(false); }
          }} disabled={loading} className="h-[50px] px-6 rounded-xl bg-[#00BEA5] text-white text-[16px] font-medium font-[Inter] hover:opacity-90 disabled:opacity-50">
            {loading ? t("common.saving") : t("common.save_changes")}
          </button>
        </div>
      </div>
    </div>
  );

  const AppearancePanel = () => (
    <div className="w-full">
      <div className="hidden lg:block mb-8">
        <h1 className="text-xl sm:text-2xl md:text-[30px] font-bold text-main font-[Inter] mb-2">{t("settings.appearance.title")}</h1>
        <p className="text-sm sm:text-[16px] text-muted font-[Inter]">{t("settings.appearance.subtitle")}</p>
      </div>
      <div className="bg-card rounded-2xl sm:rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-4 sm:p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-[16px] font-semibold text-main font-[Inter] mb-3">{t("settings.appearance.theme")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { value: "light", labelKey: "settings.appearance.light", icon: "☀️" },
                { value: "dark", labelKey: "settings.appearance.dark", icon: "🌙" },
                { value: "auto", labelKey: "settings.appearance.auto", icon: "⚙️" },
              ].map((themeOption) => (
                <button key={themeOption.value} onClick={() => setTheme(themeOption.value)}
                  className={`p-4 rounded-xl border-2 transition-colors ${theme === themeOption.value ? "border-primary bg-teal-50 dark:bg-teal-900/20 text-main" : "border-border hover:border-primary text-muted hover:text-main"}`}>
                  <div className="text-2xl mb-2">{themeOption.icon}</div>
                  <div className="text-[14px] font-medium font-[Inter]">{t(themeOption.labelKey)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LanguagePanel = () => (
    <div className="w-full">
      <div className="hidden lg:block mb-8">
        <h1 className="text-xl sm:text-2xl md:text-[30px] font-bold text-main font-[Inter] mb-2">{t("settings.language.title")}</h1>
        <p className="text-sm sm:text-[16px] text-muted font-[Inter]">{t("settings.language.subtitle")}</p>
      </div>
      <div className="bg-card rounded-2xl sm:rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-4 sm:p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-[16px] font-semibold text-main font-[Inter] mb-3">{t("settings.language.interface_language")}</h3>
            <select value={settingsData.appearance.language}
              onChange={(e) => setSettingsData((prev) => ({ ...prev, appearance: { ...prev.appearance, language: e.target.value } }))}
              className="w-full h-[50px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main">
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
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-border mt-6">
          <button type="button" className="h-[50px] px-6 rounded-xl border border-border bg-card text-main text-[16px] font-medium font-[Inter] hover:bg-canvas-alt">{t("common.cancel")}</button>
          <button onClick={async () => {
            setLoading(true);
            try {
              const token = localStorage.getItem("token");
              await axios.put("/api/users/settings", { appearance: { language: settingsData.appearance.language } }, { headers: { Authorization: `Bearer ${token}` } });
              i18n.changeLanguage(settingsData.appearance.language);
              toast.success("Language settings updated successfully!");
            } catch { toast.error("Failed to update settings. Please try again."); }
            finally { setLoading(false); }
          }} disabled={loading} className="h-[50px] px-6 rounded-xl bg-[#00BEA5] text-white text-[16px] font-medium font-[Inter] hover:opacity-90 disabled:opacity-50">
            {loading ? t("common.saving") : t("common.save_changes")}
          </button>
        </div>
      </div>
    </div>
  );

  const ContactPanel = () => (
    <div className="max-w-[896px]">
      <div className="hidden lg:block mb-8">
        <h1 className="text-[30px] font-bold text-main font-[Inter] mb-2">{t("settings.contactus.title")}</h1>
        <p className="text-[16px] text-muted font-[Inter]">{t("settings.contactus.subtitle")}</p>
      </div>
      <div className="bg-card rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-6 sm:p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2 font-[Inter]">{t("settings.contactus.subject")}</label>
            <input type="text" value={contactForm.subject} onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))} placeholder="Enter subject..." className="w-full h-[50px] px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary bg-input text-main" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2 font-[Inter]">{t("settings.contactus.message")}</label>
            <textarea value={contactForm.message} onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))} rows={6} placeholder="Describe your issue or question..." className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary bg-input text-main resize-vertical" />
          </div>
          <div className="flex justify-end">
            <button onClick={handleContactSubmit} disabled={loading} className="h-[50px] px-8 rounded-xl bg-[#00BEA5] text-white font-medium hover:opacity-90 disabled:opacity-50">
              {loading ? t("common.loading") + "..." : "Send Message"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPanel = (key) => {
    switch (key) {
      case "profile":           return <ProfilePanel />;
      case "notifications":     return <NotificationsPanel />;
      case "password_security": return <PasswordSecurityPanel />;
      case "preferences":       return <div className="w-full"><div className="hidden lg:block mb-8"><h1 className="text-xl sm:text-2xl md:text-[30px] font-bold text-main font-[Inter] mb-2">{t("preferences.nav_title")}</h1><p className="text-sm sm:text-[16px] text-muted font-[Inter]">{t("preferences.settings_modal_subtitle")}</p></div><Preferences mode="settings" onSuccess={() => toast.success(t("preferences.save_success"))} /></div>;
      case "appearance":        return <AppearancePanel />;
      case "language":          return <LanguagePanel />;
      case "contactus":         return <ContactPanel />;
      default:                  return null;
    }
  };

  if (pageLoading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted">Loading settings...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* ── Mobile top bar with "Open Settings" button ── */}
      <div className="lg:hidden flex items-center justify-between px-4 pt-5 pb-2">
        <h1 className="text-[22px] font-bold text-main font-[Inter]">Settings</h1>
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00BEA5] text-white text-sm font-semibold shadow-lg active:scale-95 transition-transform"
        >
          <span>⚙️</span>
          <span>Open Settings</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0 bg-card rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] m-6 mr-0 self-start">
          <nav className="p-6">
            <div className="space-y-2">
              {NAV_KEYS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => { item.key === "delete_account" ? setshowDeletePopup(true) : setActiveSetting(item.key); }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-colors ${activeSetting === item.key ? "bg-teal-50 dark:bg-teal-900/20 text-main" : "text-muted hover:bg-canvas-alt"}`}
                  >
                    <Icon className="w-4 h-4 text-[#00BEA5]" />
                    <span className="font-medium text-[16px] font-[Inter]">{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* ── Desktop main content ── */}
        <main className="hidden lg:block flex-1 p-3 sm:p-4 md:p-6 lg:p-8 lg:mt-5 min-w-0">
          {renderPanel(activeSetting)}
        </main>

        {/* ── Mobile placeholder card ── */}
        <div className="lg:hidden flex-1 px-4 pb-8 mt-4">
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border/40 text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <p className="font-semibold text-main mb-1">Manage Your Settings</p>
            <p className="text-xs text-muted">Tap "Open Settings" above to browse and edit your preferences.</p>
          </div>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <MobileSettingsDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onSelect={handleMobileSelect}
        t={t}
      />

      {/* ── MOBILE MODAL ── */}
      <MobileModal
        open={mobileModalOpen}
        onBack={backToDrawer}
        onClose={closeMobileModal}
        title={activeMobileNav ? t(activeMobileNav.labelKey) : ""}
      >
        {mobileModalKey && renderPanel(mobileModalKey)}
      </MobileModal>

      {/* ── DELETE ACCOUNT POPUP ── */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[230] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-[520px] text-center shadow-xl">
            <div className="mb-4 text-red-500 text-5xl">⚠</div>
            <h2 className="text-xl font-bold mb-2 text-main">Delete Account?</h2>
            <p className="text-muted mb-6 text-sm">This action will permanently delete your profile, courses and progress. This cannot be undone.</p>
            <p className="text-sm text-muted mb-6">Please type <span className="font-bold text-red-500">DELETE</span> to confirm.</p>
            <input type="text" placeholder="Type DELETE here..." value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              className="w-full h-[50px] px-4 rounded-xl border border-border text-[16px] font-[Inter] focus:ring-2 focus:ring-primary focus:border-primary bg-input text-main mb-6" />
            <div className="flex justify-center gap-4">
              <button onClick={() => { setConfirmText(""); setshowDeletePopup(false); }} className="px-6 py-2 border rounded-lg text-main hover:bg-canvas-alt">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={confirmText !== "DELETE" || deleting}
                className="h-[50px] px-6 rounded-xl text-white bg-red-500 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE UPDATED POPUP ── */}
      {profilepopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[240] animate-fadeIn p-4">
          <div className="relative bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 sm:p-10 w-[90vw] max-w-[420px] text-center shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg animate-bounce">
              <span className="text-4xl text-white">✓</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-3">Profile Updated Successfully!</h2>
            <button onClick={() => setProfilePopup(false)} className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold shadow-lg hover:scale-105 transition-all duration-300">Ok</button>
          </div>
        </div>
      )}
    </>
  );
}