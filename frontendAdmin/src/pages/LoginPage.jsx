// LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Login failed");
      }

      if (!data?.token || (data?.role !== "admin" && data?.role !== "superAdmin")) {
        throw new Error("This account is not an admin account");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 lg:gap-12 items-center justify-center">

        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-6 lg:p-8 text-white min-h-[450px]">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-2">
              <span className="text-orange-500">UPTO</span>
              <span className="text-cyan-400">SKILLS</span>
            </h1>
          </div>

          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 lg:mb-4 leading-tight">
            <span className="text-blue-400">AI Learning</span>
            <br className="hidden lg:block" />
            <span className="text-white">Platform</span>
          </h2>

          <div className="bg-red-500/20 border-l-4 border-red-500 p-3 lg:p-4 mb-4 lg:mb-6 rounded">
            <p className="text-red-200 font-semibold flex items-center gap-2 text-xs lg:text-sm">
              <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
              Admin Access Only
            </p>
          </div>

          <p className="text-slate-300 text-sm lg:text-base mb-0 lg:mb-2 max-w-xs lg:max-w-sm leading-relaxed">
            Manage and oversee the AI-powered educational platform. Access administrative tools and analytics.
          </p>

          <div className="mt-0 lg:mt-2">
            <svg className="w-40 lg:w-48 h-40 lg:h-48" viewBox="0 0 200 200" fill="none">
              <rect x="40" y="60" width="120" height="80" rx="4" fill="#1e40af" opacity="0.3" />
              <rect x="45" y="65" width="110" height="65" fill="#0f172a" />
              <path d="M100 75 L85 80 L85 95 Q85 105 100 110 Q115 105 115 95 L115 80 Z" fill="#06b6d4" opacity="0.8" />
              <path d="M95 90 L98 95 L108 85" stroke="#fff" strokeWidth="2" fill="none" />
              <rect x="90" y="100" width="20" height="15" rx="2" fill="#f97316" opacity="0.6" />
              <path d="M95 100 L95 95 Q95 90 100 90 Q105 90 105 95 L105 100" stroke="#f97316" strokeWidth="2" fill="none" />
              <rect x="90" y="140" width="20" height="10" fill="#1e40af" opacity="0.3" />
              <rect x="70" y="150" width="60" height="3" fill="#1e40af" opacity="0.3" />
            </svg>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-2 lg:p-4">
          <div className="w-full max-w-sm">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-5 lg:p-6 lg:p-8 border border-slate-700">

              {/* Header */}
              <div className="text-center mb-5 lg:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-3 mx-auto">
                  <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-white mb-1.5 lg:mb-2">
                  Admin Login
                </h3>
                <p className="text-slate-400 text-xs lg:text-sm">
                  Access your admin dashboard
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
                  <p className="text-red-200 text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-3.5 lg:space-y-4">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@uptoskills.com"
                      required
                      disabled={loading}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-2.5 lg:py-3 pl-10 lg:pl-11 pr-3 lg:pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-2.5 lg:py-3 pl-10 lg:pl-11 pr-10 lg:pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-2.5 lg:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-2.5 lg:py-3 rounded-lg hover:from-blue-600 hover:to-cyan-500 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Signing in..." : "LOG IN"}
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-5 lg:mt-6 text-center">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 lg:gap-2">
                  <Shield className="w-3 h-3 lg:w-4 lg:h-4" />
                  Secure admin access with end-to-end encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
