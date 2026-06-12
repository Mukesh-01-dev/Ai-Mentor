import { Course, AdminNotification, Module, Lesson, User } from "../models/index.js";
import { Op, Sequelize } from "sequelize";

// Valid status values
const VALID_STATUSES = ["published", "disabled", "deleted"];

/**
 * @desc    Get all courses (admin sees ALL statuses)
 * @route   GET /api/admin/courses
 * @access  Private
 */
export const getAllCourses = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const courses = await Course.findAll({
      where,
      attributes: ["id", "title", "category", "priceValue", "currency", "status", "createdAt", "updatedAt"],
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
    const enrolledUsers = await User.findAll({
      where: Sequelize.literal(`"purchasedCourses"::jsonb @> '[{"courseId": ${Number(id)}}]'`),
      attributes: ["id", "name", "purchasedCourses"],
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
 * @desc    Get enrolled users for a specific course with pagination
 * @route   GET /api/admin/courses/:id/enrollments?page=1&limit=10
 * @access  Private
 *
 * NOTE: Enrollment data is stored as JSONB in User.purchasedCourses rather than
 * in a relational join table, so we cannot apply SQL LIMIT/OFFSET before the
 * filter step. We fetch all users, filter the enrolled subset, then slice
 * in-memory — consistent with how every other handler that touches this field
 * works (e.g. deleteCourseHard).
 */
export const getCourseEnrollments = async (req, res) => {
  try {
    const { id } = req.params;

    // Pagination params (mirrors getAllUsers in userController.js)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate the course exists before reporting enrollments, so a bad/unknown
    // id returns 404 instead of a misleading empty enrollment list.
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const enrolledUsers = await User.findAll({
      where: Sequelize.literal(`"purchasedCourses"::jsonb @> '[{"courseId": ${Number(id)}}]'`),
      attributes: ["id", "name", "email", "purchasedCourses"],
    });

    const totalEnrolled = enrolledUsers.length;
    const totalPages = Math.ceil(totalEnrolled / limit) || 1;

    // Apply in-memory pagination on the filtered list
    const paginatedUsers = enrolledUsers.slice(offset, offset + limit);
    res.status(200).json({
      success: true,
      courseId: id,
      enrolledCount: totalEnrolled,
      currentPage: page,
      totalPages,
      limit,
      enrolledUsers: paginatedUsers.map((u) => {
        // Surface when the user enrolled, using the purchaseDate stored on the
        // matching purchasedCourses entry (set at purchase time).
        const enrollment = (u.purchasedCourses || []).find(
          (c) => Number(c.courseId) === Number(id)
        );
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          enrolledAt: enrollment?.purchaseDate ?? null,
        };
      }),
    });
  } catch (error) {
    console.error("GET COURSE ENROLLMENTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Get Course Syllabus (Modules and Lessons)
 * @route   GET /api/admin/courses/:id/learning
 * @access  Private
 */
export const getCourseSyllabus = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const modules = await Module.findAll({
      where: { courseId },
      order: [["order", "ASC"], ["createdAt", "ASC"]],
      include: [
        {
          model: Lesson,
          as: "lessons",
        },
      ],
    });

    // Ensure lessons are sorted inside modules
    const formattedModules = modules.map((mod) => {
      const plainMod = mod.get({ plain: true });
      if (plainMod.lessons) {
        plainMod.lessons.sort((a, b) => a.order - b.order || new Date(a.createdAt) - new Date(b.createdAt));
      }
      return plainMod;
    });

    res.json({
      modules: formattedModules,
      course: {
        id: course.id,
        title: course.title,
        subtitle: course.category,
      },
    });
  } catch (error) {
    console.error("GET COURSE SYLLABUS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Generate Course Syllabus with AI
 * @route   POST /api/admin/courses/:id/generate-syllabus
 * @access  Private
 */
export const generateCourseSyllabusWithAI = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Call Python AI Service
    const aiUrl = `${process.env.AI_SERVICE_URL}/generate-syllabus`;
    const aiResponse = await fetch(aiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_title: course.title,
        category: course.category
      }),
    });

    if (!aiResponse.ok) {
      return res.status(500).json({ message: "AI Service failed to generate syllabus. Please make sure the python server is running." });
    }

    const data = await aiResponse.json();
    if (data.error) {
      return res.status(500).json({ message: data.error });
    }

    // Insert into DB
    let moduleOrder = 1;
    for (const mod of data.modules) {
      const newModule = await Module.create({
        courseId: course.id,
        title: mod.title,
        order: moduleOrder++
      });

      let lessonOrder = 1;
      for (const les of mod.lessons) {
        await Lesson.create({
          moduleId: newModule.id,
          title: les.title,
          duration: les.duration || "5 mins",
          type: les.type || "video",
          order: lessonOrder++
        });
      }
    }

    res.json({ message: "Syllabus generated successfully", data: data });
  } catch (error) {
    console.error("GENERATE SYLLABUS ERROR:", error.message);
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
      return res.status(500).json({ message: "Python AI Server is not running. Please start it with start_ai.bat" });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
