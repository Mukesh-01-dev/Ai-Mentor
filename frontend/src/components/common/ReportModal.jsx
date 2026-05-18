import React, { useState } from "react";
import { ArrowDown, X } from "lucide-react";

const ReportModal = ({
  show,
  onClose,
  onSubmit,
  reportText,
  setReportText,
  reportType,
  setReportType,
  enrolledCourses,
  subType,
  setSubType,
  selectedCourse,
  setSelectedCourse,
  loading,
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openCourseDropdown, setOpenCourseDropdown] = useState(false);
  const [openSubDropdown, setOpenSubDropdown] = useState(false);

  const reportOptions = ["Bug / Error", "Course", "Payment Issue", "Other"];

  const subOptionsMap = {
    "Bug / Error": [
      "App Crash",
      "Button Not Working",
      "Page Not Loading",
      "UI Issue",
      "Slow Performance",
    ],
    "Payment Issue": [
      "Payment Failed",
      "Amount Deducted",
      "Refund Not Received",
      "Wrong Charge",
      "Other",
    ],
    Course: [
      "Course Not Loading",
      "Video Not Working",
      "Offensive Content",
      "Audio Issue",
      "Subtitles Missing",
      "Lesson Missing",
      "Access Issue",
      "Other",
    ],
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white/90 dark:bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Submitting report...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Report an Issue
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Help us improve your experience
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition"
              >
                <X className="w-4 h-4 text-gray-700 dark:text-white" />
              </button>
            </div>

            <div className="relative mb-5">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                Issue Type
              </label>

              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm hover:border-teal-400 transition"
              >
                {reportType}
                <ArrowDown className="w-4 h-4 opacity-70" />
              </button>

              {openDropdown && (
                <div className="absolute mt-2 w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                  {reportOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setReportType(option);
                        setSelectedCourse("");
                        setSubType("");
                        setOpenDropdown(false);
                      }}
                      className="px-4 py-3 text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-white/10 transition"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {reportType === "Course" && (
              <div className="relative mb-5">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                  Select Course
                </label>

                <button
                  onClick={() => setOpenCourseDropdown(!openCourseDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm hover:border-teal-400 transition"
                >
                  {selectedCourse || "Select your course"}
                  <ArrowDown className="w-4 h-4 opacity-70" />
                </button>

                {openCourseDropdown && (
                  <div className="absolute mt-2 w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto">
                    {enrolledCourses.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400">
                        No enrolled courses
                      </div>
                    ) : (
                      enrolledCourses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => {
                            setSelectedCourse(course.title);
                            setSubType("");
                            setOpenCourseDropdown(false);
                          }}
                          className="px-4 py-3 text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-white/10 transition"
                        >
                          {course.title}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {reportType !== "Select Issue Type" &&
              reportType !== "Other" &&
              (reportType !== "Course" || selectedCourse) && (
                <div className="relative mb-5">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                    Select Reason
                  </label>

                  <button
                    onClick={() => setOpenSubDropdown(!openSubDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm hover:border-teal-400 transition"
                  >
                    {subType || "Select reason"}
                    <ArrowDown className="w-4 h-4 opacity-70" />
                  </button>

                  {openSubDropdown && (
                    <div className="absolute mt-2 w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                      {(subOptionsMap[reportType] || []).map((item) => (
                        <div
                          key={item}
                          onClick={() => {
                            setSubType(item);
                            setOpenSubDropdown(false);
                          }}
                          className="px-4 py-3 text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-white/10 transition"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            <div className="mb-6">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                Description
              </label>

              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={4}
                placeholder="Describe the issue..."
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white hover:opacity-80 transition"
              >
                Cancel
              </button>

              <button
                disabled={
                  loading ||
                  reportType === "Select Issue Type" ||
                  !reportText.trim() ||
                  (reportType === "Course" && (!selectedCourse || !subType))
                }
                onClick={() =>
                  onSubmit({
                    reportType,
                    reportText,
                    course: selectedCourse,
                    subType,
                  })
                }
                className="flex-1 py-3 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition disabled:opacity-40 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
