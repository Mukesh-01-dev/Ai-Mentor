import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askGemini = async (
  context,
  message
) => {
  const prompt = `
    You are AI Mentor.

    Platform Features:
    - Courses
    - Lessons
    - AI Videos
    - Certificates
    - Dashboard
    - Community
    - Settings
    - Preferences
    User Context:
    ${context}
    Question:
    ${message}

    Rules:
    1. Answer as a mentor.
    2. Personalize answers.
    3. Use user profile.
    4. Keep answers under 150 words.
    5. If asked about courses, use enrolled courses.
    6. If asked about learning strategy, use experience level.
    7. If the user is asking about:
      preferences → /preferences
      settings → /settings
      profile → /profile
      courses → /courses
      community → /community
      watch history → /watch-history
      Return:
      ROUTE:/page-name at the end of your answer.
    `;

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

  return response.text;
};