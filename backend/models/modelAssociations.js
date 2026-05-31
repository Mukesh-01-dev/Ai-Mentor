import Course from "./Course.js";
import Module from "./Module.js";
import Lesson from "./Lesson.js";
import LessonContent from "./LessonContent.js";
import User from "./User.js";
import Preference from "./Preference.js";
import AIVideo from "./AIVideo.js";
import CalendarTask from "./CalendarTask.js";

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

/* ======================
   USER → PREFERENCE
====================== */

User.hasOne(Preference, {
    foreignKey: "user_id",
    as: "preferences",
    onDelete: "CASCADE",
});

Preference.belongsTo(User, {
    foreignKey: "user_id",
});

/* ======================
   LESSON → AI VIDEO
====================== */

Lesson.hasMany(AIVideo, {
    foreignKey: "lessonId",
    as: "aiVideos",
    onDelete: "CASCADE",
});

AIVideo.belongsTo(Lesson, {
    foreignKey: "lessonId",
});
/* ======================
   USER → CALENDAR TASK
====================== */

User.hasMany(CalendarTask, {
    foreignKey: "userId",
    as: "calendarTasks",
    onDelete: "CASCADE",
});

CalendarTask.belongsTo(User, {
    foreignKey: "userId",
});

export { Course, Module, Lesson, LessonContent, User, AIVideo, Preference, CalendarTask };