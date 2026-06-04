import Admin from "./Admin.js";
import User from "./User.js";
import Course from "./Course.js";
import AdminNotification from "./AdminNotification.js";
import CommunityPost from "./CommunityPost.js";
import Report from "./Report.js";
import Notification from "./Notification.js";
import Module from "./Module.js";
import Lesson from "./Lesson.js";

// Setup Associations
Report.belongsTo(User, { foreignKey: "reporterId", as: "reporter" });
Report.belongsTo(CommunityPost, { foreignKey: "postId", as: "post" });
CommunityPost.belongsTo(User, { foreignKey: "userId", as: "author" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });

Course.hasMany(Module, { foreignKey: "courseId", as: "modules" });
Module.belongsTo(Course, { foreignKey: "courseId" });

Module.hasMany(Lesson, { foreignKey: "moduleId", as: "lessons" });
Lesson.belongsTo(Module, { foreignKey: "moduleId" });

export {
  Admin,
  User,
  Course,
  AdminNotification,
  CommunityPost,
  Report,
  Notification,
  Module,
  Lesson,
};
