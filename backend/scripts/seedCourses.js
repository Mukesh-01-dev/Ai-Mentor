import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import cloudinary from "../config/cloudinary.js";
import { sequelize } from "../config/db.js";
import {
    Course,
    Module,
    Lesson,
    LessonContent,
} from "../models/modelAssociations.js";
import AIVideo from "../models/AIVideo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coursesPath = path.join(__dirname, "../seeds/data/courses.json");
const learningPath = path.join(__dirname, "../seeds/data/learning.json");
const imagesPath = path.join(__dirname, "../seeds/course_images");

// 🔥 safer upload (non-blocking mindset)
const uploadImageToCloudinary = async (imagePath, courseId) => {
    if (!imagePath) return null;

    try {
        const fileName = imagePath.split("/").pop();
        const fullPath = path.join(imagesPath, fileName);

        if (!fs.existsSync(fullPath)) return null;

        const result = await cloudinary.uploader.upload(fullPath, {
            folder: "courses",
            public_id: `course-${courseId}`,
            overwrite: true,
        });

        return result.secure_url;
    } catch (err) {
        console.log("⚠ Image upload failed:", err.message);
        return null;
    }
};

async function seedCourses() {
    try {
        console.log("\n🌱 Starting optimized seeding...\n");

        await sequelize.authenticate();
        console.log("✅ Database connected");

        // ✅ SAFE DEV RESET
        if (process.env.NODE_ENV === "production") {
            throw new Error("❌ Seeder blocked in production");
        }

        // await sequelize.sync({ force: true });
        await sequelize.sync(); // ensures tables exist
        // clear non-FK dependent tables
        await AIVideo.truncate({ restartIdentity: true });
        await Course.truncate({
            cascade: true,
            restartIdentity: true,
        });

        
        console.log("🧹 DB reset done\n");

        const coursesData = JSON.parse(fs.readFileSync(coursesPath, "utf8"));
        const learningData = JSON.parse(fs.readFileSync(learningPath, "utf8"));

        const courses = coursesData.popularCourses || [];

        for (const course of courses) {
            console.log(`📚 Seeding: ${course.title}`);

            const transaction = await sequelize.transaction();

            try {
                // ✅ Create course
                const createdCourse = await Course.create({
                    title: course.title,
                    category: course.category,
                    categoryColor: course.categoryColor,
                    lessons: course.lessons,
                    lessonsCount: course.lessonsCount,
                    level: course.level,
                    price: course.price,
                    priceValue: course.priceValue,
                    currency: course.currency,
                    rating: course.rating,
                    students: course.students,
                    studentsCount: course.studentsCount,
                    isBookmarked: course.isBookmarked,
                }, { transaction });

                const learning = learningData[String(course.id)];

                if (!learning?.modules) {
                    await transaction.commit();
                    continue;
                }

                // 🔥 mapping
                const lessonMap = new Map();

                // ✅ Prepare modules
                const modulePayload = learning.modules.map((m, index) => ({
                    title: m.title,
                    order: index,
                    courseId: createdCourse.id,
                }));

                const createdModules = await Module.bulkCreate(modulePayload, {
                    returning: true,
                    transaction,
                });

                // ✅ Lessons (bulk per module)
                for (let i = 0; i < learning.modules.length; i++) {
                    const module = learning.modules[i];
                    const dbModule = createdModules[i];

                    if (!module.lessons) continue;

                    const lessonPayload = module.lessons.map((lesson, idx) => ({
                        title: lesson.title,
                        duration: lesson.duration,
                        completed: lesson.completed,
                        playing: lesson.playing,
                        type: lesson.type,
                        youtubeUrl: lesson.youtubeUrl,
                        order: idx,
                        moduleId: dbModule.id,
                    }));

                    const createdLessons = await Lesson.bulkCreate(lessonPayload, {
                        returning: true,
                        transaction,
                    });

                    // 🔥 map JSON → DB
                    module.lessons.forEach((lesson, idx) => {
                        lessonMap.set(lesson.id, createdLessons[idx].id);
                    });
                }

                // ✅ Lesson content
                if (learning.currentLesson?.content) {
                    const mappedLessonId = lessonMap.get(learning.currentLesson.id);

                    if (mappedLessonId) {
                        await LessonContent.create({
                            lessonId: mappedLessonId,
                            introduction: learning.currentLesson.content.introduction,
                            keyConcepts: learning.currentLesson.content.keyConcepts,
                        }, { transaction });
                    }
                }

                // ✅ commit DB first
                await transaction.commit();

                // ☁️ upload image AFTER DB work (no blocking)
                const imageUrl = await uploadImageToCloudinary(course.image, createdCourse.id);

                if (imageUrl) {
                    await Course.update(
                        { image: imageUrl },
                        { where: { id: createdCourse.id } }
                    );
                }

                console.log(`✅ Done: ${course.title}\n`);

            } catch (err) {
                await transaction.rollback();
                console.error(`❌ Failed course: ${course.title}`, err.message);
            }

            // 🧘 small delay prevents pool stress
            await new Promise(res => setTimeout(res, 100));
        }

        console.log("🎉Course Seeding completed!\n");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeder crash:", error);
        process.exit(1);
    }
}

seedCourses();