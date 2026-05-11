import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Play,
  CheckCircle,
  Award,
  Clock
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setCourses(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ✅ Stats (simple)
  const stats = [
    {
      label: "Ongoing",
      value: user?.purchasedCourses?.length || 0,
      icon: <Play size={20} />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Completed",
      value: user?.analytics?.completedCourses || 0,
      icon: <CheckCircle size={20} />,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Certificates",
      value: user?.analytics?.certificates || 0,
      icon: <Award size={20} />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Hours",
      value: user?.analytics?.totalHours || 0,
      icon: <Clock size={20} />,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* 🔹 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.name || "User"} 👋
        </h1>

        <div className="flex items-center gap-2 border px-3 py-2 rounded-lg">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search courses..."
            className="outline-none text-sm"
          />
        </div>
      </div>

      {/* 🔹 STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className="bg-white shadow rounded-xl p-4 flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <div className="text-lg font-bold">{item.value}</div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 COURSES */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Popular Courses
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {courses.slice(0, 8).map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/course-preview/${course.id}`)}
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded-t-xl"
              />

              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-sm">
                  {course.title}
                </h3>

                <p className="text-xs text-gray-500">
                  {course.category} • {course.level}
                </p>

                <button className="w-full mt-2 bg-blue-500 text-white py-1.5 rounded-lg text-sm hover:bg-blue-600">
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 CONTINUE LEARNING */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Continue Learning
        </h2>

        {courses.length === 0 ? (
          <p className="text-gray-500">
            No courses available
          </p>
        ) : (
          <div className="space-y-3">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={course.image}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Continue learning
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/learning/${course.id}`)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Continue
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;