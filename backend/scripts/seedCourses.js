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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coursesPath = path.join(__dirname, "../seeds/data/courses.json");
const learningPath = path.join(__dirname, "../seeds/data/learning.json");
const imagesPath = path.join(__dirname, "../seeds/course_images");

const uploadImageToCloudinary = async (imagePath, courseId) => {
    if (!imagePath) return null;

    const fileName = imagePath.split("/").pop();
    const fullPath = path.join(imagesPath, fileName);

    if (!fs.existsSync(fullPath)) {
        console.warn(`⚠ Image not found: ${fileName}`);
        return null;
    }

    try {
        const result = await cloudinary.uploader.upload(fullPath, {
            folder: "courses",
            public_id: `course-${courseId}`,
            overwrite: true,
            invalidate: true,
        });

        return result.secure_url;
    } catch (err) {
        console.error(`❌ Cloudinary upload failed for ${fileName}:`, err.message);
        return null;
    }
};

async function seedCourses() {
    try {
        console.log("\n🌱 Starting database seeding...\n");

        await sequelize.authenticate();
        console.log("✅ Database connected");

        await sequelize.sync({ force: true });
        console.log("🧹 Old data cleared\n");

        const coursesData = JSON.parse(fs.readFileSync(coursesPath, "utf8"));
        const learningData = JSON.parse(fs.readFileSync(learningPath, "utf8"));

        const courses = coursesData.popularCourses || [];

        for (const course of courses) {
            console.log(`📚 Seeding course: ${course.title}`);

            const imageUrl = await uploadImageToCloudinary(course.image, course.id);

            const createdCourse = await Course.create({
                id: String(course.id),
                title: course.title || null,
                category: course.category || null,
                categoryColor: course.categoryColor || null,
                lessons: course.lessons || null,
                lessonsCount: course.lessonsCount ?? null,
                level: course.level || null,
                price: course.price || null,
                priceValue: course.priceValue ?? null,
                currency: course.currency || null,
                rating: course.rating ?? null,
                students: course.students || null,
                studentsCount: course.studentsCount ?? null,
                image: imageUrl,
                isBookmarked: course.isBookmarked ?? false,
            });

            const learning = learningData[String(course.id)];
            if (!learning || !Array.isArray(learning.modules)) {
                console.log(`⚠ No learning data found for course ${course.title}\n`);
                continue;
            }

            for (let m = 0; m < learning.modules.length; m++) {
                const module = learning.modules[m];

                const moduleId = `${createdCourse.id}-${module.id || `module-${m + 1}`}`;

                const createdModule = await Module.create({
                    id: moduleId,
                    title: module.title || null,
                    order: m,
                    courseId: createdCourse.id,
                });

                if (!Array.isArray(module.lessons)) continue;

                for (let l = 0; l < module.lessons.length; l++) {
                    const lesson = module.lessons[l];

                    const lessonId = `${moduleId}-${lesson.id || `lesson-${l + 1}`}`;

                    const createdLesson = await Lesson.create({
                        id: lessonId,
                        title: lesson.title || null,
                        duration: lesson.duration || null,
                        completed: lesson.completed ?? false,
                        playing: lesson.playing ?? false,
                        type: lesson.type || null,
                        youtubeUrl: lesson.youtubeUrl || null,
                        order: l,
                        moduleId: createdModule.id,
                    });

                    if (
                        learning.currentLesson &&
                        String(learning.currentLesson.id) === String(lesson.id) &&
                        learning.currentLesson.content
                    ) {
                        await LessonContent.create({
                            lessonId: createdLesson.id,
                            introduction: learning.currentLesson.content.introduction || null,
                            keyConcepts: learning.currentLesson.content.keyConcepts || [],
                        });
                    }
                }
            }

            console.log(`✅ Course seeded: ${course.title}\n`);
        }

        console.log("🎉 All courses seeded successfully!\n");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Seeding failed:", error);
        process.exit(1);
    }
}

seedCourses();