import { AdminNotification, Course, User, Admin } from "../models/index.js";

const ensureNotificationSeed = async () => {
  await AdminNotification.sync();
  if (await AdminNotification.count() > 0) return;
  const [latestCourse, latestUser, latestAdmin] = await Promise.all([
    Course.findOne({ attributes: ["title", "createdAt"], order: [["createdAt", "DESC"]] }),
    User.findOne({ attributes: ["name", "createdAt"], order: [["createdAt", "DESC"]] }),
    Admin.findOne({ attributes: ["name", "createdAt"], order: [["createdAt", "DESC"]] }),
  ]);
  const seedRows = [];
  if (latestUser) seedRows.push({ title: "New user joined", message: `${latestUser.name || "A user"} created a new account.`, type: "user", unread: true, createdAt: latestUser.createdAt, updatedAt: latestUser.createdAt });
  if (latestCourse) seedRows.push({ title: "Course update", message: `${latestCourse.title || "A course"} is available in catalog.`, type: "course", unread: true, createdAt: latestCourse.createdAt, updatedAt: latestCourse.createdAt });
  if (latestAdmin) seedRows.push({ title: "Admin activity", message: `${latestAdmin.name || "An admin"} has admin access.`, type: "admin", unread: false, createdAt: latestAdmin.createdAt, updatedAt: latestAdmin.createdAt });
  if (seedRows.length === 0) seedRows.push({ title: "Welcome", message: "Notification center is now active.", type: "system", unread: false });
  await AdminNotification.bulkCreate(seedRows);
};

export const getAdminNotifications = async (req, res) => {
  try {
    await ensureNotificationSeed();
    const notifications = await AdminNotification.findAll({ order: [["createdAt", "DESC"]], limit: 30 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await AdminNotification.update({ unread: false }, { where: { unread: true } });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await AdminNotification.findByPk(id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    notification.unread = false;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    await AdminNotification.destroy({ where: {} });
    res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
