// backend/queues/videoQueue.js
import dotenv from "dotenv";
import AIVideo from "../models/AIVideo.js";
dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

const queue = [];
let isProcessing = false;

async function processNext() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const job = queue.shift();

  try {
    const {
      courseId, lessonId, celebrity,
      courseTitle, lessonTitle,
      userPreferences, resolve, reject,
    } = job;

    const response = await fetch(`${AI_SERVICE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course: courseTitle,
        topic: lessonTitle,
        celebrity: celebrity,
        preferences: userPreferences || null,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI service error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    // data = { status, filename, text_file, audio_file, jobId }

    // Save DB record immediately with jobId so status route can update it later
    await AIVideo.create({
      courseId:      Number(courseId),
      lessonId:      String(lessonId),
      celebrity:     String(celebrity).toLowerCase(),
      videoUrl:      "",          // will be updated by status route when Cloudinary URL is ready
      transcriptName: data.text_file || null,
      jobId:         String(data.jobId),
    });

    // Resolve with the jobId — frontend will poll /api/ai/status/:jobId
    resolve({ id: String(data.jobId) });

  } catch (err) {
    job.reject(err);
  } finally {
    isProcessing = false;
    processNext();
  }
}

export const videoQueue = {
  add: (_name, jobData) => {
    return new Promise((resolve, reject) => {
      queue.push({ ...jobData, resolve, reject });
      processNext();
    });
  },
};