import { Course, AdminNotification } from "../models/index.js";

// Valid status values
const VALID_STATUSES = ["published", "disabled", "deleted"];

/**
 * @desc    Get all courses (admin sees ALL statuses)
 * @route   GET /api/admin/courses
 * @access  Private
 */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: ["id", "title", "category", "priceValue", "currency", "status", "deletedAt", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("GET COURSES ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/admin/courses
 * @access  Private
 */
export const createCourse = async (req, res) => {
  try {
    const { title, category, priceValue, currency } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    const course = await Course.create({
      title,
      category,
      priceValue: parseFloat(priceValue) || 0,
      currency: currency || "INR",
      status: "published",
    });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Update course status (published / disabled / deleted)
 * @route   PATCH /api/admin/courses/:id/status
 * @access  Private (delete requires superadmin)
 */
export const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    // Soft-deleting requires superadmin
    if (status === "deleted" && req.admin.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can soft-delete courses",
      });
    }

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Update status
    course.status = status;

    // Set or clear deletedAt based on status
    if (status === "deleted") {
      course.deletedAt = new Date();
    } else {
      course.deletedAt = null;
    }

    await course.save();

    // 🔔 Create notification for the status change
    const statusLabels = {
      published: "Published",
      disabled: "Disabled",
      deleted: "Soft Deleted",
    };
    AdminNotification.create({
      title: `Course ${statusLabels[status] || status}`,
      message: `"${course.title}" has been set to ${statusLabels[status] || status}.`,
      type: "course",
      unread: true,
    }).catch((err) => console.error("Notification error:", err.message));

    console.log(`✅ Course ${id} status changed to: ${status}`);

    res.status(200).json({
      success: true,
      message: `Course status updated to '${status}'`,
      data: course,
    });
  } catch (error) {
    console.error("UPDATE COURSE STATUS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Hard delete a course permanently (superadmin only)
 * @route   DELETE /api/admin/courses/:id
 * @access  Private/SuperAdmin
 *
 * Cascades: Modules → Lessons → LessonContent (via FK CASCADE in modelAssociations)
 * Also cleans up orphaned courseId references in Users.purchasedCourses JSONB
 */
export const deleteCourseHard = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Import User to check enrollments and clean up JSONB
    const { User } = await import("../models/index.js");

    // Check for enrolled users
    const allUsers = await User.findAll({
      attributes: ["id", "name", "purchasedCourses"],
    });

    const enrolledUsers = allUsers.filter((user) => {
      const purchased = user.purchasedCourses || [];
      return purchased.some((c) => Number(c.courseId) === Number(id));
    });

    // If force flag is not set and there are enrolled users, warn admin
    const force = req.query.force === "true";
    if (enrolledUsers.length > 0 && !force) {
      return res.status(409).json({
        success: false,
        message: `${enrolledUsers.length} student(s) are enrolled in this course. Use ?force=true to confirm permanent deletion.`,
        enrolledCount: enrolledUsers.length,
        enrolledUsers: enrolledUsers.map((u) => ({ id: u.id, name: u.name })),
      });
    }

    const courseTitle = course.title;

    // Destroy the course (CASCADE handles Modules → Lessons → LessonContent)
    await course.destroy();

    // 🔔 Create notification for the hard delete
    AdminNotification.create({
      title: "Course Permanently Deleted",
      message: `"${courseTitle}" has been permanently deleted from the database.`,
      type: "course",
      unread: true,
    }).catch((err) => console.error("Notification error:", err.message));

    // Clean up orphaned courseId references from Users.purchasedCourses
    if (enrolledUsers.length > 0) {
      console.log(`🧹 Cleaning up purchasedCourses for ${enrolledUsers.length} users...`);
      for (const user of enrolledUsers) {
        user.purchasedCourses = (user.purchasedCourses || []).filter(
          (c) => Number(c.courseId) !== Number(id)
        );
        await user.save();
      }
      console.log("   ✅ Cleanup complete.");
    }

    console.log(`🗑️ Course "${courseTitle}" (ID: ${id}) permanently deleted.`);

    res.status(200).json({
      success: true,
      message: `Course "${courseTitle}" has been permanently deleted.`,
      cleanedUpUsers: enrolledUsers.length,
    });
  } catch (error) {
    console.error("HARD DELETE COURSE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Get enrolled user count for a specific course (used by delete confirmation modal)
 * @route   GET /api/admin/courses/:id/enrollments
 * @access  Private
 */
export const getCourseEnrollments = async (req, res) => {
  try {
    const { id } = req.params;
    const { User } = await import("../models/index.js");

    const allUsers = await User.findAll({
      attributes: ["id", "name", "email", "purchasedCourses"],
    });

    const enrolledUsers = allUsers.filter((user) => {
      const purchased = user.purchasedCourses || [];
      return purchased.some((c) => Number(c.courseId) === Number(id));
    });

    res.status(200).json({
      success: true,
      courseId: id,
      enrolledCount: enrolledUsers.length,
      enrolledUsers: enrolledUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      })),
    });
  } catch (error) {
    console.error("GET COURSE ENROLLMENTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
