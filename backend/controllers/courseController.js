import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../models/Course.js"; // kept for future use
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coursesPath = path.join(__dirname, "../../frontend/public/data/courses.json");
const learningPath = path.join(__dirname, "../../frontend/public/data/learning.json");

const readJson = (targetPath, fallback) => {
  if (!fs.existsSync(targetPath)) return fallback;
  const raw = fs.readFileSync(targetPath, "utf-8");
  return JSON.parse(raw);
};

const writeJson = (targetPath, data) => {
  fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), "utf-8");
};

const lessonsCountFromCourse = (course) => {
  if (typeof course.lessonsCount === "number") return course.lessonsCount;
  if (typeof course.lessons === "string") {
    const ofMatch = course.lessons.match(/of\s+(\d+)/i);
    if (ofMatch) return Number(ofMatch[1]);
    const numberMatch = course.lessons.match(/(\d+)/);
    if (numberMatch) return Number(numberMatch[1]);
  }
  return 0;
};

const lessonsCountFromLearning = (learningCourse) =>
  (learningCourse?.modules || []).reduce(
    (total, moduleItem) => total + (moduleItem.lessons || []).length,
    0
  );

const parsePriceValue = (priceValue, priceLabel) => {
  if (typeof priceValue === "number" && Number.isFinite(priceValue)) return priceValue;
  if (!priceLabel) return 0;
  const cleaned = String(priceLabel).replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toCourseResponse = (course) => ({
  id: course.id,
  title: course.title,
  category: course.category,
  level: course.level,
  lessons: course.lessons,
  lessonsCount: lessonsCountFromCourse(course),
  price: course.price,
  priceValue: parsePriceValue(course.priceValue, course.price),
  currency: course.currency || "INR",
  rating: course.rating,
  students: course.students,
  studentsCount: course.studentsCount || 0,
  image: course.image,
  categoryColor: course.categoryColor || "bg-blue-100 text-blue-600",
  modules: course.modules || [],
  subtopics: course.subtopics || [],
  createdAt: course.createdAt || null,
  updatedAt: course.updatedAt || null,
});

const syncCourseLessonMeta = (course, learningData) => {
  const count = lessonsCountFromLearning(learningData);
  course.lessonsCount = count;
  course.lessons = `${count} lessons`;
  course.updatedAt = new Date().toISOString();
};

const ensureLearningCourse = (learningData, course) => {
  const key = String(course.id);
  if (!learningData[key]) {
    learningData[key] = {
      modules: [],
      course: {
        title: course.title,
        subtitle: "Complete Course",
        logo: course.image || "",
        progress: 0,
      },
      currentLesson: null,
    };
  }
  if (!Array.isArray(learningData[key].modules)) learningData[key].modules = [];
  if (!learningData[key].course) {
    learningData[key].course = {
      title: course.title,
      subtitle: "Complete Course",
      logo: course.image || "",
      progress: 0,
    };
  }
  return learningData[key];
};

/* =========================
   GET ALL COURSES (JSON)
========================= */
const getCourses = async (_req, res) => {
  try {
    const jsonData = readJson(coursesPath, { popularCourses: [] });
    const courses = (jsonData.popularCourses || []).map(toCourseResponse);
    res.json(courses);
  } catch (error) {
    console.error("GET COURSES JSON ERROR:", error);
    res.status(500).json({ message: "Failed to load courses" });
  }
};

/* =========================
   GET COURSE BY ID (JSON)
========================= */
const getCourseById = async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const jsonData = readJson(coursesPath, { popularCourses: [] });
    const course = (jsonData.popularCourses || []).find((c) => Number(c.id) === courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(toCourseResponse(course));
  } catch (error) {
    console.error("GET COURSE BY ID ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET MY COURSES (SAFE)
========================= */
const getMyCourses = async (req, res) => {
  try {
    if (!req.user) {
      return res.json([]);
    }

    const jsonData = readJson(coursesPath, { popularCourses: [] });
    const purchasedIds = req.user.purchasedCourses?.map((c) => Number(c.courseId)) || [];

    const myCourses = (jsonData.popularCourses || [])
      .filter((course) => purchasedIds.includes(Number(course.id)))
      .map(toCourseResponse);

    res.json(myCourses);
  } catch (error) {
    console.error("MY COURSES ERROR:", error);
    res.json([]);
  }
};

/* =========================
   Learning Data
========================= */
const getCourseLearningData = async (req, res) => {
  try {
    const learningData = readJson(learningPath, {});
    const id = String(Number(req.params.id));
    const learning = learningData[id];

    if (!learning) {
      return res.status(404).json({ message: "Learning data not found" });
    }

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
    const learningData = readJson(learningPath, {});
    const courseData = learningData[String(courseId)];
    if (!courseData) return null;

    const courseTitle = courseData.course?.title;
    if (!courseTitle) return null;

    const lesson = (courseData.modules || [])
      .flatMap((moduleItem) => moduleItem.lessons || [])
      .find((item) => String(item.id) === String(lessonId));

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

const getStatsCards = async (_req, res) => {
  res.json({
    totalCourses: 0,
    completedCourses: 0,
    hoursLearned: 0,
    certificates: 0,
  });
};

/* =========================
   ADMIN: Add Course
========================= */
const addCourse = async (req, res) => {
  try {
    const {
      id,
      title,
      category,
      level = "Beginner",
      lessons = "0 lessons",
      lessonsCount,
      price = "INR 0",
      priceValue,
      rating = 0,
      students = "0 students",
      studentsCount = 0,
      image = "",
      categoryColor = "bg-blue-100 text-blue-600",
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: "title and category are required" });
    }

    const coursesData = readJson(coursesPath, { popularCourses: [], courseCards: [], statsCards: [] });
    const learningData = readJson(learningPath, {});

    const existingIds = (coursesData.popularCourses || []).map((c) => Number(c.id));
    const nextId = id ? Number(id) : (existingIds.length ? Math.max(...existingIds) + 1 : 1);

    if (existingIds.includes(nextId)) {
      return res.status(409).json({ message: "Course id already exists" });
    }

    const now = new Date().toISOString();
    const newCourse = {
      id: nextId,
      title: String(title).trim(),
      category: String(category).trim(),
      categoryColor,
      lessons,
      lessonsCount: Number.isFinite(Number(lessonsCount))
        ? Number(lessonsCount)
        : lessonsCountFromCourse({ lessons }),
      level: String(level),
      price: String(price),
      priceValue: parsePriceValue(priceValue, price),
      currency: "INR",
      rating: Number(rating) || 0,
      students: String(students),
      studentsCount: Number(studentsCount) || 0,
      image: String(image || ""),
      isBookmarked: false,
      modules: [],
      subtopics: [],
      createdAt: now,
      updatedAt: now,
    };

    coursesData.popularCourses = [...(coursesData.popularCourses || []), newCourse];
    ensureLearningCourse(learningData, newCourse);

    writeJson(coursesPath, coursesData);
    writeJson(learningPath, learningData);

    res.status(201).json({ message: "Course added successfully", course: toCourseResponse(newCourse) });
  } catch (error) {
    console.error("ADD COURSE ERROR:", error);
    res.status(500).json({ message: "Failed to add course" });
  }
};

/* =========================
   ADMIN: Delete Course
========================= */
const deleteCourse = async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    if (!Number.isFinite(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const coursesData = readJson(coursesPath, { popularCourses: [], courseCards: [], statsCards: [] });
    const learningData = readJson(learningPath, {});

    const beforeCount = (coursesData.popularCourses || []).length;
    coursesData.popularCourses = (coursesData.popularCourses || []).filter(
      (c) => Number(c.id) !== courseId
    );
    coursesData.courseCards = (coursesData.courseCards || []).filter(
      (c) => Number(c.id) !== courseId
    );

    if (beforeCount === coursesData.popularCourses.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    delete learningData[String(courseId)];

    const users = await User.findAll();
    await Promise.all(
      users.map(async (user) => {
        const nextCourses = (user.purchasedCourses || []).filter(
          (item) => Number(item.courseId) !== courseId
        );
        if (nextCourses.length !== (user.purchasedCourses || []).length) {
          user.purchasedCourses = nextCourses;
          user.changed("purchasedCourses", true);
          await user.save();
        }
      })
    );

    writeJson(coursesPath, coursesData);
    writeJson(learningPath, learningData);

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
};

/* =========================
   ADMIN: Update Lesson Video
========================= */
const updateLessonVideo = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const lessonId = String(req.params.lessonId);
    const { youtubeUrl } = req.body;

    if (!youtubeUrl || !String(youtubeUrl).trim()) {
      return res.status(400).json({ message: "youtubeUrl is required" });
    }

    const learningData = readJson(learningPath, {});
    const learningCourse = learningData[String(courseId)];
    if (!learningCourse) {
      return res.status(404).json({ message: "Course learning data not found" });
    }

    let updated = false;
    learningCourse.modules = (learningCourse.modules || []).map((moduleItem) => {
      const nextLessons = (moduleItem.lessons || []).map((lesson) => {
        if (String(lesson.id) === lessonId) {
          updated = true;
          return { ...lesson, youtubeUrl: String(youtubeUrl).trim() };
        }
        return lesson;
      });
      return { ...moduleItem, lessons: nextLessons };
    });

    if (!updated) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (learningCourse.currentLesson && String(learningCourse.currentLesson.id) === lessonId) {
      learningCourse.currentLesson = {
        ...learningCourse.currentLesson,
        youtubeUrl: String(youtubeUrl).trim(),
      };
    }

    writeJson(learningPath, learningData);
    res.json({ message: "Lesson video URL updated successfully" });
  } catch (error) {
    console.error("UPDATE LESSON VIDEO ERROR:", error);
    res.status(500).json({ message: "Failed to update lesson video" });
  }
};

/* =========================
   ADMIN: Add Subtopics
========================= */
const addSubtopics = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const { subtopics } = req.body;

    if (!Array.isArray(subtopics) || subtopics.length === 0) {
      return res.status(400).json({ message: "subtopics array is required" });
    }

    const coursesData = readJson(coursesPath, { popularCourses: [] });
    const course = (coursesData.popularCourses || []).find((c) => Number(c.id) === courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const normalized = subtopics
      .map((item) => ({
        title: String(item.title || "").trim(),
        goal: String(item.goal || "").trim(),
        topics: Array.isArray(item.topics)
          ? item.topics.map((topic) => String(topic).trim()).filter(Boolean)
          : [],
        tools: Array.isArray(item.tools)
          ? item.tools.map((tool) => String(tool).trim()).filter(Boolean)
          : [],
        activities: Array.isArray(item.activities)
          ? item.activities.map((activity) => String(activity).trim()).filter(Boolean)
          : [],
        assignment: String(item.assignment || "").trim(),
        activity: String(item.activity || "").trim(),
      }))
      .filter((item) => item.title);

    if (normalized.length === 0) {
      return res.status(400).json({ message: "At least one valid subtopic is required" });
    }

    course.subtopics = [...(course.subtopics || []), ...normalized];
    course.updatedAt = new Date().toISOString();

    writeJson(coursesPath, coursesData);
    res.json({ message: "Subtopics added successfully", subtopics: course.subtopics });
  } catch (error) {
    console.error("ADD SUBTOPICS ERROR:", error);
    res.status(500).json({ message: "Failed to add subtopics" });
  }
};

/* =========================
   ADMIN: Add Lessons
========================= */
const addLessons = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const moduleId = String(req.params.moduleId);
    const { lessons } = req.body;

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({ message: "lessons array is required" });
    }

    const coursesData = readJson(coursesPath, { popularCourses: [] });
    const learningData = readJson(learningPath, {});
    const course = (coursesData.popularCourses || []).find((c) => Number(c.id) === courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const learningCourse = ensureLearningCourse(learningData, course);
    const targetModule = (learningCourse.modules || []).find(
      (moduleItem) => String(moduleItem.id) === moduleId
    );

    if (!targetModule) {
      return res.status(404).json({ message: "Module not found" });
    }

    const existingIds = new Set((targetModule.lessons || []).map((item) => String(item.id)));
    const normalizedLessons = lessons
      .map((item, index) => {
        const fallbackId = `${moduleId}-lesson-${(targetModule.lessons || []).length + index + 1}`;
        return {
          id: String(item.id || fallbackId),
          title: String(item.title || "").trim(),
          duration: String(item.duration || "10 min"),
          completed: false,
          playing: false,
          type: item.type === "document" ? "document" : "video",
          ...(item.youtubeUrl ? { youtubeUrl: String(item.youtubeUrl).trim() } : {}),
        };
      })
      .filter((item) => item.title && !existingIds.has(String(item.id)));

    if (normalizedLessons.length === 0) {
      return res.status(400).json({ message: "No valid new lessons to add" });
    }

    targetModule.lessons = [...(targetModule.lessons || []), ...normalizedLessons];
    if (!learningCourse.currentLesson) {
      const first = normalizedLessons[0];
      learningCourse.currentLesson = {
        id: first.id,
        title: first.title,
        module: targetModule.title,
        youtubeUrl: first.youtubeUrl || "",
        content: {
          introduction: `${first.title} lesson content`,
          keyConcepts: [],
        },
      };
    }

    syncCourseLessonMeta(course, learningCourse);
    writeJson(coursesPath, coursesData);
    writeJson(learningPath, learningData);

    res.json({ message: "Lessons added successfully", lessons: targetModule.lessons });
  } catch (error) {
    console.error("ADD LESSONS ERROR:", error);
    res.status(500).json({ message: "Failed to add lessons" });
  }
};

/* =========================
   ADMIN: Add Modules
========================= */
const addModules = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const { modules } = req.body;

    if (!Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({ message: "modules array is required" });
    }

    const coursesData = readJson(coursesPath, { popularCourses: [] });
    const learningData = readJson(learningPath, {});
    const course = (coursesData.popularCourses || []).find((c) => Number(c.id) === courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const learningCourse = ensureLearningCourse(learningData, course);
    const existingIds = new Set((learningCourse.modules || []).map((item) => String(item.id)));

    const normalizedModules = modules
      .map((item, index) => {
        const fallbackId = `module-${(learningCourse.modules || []).length + index + 1}`;
        return {
          id: String(item.id || fallbackId),
          title: String(item.title || "").trim(),
          lessons: Array.isArray(item.lessons) ? item.lessons : [],
        };
      })
      .filter((item) => item.title && !existingIds.has(String(item.id)));

    if (normalizedModules.length === 0) {
      return res.status(400).json({ message: "No valid new modules to add" });
    }

    learningCourse.modules = [...(learningCourse.modules || []), ...normalizedModules];
    syncCourseLessonMeta(course, learningCourse);

    writeJson(coursesPath, coursesData);
    writeJson(learningPath, learningData);

    res.json({ message: "Modules added successfully", modules: learningCourse.modules });
  } catch (error) {
    console.error("ADD MODULES ERROR:", error);
    res.status(500).json({ message: "Failed to add modules" });
  }
};

export {
  getCourses,
  getCourseById,
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
