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
  getCourseAndLessonTitles,
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
