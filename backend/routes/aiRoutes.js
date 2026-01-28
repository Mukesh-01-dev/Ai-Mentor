import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post("/generate-video", async (req, res) => {
  try {
    const { course, celebrity, topic } = req.body;

    // Helper to check if file size is stable (finished writing)
    const waitForFileStability = async (filePath) => {
      let lastSize = -1;
      let stableCount = 0;
      const maxStabilityChecks = 5; // Try for up to 5 * 1s = 5s of stability

      let currentSize = 0;
      for (let i = 0; i < maxStabilityChecks; i++) {
        if (!fs.existsSync(filePath)) return false;
        const stats = fs.statSync(filePath);
        currentSize = stats.size;

        if (currentSize > 0 && currentSize === lastSize) {
          stableCount++;
          if (stableCount >= 2) return true; // Stable for 2 consecutive checks
        } else {
          stableCount = 0;
        }

        lastSize = currentSize;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      return currentSize > 0;
    };

    // Match the original logic in api.py: topic.replace(' ', '_')
    // and the format: {topic_with_underscores}_{celebrity}_{course}.mp4
    const videoFileName = `${topic.replace(/\s+/g, '_')}_${celebrity}_${course.replace(/\s+/g, '_')}.mp4`;

    console.log(`Requested Video: ${videoFileName}`);

    const aiServiceVideoPath = path.join(
      __dirname,
      "../../ai_service/outputs/video",
      videoFileName
    );
    const backendVideosFolder = path.join(__dirname, "../videos");
    const backendVideoPath = path.join(backendVideosFolder, videoFileName);

    // Ensure backend/videos exists
    if (!fs.existsSync(backendVideosFolder)) {
      fs.mkdirSync(backendVideosFolder, { recursive: true });
    }

    // 1. Check if video already exists in backend/videos (Cache hit)
    if (fs.existsSync(backendVideoPath)) {
      console.log("✅ Video found in backend cache!");
      return res.json({
        status: "success",
        message: "Video retrieved from cache",
        videoUrl: `http://localhost:5000/videos/${videoFileName}`,
        topic,
        celebrity,
      });
    }

    // 2. Check if video exists in ai_service/outputs/video but not in backend/videos
    if (fs.existsSync(aiServiceVideoPath) && !videoFileName.startsWith('TEMP_')) {
      console.log("✅ Video found in AI service outputs, verifying stability...");
      if (await waitForFileStability(aiServiceVideoPath)) {
        await fs.promises.copyFile(aiServiceVideoPath, backendVideoPath);
        return res.json({
          status: "success",
          message: "Video generated successfully",
          videoUrl: `http://localhost:5000/videos/${videoFileName}`,
          topic,
          celebrity,
        });
      }
    }

    // 3. If not found, trigger generation
    console.log("🚀 Triggering new video generation...");
    const ai_service_url = `http://127.0.0.1:8000/generate`;

    try {
      const aiResponse = await fetch(ai_service_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, topic, celebrity }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `AI service returned status ${aiResponse.status}`);
      }

      console.log("AI service accepted request. Polling for results...");
    } catch (aiError) {
      console.error("❌ AI Service Error:", aiError.message);
      return res.status(500).json({
        error: "AI Service Unavailable",
        message: aiError.message
      });
    }

    // 4. Poll for the file
    const maxWaitTime = 120000; // 120 seconds
    const pollInterval = 3000; // Check every 3 seconds
    let elapsed = 0;

    while (elapsed < maxWaitTime) {
      if (fs.existsSync(aiServiceVideoPath)) {
        console.log("⏳ Video file detected, checking stability...");
        if (await waitForFileStability(aiServiceVideoPath)) {
          console.log("✅ Video generation complete and file verified!");
          await fs.promises.copyFile(aiServiceVideoPath, backendVideoPath);
          return res.json({
            status: "success",
            message: "Video generated successfully",
            videoUrl: `http://localhost:5000/videos/${videoFileName}`,
            topic,
            celebrity,
          });
        }
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      elapsed += pollInterval;
      if (elapsed % 15000 === 0) console.log(`Polling... ${elapsed / 1000}s elapsed`);
    }

    // 5. Timeout
    return res.status(408).json({
      error: "Video generation timeout",
      message: "Generation is taking longer than expected. The video will be available soon in your library.",
    });

  } catch (error) {
    console.error("🔥 Route Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message
      });
    }
  }
});

// ✅ THIS LINE IS REQUIRED
export default router;
