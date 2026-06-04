
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";
import AdminNotification from "../models/AdminNotification.js";
import CourseReport from "../models/CourseReport.js";

export const createReport = async (req, res) => {
  try {
    const { reportType, subType, description, courseName, email, phone } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const report = await CourseReport.create({
      userId: req.user.id,
      reportType,
      subType,
      description,
      courseName: courseName || null,
      email: email || null,
      phone: phone || null,
    });

    const admins = await User.findAll({ where: { role: "admin" } });
    const reporterName = req.user?.name || "A user";
    const subTypeLabel = subType ? ` (${subType})` : "";
    const courseLabel = courseName ? ` for course "${courseName}"` : "";
    const descriptionLabel = description ? `: "${description.slice(0, 100)}${description.length > 100 ? "..." : ""}"` : "";
    const message = `${reporterName} reported a course issue${courseLabel}${subTypeLabel}${descriptionLabel}`;

    for (const admin of admins) {
      await createNotification(admin.id, {
        title: "Course Report Submitted",
        message,
        type: "security",
        metadata: {
          reportId: report.id,
          reportType,
          subType,
          courseName,
        },
      });
    }

    // Also notify the admin dashboard
    await AdminNotification.create({
      title: "Course Report Submitted",
      message,
      type: "report",
    });
    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};