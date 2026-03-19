import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "../config/db.js";
import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import "../models/CommunityPost.js";
import "../models/Notification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(
  __dirname,
  "../../frontend/public/data"
);

// Set up associations
Course.hasMany(Module, { foreignKey: "courseId", onDelete: "CASCADE" });
Module.belongsTo(Course, { foreignKey: "courseId" });

Module.hasMany(Lesson, { foreignKey: "moduleId", onDelete: "CASCADE" });
Lesson.belongsTo(Module, { foreignKey: "moduleId" });

async function seedDatabase() {
  try {
    console.log("🔄 Starting database seeding...");

    // Sync database
    await sequelize.sync({ force: true });
    console.log("✅ Database synced");

    // Read learning.json for detailed course structure
    const learningPath = path.join(dataDir, "learning.json");
    const learningData = JSON.parse(fs.readFileSync(learningPath, "utf-8"));

    // Read courses.json for course metadata
    const coursesPath = path.join(dataDir, "courses.json");
    const coursesData = JSON.parse(fs.readFileSync(coursesPath, "utf-8"));

    // Read coursePreview.json for additional details
    const coursesPreviewPath = path.join(dataDir, "coursePreview.json");
    const coursePreviewData = JSON.parse(
      fs.readFileSync(coursesPreviewPath, "utf-8")
    );

    console.log("📖 Seeding course data...");

    // Seed each course
    for (const courseData of coursesData.popularCourses) {
      // Create course
      const course = await Course.create({
        id: courseData.id,
        title: courseData.title,
        subtitle: courseData.title,
        category: courseData.category,
        categoryColor: courseData.categoryColor,
        level: courseData.level,
        price: courseData.priceValue,
        originalPrice: courseData.priceValue * 1.5,
        currency: courseData.currency,
        rating: courseData.rating,
        reviews: courseData.studentsCount,
        students: courseData.studentsCount,
        image: courseData.image,
        language: "English",
        subtitles: true,
        tags: ["Popular"],
        isActive: true,
      });

      console.log(`📦 Created course: ${course.title}`);

      // Get learning data for this course
      const courseModules = learningData[courseData.id]?.modules || [];

      // Seed modules and lessons
      for (let moduleIndex = 0; moduleIndex < courseModules.length; moduleIndex++) {
        const moduleData = courseModules[moduleIndex];

        const module = await Module.create({
          courseId: course.id,
          title: moduleData.title,
          description: moduleData.title,
          goal: moduleData.title,
          order: moduleIndex + 1,
        });

        console.log(`  📚 Created module: ${module.title}`);

        // Seed lessons for this module
        const lessons = moduleData.lessons || [];
        for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
          const lessonData = lessons[lessonIndex];

          await Lesson.create({
            moduleId: module.id,
            title: lessonData.title,
            duration: lessonData.duration,
            type: lessonData.type || "video",
            youtubeUrl: lessonData.youtubeUrl || null,
            content: lessonData.content || null,
            order: lessonIndex + 1,
          });
        }

        console.log(`    ✅ Created ${lessons.length} lessons for ${module.title}`);
      }
    }

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
