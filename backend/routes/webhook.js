import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { getEnrollmentEmailTemplate } from "../templates/enrollmentEmailTemplate.js";
import { escapeHtml } from "../utils/userUtils.js";
import { createNotification } from "../controllers/notificationController.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ⚠️ Stripe webhook must use RAW body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ HANDLE PAYMENT SUCCESS
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const courseId = session.metadata.courseId;
      const courseTitle = session.metadata.courseTitle;
      const userId = session.metadata.userId;

      try {
        const user = await User.findByPk(userId);

        if (!user) {
          console.log("❌ User not found");
          return res.status(404).send("User not found");
        }

        // ensure array exists
        let purchased = user.purchasedCourses || [];

        // ✅ check duplicate
        const alreadyPurchased = purchased.find(
          (c) => Number(c.courseId) === Number(courseId)
        );

        if (!alreadyPurchased) {
          purchased.push({
            courseId: Number(courseId),
            courseTitle: courseTitle || "Course",
            purchasedAt: new Date(),
            progress: {
              completedLessons: [],
              currentLesson: null,
            },
          });

          user.purchasedCourses = purchased;
          user.changed("purchasedCourses", true);
          await user.save();

          console.log("✅ Course added after payment:", courseId);

          // ✅ SEND ENROLLMENT EMAIL (NON-BLOCKING)
          try {
            const frontendUrl = process.env.FRONTEND_URL;
            
            // Validation of courseLink (Requirement 6)
            let courseLink;
            if (!frontendUrl) {
              console.warn("⚠️ FRONTEND_URL not set, using fallback for email link");
              courseLink = `http://localhost:5173/learning/${courseId}`;
            } else {
              courseLink = `${frontendUrl}/learning/${courseId}`;
            }

            const emailHtml = getEnrollmentEmailTemplate(
              escapeHtml(user.firstName || user.name || "Student"),
              escapeHtml(courseTitle || "your new course"),
              courseLink
            );

            await sendEmail({
              email: user.email,
              subject: `Enrollment Confirmed: ${courseTitle || "Your Course"}`,
              html: emailHtml,
            });

            console.log("📧 Enrollment email sent successfully to:", user.email);
          } catch (emailError) {
            // Log full error object (stack trace) for debugging SMTP/network issues
            console.error("❌ Failed to send enrollment email from webhook:", emailError);

            // ✅ Log to database for audit trail
            try {
              await createNotification(userId, {
                title: "⚠️ Email Delivery Issue",
                message: `We couldn't send your enrollment confirmation email for ${courseTitle || "your course"}.`,
                type: "alert",
                metadata: {
                  errorMessage: emailError.message,
                  stack: emailError.stack,
                  courseId: courseId,
                },
              });
            } catch (notificationError) {
              console.error("❌ Failed to create email failure notification in webhook:", notificationError);
            }
          }
        } else {
          console.log("⚠️ Course already purchased:", courseId);
        }
      } catch (err) {
        console.error("❌ DB Error:", err);
      }
    }

    res.json({ received: true });
  }
);

export default router;