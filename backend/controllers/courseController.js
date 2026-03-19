import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   GET ALL COURSES (Database)
   Optimized: Returns only essential course data without curriculum
========================= */
const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: [
        "id",
        "title",
        "category",
        "level",
        "price",
        "rating",
        "students",
        "image",
        "categoryColor",
      ],
      where: { isActive: true },
      order: [["id", "ASC"]],
    });

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      level: course.level,
      price: `₹${course.price}`,
      rating: course.rating,
      students: `${course.students} students`,
      image: course.image,
      categoryColor: course.categoryColor,
    }));

    res.json(formattedCourses);
  } catch (error) {
    console.error("GET COURSES ERROR:", error);
    res.status(500).json({ message: "Failed to load courses" });
  }
};

/* =========================
   GET COURSE BY ID (Database)
   Optimized: Returns course with modules count, no lessons yet
========================= */
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: Module,
          attributes: ["id", "title", "order"],
          order: [["order", "ASC"]],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      category: course.category,
      level: course.level,
      instructor: course.instructor,
      price: course.price,
      rating: course.rating,
      reviews: course.reviews,
      students: course.students,
      image: course.image,
      thumbnail: course.thumbnail,
      duration: course.duration,
      language: course.language,
      subtitles: course.subtitles,
      tags: course.tags,
      features: course.features,
      whatYouLearn: course.whatYouLearn,
      modulesCount: course.Modules?.length || 0,
      modules: course.Modules || [],
    });
  } catch (error) {
    console.error("GET COURSE BY ID ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET course modules (Database)
   Optimized: Get modules for specific course
========================= */
const getCourseModules = async (req, res) => {
  try {
    const modules = await Module.findAll({
      where: { courseId: req.params.id },
      attributes: ["id", "title", "description", "goal", "order"],
      order: [["order", "ASC"]],
    });

    if (modules.length === 0) {
      return res.status(404).json({ message: "No modules found for this course" });
    }

    res.json(modules);
  } catch (error) {
    console.error("GET COURSE MODULES ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET module lessons (Database)
   Optimized: Get lessons for specific module - LAZY LOADING
========================= */
const getModuleLessons = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    // Verify module belongs to course
    const module = await Module.findOne({
      where: { id: moduleId, courseId },
    });

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const lessons = await Lesson.findAll({
      where: { moduleId },
      attributes: ["id", "title", "duration", "type", "order"],
      order: [["order", "ASC"]],
    });

    res.json({
      moduleId: module.id,
      title: module.title,
      lessonsCount: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error("GET MODULE LESSONS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET lesson details (Database)
   Optimized: Get full lesson content when needed
========================= */
const getLessonDetails = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    // Verify lesson belongs to module which belongs to course
    const lesson = await Lesson.findOne({
      where: { id: lessonId },
      include: [
        {
          model: Module,
          where: { id: moduleId, courseId },
          attributes: ["id", "title"],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      type: lesson.type,
      youtubeUrl: lesson.youtubeUrl,
      documentUrl: lesson.documentUrl,
      content: lesson.content,
      order: lesson.order,
    });
  } catch (error) {
    console.error("GET LESSON DETAILS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET MY COURSES (Database)
========================= */
const getMyCourses = async (req, res) => {
  try {
    if (!req.user) {
      return res.json([]);
    }

    const purchasedIds =
      req.user.purchasedCourses?.map((c) => Number(c.courseId)) || [];

    if (purchasedIds.length === 0) {
      return res.json([]);
    }

    const myCourses = await Course.findAll({
      where: { id: purchasedIds, isActive: true },
      attributes: [
        "id",
        "title",
        "category",
        "level",
        "image",
        "rating",
        "price",
      ],
    });

    res.json(myCourses);
  } catch (error) {
    console.error("MY COURSES ERROR:", error);
    res.json([]);
  }
};

/* =========================
   GET STATS CARDS (Database)
========================= */
const getStatsCards = async (req, res) => {
  try {
    if (!req.user) {
      return res.json([
        {
          icon: "/AI_Tutor_New_UI/Icons/play_button.svg",
          value: "0",
          label: "Courses in Progress",
          bgColor: "bg-purple-50",
          iconBg: "bg-purple-100",
        },
        {
          icon: "/AI_Tutor_New_UI/Icons/check_mark.svg",
          value: "0",
          label: "Completed",
          bgColor: "bg-green-50",
          iconBg: "bg-green-100",
        },
        {
          icon: "/AI_Tutor_New_UI/Icons/time_spent.svg",
          value: "0h",
          label: "Learning Hours",
          bgColor: "bg-blue-50",
          iconBg: "bg-blue-100",
        },
      ]);
    }

    // Get user's learning progress from analytics or user model
    // For now, return default values - integrate with analytics later
    res.json([
      {
        icon: "/AI_Tutor_New_UI/Icons/play_button.svg",
        value: req.user.inProgressCourses?.length || "0",
        label: "Courses in Progress",
        bgColor: "bg-purple-50",
        iconBg: "bg-purple-100",
      },
      {
        icon: "/AI_Tutor_New_UI/Icons/check_mark.svg",
        value: req.user.completedCourses?.length || "0",
        label: "Completed",
        bgColor: "bg-green-50",
        iconBg: "bg-green-100",
      },
      {
        icon: "/AI_Tutor_New_UI/Icons/time_spent.svg",
        value: req.user.learningHours || "0h",
        label: "Learning Hours",
        bgColor: "bg-blue-50",
        iconBg: "bg-blue-100",
      },
    ]);
  } catch (error) {
    console.error("GET STATS CARDS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   LEGACY: GET LEARNING DATA (Direct from JSON for now)
   TODO: Migrate to database later
========================= */
const getCourseLearningData = async (req, res) => {
  try {
    const learningPath = path.join(
      __dirname,
      "../../frontend/public/data/learning.json"
    );

    if (!fs.existsSync(learningPath)) {
      return res.status(404).json({ message: "Learning data not found" });
    }

    const raw = fs.readFileSync(learningPath, "utf-8");
    const jsonData = JSON.parse(raw);

    const id = String(Number(req.params.id));
    const learning = jsonData[id];

    if (!learning) {
      return res.status(404).json({ message: "Learning data not found" });
    }

    // Ensure the course object includes an id
    const courseObj = { ...(learning.course || {}), id: Number(id) };

    res.json({ ...learning, course: courseObj });
  } catch (error) {
    console.error("GET COURSE LEARNING DATA ERROR:", error);
    res.status(500).json({ message: "Failed to load learning data" });
  }
};

/* =================================
  Get Course and Lesson Titles
===================================== */
const getCourseAndLessonTitles = (courseId, lessonId) => {
  try {
    const learningPath = path.join(
      __dirname,
      "../../frontend/public/data/learning.json"
    );

    const raw = fs.readFileSync(learningPath, "utf-8");
    const learningData = JSON.parse(raw);

    // 🔹 courseId is key in JSON
    const courseData = learningData[String(courseId)];

    if (!courseData) return null;

    const courseTitle = courseData.course?.title;

    if (!courseTitle) return null;

    // 🔹 Flatten all modules into lessons
    const lesson = (courseData.modules || [])
      .flatMap((module) => module.lessons || [])
      .find((l) => l.id === lessonId); // IMPORTANT: string compare

    if (!lesson) return null;

    return {
      courseTitle,
      lessonTitle: lesson.title,
    };

  } catch (error) {
    console.error("Error reading learning.json:", error);
    return null;
  }
};

/* =========================
   ADMIN: ADD COURSE
========================= */
const addCourse = async (req, res) => {
  try {
    const { title, subtitle, category, level, price, instructor } = req.body;

    const course = await Course.create({
      title,
      subtitle,
      category,
      level,
      price,
      instructor,
      isActive: true,
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("ADD COURSE ERROR:", error);
    res.status(500).json({ message: "Failed to create course" });
  }
};

/* =========================
   ADMIN: DELETE COURSE
========================= */
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.destroy();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
};

/* =========================
   ADMIN: ADD MODULES
========================= */
const addModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { modules } = req.body;

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const createdModules = await Module.bulkCreate(
      modules.map((mod, index) => ({
        courseId,
        title: mod.title,
        description: mod.description,
        goal: mod.goal,
        order: index + 1,
      }))
    );

    res.status(201).json({
      message: "Modules added successfully",
      modules: createdModules,
    });
  } catch (error) {
    console.error("ADD MODULES ERROR:", error);
    res.status(500).json({ message: "Failed to add modules" });
  }
};

/* =========================
   ADMIN: ADD LESSONS
========================= */
const addLessons = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { lessons } = req.body;

    // Verify module exists and belongs to course
    const module = await Module.findOne({
      where: { id: moduleId, courseId },
    });

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const createdLessons = await Lesson.bulkCreate(
      lessons.map((lesson, index) => ({
        moduleId,
        title: lesson.title,
        duration: lesson.duration,
        type: lesson.type || "video",
        youtubeUrl: lesson.youtubeUrl,
        documentUrl: lesson.documentUrl,
        content: lesson.content,
        order: index + 1,
      }))
    );

    res.status(201).json({
      message: "Lessons added successfully",
      lessons: createdLessons,
    });
  } catch (error) {
    console.error("ADD LESSONS ERROR:", error);
    res.status(500).json({ message: "Failed to add lessons" });
  }
};

/* =========================
   ADMIN: UPDATE LESSON VIDEO
========================= */
const updateLessonVideo = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { youtubeUrl, documentUrl } = req.body;

    const lesson = await Lesson.findOne({
      where: { id: lessonId },
      include: [
        {
          model: Module,
          where: { courseId },
          attributes: ["id"],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await lesson.update({
      youtubeUrl: youtubeUrl || lesson.youtubeUrl,
      documentUrl: documentUrl || lesson.documentUrl,
    });

    res.json({
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (error) {
    console.error("UPDATE LESSON VIDEO ERROR:", error);
    res.status(500).json({ message: "Failed to update lesson" });
  }
};

/* =========================
   ADMIN: ADD SUBTOPICS (LEGACY - can be used for lesson content)
========================= */
const addSubtopics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { subtopics } = req.body;

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update course with subtopics if needed
    res.status(201).json({
      message: "Subtopics added successfully",
    });
  } catch (error) {
    console.error("ADD SUBTOPICS ERROR:", error);
    res.status(500).json({ message: "Failed to add subtopics" });
  }
};

/* =========================
   EXPORTS
========================= */
export {
  getCourses,
  getCourseById,
  getCourseModules,
  getModuleLessons,
  getLessonDetails,
  getCourseLearningData,
  getCourseAndLessonTitles,
  getStatsCards,
  getMyCourses,
  addCourse,
  deleteCourse,
  updateLessonVideo,
  addSubtopics,
  addLessons,
  addModules,
};
