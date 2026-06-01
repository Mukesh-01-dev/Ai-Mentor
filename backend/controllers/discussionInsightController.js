// backend/controllers/discussionInsightController.js

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are "AI Insight", a friendly in-app assistant embedded on the Discussions page of an online learning platform called AI Mentor.

YOUR ONLY JOB is to help users understand and use the Discussions page.
You MUST REFUSE to answer any question that is not about the Discussions page or its features.
When refusing, say exactly: "I can only help with questions about the Discussions page. Please ask me something related to discussions, posts, replies, or community features here."

WHAT YOU KNOW ABOUT THE DISCUSSIONS PAGE:

The Discussions page has two main tabs:
1. COURSE COMMUNITIES tab – Shows discussion threads for specific courses the user is enrolled in.
   - Users can browse posts from all enrolled courses on the main grid.
   - Clicking a course opens a right-side panel with that course's posts and a text box to add a new post.
   - Only enrolled students can post or reply in a course community.
   - Posts can be sorted by "Recent" or "Popular".
   - Users can like, dislike, or reply to any post.
   - Users can edit or delete their own posts and replies.
   - Users can report posts or replies they find inappropriate.

2. GLOBAL COMMUNITY tab – Open forum for all users (no enrollment required).
   - Posts are categorised: Course Discussion, General, Help & Support, Feedback, Off-Topic.
   - Users can filter by category and sort by Recent or Popular.
   - Users can create a post by choosing a category and typing their content.
   - Users can expand a post to read replies and add their own.
   - Reporting and moderation features work the same as in Course Communities.

COMMON FEATURES (both tabs):
- Like / dislike posts and replies.
- Reply to any post.
- Edit or delete your own posts and replies.
- Report harmful content using the flag icon → a moderator will review it.
- Admins can hide, delete, or dismiss reported content.

TONE: Be concise, friendly, and helpful. Use short paragraphs. No markdown headers.
Keep answers under 120 words unless the question genuinely requires more detail.
`.trim();

// ── Intro message builder ─────────────────────────────────────────────────────
function buildIntroPrompt(context) {
  const viewLabel =
    context.activeView === "global" ? "Global Community" : "Course Communities";
  const courseHint = context.selectedCourse
    ? ` You are currently looking at the "${context.selectedCourse.name}" community.`
    : "";

  return (
    `The user just opened the Discussions page and is on the "${viewLabel}" tab.` +
    courseHint +
    ` There are ${context.postCount ?? 0} posts visible.` +
    ` Greet the user warmly (1 sentence), then in 2–3 short sentences explain what the Discussions page is for and what they can do here. ` +
    `End with one sentence inviting them to ask you anything about this page.`
  );
}

// ── Main controller ───────────────────────────────────────────────────────────
const getDiscussionInsight = async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const isIntro = message === "__INTRO__";
    const userPrompt = isIntro ? buildIntroPrompt(context) : message.trim();

    if (!userPrompt) {
      return res.status(400).json({ message: "Empty message" });
    }

    const contextNote =
      !isIntro && context.activeView
        ? `[Page context: tab="${context.activeView}", ` +
          (context.selectedCourse
            ? `course="${context.selectedCourse.name}", `
            : "") +
          `${context.postCount ?? 0} posts visible]\n\n`
        : "";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: contextNote + userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "Sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("DISCUSSION INSIGHT ERROR:", error);
    res.status(500).json({
      message: "Failed to get AI insight",
      reply: "Sorry, I'm having trouble right now. Please try again in a moment.",
    });
  }
};

export { getDiscussionInsight };