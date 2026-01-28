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

    res.json(course);
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

    const myCourses = (jsonData.popularCourses || []).filter((course) =>
      purchasedIds.includes(course.id)
    );

    res.json(myCourses);
  } catch (error) {
    console.error("MY COURSES ERROR:", error);
    res.json([]);
  }
};

/* =========================
   STUBS
========================= */
const getCourseLearningData = async (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
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
  res.status(501).json({ message: "addCourse not implemented" });
};

const deleteCourse = async (req, res) => {
  res.status(501).json({ message: "deleteCourse not implemented" });
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
  res.status(501).json({ message: "addModules not implemented" });
};

/* =========================
   EXPORTS
========================= */
export {
  getCourses,
  getCourseById,
  getCourseLearningData,
  getStatsCards,
  getMyCourses,
  addCourse,
  deleteCourse,
  updateLessonVideo,
  addSubtopics,
  addLessons,
  addModules,
};
