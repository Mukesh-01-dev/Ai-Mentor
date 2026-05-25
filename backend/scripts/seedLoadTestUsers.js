import dotenv from "dotenv";
import { Op } from "sequelize";
import { connectDB } from "../config/db.js";
import { User, Preference } from "../models/modelAssociations.js";
dotenv.config();
const SEED_COUNT = 100;
const PASSWORD = "Password123!";
const seedLoadTestUsers = async () => {
    try {
        await connectDB();
        console.log("✅ Database connected for load test seeding.");
        // Delete existing load test users
        console.log("🧹 Cleaning up old load test users...");
        const deletedCount = await User.destroy({
            where: {
                email: {
                    [Op.like]: "loadtest_%@uptoskills.com",
                },
            },
        });
        console.log(`🧹 Deleted ${deletedCount} existing load test users.`);
        console.log(`🌱 Seeding ${SEED_COUNT} load test users...`);
        for (let i = 1; i <= SEED_COUNT; i++) {
            const email = `loadtest_${i}@uptoskills.com`;

            const user = await User.create({
                firstName: "LoadTest",
                lastName: `User${i}`,
                name: `LoadTest User${i}`,
                email: email,
                password: PASSWORD,
                role: "user",
                bio: `Pre-seeded load testing account number ${i}`,
                avatar_url: `https://res.cloudinary.com/demo/image/upload/sample.jpg`,
                purchasedCourses: [
                    {
                        courseId: 1,
                        courseTitle: "Load Test Course",
                        purchaseDate: new Date(),
                        progress: {
                            completedLessons: [],
                            currentLesson: null,
                        },
                    },
                ],
            });
            // Create preferences for the user
            await Preference.create({
                user_id: user.id,
                explanation_type: "Visual",
                learning_style: "Active",
                teaching_pace: "Medium",
                example_type: "Practical",
                focus_area: "Backend Development",
            });
            if (i % 10 === 0 || i === SEED_COUNT) {
                console.log(`   Seeded ${i}/${SEED_COUNT} users...`);
            }
        }
        console.log("🎉 Load test users seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding load test users:", error);
        process.exit(1);
    }
};
seedLoadTestUsers();
