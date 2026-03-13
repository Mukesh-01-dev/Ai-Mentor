import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { useTranslation } from 'react-i18next'

const Analytics = () => {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allCourses, setAllCourses] = useState([])

  // Calendar generation logic
  const generateCalendarGrid = (date, studyDays) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];
    let dayCounter = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push({ day: null });
        } else if (dayCounter > daysInMonth) {
          week.push({ day: null });
        } else {
          const isStudyDay = studyDays.includes(dayCounter);
          week.push({ day: dayCounter, isStudyDay });
          dayCounter++;
        }
      }
      grid.push(week);
      if (dayCounter > daysInMonth) break;
    }
    return grid;
  };

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.setMonth(prevDate.getMonth() + 1)));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const [analyticsRes, coursesRes] = await Promise.all([
          fetch('/api/analytics', { headers }),
          fetch('/api/courses', { headers })
        ])

        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics data')
        if (!coursesRes.ok) throw new Error('Failed to fetch courses')

        const aData = await analyticsRes.json()
        const cData = await coursesRes.json()

        setAnalyticsData(aData)
        setAllCourses(cData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    if (user) {
      fetchAllData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activePage="analytics"
        />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'
          }`}>
          <main className="flex-1 mt-16 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA946D] mx-auto"></div>
                  <p className="mt-4 text-gray-600">{t("analytics.loading")}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas-alt flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activePage="analytics"
        />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'
          }`}>
          <main className="flex-1 mt-16 overflow-x-hidden overflow-y-auto bg-canvas-alt p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="text-red-500 text-lg">{t("analytics.error")}</div>
                  <p className="mt-2 text-muted">{error}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const studyDaysInCurrentMonth = analyticsData?.studySessions
    .map(s => new Date(s.date))
    .filter(d => d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth())
    .map(d => d.getDate()) || [];

  const calendarGrid = generateCalendarGrid(currentDate, studyDaysInCurrentMonth);

  const learningHoursChartData = analyticsData?.learningHoursChart || [];
  const maxLearningHour = Math.max(...learningHoursChartData.map(d => d.hours), 1); // Avoid division by zero

  const coursePerformanceData = user?.purchasedCourses?.map(purchasedCourse => {
    const courseInfo = allCourses.find(c => c.id == purchasedCourse.courseId);
    const totalLessons = courseInfo?.lessonsCount ||
      (courseInfo?.lessons ? (courseInfo.lessons.includes(" of ") ? parseInt(courseInfo.lessons.split(" of ")[1]) : parseInt(courseInfo.lessons.split(" ")[0])) : 0);
    const completedLessons = purchasedCourse.progress?.completedLessons?.length || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      ...purchasedCourse,
      totalLessons,
      completedLessons,
      progressPercent
    };
  }) || [];

  return (
    <div className="min-h-screen bg-canvas-alt flex flex-col">
      <Header />

      <Sidebar activePage="analytics" />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'
        }`}>
        <main className="flex-1 mt-16 overflow-x-hidden overflow-y-auto bg-canvas-alt p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Attendance Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted text-sm mb-1">{t("analytics.attendance")}</div>
                    <div className="text-green-600 dark:text-green-400 text-2xl font-bold">{analyticsData?.attendance || 0}%</div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-[14px] h-4" viewBox="0 0 14 16" fill="none">
                      <path d="M4 0C4.55312 0 5 0.446875 5 1V2H9V1C9 0.446875 9.44687 0 10 0C10.5531 0 11 0.446875 11 1V2H12.5C13.3281 2 14 2.67188 14 3.5V5H0V3.5C0 2.67188 0.671875 2 1.5 2H3V1C3 0.446875 3.44688 0 4 0ZM0 6H14V14.5C14 15.3281 13.3281 16 12.5 16H1.5C0.671875 16 0 15.3281 0 14.5V6ZM10.2812 9.53125C10.575 9.2375 10.575 8.7625 10.2812 8.47188C9.9875 8.18125 9.5125 8.17813 9.22188 8.47188L6.25313 11.4406L4.78438 9.97188C4.49063 9.67813 4.01562 9.67813 3.725 9.97188C3.43437 10.2656 3.43125 10.7406 3.725 11.0312L5.725 13.0312C6.01875 13.325 6.49375 13.325 6.78438 13.0312L10.2812 9.53125Z" fill="#16A34A" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Avg Marks Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted text-sm mb-1">{t("analytics.avg_marks")}</div>
                    <div className="text-blue-600 dark:text-blue-400 text-2xl font-bold">{analyticsData?.avgMarks || 0}</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2C2 1.44687 1.55313 1 1 1C0.446875 1 0 1.44687 0 2V12.5C0 13.8813 1.11875 15 2.5 15H15C15.5531 15 16 14.5531 16 14C16 13.4469 15.5531 13 15 13H2.5C2.225 13 2 12.775 2 12.5V2ZM14.7063 4.70625C15.0969 4.31563 15.0969 3.68125 14.7063 3.29063C14.3156 2.9 13.6812 2.9 13.2906 3.29063L10 6.58437L8.20625 4.79063C7.81563 4.4 7.18125 4.4 6.79063 4.79063L3.29063 8.29062C2.9 8.68125 2.9 9.31563 3.29063 9.70625C3.68125 10.0969 4.31563 10.0969 4.70625 9.70625L7.5 6.91563L9.29375 8.70938C9.68437 9.1 10.3188 9.1 10.7094 8.70938L14.7094 4.70937L14.7063 4.70625Z" fill="#2563EB" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Daily Hours Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted text-sm mb-1">{t("analytics.daily_hours")}</div>
                    <div className="text-purple-600 dark:text-purple-400 text-2xl font-bold">{analyticsData?.dailyHours || 0}h</div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0ZM7.25 3.75V8C7.25 8.25 7.375 8.48438 7.58437 8.625L10.5844 10.625C10.9281 10.8562 11.3938 10.7625 11.625 10.4156C11.8562 10.0687 11.7625 9.60625 11.4156 9.375L8.75 7.6V3.75C8.75 3.33437 8.41562 3 8 3C7.58437 3 7.25 3.33437 7.25 3.75Z" fill="#9333EA" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Courses Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted text-sm mb-1">{t("analytics.courses")}</div>
                    <div className="text-orange-600 dark:text-orange-400 text-2xl font-bold">{analyticsData?.totalCourses || 0}</div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-[14px] h-4" viewBox="0 0 14 16" fill="none">
                      <path d="M3 0C1.34375 0 0 1.34375 0 3V13C0 14.6562 1.34375 16 3 16H12H13C13.5531 16 14 15.5531 14 15C14 14.4469 13.5531 14 13 14V12C13.5531 12 14 11.5531 14 11V1C14 0.446875 13.5531 0 13 0H12H3ZM3 12H11V14H3C2.44688 14 2 13.5531 2 13C2 12.4469 2.44688 12 3 12ZM4 4.5C4 4.225 4.225 4 4.5 4H10.5C10.775 4 11 4.225 11 4.5C11 4.775 10.775 5 10.5 5H4.5C4.225 5 4 4.775 4 4.5ZM4.5 6H10.5C10.775 6 11 6.225 11 6.5C11 6.775 10.775 7 10.5 7H4.5C4.225 7 4 6.775 4 6.5C4 6.225 4.225 6 4.5 6Z" fill="#EA580C" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Certificates Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted text-sm mb-1">{t("analytics.certificates")}</div>
                    <div className="text-yellow-600 dark:text-yellow-400 text-2xl font-bold">{analyticsData?.certificates || 0}</div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-4" viewBox="0 0 12 16" fill="none">
                      <path d="M6 0L8.5 2.5L11.5 1.5L10.5 4.5L13 7L10.5 9.5L11.5 12.5L8.5 11.5L6 14L3.5 11.5L0.5 12.5L1.5 9.5L-1 7L1.5 4.5L0.5 1.5L3.5 2.5L6 0Z" fill="#CA8A04" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Calendar */}
            <div className="xl:col-span-2">
              <div className="bg-card rounded-xl border border-border p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-main">{t("analytics.class_calendar")}</h3>
                  <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="w-[26px] h-10 bg-canvas dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                      <svg className="w-[10px] h-4" viewBox="0 0 11 16" fill="none">
                        <path d="M1.21582 7.29365C0.825195 7.68428 0.825195 8.31865 1.21582 8.70928L7.21582 14.7093C7.60645 15.0999 8.24082 15.0999 8.63145 14.7093C9.02207 14.3187 9.02207 13.6843 8.63145 13.2937L3.3377 7.9999L8.62832 2.70615C9.01895 2.31553 9.01895 1.68115 8.62832 1.29053C8.2377 0.899902 7.60332 0.899902 7.2127 1.29053L1.2127 7.29053L1.21582 7.29365Z" fill="#4B5563" />
                      </svg>
                    </button>
                    <span className="text-lg text-main font-medium px-2">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={handleNextMonth} className="w-[26px] h-10 bg-canvas dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                      <svg className="w-[10px] h-4" viewBox="0 0 10 16" fill="none">
                        <path d="M9.70615 7.29365C10.0968 7.68428 10.0968 8.31865 9.70615 8.70928L3.70615 14.7093C3.31553 15.0999 2.68115 15.0999 2.29053 14.7093C1.8999 14.3187 1.8999 13.6843 2.29053 13.2937L7.58428 7.9999L2.29365 2.70615C1.90303 2.31553 1.90303 1.68115 2.29365 1.29053C2.68428 0.899902 3.31865 0.899902 3.70928 1.29053L9.70928 7.29053L9.70615 7.29365Z" fill="#4B5563" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Calendar Days Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="h-9 flex items-center justify-center">
                      <span className="text-sm text-muted font-medium">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarGrid.flat().map((dayInfo, index) => (
                    <div
                      key={index}
                      className={`h-[104px] flex items-start justify-center pt-2 rounded-lg ${dayInfo.isStudyDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                    >
                      {dayInfo.day && (
                        <span className={`text-sm ${dayInfo.isStudyDay ? 'text-blue-800 dark:text-blue-200 font-bold' : 'text-main'
                          }`}>
                          {dayInfo.day}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Calendar Legend */}
                <div className="flex items-center space-x-4 mt-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-muted">{t("analytics.upcoming")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-muted">{t("analytics.completed")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-muted">{t("analytics.missed")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - AI Insights & Schedule */}
            <div className="space-y-6">
              {/* AI Insights */}
              <div className="bg-linear-to-r from-[#FFF4F0] to-[#E7FFFC] border border-[#FFDACC] rounded-xl p-6 shadow-[0_0_20px_rgba(102,126,234,0.3)]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#FE6C34] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-4" viewBox="0 0 20 16" fill="none">
                      <path d="M10 0C10.5531 0 11 0.446875 11 1V3H14.75C15.9937 3 17 4.00625 17 5.25V13.75C17 14.9937 15.9937 16 14.75 16H5.25C4.00625 16 3 14.9937 3 13.75V5.25C3 4.00625 4.00625 3 5.25 3H9V1C9 0.446875 9.44687 0 10 0ZM6.5 12C6.225 12 6 12.225 6 12.5C6 12.775 6.225 13 6.5 13H7.5C7.775 13 8 12.775 8 12.5C8 12.225 7.775 12 7.5 12H6.5ZM9.5 12C9.225 12 9 12.225 9 12.5C9 12.775 9.225 13 9.5 13H10.5C10.775 13 11 12.775 11 12.5C11 12.225 10.775 12 10.5 12H9.5ZM12.5 12C12.225 12 12 12.225 12 12.5C12 12.775 12.225 13 12.5 13H13.5C13.775 13 14 12.775 14 12.5C14 12.225 13.775 12 13.5 12H12.5ZM8.25 8C8.25 7.66848 8.1183 7.35054 7.88388 7.11612C7.64946 6.8817 7.33152 6.75 7 6.75C6.66848 6.75 6.35054 6.8817 6.11612 7.11612C5.8817 7.35054 5.75 7.66848 5.75 8C5.75 8.33152 5.8817 8.64946 6.11612 8.88388C6.35054 9.1183 6.66848 9.25 7 9.25C7.33152 9.25 7.64946 9.1183 7.88388 8.88388C8.1183 8.64946 8.25 8.33152 8.25 8ZM13 9.25C13.3315 9.25 13.6495 9.1183 13.8839 8.88388C14.1183 8.64946 14.25 8.33152 14.25 8C14.25 7.66848 14.1183 7.35054 13.8839 7.11612C13.6495 6.8817 13.3315 6.75 13 6.75C12.6685 6.75 12.3505 6.8817 12.1161 7.11612C11.8817 7.35054 11.75 7.66848 11.75 8C11.75 8.33152 11.8817 8.64946 12.1161 8.88388C12.3505 9.1183 12.6685 9.25 13 9.25ZM1.5 7H2V13H1.5C0.671875 13 0 12.3281 0 11.5V8.5C0 7.67188 0.671875 7 1.5 7ZM18.5 7C19.3281 7 20 7.67188 20 8.5V11.5C20 12.3281 19.3281 13 18.5 13H18V7H18.5Z" fill="white" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-black">{t("analytics.ai_insights")}</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>Your performance in Machine Learning has improved by 15% this week!</p>
                  <p>Consider reviewing Data Structures - your quiz scores suggest more practice needed.</p>
                  <p>Great consistency! You've maintained 4+ hours daily for 2 weeks.</p>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-main mb-4">{t("analytics.schedule")}</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center space-x-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-main">Machine Learning</div>
                      <div className="text-sm text-muted">10:00 AM - 11:30 AM</div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center space-x-3">
                    <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-main">React Development</div>
                      <div className="text-sm text-muted">2:00 PM - 3:30 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
            {/* Learning Hours Chart */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-main">{t("analytics.learning_hours")}</h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-1 bg-[#FA946D] text-white text-sm rounded-lg">{t("analytics.week")}</button>
                  <button className="px-4 py-1 bg-canvas text-muted text-sm rounded-lg">{t("analytics.month")}</button>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between space-x-2">
                {learningHoursChartData.map((dayData, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-[#FA946D] opacity-80 rounded-t" style={{ height: `${(dayData.hours / maxLearningHour) * 100}%` }}></div>
                    <div className="text-xs text-muted mt-2">
                      {new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Distribution Chart */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-main mb-6">{t("analytics.course_distribution")}</h3>
              <div className="flex items-center justify-center h-64">
                <div className="relative">
                  {/* Simplified pie chart representation */}
                  <div className="w-40 h-40 rounded-full bg-linear-to-r from-[#3CC3DF] to-[#FA946D] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{analyticsData?.totalCourses || 0}</div>
                      <div className="text-xs text-gray-600">{t("analytics.total_course")}</div>
                    </div>
                  </div>
                </div>
                <div className="ml-8 space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#3CC3DF] rounded"></div>
                    <span className="text-muted">Code</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#FA946D] rounded"></div>
                    <span className="text-muted">Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#9333EA] rounded"></div>
                    <span className="text-muted">Design</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Performance */}
          <div className="bg-card rounded-xl border border-border p-6 mt-8">
            <h3 className="text-lg font-semibold text-main mb-6">{t("analytics.course_performance")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coursePerformanceData.length > 0 ? coursePerformanceData.map(course => {
                const progressPercentStr = course.progressPercent > 0 ? `${course.progressPercent}%` : '0%';
                return (
                  <div key={course.courseId} className="bg-canvas-alt rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-main">{course.courseTitle}</span>
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">{progressPercentStr}</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 mb-3">
                      <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full" style={{ width: `${course.progressPercent}%` }}></div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="text-muted">{t("analytics.progress_lessons")}: {course.completedLessons}/{course.totalLessons} lessons</div>
                      {/* AI Tip can be added later */}
                    </div>
                  </div>
                );
              }) : (
                <p className="text-muted col-span-3 text-center">{t("analytics.no_courses")}</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Analytics
