import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";

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
            purchasedAt: new Date(),
            progress: {
              completedLessons: [],
              currentLesson: null,
            },
          });

          user.purchasedCourses = purchased;
          await user.save();

          console.log("✅ Course added after payment:", courseId);
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