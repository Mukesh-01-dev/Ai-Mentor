import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../models/Course.js"; // kept for future use
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   GET ALL COURSES 
========================= */
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
    res.json(courses);
  } catch (error) {
    console.error("GET COURSES JSON ERROR:", error);
    res.status(500).json({ message: "Failed to load courses" });
  }
};

/* =========================
   GET COURSE BY ID 
========================= */
const getCourseById = async (req, res) => {
  try {

    const course = await Course.findOne({ id: Number(req.params.id) });
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
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const courseIds = user.purchasedCourses.map(c => Number(c.courseId));

    // one DB query only
    const courses = await Course.find({ id: { $in: courseIds } });

    const result = user.purchasedCourses.map(c => {
      const course = courses.find(co => co.id === Number(c.courseId));
      if (!course) return null;
      let totalLessons = 0;
      if (course?.modules?.length) {
        course.modules.forEach(m => {
          if (m.lessons?.length) {
            totalLessons += m.lessons.length;
          }
        });
      }

      const completedLessons =
        c.progress?.completedLessons?.length || 0;

      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        courseId: c.courseId,
        title: c.courseTitle,
        image:  course?.image,
        progress,
        lessons: course?.lessons,
        level: course?.level,
        price: course?.price ,
        students: course?.students,
        rating: course?.rating,
      };
    }).filter(Boolean);

    res.json(result);
  } catch (err) {
    console.error("GET MY COURSES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//@desc Purchase a Course 
//@Route POST/api/courses/purchase
//@access Private 


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
    const { id, title, category, level, rating, students, lessons, price, image } = req.body;

    if (!id || !title || !category || !level || !price || !image || !rating || !students || !lessons) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const course = await Course.create({ id, title, category, level, rating, students, lessons, price, image });
    res.status(201).json(course);
  } catch (error) {
    console.log("Courses not aded", error);
    res.status(501).json({ message: "addCourse not added" });
  }
};

const updateCourse = async (req, res) => {
  try {
    const updated = await Course.findByIdOneUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!updated)
      return res.status(404).json({ msg: "Course not found" })
    res.json(updated);
  } catch (error) {
    console.error("UPDATE COURSE ERROR:", err);
    res.status(500).json({ message: "Failed to update course" });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

const updateLessonVideo = async (req, res) => {
  res.status(500).json({ message: "Failed to update course" });

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
  updateCourse,
};
