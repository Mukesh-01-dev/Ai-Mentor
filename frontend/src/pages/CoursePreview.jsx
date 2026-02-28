import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function CoursePreview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [courseData, setCourseData] = useState(null);
  const [error, setError] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course data");
        }
        const data = await response.json();

        if (data) {
          // The backend returns the course directly
          setCourseData(data || null);
          setError(null);
        } else {
          setError(`Course with ID ${courseId} not found`);
          setCourseData(null);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError("Failed to load course data");
        setCourseData(null);
      }
    };
    fetchCourseData();
  }, [courseId]);

  const handlePurchase = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    purchaseLock.current = true;

    setIsPurchasing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/purchase-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: courseId,
          courseTitle: courseData.title,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user context with new purchased courses
        const updatedUser = {
          ...user,
          purchasedCourses: data.purchasedCourses,
        };
        updateUser(updatedUser);

        // Navigate to learning page
        navigate(`/learning/${courseId}`);
      } else {
        alert(data.message || "Failed to purchase course");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to purchase course. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
          <p className="text-gray-600">
            Please check the course ID and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 py-8 lg:py-16 mt-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column */}
          <div className="flex-1 w-full lg:max-w-[821px]">
            {/* Course Header */}
            <section className="mb-6 lg:mb-8 relative">
              <div className="flex items-center gap-2 lg:gap-3 mb-4 flex-wrap">
                {courseData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className={`text-sm font-medium ${tag === "Bestseller"
                        ? "text-[#FACC15]"
                        : tag === "Beginner-Friendly"
                          ? "bg-[#22C55E] text-white px-3 py-1 rounded-full"
                          : "bg-[#3B82F6] text-white px-3 py-1 rounded-full"
                      }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-[#0D0D0D] text-2xl lg:text-4xl font-bold leading-tight lg:leading-[45px] mb-4">
                {courseData.title}
              </h1>

              <p className="text-[#6B7280] text-base lg:text-xl leading-6 lg:leading-7 mb-5">
                {courseData.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                <div className="flex items-center gap-2">
                  <img
                    src="/ui/avatar-4.png"
                    alt="Instructor"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-[#6B7280] text-sm">
                    Created by{" "}
                    <span className="text-[#FF6C34]">
                      {courseData.instructor}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[#6B7280] text-sm">
                  <svg className="w-3 h-3.5" viewBox="0 0 13 15" fill="none">
                    <path
                      d="M3.35938 1.625V2.5H2.04688C1.32227 2.5 0.734375 3.08789 0.734375 3.8125V5.125H12.9844V3.8125C12.9844 3.08789 12.3965 2.5 11.6719 2.5H10.3594V1.625C10.3594 1.14102 9.96836 0.75 9.48438 0.75C9.00039 0.75 8.60938 1.14102 8.60938 1.625V2.5H5.10938V1.625C5.10938 1.14102 4.71836 0.75 4.23438 0.75C3.75039 0.75 3.35938 1.14102 3.35938 1.625ZM12.9844 6H0.734375V13.4375C0.734375 14.1621 1.32227 14.75 2.04688 14.75H11.6719C12.3965 14.75 12.9844 14.1621 12.9844 13.4375V6Z"
                      fill="#6B7280"
                    />
                  </svg>
                  Last updated {courseData.lastUpdated}
                </div>

                <div className="flex items-center gap-1 text-[#6B7280] text-sm">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 15 15" fill="none">
                    <path
                      d="M10.3125 7.75C10.3125 8.35703 10.2797 8.94219 10.2223 9.5H5.15273C5.09258 8.94219 5.09258 8.35703 5.0625 7.75C5.0625 7.14297 5.09531 6.55781 5.15273 6H10.2223C10.2824 6.55781 10.3125 7.14297 10.3125 7.75ZM11.1 6H14.466C14.6109 6.56055 14.6875 7.1457 14.6875 7.75C14.6875 8.3543 14.6109 8.93945 14.466 9.5H11.1C11.1574 8.93672 11.1875 8.35156 11.1875 7.75C11.1875 7.14844 11.1574 6.56328 11.1 6ZM14.1789 5.125H10.9879C10.7145 3.37773 10.173 1.91484 9.47578 0.979687C11.6168 1.5457 13.3586 3.09883 14.1762 5.125H14.1789ZM10.102 5.125H5.27305C5.43984 4.12969 5.69688 3.24922 6.01133 2.53555C6.29844 1.89023 6.61836 1.42266 6.92734 1.12734C7.23359 0.8375 7.48789 0.75 7.6875 0.75C7.88711 0.75 8.14141 0.8375 8.44766 1.12734C8.75664 1.42266 9.07656 1.89023 9.36367 2.53555C9.68086 3.24648 9.93516 4.12695 10.102 5.125ZM4.38711 5.125H1.19609C2.01641 3.09883 3.75547 1.5457 5.89922 0.979687C5.20195 1.91484 4.66055 3.37773 4.38711 5.125ZM0.908984 6H4.275C4.21758 6.56328 4.1875 7.14844 4.1875 7.75C4.1875 8.35156 4.21758 8.93672 4.275 9.5H0.908984C0.764063 8.93945 0.6875 8.3543 0.6875 7.75C0.6875 7.1457 0.764063 6.56055 0.908984 6ZM6.01133 12.9617C5.69414 12.2508 5.43984 11.3703 5.27305 10.375H10.102C9.93516 11.3703 9.67812 12.2508 9.36367 12.9617C9.07656 13.607 8.75664 14.0746 8.44766 14.3699C8.14141 14.6625 7.88711 14.75 7.6875 14.75C7.48789 14.75 7.23359 14.6625 6.92734 14.3727C6.61836 14.0773 6.29844 13.6098 6.01133 12.9645V12.9617ZM4.38711 10.375C4.66055 12.1223 5.20195 13.5852 5.89922 14.5203C3.75547 13.9543 2.01641 12.4012 1.19609 10.375H4.38711ZM14.1789 10.375C13.3586 12.4012 11.6195 13.9543 9.47852 14.5203C10.1758 13.5852 10.7145 12.1223 10.9906 10.375H14.1789Z"
                      fill="#6B7280"
                    />
                  </svg>
                  {courseData.language}
                </div>

                {courseData.subtitles && (
                  <div className="flex items-center gap-1 text-[#6B7280] text-sm">
                    <svg className="w-4 h-3.5" viewBox="0 0 16 15" fill="none">
                      <path
                        d="M0.25 3.375C0.25 2.40977 1.03477 1.625 2 1.625H14.25C15.2152 1.625 16 2.40977 16 3.375V12.125C16 13.0902 15.2152 13.875 14.25 13.875H2C1.03477 13.875 0.25 13.0902 0.25 12.125V3.375ZM5.71875 6.4375C6.10703 6.4375 6.45703 6.6043 6.69766 6.875C6.93828 7.1457 7.35391 7.16758 7.62461 6.92695C7.89531 6.68633 7.91719 6.2707 7.67656 6C7.19805 5.46406 6.49805 5.125 5.72148 5.125C4.27227 5.125 3.09648 6.30078 3.09648 7.75C3.09648 9.19922 4.27227 10.375 5.72148 10.375C6.49805 10.375 7.19805 10.0359 7.67656 9.5C7.91719 9.2293 7.89531 8.81641 7.62461 8.57305C7.35391 8.32969 6.94102 8.3543 6.69766 8.625C6.45703 8.8957 6.10703 9.0625 5.71875 9.0625C4.99414 9.0625 4.40625 8.47461 4.40625 7.75C4.40625 7.02539 4.99414 6.4375 5.71875 6.4375ZM9.65625 7.75C9.65625 7.02539 10.2441 6.4375 10.9688 6.4375C11.357 6.4375 11.707 6.6043 11.9477 6.875C12.1883 7.1457 12.6039 7.16758 12.8746 6.92695C13.1453 6.68633 13.1672 6.2707 12.9266 6C12.448 5.46406 11.748 5.125 10.9715 5.125C9.52227 5.125 8.34648 6.30078 8.34648 7.75C8.34648 9.19922 9.52227 10.375 10.9715 10.375C11.748 10.375 12.448 10.0359 12.9266 9.5C13.1672 9.2293 13.1453 8.81641 12.8746 8.57305C12.6039 8.32969 12.191 8.3543 11.9477 8.625C11.707 8.8957 11.357 9.0625 10.9688 9.0625C10.2441 9.0625 9.65625 8.47461 9.65625 7.75Z"
                        fill="#6B7280"
                      />
                    </svg>
                    Subtitles
                  </div>
                )}
              </div>
            </section>

            {/* Bookmark Icon */}
            <button className="absolute top-0 right-0 lg:right-4 hover:opacity-80 transition-opacity">
              <svg
                className="w-12 lg:w-[67px] h-12 lg:h-[60px]"
                viewBox="0 0 67 61"
                fill="none"
              >
                <ellipse
                  cx="24.6842"
                  cy="23.45"
                  rx="24.6842"
                  ry="23.45"
                  fill="white"
                />
                <path
                  d="M25.0301 5.05005C28.4564 5.05005 30.9533 5.05142 32.8611 5.23657C34.765 5.42138 35.9348 5.77931 36.7791 6.38892C37.5777 6.96545 38.0027 7.70463 38.2332 8.94263C38.4768 10.2509 38.4813 11.9859 38.4813 14.4836V25.6829C38.4813 27.2895 38.4759 28.3365 38.327 29.0627C38.2566 29.4055 38.1666 29.6038 38.0799 29.7249C38.0037 29.831 37.9006 29.9205 37.7137 29.9954C37.3085 30.1575 36.7179 30.1763 35.9139 29.9934C35.1233 29.8135 34.2354 29.4637 33.3104 29.0256C32.3896 28.5896 31.4711 28.0848 30.6131 27.6096C29.7748 27.1453 28.9622 26.6905 28.3133 26.3977C26.9923 25.8016 26.0709 25.3636 25.0301 25.3635C23.9893 25.3635 23.0678 25.8016 21.7469 26.3977C21.0979 26.6905 20.2845 27.1453 19.4461 27.6096C18.588 28.0849 17.6697 28.5896 16.7488 29.0256C15.8239 29.4636 14.9368 29.8135 14.1463 29.9934C13.443 30.1534 12.903 30.1586 12.5076 30.0491L12.3465 29.9954C12.1594 29.9205 12.0565 29.8311 11.9803 29.7249C11.8935 29.6038 11.8036 29.4056 11.7332 29.0627C11.5842 28.3365 11.5789 27.2896 11.5789 25.6829V14.4836C11.5789 11.9859 11.5834 10.2509 11.827 8.94263C12.0575 7.70481 12.4818 6.96541 13.2801 6.38892C14.1244 5.77931 15.2943 5.42138 17.1981 5.23657C19.106 5.05137 21.6034 5.05005 25.0301 5.05005Z"
                  stroke="#00BEA5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Stats Card */}
            <section className="bg-white rounded-xl p-4 lg:p-6 mb-8 shadow-[0_0_30px_0_rgba(102,126,234,0.3)]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-[18px] h-4"
                        viewBox="0 0 19 16"
                        fill="none"
                      >
                        <path
                          d="M10.2625 0.5625C10.0969 0.21875 9.74687 0 9.3625 0C8.97813 0 8.63125 0.21875 8.4625 0.5625L6.45312 4.69688L1.96563 5.35938C1.59063 5.41563 1.27813 5.67812 1.1625 6.0375C1.04688 6.39687 1.14062 6.79375 1.40937 7.05937L4.66563 10.2812L3.89687 14.8344C3.83437 15.2094 3.99062 15.5906 4.3 15.8125C4.60938 16.0344 5.01875 16.0625 5.35625 15.8844L9.36563 13.7437L13.375 15.8844C13.7125 16.0625 14.1219 16.0375 14.4312 15.8125C14.7406 15.5875 14.8969 15.2094 14.8344 14.8344L14.0625 10.2812L17.3188 7.05937C17.5875 6.79375 17.6844 6.39687 17.5656 6.0375C17.4469 5.67812 17.1375 5.41563 16.7625 5.35938L12.2719 4.69688L10.2625 0.5625Z"
                          fill="#FACC15"
                        />
                      </svg>
                    ))}
                  </div>
                  <div className="text-[#0D0D0D] text-2xl font-bold mb-1">
                    {courseData.rating}
                  </div>
                  <div className="text-[#9CA3AF] text-base">
                    {(courseData.reviews || 0).toLocaleString()} reviews
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[#C084FC] text-2xl font-bold mb-1">
                    {courseData.students.toLocaleString()}
                  </div>
                  <div className="text-[#9CA3AF] text-base">
                    Students enrolled
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[#60A5FA] text-2xl font-bold mb-1">
                    {courseData.duration}
                  </div>
                  <div className="text-[#9CA3AF] text-base">Total content</div>
                </div>
              </div>
            </section>

            {/* What You'll Learn */}
            <section className="bg-white rounded-xl p-4 lg:p-6 mb-8 shadow-[0_0_30px_0_rgba(102,126,234,0.3)]">
              <h2 className="text-black text-xl lg:text-[26px] font-bold mb-4 lg:mb-6">
                What you'll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseData.whatYouLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <svg
                      className="w-3.5 h-4 mt-1 shrink-0"
                      viewBox="0 0 14 16"
                      fill="none"
                    >
                      <path
                        d="M13.7063 3.2937C14.0969 3.68433 14.0969 4.3187 13.7063 4.70933L5.70625 12.7093C5.31563 13.1 4.68125 13.1 4.29063 12.7093L0.290627 8.70933C-0.0999985 8.3187 -0.0999985 7.68433 0.290627 7.2937C0.681252 6.90308 1.31563 6.90308 1.70625 7.2937L5 10.5843L12.2938 3.2937C12.6844 2.90308 13.3188 2.90308 13.7094 3.2937H13.7063Z"
                        fill="#4ADE80"
                      />
                    </svg>
                    <span className="text-[#6B7280] text-base leading-6">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="bg-white rounded-xl p-4 lg:p-6 shadow-[0_0_30px_0_rgba(102,126,234,0.3)]">
              <h2 className="text-black text-xl lg:text-[26px] font-bold mb-4 lg:mb-5">
                Curriculum
              </h2>
              <div className="border-t border-[#ACB2BD] pt-2">
                <div className="text-black space-y-4 leading-6">
                  {courseData.curriculum.map((module, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                      <p className="text-base">{module.goal}</p>
                      {module.topics && (
                        <>
                          <p className="text-base mt-2">
                            <strong>Topics:</strong>
                          </p>
                          <ul className="list-none text-base space-y-1 ml-0">
                            {module.topics.map((topic, topicIndex) => (
                              <li key={topicIndex}>{topic}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {module.tools && (
                        <>
                          <p className="text-base mt-2">
                            <strong>Tools:</strong>
                          </p>
                          <ul className="list-none text-base space-y-1 ml-0">
                            {module.tools.map((tool, toolIndex) => (
                              <li key={toolIndex}>{tool}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {module.activities && (
                        <>
                          <p className="text-base mt-2">
                            <strong>Activities:</strong>
                          </p>
                          <ul className="list-none text-base space-y-1 ml-0">
                            {module.activities.map(
                              (activity, activityIndex) => (
                                <li key={activityIndex}>{activity}</li>
                              )
                            )}
                          </ul>
                        </>
                      )}
                      {module.assignment && (
                        <>
                          <p className="text-base mt-2">
                            <strong>Assignment:</strong>
                          </p>
                          <p className="text-base">{module.assignment}</p>
                        </>
                      )}
                      {module.activity && (
                        <>
                          <p className="text-base mt-2">
                            <strong>Activity:</strong>
                          </p>
                          <p className="text-base">{module.activity}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[395px] shrink-0 space-y-6">
            {/* Video Preview */}
            <div className="relative bg-[#1F2937] rounded-xl overflow-hidden shadow-[0_0_30px_0_rgba(102,126,234,0.3)]">
              <img
                src={courseData.thumbnail}
                alt="Course preview"
                className="w-full h-48 object-cover"
              />
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_0_30px_0_rgba(102,126,234,0.3)]">
              {/* Tab Switcher */}
              <div className="bg-white rounded-xl p-1 shadow-[0_0_30px_0_rgba(102,126,234,0.3)] mb-6">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("personal")}
                    className={`flex-1 py-2 px-4 rounded-lg text-base font-bold transition-colors ${activeTab === "personal"
                        ? "bg-[#00BEA5] bg-opacity-67 text-white"
                        : "bg-transparent text-[#6B7280]"
                      }`}
                  >
                    Personal
                  </button>
                  <button
                    onClick={() => setActiveTab("team")}
                    className={`flex-1 py-2 px-4 rounded-lg text-base font-bold transition-colors ${activeTab === "team"
                        ? "bg-[#00BEA5] bg-opacity-67 text-white"
                        : "bg-transparent text-[#6B7280]"
                      }`}
                  >
                    Team
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-[#0D0D0D] text-[30px] font-bold leading-9">
                    ₹{courseData.priceDetails?.current || 0}
                  </span>
                  <span className="text-[#9CA3AF] text-lg line-through">
                    ₹{courseData.priceDetails?.original || 0}
                  </span>
                </div>
                <span className="inline-block bg-[#EF4444] text-white text-sm font-medium px-3 py-1 rounded-full">
                  {courseData.priceDetails?.discount || "0%"}
                </span>
              </div>

              {/* Countdown Timer */}
              {courseData.countdown && (
                <div className="bg-white rounded-xl p-4 shadow-[0_0_30px_0_rgba(102,126,234,0.3)] mb-4">
                  <p className="text-[#9CA3AF] text-sm text-center mb-2">
                    Sale ends in:
                  </p>
                  <div
                    className="flex items-center justify-center gap-2 text-[#F87171] text-base font-bold"
                    suppressHydrationWarning
                  >
                    <span>{courseData.countdown.hours}h</span>
                    <span>:</span>
                    <span>{courseData.countdown.minutes}m</span>
                    <span>:</span>
                    <span>{courseData.countdown.seconds}s</span>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full bg-linear-to-r from-[#00BEA5] to-[#54D3C3] text-white text-base font-bold py-3 rounded-lg mb-4 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPurchasing ? "Purchasing..." : "Buy Now"}
              </button>
              <button className="w-full border border-black text-[#54D3C3] text-base font-bold py-3 rounded-lg mb-6 hover:bg-gray-50 transition-colors">
                Add to Cart
              </button>

              {/* Features */}
              {courseData.features && courseData.features.length > 0 && (
                <div className="space-y-3">
                  {courseData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-[#9CA3AF] text-sm"
                    >
                      <img
                        src={feature.icon}
                        alt=""
                        className="w-4 h-3.5 shrink-0"
                      />
                      {feature.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
