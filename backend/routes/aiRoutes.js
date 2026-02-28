import AIVideo from "../models/AIVideo.js";
import express from "express";
import fs from "fs";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import { getCourseAndLessonTitles } from "../controllers/courseController.js";
import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post("/generate-video", protect, async (req, res) => {
  try {
    const { courseId, lessonId, celebrity } = req.body;

    if (!courseId || !lessonId || !celebrity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔐 Check purchase
    const purchasedCourse = req.user.purchasedCourses.find(
      (c) => Number(c.courseId) === Number(courseId)
    );

    if (!purchasedCourse) {
      return res.status(403).json({ message: "Course not purchased" });
    }

    // 🕵️ Check Cache First
    const cachedVideo = await AIVideo.findOne({
      where: {
        courseId: Number(courseId),
        lessonId: String(lessonId),
        celebrity: String(celebrity).toLowerCase(),
      },
    });

    if (cachedVideo) {
      console.log("🎯 Serving cached AI video for:", celebrity);
      return res.json({
        videoUrl: cachedVideo.videoUrl,
        transcriptName: cachedVideo.transcriptName,
        jobId: cachedVideo.jobId,
        cached: true,
      });
    }

    // 📘 Get titles from JSON
    const titles = getCourseAndLessonTitles(courseId, lessonId);

    if (!titles) {
      return res.status(404).json({ message: "Invalid course or lesson" });
    }

    const { courseTitle, lessonTitle } = titles;

    // 🚀 Call AI service
    console.log("🤖 Cache miss. Calling AI service for:", celebrity);
    const aiResponse = await fetch(
      `${process.env.AI_SERVICE_URL}/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: courseTitle,
          topic: lessonTitle,
          celebrity,
        }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error("AI service failed");
    }

    const { filename, text_file, jobId } = await aiResponse.json();

    const videoUrl = `/api/ai/video/${courseId}/${filename}`;
    const textUrl = `/api/ai/transcript/${text_file}`;

    // 💾 Save to Cache
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
    res.status(500).json({ message: "Failed to generate AI video" });
  }
});

// ----------------------------------------------------
// Proxy Transcript Content from Python
// ----------------------------------------------------
router.get("/transcript/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    // 🕵️ Check Cache First
    const cachedVideo = await AIVideo.findOne({
      where: { transcriptName: filename },
    });

    if (cachedVideo && cachedVideo.transcript) {
      console.log("🎯 Serving cached transcript for:", filename);
      return res.json({ content: cachedVideo.transcript });
    }

    const pythonTranscriptUrl = `${process.env.AI_SERVICE_URL}/transcript/${filename}`;
    const response = await fetch(pythonTranscriptUrl);

    if (!response.ok) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    const data = await response.json();

    // 💾 Save to Cache if we found the record
    if (cachedVideo) {
      cachedVideo.transcript = data.content;
      await cachedVideo.save();
      console.log("💾 Transcript cached for:", filename);
    }

    res.json(data);

  } catch (error) {
    console.error("❌ Transcript Proxy Error:", error.message);
    res.status(500).json({ error: "Failed to load transcript" });
  }
});

router.get("/status/:jobId", protect, async (req, res) => {
  try {
    const { jobId } = req.params;
    const response = await fetch(`${process.env.AI_SERVICE_URL}/status/${jobId}`);

    if (!response.ok) {
      return res.status(404).json({ status: "not_found" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Status Proxy Error:", error.message);
    res.status(500).json({ status: "error" });
  }
});

// ----------------------------------------------------
// 3. Proxy Video Stream from Python (The "Middleman")
// ----------------------------------------------------
router.get("/video/:courseId/:filename", async (req, res) => {
  try {
    const { courseId, filename } = req.params;

    const pythonVideoUrl =
      `${process.env.AI_SERVICE_URL}/video-stream/${filename}`;

    const response = await fetch(pythonVideoUrl);

    if (!response.ok) {
      return res.status(404).json({
        error: "Video not found in AI service",
      });
    }

    res.setHeader("Content-Type", "video/mp4");
    // Streams the response body directly to the client
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
      error: "Failed to load video via proxy",
    });
  }
});

export default router;
