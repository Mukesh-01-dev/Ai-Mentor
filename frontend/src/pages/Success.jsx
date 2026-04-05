import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../lib/api";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const hasSaved = useRef(false); // ✅ prevent double API call

  // ✅ get from URL
  const courseId = searchParams.get("courseId");
  const courseTitle =
    searchParams.get("title") || `Course ${searchParams.get("courseId")}`;

  useEffect(() => {
    const savePurchase = async () => {
      if (hasSaved.current) return; // 🔥 prevent duplicate
      hasSaved.current = true;

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_BASE_URL}/api/users/purchase-course`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              courseId: Number(courseId),
              courseTitle,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Purchase failed:", data.message);
        }

        // ✅ small delay for UX
        setTimeout(() => {
          navigate("/courses", { state: { activeTab: "my-courses" } });
        }, 1500);
      } catch (error) {
        console.error("Error saving purchase:", error);

        // still redirect
        navigate("/courses", { state: { activeTab: "my-courses" } });
      }
    };

    if (courseId) {
      savePurchase();
    }
  }, [courseId, courseTitle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h1 className="text-xl font-bold text-green-600">
        Payment Successful 🎉
      </h1>
      <p className="text-gray-500">
        Enrolling you into the course...
      </p>
    </div>
  );
};

export default Success;