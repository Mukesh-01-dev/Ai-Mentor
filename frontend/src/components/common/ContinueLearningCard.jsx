import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Clock, BarChart3 } from "lucide-react";

const DEFAULT_COURSE = {
  id: 1,
  title: "React.js Masterclass",
  category: "Web Development",
  lesson: "Lesson 18 — React Hooks",
  progress: 72,
  duration: "15 min",
  level: "Beginner",
};

export default function ContinueLearningCard({ course, onContinue, onViewAll }) {
  const navigate = useNavigate();
  const currentCourse = { ...DEFAULT_COURSE, ...course };

  const progressValue = Math.min(
    100,
    Math.max(0, Number(currentCourse.progress) || 0)
  );

  const handleContinue = () => {
    if (typeof onContinue === "function") {
      onContinue(currentCourse);
    } else if (currentCourse.id) {
      navigate(`/learning/${currentCourse.id}`);
    } else {
      navigate("/courses");
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      {/* 1. Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Continue Learning
          </h2>
        </div>
        <Link
          to="/courses"
          onClick={onViewAll}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors group"
        >
          View All <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      {/* 2. Course Area */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        {/* Dark Course Thumbnail */}
        <div className="relative w-full sm:w-36 h-28 sm:h-28 rounded-xl sm:rounded-2xl bg-[#0b1329] dark:bg-[#070d1e] border border-slate-800/80 flex flex-col items-center justify-center shrink-0 overflow-hidden shadow-inner">
          {/* Green "In Progress" Badge */}
          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-[#064e3b]/90 border border-emerald-500/50 text-[10px] font-semibold text-emerald-300 leading-tight">
            In Progress
          </span>

          {/* React Logo / Branding */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <svg
              viewBox="-11.5 -10.23174 23 20.46348"
              className="w-6 h-6 sm:w-7 sm:h-7 text-[#00d8ff]"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="0" cy="0" r="2.05" fill="#00d8ff" />
              <g stroke="#00d8ff" strokeWidth="1" fill="none">
                <ellipse rx="11" ry="4.2" />
                <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                <ellipse rx="11" ry="4.2" transform="rotate(120)" />
              </g>
            </svg>
            <span className="text-white font-bold text-sm sm:text-base tracking-tight">
              React
            </span>
          </div>
        </div>

        {/* Course Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
          {/* Title and Category */}
          <div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3
                className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate min-w-0"
                title={currentCourse.title}
              >
                {currentCourse.title}
              </h3>
              {currentCourse.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#ede9fe] dark:bg-purple-950/60 text-[#7c3aed] dark:text-purple-300 shrink-0">
                  {currentCourse.category}
                </span>
              )}
            </div>
            <p
              className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-1"
              title={currentCourse.lesson}
            >
              {currentCourse.lesson}
            </p>
          </div>

          {/* 3. Progress Bar */}
          <div className="flex items-center gap-3 my-2.5">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700/60 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[#00BEA5] dark:bg-[#00BEA5] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressValue}%` }}
                role="progressbar"
                aria-valuenow={progressValue}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
              {progressValue}%
            </span>
          </div>

          {/* 4. Meta Information & 5. Button */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-3.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span>{currentCourse.duration || "15 min"}</span>
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span>{currentCourse.level || "Beginner"}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shrink-0"
            >
              Continue Learning <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
