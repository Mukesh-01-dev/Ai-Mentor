import { Op } from "sequelize";
import { Course, Module, Lesson, LessonContent } from "../models/modelAssociations.js";

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

const getCourses = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const courses = await Course.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json(courses.map(formatCourse));
  } catch (error) {
    console.error("GET COURSES ERROR:", error);
    res.status(500).json({ message: "Failed to load courses" });
  }
};

const getCourseById = async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json(formatCourse(course));
  } catch (error) {
    console.error("GET COURSE BY ID ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyCourses = async (req, res) => {
  try {
    if (!req.user) {
      return res.json([]);
    }

    const purchasedIds = (req.user.purchasedCourses || [])
      .map((c) => Number(c.courseId))
      .filter((id) => Number.isFinite(id));

    if (purchasedIds.length === 0) {
      return res.json([]);
    }

    const myCourses = await Course.findAll({
      where: { id: purchasedIds },
      order: [["createdAt", "DESC"]],
    });

    return res.json(
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
    return res.json([]);
  }
};

const getCourseLearningData = async (req, res) => {
  try {
    const courseId = Number(req.params.id);
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
          include: [{ model: LessonContent, as: "content", required: false }],
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
        currentLesson = { ...firstLesson, module: module.title };
        break;
      }
    }

    return res.json({
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
    return res.status(500).json({ message: "Failed to load learning data" });
  }
};

const getCourseAndLessonTitles = async (courseId, lessonId) => {
  try {
    const course = await Course.findByPk(Number(courseId));
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

const getStatsCards = async (_req, res) => {
  try {
    const totalCourses = await Course.count();
    return res.json({
      totalCourses,
      completedCourses: 0,
      hoursLearned: 0,
      certificates: 0,
    });
  } catch (error) {
    console.error("GET STATS CARDS ERROR:", error);
    return res.status(500).json({ message: "Failed to load stats" });
  }
};

const buildCoursePayload = (body, fallback = {}) => {
  const priceValue = Number(body.priceValue ?? fallback.priceValue ?? 0);
  const lessonsCount = Number(
    body.lessonsCount ?? parseLessonsCount(body.lessons || fallback.lessons || "")
  );
  const studentsCount = Number(
    body.studentsCount ?? fallback.studentsCount ?? 0
  );

  return {
    title: String(body.title ?? fallback.title ?? "").trim(),
    category: String(body.category ?? fallback.category ?? "").trim() || "General",
    categoryColor: body.categoryColor ?? fallback.categoryColor ?? "#4f46e5",
    level: String(body.level ?? fallback.level ?? "Beginner"),
    lessons: body.lessons ?? fallback.lessons ?? `${lessonsCount || 0} lessons`,
    lessonsCount: Number.isFinite(lessonsCount) ? lessonsCount : 0,
    price: body.price ?? fallback.price ?? `INR ${priceValue || 0}`,
    priceValue: Number.isFinite(priceValue) ? priceValue : 0,
    currency: body.currency ?? fallback.currency ?? "INR",
    rating: Number(body.rating ?? fallback.rating ?? 0),
    students: body.students ?? fallback.students ?? `${studentsCount || 0} students`,
    studentsCount: Number.isFinite(studentsCount) ? studentsCount : 0,
    image: body.image ?? fallback.image ?? "",
    isBookmarked: Boolean(body.isBookmarked ?? fallback.isBookmarked ?? false),
  };
};

const addCourse = async (req, res) => {
  try {
    const payload = buildCoursePayload(req.body || {});
    if (!payload.title) {
      return res.status(400).json({ message: "title is required" });
    }

    const maxCourse = await Course.findOne({ order: [["id", "DESC"]] });
    const nextId = maxCourse?.id ? Number(maxCourse.id) + 1 : 1;

    const course = await Course.create({
      id: nextId,
      ...payload,
    });

    return res.status(201).json({
      success: true,
      data: formatCourse(course),
    });
  } catch (error) {
    console.error("ADD COURSE ERROR:", error);
    return res.status(500).json({ message: "Failed to create course" });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(Number(req.params.id));
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const payload = buildCoursePayload(req.body || {}, course);
    await course.update(payload);

    return res.json({ success: true, data: formatCourse(course) });
  } catch (error) {
    console.error("UPDATE COURSE ERROR:", error);
    return res.status(500).json({ message: "Failed to update course" });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(Number(req.params.id));
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    await course.destroy();
    return res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    return res.status(500).json({ message: "Failed to delete course" });
  }
};

const addModules = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const modules = Array.isArray(req.body?.modules) ? req.body.modules : [];
    if (modules.length === 0) {
      return res.status(400).json({ message: "modules must be a non-empty array" });
    }

    const created = [];
    for (let i = 0; i < modules.length; i += 1) {
      const mod = modules[i];
      if (!mod?.title) continue;
      const moduleId = String(mod.id || `m-${courseId}-${Date.now()}-${i}`);
      const [module] = await Module.findOrCreate({
        where: { id: moduleId },
        defaults: {
          id: moduleId,
          courseId,
          title: mod.title,
          order: Number(mod.order ?? i + 1),
        },
      });
      if (module.courseId !== courseId) continue;
      if (module.title !== mod.title || module.order !== Number(mod.order ?? i + 1)) {
        await module.update({
          title: mod.title,
          order: Number(mod.order ?? i + 1),
        });
      }
      created.push(module);
    }

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("ADD MODULES ERROR:", error);
    return res.status(500).json({ message: "Failed to add modules" });
  }
};

const addLessons = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const module = await Module.findOne({
      where: { id: String(moduleId), courseId: Number(courseId) },
    });
    if (!module) {
      return res.status(404).json({ message: "Module not found for this course" });
    }

    const lessons = Array.isArray(req.body?.lessons) ? req.body.lessons : [];
    if (lessons.length === 0) {
      return res.status(400).json({ message: "lessons must be a non-empty array" });
    }

    const created = [];
    for (let i = 0; i < lessons.length; i += 1) {
      const lessonInput = lessons[i];
      if (!lessonInput?.title) continue;

      const lessonId = String(lessonInput.id || `l-${moduleId}-${Date.now()}-${i}`);
      const [lesson] = await Lesson.findOrCreate({
        where: { id: lessonId },
        defaults: {
          id: lessonId,
          moduleId: String(moduleId),
          title: lessonInput.title,
          duration: lessonInput.duration || "10 min",
          completed: false,
          playing: false,
          type: lessonInput.type || "video",
          youtubeUrl: lessonInput.youtubeUrl || "",
          order: Number(lessonInput.order ?? i + 1),
        },
      });

      await lesson.update({
        title: lessonInput.title,
        duration: lessonInput.duration || lesson.duration || "10 min",
        type: lessonInput.type || lesson.type || "video",
        youtubeUrl: lessonInput.youtubeUrl || lesson.youtubeUrl || "",
        order: Number(lessonInput.order ?? i + 1),
      });

      if (lessonInput.content) {
        const [content] = await LessonContent.findOrCreate({
          where: { lessonId: lesson.id },
          defaults: {
            lessonId: lesson.id,
            introduction: lessonInput.content.introduction || "",
            keyConcepts: lessonInput.content.keyConcepts || [],
          },
        });
        await content.update({
          introduction: lessonInput.content.introduction || content.introduction || "",
          keyConcepts: lessonInput.content.keyConcepts || content.keyConcepts || [],
        });
      }

      created.push(lesson);
    }

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("ADD LESSONS ERROR:", error);
    return res.status(500).json({ message: "Failed to add lessons" });
  }
};

const updateLessonVideo = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { youtubeUrl } = req.body || {};

    if (!youtubeUrl) {
      return res.status(400).json({ message: "youtubeUrl is required" });
    }

    const lesson = await Lesson.findByPk(String(lessonId));
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const module = await Module.findByPk(lesson.moduleId);
    if (!module || Number(module.courseId) !== Number(courseId)) {
      return res.status(404).json({ message: "Lesson does not belong to this course" });
    }

    lesson.youtubeUrl = youtubeUrl;
    await lesson.save();

    return res.json({ success: true, data: lesson });
  } catch (error) {
    console.error("UPDATE LESSON VIDEO ERROR:", error);
    return res.status(500).json({ message: "Failed to update lesson video" });
  }
};

const addSubtopics = async (req, res) => {
  try {
    const course = await Course.findByPk(Number(req.params.courseId));
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const subtopics = Array.isArray(req.body?.subtopics) ? req.body.subtopics : [];
    return res.status(201).json({
      success: true,
      message: "Subtopics accepted",
      data: subtopics,
    });
  } catch (error) {
    console.error("ADD SUBTOPICS ERROR:", error);
    return res.status(500).json({ message: "Failed to add subtopics" });
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
  updateCourse,
  deleteCourse,
  updateLessonVideo,
  addSubtopics,
  addLessons,
  addModules,
};
