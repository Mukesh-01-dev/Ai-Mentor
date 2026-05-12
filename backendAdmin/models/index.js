import Admin from "./Admin.js";
import User from "./User.js";
import Course from "./Course.js";
import AdminNotification from "./AdminNotification.js";
import CommunityPost from "./CommunityPost.js";
import Report from "./Report.js";

// Setup Associations
Report.belongsTo(User, { foreignKey: "reporterId", as: "reporter" });
Report.belongsTo(CommunityPost, { foreignKey: "postId", as: "post" });
CommunityPost.belongsTo(User, { foreignKey: "userId", as: "author" });

export {
  Admin,
  User,
  Course,
  AdminNotification,
  CommunityPost,
  Report,
};
