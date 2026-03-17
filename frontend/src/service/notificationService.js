const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const fetchNotifications = async () => {
  try {
    const response = await fetch(`/api/notifications`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return await response.json();
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    throw error;
  }
};

export const markAsReadApi = async (id) => {
  try {
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to mark notification as read");
    return await response.json();
  } catch (error) {
    console.error("Mark Read Error:", error);
    throw error;
  }
};

export const markAllAsReadApi = async () => {
  try {
    const response = await fetch(`/api/notifications/read-all`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to mark all as read");
    return await response.json();
  } catch (error) {
    console.error("Mark All Read Error:", error);
    throw error;
  }
};

export const clearAllNotificationsApi = async () => {
  try {
    const response = await fetch(`/api/notifications/clear`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to clear notifications");
    return await response.json();
  } catch (error) {
    console.error("Clear Notifications Error:", error);
    throw error;
  }
};
