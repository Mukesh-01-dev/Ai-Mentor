import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import SocialLogin from "../components/auth/SocialLogin";
import API from "../lib/api";
import toast from "react-hot-toast";

/* ================= INPUT ================= */
const FormInput = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>

    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
      required
      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-900 dark:border-gray-700 dark:text-white"
    />
  </div>
);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  /* ================= LOGOUT ALERT ================= */
  useEffect(() => {
    if (location.state?.logoutSuccess) {
      setShowLogoutAlert(true);
      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => setShowLogoutAlert(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  /* ================= LOGIN ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Enter email and password");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      console.log("📤 Login Request:", { email, password });

      const response = await API.post("/api/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      console.log("✅ Login Response:", response.data);

      const data = response.data;

      // ✅ FIXED CHECK (important)
      if (!data?.success || !data?.token) {
        toast.error(data?.message || "Login failed");
        return;
      }

      // save token
      localStorage.setItem("token", data.token);

      // save user in context
      login(data);

      toast.success("Login successful!");

      // redirect
      navigate("/dashboard");
    } catch (err) {
      console.log("❌ Login Error:", err.response?.data);

      toast.error(err.response?.data?.message || "Invalid email or password");

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Access your AI Learning Journey"
    >
      {/* ALERT */}
      {showLogoutAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100]">
          <div className="bg-teal-500 text-white px-6 py-2 rounded-xl shadow-lg">
            Logged out successfully
          </div>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <FormInput
          label="Email Address"
          type="email"
          value={email}
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormInput
          label="Password"
          type="password"
          value={password}
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* FORGOT PASSWORD */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-teal-600 hover:text-teal-500"
          >
            Forgot Password?
          </Link>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-400 text-white font-bold disabled:opacity-50"
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>
      </form>

      <SocialLogin />

      <p className="text-center mt-6 text-sm">
        New here?{" "}
        <Link to="/signup" className="text-teal-500 font-semibold">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;