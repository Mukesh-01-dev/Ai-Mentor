import Course from "./Course.js";
import Module from "./Module.js";
import Lesson from "./Lesson.js";
import LessonContent from "./LessonContent.js";

/* ======================
   COURSE → MODULE
====================== */

Course.hasMany(Module, {
    foreignKey: "courseId",
    as: "modules",
    onDelete: "CASCADE",
});

Module.belongsTo(Course, {
    foreignKey: "courseId",
});

/* ======================
   MODULE → LESSON
====================== */

Module.hasMany(Lesson, {
    foreignKey: "moduleId",
    as: "lessons",
    onDelete: "CASCADE",
});

Lesson.belongsTo(Module, {
    foreignKey: "moduleId",
});

/* ======================
   LESSON → CONTENT
====================== */

Lesson.hasOne(LessonContent, {
    foreignKey: "lessonId",
    as: "content",
    onDelete: "CASCADE",
});

LessonContent.belongsTo(Lesson, {
    foreignKey: "lessonId",
});

export { Course, Module, Lesson, LessonContent };