import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Search, Bell, Menu, X, User, Settings, LogOut, 
  ShieldCheck, Flame, BookOpen, Trophy, Calendar, Clock, 
  ArrowRight, Activity, Award, Star, CheckCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle";
import { useSidebar } from "../context/SidebarContext";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout, updateProfile } = useAuth(); // Assuming updateProfile exists in your context
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const statsRef = useRef(null);

  const displayName = user?.name || user?.email?.split('@')[0] || "User";

  // --- DYNAMIC COURSE LOGIC ---
  const activeCourse = useMemo(() => {
    if (!user?.enrolledCourses || user.enrolledCourses.length === 0) return null;
    return user.enrolledCourses.find(c => c.progress > 0 && c.progress < 100) || user.enrolledCourses[0];
  }, [user]);

  // --- STRICT BADGE LOGIC ---
  const earnedBadgesList = useMemo(() => {
    if (!user?.enrolledCourses) return [];
    return user.enrolledCourses.filter(course => course.progress === 100);
  }, [user]);

  const badgeCount = earnedBadgesList.length;

  // --- 24-HOUR STREAK LOGIC (Calculation & Automatic Update) ---
  const streakData = useMemo(() => {
    if (!user?.lastLoginDate) return { count: 0, label: "Start your streak today!" };
    const now = new Date();
    const lastLogin = new Date(user.lastLoginDate);
    const diffInMs = now - lastLogin;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    let currentStreak = user?.streakCount || 0;

    if (diffInHours >= 24 && diffInHours <= 48) {
       return { count: currentStreak, label: `${currentStreak} days in a row! 🔥` };
    } else if (diffInHours > 48) {
       return { count: 0, label: "Streak lost! Start again." };
    }
    return { 
      count: currentStreak, 
      label: currentStreak > 0 ? `${currentStreak} days in a row! 🔥` : "Start your streak today!" 
    };
  }, [user]);

  // NEW: Logic to actually increase/reset the streak in the database/state
  useEffect(() => {
    if (!user || !user.lastLoginDate) return;

    const now = new Date();
    const lastLogin = new Date(user.lastLoginDate);
    const diffInMs = now - lastLogin;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    // If more than 24 hours but less than 48 hours: INCREMENT
    if (diffInHours >= 24 && diffInHours <= 48) {
      updateProfile({
        streakCount: (user.streakCount || 0) + 1,
        lastLoginDate: now.toISOString()
      });
    } 
    // If more than 48 hours: RESET to 1 (starting a new streak)
    else if (diffInHours > 48) {
      updateProfile({
        streakCount: 1,
        lastLoginDate: now.toISOString()
      });
    }
  }, [user, updateProfile]);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setDropdownOpen(false);
    navigate("/login", { state: { logoutSuccess: true } });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (statsRef.current && !statsRef.current.contains(event.target)) setStatsVisible(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 fixed top-0 left-0 right-0 z-[100]">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 rounded-xl bg-card border border-border hover:bg-canvas-alt transition-all cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5 text-muted cursor-pointer" /> : <Menu className="w-5 h-5 text-muted cursor-pointer" />}
            </button>
            <div className="flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/dashboard")}>
              <img src="/upto.png" alt="Logo" className="h-10 w-auto cursor-pointer" />
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal-500 transition-colors w-4 h-4" />
              <input type="text" placeholder={t("header.search_placeholder")} className="w-full pl-12 pr-4 py-2.5 bg-canvas border border-border rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" />
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <div className="cursor-pointer"><ThemeToggle /></div>

            <div className="relative" ref={statsRef}>
              <button onClick={() => setStatsVisible(!statsVisible)} className="relative p-2.5 hover:bg-canvas-alt rounded-xl transition-all group cursor-pointer border-none bg-transparent">
                <Activity className="w-5 h-5 text-muted group-hover:text-teal-500 transition-colors cursor-pointer" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-card cursor-pointer" />
              </button>

              {statsVisible && (
                <div className="absolute right-0 mt-4 w-80 z-[120] animate-in fade-in slide-in-from-top-2 duration-200 cursor-pointer">
                  <div className="bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl cursor-pointer">
                    <div className="p-4 border-b border-border/50 bg-muted/5 flex justify-between items-center cursor-pointer">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-main cursor-pointer">Stats & Activity</h5>
                      <span className="text-[9px] bg-teal-500/10 text-teal-600 px-2 py-0.5 rounded-full font-bold cursor-pointer">Live</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto custom-scrollbar cursor-pointer">
                      <div className="p-4 hover:bg-teal-500/5 transition-colors cursor-pointer border-b border-border/10">
                        <p className="text-xs font-bold text-main cursor-pointer">Welcome back, {displayName}! 👋</p>
                      </div>

                      <div onClick={() => navigate(activeCourse ? `/course/${activeCourse.id}` : "/courses")} className="p-4 hover:bg-blue-500/5 transition-colors cursor-pointer border-b border-border/10 flex items-center justify-between">
                        <div className="pr-4 cursor-pointer">
                          <p className="text-xs font-bold text-main cursor-pointer">{activeCourse?.progress === 100 ? "Course Completed 🎉" : "Continue Learning"}</p>
                          <p className="text-[10px] text-muted mt-1 cursor-pointer">{activeCourse ? `Resume ${activeCourse.title}` : "Start learning"}</p>
                        </div>
                        <BookOpen className="w-4 h-4 text-blue-500 cursor-pointer" />
                      </div>

                      <div onClick={() => { setShowBadgeModal(true); setStatsVisible(false); }} className="p-4 hover:bg-yellow-500/5 transition-colors cursor-pointer border-b border-border/10 flex items-center justify-between">
                        <div className="cursor-pointer">
                          <p className="text-xs font-bold text-main cursor-pointer">Badges Earned</p>
                          <p className="text-[10px] text-muted mt-1 cursor-pointer">
                            {badgeCount > 0 ? `You've earned ${badgeCount} course badges!` : "Finish a course to earn a badge!"}
                          </p>
                        </div>
                        <Award className={`w-4 h-4 ${badgeCount > 0 ? 'text-yellow-600' : 'text-muted'} cursor-pointer`} />
                      </div>

                      <div onClick={() => navigate("/analytics")} className="p-4 hover:bg-orange-500/5 transition-colors cursor-pointer border-b border-border/10 flex items-center justify-between">
                        <div className="cursor-pointer">
                          <p className="text-xs font-bold text-main cursor-pointer">Daily Streak</p>
                          <p className="text-[10px] text-muted mt-1 cursor-pointer">{streakData.label}</p>
                        </div>
                        <Flame className={`w-4 h-4 ${streakData.count > 0 ? 'text-orange-500' : 'text-muted'} cursor-pointer`} />
                      </div>
                    </div>

                    <div className="p-3 bg-muted/5 border-t border-border/50 cursor-pointer">
                      <button onClick={() => { navigate("/analytics"); setStatsVisible(false); }} className="w-full py-2.5 rounded-xl bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all cursor-pointer flex items-center justify-center group">
                        View All Activity <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform cursor-pointer" />
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
            
            <button className="relative p-2.5 hover:bg-canvas-alt rounded-xl transition-all group cursor-pointer border-none bg-transparent">
              <Bell className="w-5 h-5 text-muted group-hover:rotate-12 transition-transform cursor-pointer" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-card cursor-pointer" />
            </button>

            {/* --- REFINED PROFILE SECTION --- */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 bg-card p-1 pr-3 rounded-full border border-border/50 hover:bg-canvas-alt transition-all cursor-pointer shadow-sm">
                <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`} className="w-8 h-8 rounded-full border border-border/50 cursor-pointer" alt="Avatar" />
                <span className="text-sm font-bold text-main hidden lg:block cursor-pointer">{displayName}</span>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-2xl z-[110] overflow-hidden animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
                  <div className="p-6 pb-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`} className="w-14 h-14 rounded-2xl shadow-lg border border-border/50" alt="Avatar" />
                      <div className="text-left">
                        <h4 className="text-sm font-black text-main uppercase tracking-tight leading-none truncate max-w-[140px]">{displayName}</h4>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">User</p>
                      </div>
                    </div>

                    {/* Verified Profile Shield Badge */}
                    <div className="flex items-center space-x-2 text-[10px] font-black bg-teal-500/10 text-teal-600 py-1.5 px-3 rounded-full w-fit uppercase border border-teal-500/10">
                      <ShieldCheck className="w-3.5 h-3.5" /> 
                      <span>Verified Profile</span>
                    </div>
                  </div>

                  <div className="p-3">
                    <button onClick={() => { navigate("/settings"); setDropdownOpen(false); }} className="flex items-center w-full px-4 py-3.5 text-xs font-bold text-main hover:bg-teal-500 hover:text-white rounded-[1.2rem] transition-all group cursor-pointer">
                      <User className="mr-3 w-4 h-4 group-hover:scale-110 transition-transform" /> {t("nav.profile") || "Profile"}
                    </button>
                    <button onClick={() => { navigate("/settings"); setDropdownOpen(false); }} className="flex items-center w-full px-4 py-3.5 text-xs font-bold text-main hover:bg-teal-500 hover:text-white rounded-[1.2rem] transition-all group mt-1 cursor-pointer">
                      <Settings className="mr-3 w-4 h-4 group-hover:rotate-45 transition-transform" /> {t("nav.settings") || "Settings"}
                    </button>
                    <div className="my-2 border-t border-border/50 mx-2" />
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-3.5 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white rounded-[1.2rem] transition-all group cursor-pointer">
                      <LogOut className="mr-3 w-4 h-4 group-hover:translate-x-1 transition-transform" /> {t("auth.logout") || "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- MODALS REMAIN THE SAME --- */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300 cursor-pointer" onClick={() => setShowBadgeModal(false)}>
          <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl relative cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowBadgeModal(false)} className="absolute top-6 right-6 p-2 hover:bg-muted/10 rounded-full cursor-pointer"><X className="w-5 h-5 cursor-pointer" /></button>
            <div className="mb-6 inline-flex p-5 rounded-full bg-yellow-500/10 border-2 border-yellow-500/20 cursor-pointer">
              <Trophy className="w-12 h-12 text-yellow-500 cursor-pointer" />
            </div>
            <h3 className="text-xl font-black text-main uppercase tracking-tight mb-2 cursor-pointer">
              {badgeCount > 0 ? "Course Master!" : "The Journey Begins"}
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-6 cursor-pointer">
              {badgeCount > 0 
                ? `Amazing! You have successfully completed ${badgeCount} courses and unlocked their respective badges.` 
                : "You haven't earned any badges yet. Complete a course 100% to unlock your first official badge!"}
            </p>
            <div className="space-y-2 mb-6 cursor-pointer">
              {earnedBadgesList.map((course, index) => (
                <div key={index} className="flex items-center p-3 bg-muted/5 rounded-xl border border-border/50 cursor-pointer">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-3 cursor-pointer" />
                  <span className="text-[10px] font-bold text-main uppercase truncate cursor-pointer">{course.title}</span>
                  <CheckCircle className="w-4 h-4 text-teal-500 ml-auto cursor-pointer" />
                </div>
              ))}
            </div>
            <button onClick={() => setShowBadgeModal(false)} className="w-full py-4 rounded-2xl bg-main text-card text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer">
              Got it!
            </button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer">
          <div className="bg-card border border-border/50 rounded-[2rem] p-8 w-80 text-center cursor-pointer">
            <LogOut className="w-10 h-10 text-red-500 mx-auto mb-4 cursor-pointer" />
            <h3 className="text-sm font-black text-main mb-6 cursor-pointer">Are you sure you want to logout?</h3>
            <div className="flex gap-3 cursor-pointer">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl border border-border cursor-pointer text-[10px] font-black uppercase">Cancel</button>
              <button onClick={confirmLogout} className="flex-1 py-3 rounded-xl bg-red-500 text-white cursor-pointer text-[10px] font-black uppercase">Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
