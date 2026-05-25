import dotenv from "dotenv";
import { Op } from "sequelize";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import CommunityPost from "../models/CommunityPost.js";
import Notifications from "../models/Notification.js";
import CourseReport from "../models/CouresReport.js";
import Report from "../models/Report.js";
import Preference from "../models/Preference.js";
import ContactMessage from "../models/Contactmessage.js";
dotenv.config();
const cleanupLoadTest = async () => {
    try {
        await connectDB();
        console.log("✅ Database connected for load test cleanup.");
        // Find all loadtest user IDs
        const loadTestUsers = await User.findAll({
            where: {
                email: {
                    [Op.like]: "loadtest_%@uptoskills.com",
                },
            },
            attributes: ["id"],
        });
        const userIds = loadTestUsers.map(user => user.id);
        if (userIds.length === 0) {
            console.log("ℹ️ No load test users found in the database. Cleanup complete!");
            process.exit(0);
        }
        console.log(`\n🧹 Found ${userIds.length} load test users. Cleaning up related records...`);
        // 1. Find all post IDs belonging to these users
        const posts = await CommunityPost.findAll({
            where: { userId: userIds },
            attributes: ["id"],
        });
        const postIds = posts.map(p => p.id);
        // 2. Delete reports associated with user's posts
        if (postIds.length > 0) {
            const deletedPostReports = await Report.destroy({
                where: { postId: postIds },
            });
            console.log(`   Deleted ${deletedPostReports} reports associated with load test posts.`);
        }
        // 3. Delete reports filed by users
        const deletedReports = await Report.destroy({
            where: { reporterId: userIds },
        });
        console.log(`   Deleted ${deletedReports} reports filed by load test users.`);
        // 4. Delete course reports filed by users
        const deletedCourseReports = await CourseReport.destroy({
            where: { userId: userIds },
        });
        console.log(`   Deleted ${deletedCourseReports} course reports.`);
        // 5. Delete community posts
        const deletedPosts = await CommunityPost.destroy({
            where: { userId: userIds },
        });
        console.log(`   Deleted ${deletedPosts} community posts.`);
        // 6. Delete notifications
        const deletedNotifications = await Notifications.destroy({
            where: { userId: userIds },
        });
        console.log(`   Deleted ${deletedNotifications} notifications.`);
        // 7. Delete preferences
        const deletedPreferences = await Preference.destroy({
            where: { user_id: userIds },
        });
        console.log(`   Deleted ${deletedPreferences} preferences.`);
        // 7.5 Delete submitted contact messages
        const deletedContactMessages = await ContactMessage.destroy({
            where: {
                email: {
                    [Op.like]: "loadtest_%@uptoskills.com",
                },
            },
        });
        console.log(`   Deleted ${deletedContactMessages} contact messages.`);
        // 8. Delete user records
        const deletedUsers = await User.destroy({
            where: { id: userIds },
        });
        console.log(`🧹 Successfully deleted ${deletedUsers} load test user records.`);
        console.log("\n🎉 Load testing database cleanup complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error running cleanup script:", error);
        process.exit(1);
    }
};
cleanupLoadTest();
