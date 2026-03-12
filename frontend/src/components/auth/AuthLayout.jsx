import React from "react";
import logo from "../../assets/images/logo.png";
import hero from "../../assets/images/hero-img.jpg";
import ThemeToggle from "../common/ThemeToggle";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a] p-4 sm:p-6 lg:p-0">
      <div className="flex w-full max-w-[1440px] mx-auto h-full lg:h-screen items-center">
        {/* LEFT SECTION - Visible only on Desktop */}
        <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 w-1/2 h-full bg-white dark:bg-[#0f172a] border-r border-gray-100 dark:border-gray-800">
          <div className="max-w-md">
            {/* Logo */}
            <img src={logo} alt="UptoSkills" className="w-32 xl:w-40 mb-10" />

            {/* Heading */}
            <h1 className="font-black text-4xl xl:text-5xl leading-[1.1] text-gray-900 dark:text-white uppercase tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4facfe] to-[#7846aa]">
                AI Learning
              </span>
              <br /> Platform
            </h1>

            {/* Subtitle */}
            <p className="text-gray-500 dark:text-gray-400 text-sm xl:text-base mt-6 font-medium leading-relaxed">
              Unlock the future of education with AI-powered courses designed to
              accelerate your learning journey. Join thousands of students today.
            </p>

            {/* HERO IMAGE SECTION */}
            <div className="mt-12 relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#4facfe]/10 to-[#7846aa]/10 rounded-full blur-3xl" />
              <img
                src={hero}
                alt="AI Learning Illustration"
                className="relative max-w-full h-auto object-contain transform hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Auth Forms */}
        <div className="w-full lg:w-1/2 flex justify-center items-center py-8 lg:py-0">
          <div className="w-full max-w-[400px] px-4 sm:px-0">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src={logo} alt="UptoSkills" className="w-28" />
            </div>

            <div className="bg-white dark:bg-[#0f172a] lg:shadow-none shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-100 dark:border-gray-800 lg:border-none p-8 sm:p-10 rounded-[2.5rem] relative">
              {/* Theme Toggle */}
              <div className="absolute -top-4 -right-4 lg:top-0 lg:right-0">
                <div className="p-1 bg-white dark:bg-gray-900 rounded-2xl shadow-xl lg:shadow-none border border-gray-100 dark:border-gray-800">
                  <ThemeToggle />
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="font-black text-2xl xl:text-3xl text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                  {title}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-xs xl:text-sm font-bold uppercase tracking-widest opacity-60">
                  {subtitle}
                </p>
              </div>

              <div className="space-y-4">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
