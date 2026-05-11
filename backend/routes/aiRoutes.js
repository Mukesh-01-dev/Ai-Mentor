import AIVideo from "../models/AIVideo.js";
import express from "express";
import fs from "fs";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { generateVideoSchema } from "../schemas/aiSchema.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ----------------------------------------------------
// Get Course + Lesson Titles
// ----------------------------------------------------
async function getCourseAndLessonTitles(courseId, lessonId) {
  try {
    const filePath = path.join(process.cwd(), "data", "courses.json");

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const course = data.find(
      (c) => Number(c.id) === Number(courseId)
    );

    if (!course) return null;

    const lesson = course.lessons.find(
      (l) => Number(l.id) === Number(lessonId)
    );

    if (!lesson) return null;

    return {
      courseTitle: course.title,
      lessonTitle: lesson.title,
    };
  } catch (error) {
    console.error("Error reading course data:", error);
    return null;
  }
}

// ----------------------------------------------------
// Generate AI Video
// ----------------------------------------------------
router.post(
  "/generate-video",
  protect,
  validate(generateVideoSchema),
  async (req, res) => {
    try {
      const { courseId, lessonId, celebrity } = req.body;

      // Temporary purchase bypass
      const purchasedCourse = true;

      // if (!purchasedCourse) {
      //   return res.status(403).json({
      //     message: "Course not purchased",
      //   });
      // }

      // ------------------------------------------------
      // Check cache
      // ------------------------------------------------
      const cachedVideo = await AIVideo.findOne({
        where: {
          courseId: Number(courseId),
          lessonId: String(lessonId),
          celebrity: String(celebrity).toLowerCase(),
        },
      });

      if (cachedVideo) {
        console.log("🎯 Cache found");

        return res.json({
          videoUrl: cachedVideo.videoUrl,
          transcriptName: cachedVideo.transcriptName,
          jobId: cachedVideo.jobId,
          cached: true,
        });
      }

      // ------------------------------------------------
      // Get titles
      // ------------------------------------------------
      const titles = await getCourseAndLessonTitles(
        courseId,
        lessonId
      );

      if (!titles) {
        return res.status(404).json({
          message: "Invalid course or lesson",
        });
      }

      const { courseTitle, lessonTitle } = titles;

      // ------------------------------------------------
      // Call AI service
      // ------------------------------------------------
      console.log("🤖 Calling AI service...");

      const aiResponse = await fetch(
        `${process.env.AI_SERVICE_URL}/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course: courseTitle,
            topic: lessonTitle,
            celebrity,
          }),
        }
      );

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();

        console.log("AI SERVICE ERROR:", errorText);

        throw new Error("AI service failed");
      }

      const { filename, text_file, jobId } =
        await aiResponse.json();

      const videoUrl = `/api/ai/video/${courseId}/${filename}`;

      // ------------------------------------------------
      // Save cache
      // ------------------------------------------------
      await AIVideo.create({
        courseId: Number(courseId),
        lessonId: String(lessonId),
        celebrity: String(celebrity).toLowerCase(),
        videoUrl,
        transcriptName: text_file,
        jobId,
      });

      res.json({
        videoUrl,
        transcriptName: text_file,
        jobId,
        cached: false,
      });
    } catch (error) {
      console.error("AI GENERATE ERROR:", error);

      res.status(500).json({
        message: "Failed to generate AI video",
      });
    }
  }
);

// ----------------------------------------------------
// Transcript
// ----------------------------------------------------
router.get("/transcript/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    const pythonTranscriptUrl =
      `${process.env.AI_SERVICE_URL}/transcript/${filename}`;

    const response = await fetch(pythonTranscriptUrl);

    if (!response.ok) {
      return res.status(404).json({
        error: "Transcript not found",
      });
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("❌ Transcript Error:", error.message);

    res.status(500).json({
      error: "Failed to load transcript",
    });
  }
});

// ----------------------------------------------------
// Status
// ----------------------------------------------------
router.get("/status/:jobId", protect, async (req, res) => {
  try {
    const { jobId } = req.params;

    const response = await fetch(
      `${process.env.AI_SERVICE_URL}/status/${jobId}`
    );

    if (!response.ok) {
      return res.status(404).json({
        status: "not_found",
      });
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("❌ Status Error:", error.message);

    res.status(500).json({
      status: "error",
    });
  }
});

// ----------------------------------------------------
// Video Proxy
// ----------------------------------------------------
router.get("/video/:courseId/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    const pythonVideoUrl =
      `${process.env.AI_SERVICE_URL}/video-stream/${filename}`;

    const response = await fetch(pythonVideoUrl);

    if (!response.ok) {
      return res.status(404).json({
        error: "Video not found",
      });
    }

    res.setHeader("Content-Type", "video/mp4");

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      res.write(value);
    }

    res.end();
  } catch (error) {
    console.error("❌ Proxy Error:", error.message);

    res.status(500).json({
      error: "Failed to stream video",
    });
  }
});

export default router;