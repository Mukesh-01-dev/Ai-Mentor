import { CourseReports } from "../models/CourseReports.js";
import { User, Notification } from "../models/index.js";

CourseReports.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["pending", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    if (status === "rejected" && (!reason || !String(reason).trim())) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const report = await CourseReports.findByPk(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    report.status = status;
    await report.save();

    if (status === "resolved" || status === "rejected") {
      const title =
        status === "resolved"
          ? "Your report has been resolved"
          : "Your report was rejected";

      const baseMessage =
        status === "resolved"
          ? `Your report on "${report.courseName}" has been reviewed and marked as resolved.`
          : `Your report on "${report.courseName}" was rejected. Reason: ${reason}`;

      try {
        await Notification.create({
          userId: report.userId,
          title,
          message: baseMessage,
          type: "account",
          metadata: {
            reportId: report.id,
            status,
            ...(status === "rejected" ? { reason } : {}),
          },
        });
      } catch (notifyErr) {
        console.error("REPORT NOTIFICATION ERROR:", notifyErr.message);
      }
    }

    res.status(200).json({
      message: "Report updated successfully",
      data: report,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await CourseReports.findByPk(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    await report.destroy();

    res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllCourseReports = async (req, res) => {
  try {
    const reports = await CourseReports.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      data: reports,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
