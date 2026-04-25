import React, { useState } from "react";

const Login = () => {
  const [dark, setDark] = useState(false);

  const stats = [
    "12.4K Active learners",
    "340 Courses live",
    "98% Uptime today",
    "87 New this week",
  ];

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/light-bg.jpeg')] dark:bg-[url('/dark-bg.jpeg')] bg-cover bg-center transition-all duration-300">
        <div className="w-full max-w-[900px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-gradient-to-tr from-[#75b397] via-[#99c1a7] to-[#97bea9] dark:bg-gradient-to-br dark:from-[#586369] dark:via-[#455b68] dark:to-[#586369] flex flex-col md:flex-row">
          {/* Left Side */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-black border rounded-lg">
                <img
                  src="/uptoskills.png"
                  alt="Logo"
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </div>
              <img
                src="/Mascot.jpeg"
                alt="Mascot"
                className="h-10 md:h-12 w-auto object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold leading-snug text-white dark:text-black">
                Control every{" "}
                <span className="text-[#247153] dark:text-[#de8e3b]">
                  corner
                </span>{" "}
                of the platform.
              </h1>

              <p className="mt-3 text-xs md:text-sm text-[#247153] dark:text-black">
                Manage learners, instructors, courses, and analytics — all from
                one unified dashboard.
              </p>
              <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                {stats.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-3 md:p-4 text-xs md:text-sm text-[#247153] dark:text-black shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full md:w-1/2 p-6 md:p-10 pt-8 md:pt-12 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-2xl font-semibold text-[#247153] dark:text-[#de8e3b]">
                Admin Portal
              </h2>
              <button
                onClick={() => setDark(!dark)}
                className="w-14 md:w-16 h-7 md:h-8 flex items-center rounded-full px-1 bg-white"
              >
                <div
                  className={`${
                    dark ? "bg-[#de8e3b]" : "bg-[#247153]"
                  } w-5 h-5 md:w-6 md:h-6 rounded-full shadow-md flex items-center justify-center text-xs transform transition-all duration-300 ${
                    dark ? "translate-x-7 md:translate-x-8" : "translate-x-0"
                  }`}
                >
                  {dark ? "🌙" : "☀️"}
                </div>
              </button>
            </div>
            <h2 className="text-xl md:text-3xl font-semibold text-white dark:text-black mb-6">
              Sign in to continue
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm mb-2 text-white dark:text-black">
                  Admin Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 md:py-3 rounded-3xl bg-[#f8fafc] border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-orange-400 text-sm text-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm mb-2 text-white dark:text-black">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 md:py-3 rounded-3xl bg-[#f8fafc] border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-orange-400 text-sm text-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="text-right mt-2">
              <a className="text-xs text-white dark:text-black underline">
                Forgot password?
              </a>
            </div>
            <button className="mt-6 w-full py-2 md:py-3 rounded-3xl bg-[#247153] hover:bg-[#16a34a] dark:bg-[#de8e3b] dark:hover:bg-[#d97706] text-white dark:text-black font-semibold transition">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;