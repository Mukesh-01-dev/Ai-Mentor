import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    // Verify Stripe webhook signature
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // userId should remain string because your User PK is UUID
        const userId = session.metadata.userId;
        const courseId = Number(session.metadata.courseId);
        const courseTitle = session.metadata.courseTitle;

        const user = await User.findByPk(userId);

        if (!user) {
          console.error("User not found for Stripe webhook:", userId);
          return res.status(404).json({ message: "User not found" });
        }

        const purchasedCourses = Array.isArray(user.purchasedCourses)
          ? user.purchasedCourses
          : [];

        const alreadyPurchased = purchasedCourses.some(
          (c) => Number(c.courseId) === Number(courseId)
        );

        if (!alreadyPurchased) {
          user.purchasedCourses = [
            ...purchasedCourses,
            {
              courseId,
              courseTitle,
              purchaseDate: new Date(),
              paymentStatus: "paid",
              stripeSessionId: session.id,
              progress: {
                completedLessons: [],
                currentLesson: null,
              },
            },
          ];

          user.changed("purchasedCourses", true);
          await user.save();

          console.log(
            `Course ${courseId} added to purchasedCourses for user ${userId}`
          );
        } else {
          console.log(
            `Course ${courseId} already exists in purchasedCourses for user ${userId}`
          );
        }
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Stripe webhook handler error:", error);
      return res.status(500).json({
        message: "Webhook processing failed",
        error: error.message,
      });
    }
  }
);

export default router;