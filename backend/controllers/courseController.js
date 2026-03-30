import { Course, Module, Lesson, LessonContent } from "../models/modelAssociations.js";

/* =========================
   HELPERS
========================= */

const parseLessonsCount = (lessons) => {
  if (typeof lessons !== "string") return 0;

  try {
    if (lessons.includes(" of ")) {
      const value = parseInt(lessons.split(" of ")[1], 10);
      return Number.isNaN(value) ? 0 : value;
    }

    const value = parseInt(lessons.split(" ")[0], 10);
    return Number.isNaN(value) ? 0 : value;
  } catch {
    return 0;
  }
};

const formatCourse = (course) => ({
  id: course.id,
  title: course.title,
  category: course.category,
  categoryColor: course.categoryColor,
  level: course.level,
  lessons: course.lessons,
  lessonsCount: course.lessonsCount ?? parseLessonsCount(course.lessons),
  price: course.price,
  priceValue: course.priceValue,
  currency: course.currency,
  rating: course.rating,
  students: course.students,
  studentsCount: course.studentsCount,
  image: course.image,
  isBookmarked: course.isBookmarked,
});

/* =========================
   GET ALL COURSES (DB)
========================= */
const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [["createdAt", "ASC"]],
    });

    res.json(courses.map(formatCourse));
  } catch (error) {
    console.error("GET COURSES ERROR:", error);
    res.status(500).json({ message: "Failed to load courses" });
  }
};

/* =========================
   GET COURSE BY ID (DB)
========================= */
const getCourseById = async (req, res) => {
  try {
    const courseId = String(req.params.id);

    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(formatCourse(course));
  } catch (error) {
    console.error("GET COURSE BY ID ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET MY COURSES (DB)
========================= */
const getMyCourses = async (req, res) => {
  try {
    if (!req.user) {
      return res.json([]);
    }

    const purchasedIds =
      req.user.purchasedCourses?.map((c) => String(c.courseId)) || [];

    if (purchasedIds.length === 0) {
      return res.json([]);
    }

    const myCourses = await Course.findAll({
      where: {
        id: purchasedIds,
      },
      order: [["createdAt", "ASC"]],
    });

    res.json(
      myCourses.map((course) => ({
        id: course.id,
        title: course.title,
        category: course.category,
        level: course.level,
        lessons: course.lessons,
        lessonsCount: course.lessonsCount ?? parseLessonsCount(course.lessons),
        image: course.image,
      }))
    );
  } catch (error) {
    console.error("MY COURSES ERROR:", error);
    res.json([]);
  }
};

/* =========================
   GET COURSE LEARNING DATA (DB)
========================= */
const getCourseLearningData = async (req, res) => {
  try {
    const courseId = String(req.params.id);

    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ message: "Learning data not found" });
    }

    const modules = await Module.findAll({
      where: { courseId },
      order: [["order", "ASC"], ["createdAt", "ASC"]],
    });

    const formattedModules = await Promise.all(
      modules.map(async (module) => {
        const lessons = await Lesson.findAll({
          where: { moduleId: module.id },
          include: [
            {
              model: LessonContent,
              as: "content",
              required: false,
            },
          ],
          order: [["order", "ASC"], ["createdAt", "ASC"]],
        });

        return {
          id: module.id,
          title: module.title,
          lessons: lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            completed: lesson.completed,
            playing: lesson.playing,
            type: lesson.type,
            youtubeUrl: lesson.youtubeUrl,
            content: lesson.content
              ? {
                introduction: lesson.content.introduction,
                keyConcepts: lesson.content.keyConcepts,
              }
              : undefined,
          })),
        };
      })
    );

    let currentLesson = null;

    for (const module of formattedModules) {
      const firstLesson = module.lessons?.[0];
      if (firstLesson) {
        currentLesson = {
          ...firstLesson,
          module: module.title,
        };
        break;
      }
    }

    res.json({
      modules: formattedModules,
      course: {
        id: course.id,
        title: course.title,
        subtitle: course.category,
        logo: course.image,
        progress: 0,
      },
      currentLesson,
    });
  } catch (error) {
    console.error("GET COURSE LEARNING DATA ERROR:", error);
    res.status(500).json({ message: "Failed to load learning data" });
  }
};

/* =================================
   GET COURSE AND LESSON TITLES
===================================== */
const getCourseAndLessonTitles = async (courseId, lessonId) => {
  try {
    const course = await Course.findByPk(String(courseId));
    const lesson = await Lesson.findByPk(String(lessonId));

    if (!course || !lesson) return null;

    return {
      courseTitle: course.title || null,
      lessonTitle: lesson.title || null,
    };
  } catch (error) {
    console.error("Error reading course/lesson titles:", error);
    return null;
  }
};

/* =========================
   GET STATS CARDS (DB)
========================= */
const getStatsCards = async (req, res) => {
  try {
    const totalCourses = await Course.count();

    res.json({
      totalCourses,
      completedCourses: 0,
      hoursLearned: 0,
      certificates: 0,
    });
  } catch (error) {
    console.error("GET STATS CARDS ERROR:", error);
    res.status(500).json({ message: "Failed to load stats" });
  }
};

/* =========================
   ADMIN STUBS (UNCHANGED)
========================= */
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