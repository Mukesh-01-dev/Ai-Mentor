import User from "./User.js";
import Discussion from "./Discussion.js";
import DiscussionLike from "./DiscussionLike.js";

// Associations

Discussion.hasMany(DiscussionLike, {
  foreignKey: "discussionId",
  onDelete: "CASCADE",
});

DiscussionLike.belongsTo(Discussion, {
  foreignKey: "discussionId",
});

User.hasMany(DiscussionLike, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

DiscussionLike.belongsTo(User, {
  foreignKey: "userId",
});

export {
  User,
  Discussion,
  DiscussionLike,
};