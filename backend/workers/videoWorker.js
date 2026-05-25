import { Worker } from "bullmq";
import Redis from "ioredis";
// import AIVideo from "../models/AIVideo.js";
import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });

const AIVideo = (await import("../models/AIVideo.js")).default;


console.log("Video worker started...");

const connection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "videoQueue",
  async (job) => {
    const { courseId, lessonId, celebrity, courseTitle, lessonTitle, userPreferences } = job.data;

    console.log(`🎬 Worker processing video for: ${lessonTitle} (${celebrity})`);
    console.log("AI_SERVICE_URL:", process.env.AI_SERVICE_URL);
    // Call AI service
    const aiResponse = await fetch(`${process.env.AI_SERVICE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course: courseTitle,
        topic: lessonTitle,
        celebrity,
        preferences: userPreferences,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI service failed: ${await aiResponse.text()}`);
    }

    const { filename, text_file, jobId } = await aiResponse.json();
    const videoUrl = `/api/ai/video/${courseId}/${filename}`;

    // Save to DB
    await AIVideo.create({
      courseId: Number(courseId),
      lessonId: String(lessonId),
      celebrity: String(celebrity).toLowerCase(),
      videoUrl,
      transcriptName: text_file,
      jobId,
    });

    console.log(`✅ Worker done. jobId: ${jobId}`);
    return { jobId, videoUrl, transcriptName: text_file };
  },
  { connection }
);

worker.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`❌ Job ${job.id} failed:`, err.message));

export default worker;