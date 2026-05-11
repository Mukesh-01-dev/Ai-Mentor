import API from "../lib/api";

// ================= GET ALL =================
export const fetchNotifications = async () => {
  try {
    const res = await API.get("/api/notifications");
    return res.data;
  } catch (error) {
    console.error("Fetch Notifications Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch notifications");
  }
};

// ================= MARK ONE AS READ =================
export const markAsReadApi = async (id) => {
  try {
    const res = await API.patch(`/api/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    console.error("Mark Read Error:", error.response?.data || error.message);
    throw new Error("Failed to mark notification as read");
  }
};

// ================= MARK ALL AS READ =================
export const markAllAsReadApi = async () => {
  try {
    const res = await API.patch("/api/notifications/read-all");
    return res.data;
  } catch (error) {
    console.error("Mark All Read Error:", error.response?.data || error.message);
    throw new Error("Failed to mark all as read");
  }
};

// ================= CLEAR ALL =================
export const clearAllNotificationsApi = async () => {
  try {
    const res = await API.delete("/api/notifications/clear");
    return res.data;
  } catch (error) {
    console.error("Clear Notifications Error:", error.response?.data || error.message);
    throw new Error("Failed to clear notifications");
  }
};