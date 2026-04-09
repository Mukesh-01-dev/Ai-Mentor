// routes/contactus.js
import express from "express";
import ContactMessage from "../models/contactMessage.js";

const router = express.Router();

/*
POST /api/contactus
Body:
{
  email: "user@gmail.com",
  subject: "Need Help",
  message: "My message here..."
}
*/
router.post("/", async (req, res) => {
  try {
    let { userId, email, subject, message } = req.body;

    // Clean values
    email = email?.trim();
    subject = subject?.trim();
    message = message?.trim();

    // Manual validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!subject || subject.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Subject must be at least 3 characters",
      });
    }

    if (!message || message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters",
      });
    }

    // Save message in DB
    const savedMessage = await ContactMessage.create({
      userId: userId || null,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      data: savedMessage,
    });
  } catch (error) {
    console.error("❌ ContactUs Error:", error);

    // Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while sending message",
    });
  }
});

export default router;
