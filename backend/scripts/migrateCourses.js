import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Course from "../models/Course.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

const migrateCourses = async () => {
 
  const previewsPath = path.join(
    __dirname,
    "../../frontend/public/data/coursePreviews.json"
  );

  const previewsData = JSON.parse(fs.readFileSync(previewsPath, "utf8"));

  await Course.deleteMany({});

  for (const preview of previewsData.courses) {
    const info = coursesData.popularCourses.find((c) => c.id === preview.id);

    await Course.create({
      id: preview.id,
      title: preview.title,
      category: info?.category || preview.category,
      level: info?.level || preview.level,
      lessons: info?.lessons || preview.lessons || "0 lessons",
      price: Number(preview.priceDetails?.current || 0),
      rating: preview.rating,
      students: preview.students,
      image: info?.image || preview.thumbnail,
      categoryColor: info?.categoryColor || "bg-blue-100 text-blue-600",
    });
  }

  console.log("Courses migrated");
  process.exit(0);
};

await connectDB();
await migrateCourses();
