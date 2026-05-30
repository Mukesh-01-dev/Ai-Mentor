import express from "express";
import Stripe from "stripe";
import { protect } from "../middleware/authMiddleware.js";
import Payment from "../models/Payment.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ CREATE CHECKOUT SESSION — with idempotency protection
router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    const { course, idempotencyKey } = req.body;
    const userId = req.user.id; // ✅ from JWT token — never trust req.body for userId

    // Validate inputs
    if (!course || !course.id || !course.title || !course.priceValue || Number(course.priceValue) <= 0) {
      return res.status(400).json({ error: "Invalid course data" });
    }

    if (!idempotencyKey) {
      return res.status(400).json({ error: "idempotencyKey is required" });
    }

    // ─────────────────────────────────────────────────
    // STEP 1: CHECK IDEMPOTENCY — was this exact request already made?
    // ─────────────────────────────────────────────────
    const existing = await Payment.findOne({
      where: { idempotencyKey },
    });

    if (existing && existing.cachedResponse && existing.cacheExpiresAt > new Date()) {
      console.log(`[Idempotency] Returning cached response for key: ${idempotencyKey}`);
      return res.status(200).json(existing.cachedResponse);
    }

    // ─────────────────────────────────────────────────
    // STEP 2: SAVE payment record FIRST (status: initiated)
    // ─────────────────────────────────────────────────
    const amount = Math.round(Number(course.priceValue) * 100); // ₹ → paise

    const payment = await Payment.create({
      userId,
      courseId: course.id,
      courseTitle: course.title,
      amount,
      currency: "inr",
      status: "initiated",
      idempotencyKey,
      gateway: "stripe",
      cacheExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hrs
    });

    // ─────────────────────────────────────────────────
    // STEP 3: CREATE Stripe session
    // ─────────────────────────────────────────────────
    const successUrl = `${process.env.FRONTEND_URL}/success?courseId=${course.id}&title=${encodeURIComponent(course.title)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: course.title },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: course.id.toString(),
        courseTitle: course.title,
        userId: userId.toString(),        // ✅ from JWT — safe
        paymentId: payment.id,            // ✅ link back to our DB record
        idempotencyKey,
      },
      success_url: successUrl,
      cancel_url: `${process.env.FRONTEND_URL}/courses`,
    });

    // ─────────────────────────────────────────────────
    // STEP 4: UPDATE payment with Stripe session ID + cache response
    // ─────────────────────────────────────────────────
    const cachedResponse = { url: session.url, paymentId: payment.id };

    await payment.update({
      status: "processing",
      stripeSessionId: session.id,
      cachedResponse,
    });

    return res.status(200).json(cachedResponse);

  } catch (error) {
    console.error("❌ Stripe Error:", error.message);
    return res.status(500).json({ error: "Stripe session failed" });
  }
});

export default router;
