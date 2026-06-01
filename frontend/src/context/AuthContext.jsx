// frontend/src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.js"; 
import { apiFetch } from "../lib/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    return !!(token && storedUser && storedUser !== "undefined");
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser && storedUser !== "undefined"
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser || storedUser === "undefined") {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);

    const newUser = {
      ...userData,
      token: userData.token || localStorage.getItem("token"),
      avatar_url: userData.avatar_url || null,
      isProfileComplete: userData.isProfileComplete ?? false,
      isGoogleUser: (userData.isGoogleUser || !!userData.googleId) ?? false,
      googleId: userData.googleId ?? null,
      hasPassword: userData.hasPassword ?? false,
    };

    setUser(newUser);
    localStorage.setItem("token", newUser.token);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.removeItem("preferencesSkipped");
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await apiFetch("/api/users/profile");
      if (!response) return;
      if (response.ok) {
        const userData = await response.json();

        const newUser = {
          ...userData,
          token: localStorage.getItem("token"),
          avatar_url: userData.avatar_url || null,
          isProfileComplete: userData.isProfileComplete ?? false,
          isGoogleUser: userData.isGoogleUser ?? false,
          googleId: userData.googleId ?? null,
          hasPassword: userData.hasPassword ?? false,
        };

        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, fetchUserProfile]);

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Firebase sign out error:", error);
    }

    setIsAuthenticated(false);
    setUser(null);

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("course-progress-")) {
        localStorage.removeItem(key);
      }
    });

    localStorage.clear();
  };

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => {
      const newUser = {
        ...prevUser,
        ...updatedUserData,
        settings: {
          ...prevUser?.settings,
          ...updatedUserData?.settings,
        },
        token: prevUser?.token || localStorage.getItem("token"),
      };

      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
