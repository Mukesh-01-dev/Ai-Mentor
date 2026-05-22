import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import SocialLogin from "../components/auth/SocialLogin";
import toast from "react-hot-toast";

const FormInput = ({ label, type, placeholder, value, onChange }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BEA5] transition-all dark:bg-[#0f172a] dark:border-gray-700 dark:text-white"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

const ValidationItem = ({ label, met }) => (
  <div className={`flex items-center gap-1 ${met ? "text-green-500" : "text-gray-400"}`}>
    {met ? <Check size={10} /> : <X size={10} />}
    <span className="text-[10px]">{label}</span>
  </div>
);

const SignUpPage = () => {
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

  const passwordRequirements = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    try {
      // 1. Double check your vite.config.js proxy settings. 
      // If it's not working, use the full URL: http://localhost:5000/api/auth/register
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
        }),
      });

      // 2. CHECK CONTENT TYPE FIRST
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // If it's not JSON, it's usually an HTML error page from the server
        const rawText = await response.text();
        console.error("Server returned non-JSON:", rawText);
        throw new Error("Server error: Check your backend terminal for crashes.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // 3. Success logic
      login(data, false);
      toast.success("Account created successfully!");
      navigate("/complete-profile");
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join Us Today!"
      subtitle="Create your account to start your journey."
      rightHeader={
        <div className="flex items-center gap-2">
          <Sun size={16} className={isDark ? "text-gray-500" : "text-yellow-500"} />
          <input
            type="checkbox"
            checked={isDark}
            onChange={toggleTheme}
            className="cursor-pointer accent-[#00BEA5]"
          />
          <Moon size={16} className={isDark ? "text-blue-400" : "text-gray-500"} />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="First Name" type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <FormInput label="Last Name" type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <FormInput label="Email Address" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormInput label="Choose a Username" type="text" placeholder="johndoe123" value={username} onChange={(e) => setUsername(e.target.value)} />

        <div className="mb-3 relative">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00BEA5] dark:bg-[#0f172a] dark:border-gray-700 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !isPasswordValid}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      <SocialLogin />

      <p className="text-center mt-5 text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-red-500 hover:text-red-400 transition-colors">
          Log In!
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUpPage;