import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Moon, Sun, Check, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import SocialLogin from "../components/auth/SocialLogin";
import toast from "react-hot-toast";

/* FormInput stays UI-only */
const FormInput = ({ label, type, placeholder, value, onChange }) => {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BEA5] focus:border-transparent transition-all dark:bg-[#0f172a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
};

/* Password Validation UI Helper */
const ValidationItem = ({ label, met }) => (
  <div className={`flex items-center gap-1 ${met ? "text-green-500" : "text-gray-400"}`}>
    {met ? <Check size={10} /> : <X size={10} />}
    <span className="text-[10px]">{label}</span>
  </div>
);

const SignUpPage = () => {
  /* 🔹 NEW STATES FOR NAMES */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  /* 🔹 PASSWORD REQUIREMENTS LOGIC */
  const passwordRequirements = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          name: username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      login(data, false);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 UI FROM AUTHLAYOUT SIGNUP */
  return (
    <AuthLayout
      title="Join Us Today!"
      subtitle="Create your account for an enhanced experience at your fingertips."
      rightHeader={
        <div className="flex items-center gap-2">
          <Sun size={16} className="text-gray-500" />
          <input
            type="checkbox"
            checked={isDark}
            onChange={toggleTheme}
            className="cursor-pointer"
          />
          <Moon size={16} className="text-gray-500" />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 🔹 FIRST & LAST NAME ROW */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="First Name"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <FormInput
            label="Last Name"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter your email here"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormInput
          label="Choose a Username"
          type="text"
          placeholder="Enter your username here"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <div className="mb-3 relative">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Create a Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BEA5] focus:border-transparent transition-all dark:bg-[#0f172a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* 🔹 PASSWORD CHECKLIST UI */}
          <div className="mt-2 grid grid-cols-2 gap-1">
            <ValidationItem label="8+ Characters" met={passwordRequirements.length} />
            <ValidationItem label="Uppercase" met={passwordRequirements.capital} />
            <ValidationItem label="Lowercase" met={passwordRequirements.lower} />
            <ValidationItem label="Number" met={passwordRequirements.number} />
            <ValidationItem label="Symbol" met={passwordRequirements.symbol} />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#2186df] to-[#02ffbb] text-white font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading || !isPasswordValid}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      <SocialLogin />

      <p className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          Log In!
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUpPage;