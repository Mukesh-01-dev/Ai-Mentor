import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import SocialLogin from "../components/auth/SocialLogin";
import axios from "axios"; // ✅ Yeh line add karna compulsory hai
import toast from "react-hot-toast";

const FormInput = ({ label, type, placeholder, value, onChange }) => {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-900 dark:border-gray-700 dark:text-white"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  useEffect(() => {
    if (location.state?.logoutSuccess) {
      setShowLogoutAlert(true);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowLogoutAlert(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.token) {
        login(response.data);
        toast.success("Logged in successfully!");
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials!");
    }
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Access your AI Learning Journey.">
      {showLogoutAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500">
          <div className="bg-teal-500 text-white px-8 py-3 rounded-2xl shadow-2xl font-bold border-2 border-white/20">
            ✅ You have been logged out successfully!
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Email Address" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormInput label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="flex justify-end">
          <Link to="/forgot-password" size="sm" className="text-xs font-semibold text-teal-600 hover:text-teal-500 transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-400 text-white font-black shadow-lg hover:scale-[1.02] transition-all">
          LOG IN
        </button>
      </form>

      <SocialLogin />
      <p className="text-center mt-6 text-sm text-muted">
        New here? <Link to="/signup" className="font-bold text-teal-500 hover:underline">Create Account</Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;