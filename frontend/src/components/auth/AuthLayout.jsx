import React from "react";
import logo from "../../assets/images/logo.png";
import hero from "../../assets/images/hero-img.jpg";
import ThemeToggle from "../common/ThemeToggle";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center w-full bg-white dark:bg-[#0f172a]">
      <div className="flex w-full h-full">
        {/* LEFT SECTION */}
        <div className="hidden lg:flex flex-col justify-center px-10 w-1/2 relative bg-white dark:bg-[#0f172a]">
          {/* Logo */}
          <img src={logo} alt="UptoSkills" className="w-32" />

          {/* Heading */}
          <h1 className="font-bold mt-6 text-4xl leading-tight text-gray-900 dark:text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4facfe] to-[#7846aa] font-bold">
              AI Learning
            </span>
            <br /> Platform
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 dark:text-gray-400 text-base mt-3 max-w-sm">
            Unlock the future of education with AI-powered courses designed to
            accelerate your learning journey.
          </p>

          {/* HERO IMAGE SECTION */}
          <div className="mt-6">
            <img
              src={hero}
              alt="AI Learning Illustration"
              className="max-w-[360px] w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="mt-[24px] mb-[24px] w-full lg:w-1/2 flex justify-center items-center p-4 lg:p-0 bg-white dark:bg-[#0f172a]">
          <div className="bg-white dark:bg-[#0f172a] shadow-[0_10px_30px_rgba(0,0,0,0.19)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.19)] border-0 py-7 px-6 rounded-2xl relative w-full max-w-[370px] dark:border dark:border-gray-800">
            {/* 🔥 UNIVERSAL THEME TOGGLE (TOP-RIGHT) */}
            <div className="absolute top-3 right-3">
              <ThemeToggle />
            </div>

            <h3 className="font-bold text-center mb-1.5 text-xl text-gray-900 dark:text-white">
              {title}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mb-5 text-center mx-auto max-w-[320px] text-sm">
              {subtitle}
            </p>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
