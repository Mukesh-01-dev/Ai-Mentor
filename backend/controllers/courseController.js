import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../models/Course.js"; // kept for future use

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   GET ALL COURSES (JSON)
========================= */
const getCourses = async (req, res) => {
  try {
    const coursesPath = path.join(
      __dirname,
      "../../frontend/public/data/courses.json"
    );

    const rawData = fs.readFileSync(coursesPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    const courses = (jsonData.popularCourses || []).map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      level: course.level,
      lessons: course.lessons,
      lessonsCount: course.lessonsCount ||
        (course.lessons.includes(" of ")
          ? parseInt(course.lessons.split(" of ")[1])
          : parseInt(course.lessons.split(" ")[0])),
      price: course.price,
      rating: course.rating,
      students: course.students,
      image: course.image,
    }));

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
    const coursesPath = path.join(
      __dirname,
      "../../frontend/public/data/courses.json"
    );

    const rawData = fs.readFileSync(coursesPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    const course = jsonData.popularCourses.find(
      (c) => c.id === Number(req.params.id)
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const mappedCourse = {
      ...course,
      lessonsCount: course.lessonsCount ||
        (course.lessons.includes(" of ")
          ? parseInt(course.lessons.split(" of ")[1])
          : parseInt(course.lessons.split(" ")[0])),
    };

    res.json(mappedCourse);
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

    const coursesPath = path.join(
      __dirname,
      "../../frontend/public/data/courses.json"
    );

    const rawData = fs.readFileSync(coursesPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    const purchasedIds =
      req.user.purchasedCourses?.map((c) => Number(c.courseId)) || [];

    const myCourses = (jsonData.popularCourses || [])
      .filter((course) => purchasedIds.includes(course.id))
      .map((course) => ({
        id: course.id,
        title: course.title,
        category: course.category,
        level: course.level,
        lessons: course.lessons,
        lessonsCount:
          course.lessonsCount ||
          (course.lessons.includes(" of ")
            ? parseInt(course.lessons.split(" of ")[1])
            : parseInt(course.lessons.split(" ")[0])),
        image: course.image,
      }));

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
  // res.status(501).json({ message: "Not implemented yet" });
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



const getStatsCards = async (req, res) => {
  res.json({
    totalCourses: 0,
    completedCourses: 0,
    hoursLearned: 0,
    certificates: 0,
  });
};

const addCourse = async (req, res) => {
  try {
    const coursesPath = path.join(
      __dirname,
      "../../frontend/public/data/courses.json"
    );

    const rawData = fs.readFileSync(coursesPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    const newCourse = req.body;

    // Ensure array exists
    if (!jsonData.popularCourses) {
      jsonData.popularCourses = [];
    }

    // Push new course
    jsonData.popularCourses.push(newCourse);

    // Save back to file
    fs.writeFileSync(
      coursesPath,
      JSON.stringify(jsonData, null, 2),
      "utf-8"
    );

    res.status(201).json({
      message: "Course added successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("ADD COURSE ERROR:", error);
    res.status(500).json({ message: "Failed to add course" });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const coursesPath = path.join(
      __dirname,
      "../../frontend/public/data/courses.json"
    );

    const rawData = fs.readFileSync(coursesPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    const courseId = Number(req.params.id);

    jsonData.popularCourses = jsonData.popularCourses.filter(
      (c) => c.id !== courseId
    );

    fs.writeFileSync(
      coursesPath,
      JSON.stringify(jsonData, null, 2),
      "utf-8"
    );

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
};

const updateLessonVideo = async (req, res) => {
  res.status(501).json({ message: "updateLessonVideo not implemented" });
};

const addSubtopics = async (req, res) => {
  res.status(501).json({ message: "addSubtopics not implemented" });
};

const addLessons = async (req, res) => {
  res.status(501).json({ message: "addLessons not implemented" });
};

const addModules = async (req, res) => {
  try {
    const learningPath = path.join(
      __dirname,
      "../../frontend/public/data/learning.json"
    );

    const raw = fs.readFileSync(learningPath, "utf-8");
    const jsonData = JSON.parse(raw);

    const courseId = req.params.id;
    const { modules } = req.body;

    if (!jsonData[courseId]) {
      jsonData[courseId] = {
        course: { id: Number(courseId) },
        modules: [],
      };
    }

    if (!jsonData[courseId].modules) {
      jsonData[courseId].modules = [];
    }

    // ✅ FIX HERE
    const formattedModules = modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      lessons: [],
    }));

    jsonData[courseId].modules.push(...formattedModules);

    fs.writeFileSync(learningPath, JSON.stringify(jsonData, null, 2));

    res.json({ message: "Modules added to learning page!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add modules" });
  }
};

/* =========================
   EXPORTS
========================= */
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
