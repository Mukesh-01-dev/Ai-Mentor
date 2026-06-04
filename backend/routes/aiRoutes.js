import AIVideo from "../models/AIVideo.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { generateVideoSchema } from "../schemas/aiSchema.js";
import { getCourseAndLessonTitles } from "../controllers/courseController.js";
import Preferences from "../models/Preference.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/generate-video", protect, validate(generateVideoSchema), async (req, res) => {
  try {
    const { courseId, lessonId, celebrity } = req.body;

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
      let parsedUrl;
      try {
        parsedUrl = new URL(cachedVideo.videoUrl);
      } catch {
        parsedUrl = null;
      }
      if (
        parsedUrl &&
        parsedUrl.protocol === "https:" &&
        parsedUrl.hostname.endsWith("res.cloudinary.com")
      ) {
        return res.json({
          videoUrl: cachedVideo.videoUrl,
          transcriptName: cachedVideo.transcriptName,
          jobId: cachedVideo.jobId,
          cached: true,
        });
      }

      const filename = cachedVideo.videoUrl.split("/").pop();

      if (cachedVideo.videoUrl === "processing" || cachedVideo.videoUrl === "") {
        console.log("⏳ Cached video is still processing. Skipping HEAD check.");
        return res.json({
          jobId: cachedVideo.jobId,
          status: "processing",
          message: "Video is still generating",
        });
      }

      const videoCheck = await fetch(
        `${process.env.AI_SERVICE_URL}/video-stream/${filename}`,
        { method: "HEAD" }   // lightweight check
      );

      if (!videoCheck.ok) {
        console.log("⚠️ Cached video missing. Removing from DB...");
        await cachedVideo.destroy();  // delete bad cache
      } else {
        console.log("✅ Cached video verified.");

        return res.json({
          videoUrl: cachedVideo.videoUrl,
          transcriptName: cachedVideo.transcriptName,
          jobId: cachedVideo.jobId,
          cached: true,
        });
      }
    }


    // Get titles from JSON
    const titles = await getCourseAndLessonTitles(courseId, lessonId);

    if (!titles) {
      return res.status(404).json({ message: "Invalid course or lesson" });
    }

    const { courseTitle, lessonTitle } = titles;

    const userPreferencesRecord = await Preferences.findOne({
      where: { user_id: req.user.id }   // 👈 FIX
    });

    const userPreferences = userPreferencesRecord
      ? userPreferencesRecord.toJSON()
      : null;

  
    // Send request directly to Python AI service
    const aiServiceResponse = await fetch(`${process.env.AI_SERVICE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course: courseTitle,
        topic: lessonTitle,
        celebrity: celebrity,
        preferences: userPreferences,
      }),
    });

    if (!aiServiceResponse.ok) {
      throw new Error("Failed to communicate with AI Service");
    }

    const aiData = await aiServiceResponse.json();

    // Create a placeholder record in the DB so we can cache it later
    await AIVideo.create({
      courseId: courseId,
      lessonId: lessonId,
      celebrity: celebrity.toLowerCase(),
      jobId: aiData.jobId,
      transcriptName: aiData.text_file,
      videoUrl: "", // Will be updated when status is ready
    });

    console.log(`📥 Job started in AI service: ${aiData.jobId}`);

    return res.json({
      jobId: aiData.jobId,
      status: "processing",
      message: "Video generation started",
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

    // 🌥️ If video is ready, persist URL to DB (use Cloudinary or fallback to local proxy)
    if (data.status === "ready") {
      let finalUrl = data.cloudinary_url;
      
      if (!finalUrl) {
        finalUrl = `/api/ai/video/0/${jobId}.mp4`;
        data.cloudinary_url = finalUrl; // inject it so frontend uses it
      }

      try {
        const updated = await AIVideo.update(
          { videoUrl: finalUrl },
          { where: { jobId: String(jobId) } }
        );
        if (updated[0] > 0) {
          console.log(`☁️ AIVideo DB updated with URL for jobId: ${jobId}`);
        }
      } catch (dbErr) {
        console.error("⚠️ Failed to update AIVideo with URL:", dbErr.message);
      }
    }

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
    const { filename } = req.params;

    const pythonVideoUrl =
      `${process.env.AI_SERVICE_URL}/video-stream/${filename}`;

    // Redirect the browser directly to the Python AI service StaticFiles server.
    // This fully supports HTTP Range Requests (seek, buffering) which the manual proxy broke.
    res.redirect(pythonVideoUrl);
  } catch (error) {
    console.error("❌ Proxy Error:", error.message);
    res.status(500).json({
      error: "Failed to redirect to video stream",
    });
  }
});

export default router;