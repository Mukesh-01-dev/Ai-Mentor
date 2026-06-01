import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { createNotification } from "../controllers/notificationController.js";
import { sequelize } from "../config/db.js";

const router = express.Router();

// ✅ Validate required env vars at startup
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ⚠️ Stripe webhook MUST use RAW body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    // ✅ Verify webhook signature
    // Distinguishes between invalid signature (attack) vs missing secret (config error)
    try {
      if (!sig) {
        console.error("[Webhook] Missing stripe-signature header");
        return res.status(400).send("Missing stripe-signature header");
      }
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      // Invalid signature = possible attack or corrupted payload
      console.error("[Webhook] ❌ Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {

      // ✅ PAYMENT SUCCESS
  case "checkout.session.completed": {
  const session = event.data.object;
  const courseId = session.metadata?.courseId;
  const userId = session.metadata?.userId;
  const courseTitle = session.metadata?.courseTitle;

  const transaction = await sequelize.transaction();
  try {
    if (session.id) {
      const payment = await Payment.findOne({
        where: { stripeSessionId: session.id }, transaction
      });

      if (payment?.status === "success") {
        await transaction.rollback();
        console.log("[Webhook] Already processed:", session.id);
        return res.json({ received: true });
      }

      await Payment.update(
        { status: "success", stripePaymentIntentId: session.payment_intent },
        { where: { stripeSessionId: session.id }, transaction }
      );
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
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
        progress: { completedLessons: [], currentLesson: null },
      });
      user.purchasedCourses = purchased;
      user.changed("purchasedCourses", true);
      await user.save({ transaction });
    }

    await transaction.commit();

    // Send notification AFTER commit
    try {
      await createNotification(user.id, {
        title: "Course Enrolled 🎉",
        message: `You successfully enrolled in ${courseTitle || "a course"}`,
        type: "course",
        metadata: { courseId },
      });
    } catch (err) {
      console.error("[Webhook] Notification error:", err);
    }

    console.log("[Webhook] ✅ Payment processed:", courseId);
  } catch (err) {
    await transaction.rollback();
    console.error("[Webhook] ❌ DB Error:", err);
  }
  break;
  }

      // ✅ SESSION EXPIRED
      case "checkout.session.expired": {
        const session = event.data.object;
        if (session.id) {
          await Payment.update(
            { status: "failed" },
            { where: { stripeSessionId: session.id } }
          ).catch(console.error);
          console.log(`[Webhook] Session expired — marked failed: ${session.id}`);
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
