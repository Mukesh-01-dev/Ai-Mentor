import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { createNotification } from "../controllers/notificationController.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    // ─────────────────────────────────────────────────
    // STEP 1: Verify webhook signature (prevents fake webhooks)
    // ─────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────
    // STEP 2: Handle events
    // ─────────────────────────────────────────────────
    switch (event.type) {

      // ✅ PAYMENT SUCCESS
      case "checkout.session.completed": {
        const session = event.data.object;

        const courseId = session.metadata.courseId;
        const userId = session.metadata.userId;
        const courseTitle = session.metadata.courseTitle;

        console.log(`[Webhook] checkout.session.completed — courseId: ${courseId}, userId: ${userId}`);

        try {
          // Update Payment record status → success
          if (session.id) {
            await Payment.update(
              {
                status: "success",
                stripePaymentIntentId: session.payment_intent,
              },
              { where: { stripeSessionId: session.id } }
            );
          }

          // Find and enroll the user
          const user = await User.findByPk(userId);

          if (!user) {
            console.log("❌ User not found:", userId);
            return res.status(404).send("User not found");
          }

          let purchased = user.purchasedCourses || [];

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

            // Send notification
            try {
              await createNotification(user.id, {
                title: "Course Enrolled 🎉",
                message: `You successfully enrolled in ${courseTitle || "a course"}`,
                type: "course",
                metadata: { courseId },
              });
            } catch (err) {
              console.error("Notification error:", err);
            }

            console.log("✅ Course added after Stripe payment:", courseId);
          } else {
            console.log("⚠️ Course already purchased:", courseId);
          }

        } catch (err) {
          console.error("❌ DB Error in webhook:", err);
        }
        break;
      }

      // ✅ SESSION EXPIRED (user abandoned checkout)
      case "checkout.session.expired": {
        const session = event.data.object;
        if (session.id) {
          await Payment.update(
            { status: "failed" },
            { where: { stripeSessionId: session.id } }
          ).catch(console.error);
          console.log(`[Webhook] Session expired — marked as failed: ${session.id}`);
        }
        break;
      }

      // ✅ PAYMENT FAILED
      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        console.log(`[Webhook] PaymentIntent failed: ${intent.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event: ${event.type}`);
    }

    res.json({ received: true });
  }
);

export default router;
