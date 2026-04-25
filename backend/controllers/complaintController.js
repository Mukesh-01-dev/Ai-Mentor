import Complaint from "../models/Complaint.js";
import Report from "../models/Report.js";
import CommunityPost from "../models/CommunityPost.js";
import User from "../models/User.js";

const allowedPriorities = new Set(["low", "medium", "high"]);

const createComplaint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { subject, message, priority } = req.body || {};
    if (!subject || !message) {
      return res.status(400).json({ message: "subject and message are required" });
    }

    const complaint = await Complaint.create({
      userId: req.user.id,
      subject: String(subject).trim(),
      message: String(message).trim(),
      priority: allowedPriorities.has(priority) ? priority : "medium",
      status: "open",
    });

    return res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    console.error("CREATE COMPLAINT ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const complaints = await Complaint.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, data: complaints });
  } catch (error) {
    console.error("GET MY COMPLAINTS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all complaints and reports for admin (unified view)
const getAllComplaintsAndReports = async (req, res) => {
  try {
    const { search = "", status = "", limit = "200" } = req.query;

    // Fetch general complaints
    const whereClause = {};
    if (status) whereClause.status = status;

    const complaints = await Complaint.findAll({
      where: whereClause,
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
    });

    // Fetch pending reports
    const reports = await Report.findAll({
      where: { status: "pending" },
      include: [
        { model: User, as: "reporter", attributes: ["id", "name", "email"] },
        {
          model: CommunityPost,
          as: "post",
          attributes: ["id", "content", "replies", "userId"],
          include: [{ model: User, as: "author", attributes: ["id", "name"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format reports as complaints for unified display
    const formattedReports = reports.map((r) => ({
      id: r.id,
      type: "report",
      user: r.reporter,
      subject: r.replyId ? "Reported Comment" : "Reported Discussion Post",
      message: r.description || `Reason: ${r.reason}`,
      priority: "high", // Reports are high priority
      status: r.status,
      reason: r.reason,
      action: r.action,
      reportId: r.id,
      postId: r.postId,
      replyId: r.replyId,
      post: r.post,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    // Format complaints
    const formattedComplaints = complaints.map((c) => ({
      id: c.id,
      type: "complaint",
      user: c.user,
      subject: c.subject,
      message: c.message,
      priority: c.priority,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    // Combine and sort by date
    const allItems = [...formattedReports, ...formattedComplaints].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Apply search filter
    const filtered = allItems.filter((item) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        item.subject.toLowerCase().includes(searchLower) ||
        item.message.toLowerCase().includes(searchLower) ||
        item.user?.name.toLowerCase().includes(searchLower) ||
        item.user?.email.toLowerCase().includes(searchLower)
      );
    });

    return res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("GET ALL COMPLAINTS AND REPORTS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    await complaint.save();

    return res.json({ success: true, data: complaint });
  } catch (error) {
    console.error("UPDATE COMPLAINT STATUS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Handle report moderation (for reports in complaints view)
const moderateReport = async (req, res) => {
  try {
    const { action } = req.body;
    const { id } = req.params;

    if (!["hidden", "deleted", "dismissed"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const report = await Report.findByPk(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const post = await CommunityPost.findByPk(report.postId);

    if (action === "hidden") {
      if (post) {
        if (report.replyId) {
          const replies = (post.replies || []).map((r) =>
            String(r.id) === String(report.replyId) ? { ...r, hidden: true } : r
          );
          post.replies = replies;
          post.changed("replies", true);
          await post.save();
        } else {
          post.hiddenAt = new Date().toISOString();
          post.changed("hiddenAt", true);
          await post.save();
        }
      }
    }

    if (action === "deleted") {
      if (post) {
        if (report.replyId) {
          const replies = (post.replies || []).filter((r) => String(r.id) !== String(report.replyId));
          post.replies = replies;
          post.changed("replies", true);
          await post.save();
        } else {
          await Report.destroy({ where: { postId: report.postId } });
          await post.destroy();
        }
      }
    }

    // Mark report and related reports as resolved
    const reportsToResolve = await Report.findAll({
      where: report.replyId
        ? { postId: report.postId, replyId: report.replyId, status: "pending" }
        : action === "deleted"
          ? { postId: report.postId, status: "pending" }
          : { postId: report.postId, replyId: null, status: "pending" },
    });

    await Report.update(
      { status: "resolved", action },
      { where: { id: reportsToResolve.map((r) => r.id) } }
    );

    return res.json({ success: true, message: `Report ${action} successfully` });
  } catch (error) {
    console.error("MODERATE REPORT ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export { createComplaint, getMyComplaints, getAllComplaintsAndReports, updateComplaintStatus, moderateReport };
