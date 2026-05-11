import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import SocialLogin from "../components/auth/SocialLogin";
import API from "../lib/api";
import toast from "react-hot-toast";

const FormInput = ({ label, type = "text", value, onChange }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm dark:bg-slate-900 dark:border-gray-700 dark:text-white"
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const fullName = `${firstName} ${lastName}`.trim();

    if (!fullName) {
      toast.error("Name is required");
      return;
    }

    if (!passwordValid) {
      toast.error("Password not strong enough");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/api/auth/register", {
        name: fullName,
        email: email.trim(),
        password: password.trim(),
      });

      console.log("Signup response:", res.data);

      const userData = res.data?.user || res.data;

      login(userData);

      toast.success("Account created successfully!");

      navigate("/complete-profile");

    } catch (err) {
      console.log("Signup error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Signup failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join Us Today!"
      subtitle="Create your account"
      rightHeader={
        <div className="flex items-center gap-2">
          <Sun size={16} />
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />
          <Moon size={16} />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <FormInput
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <label className="text-xs">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>

      <SocialLogin />

      <p className="text-center text-sm mt-4">
        Already have account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
};

export default SignUpPage;