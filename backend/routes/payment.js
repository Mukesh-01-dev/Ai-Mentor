import express from "express";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/authMiddleware.js";
import Payment from "../models/Payment.js";

const router = express.Router();

// ✅ Validate required env vars at startup
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: "Too many payment attempts. Try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ CREATE CHECKOUT SESSION — with idempotency protection
router.post("/create-checkout-session", protect,paymentLimiter, async (req, res) => {
  try {
    const { course, idempotencyKey } = req.body;
    const userId = req.user.id; // ✅ from JWT token — never trust req.body for userId

    // Validate inputs
    if (!course || !course.id || !course.title || !course.priceValue || Number(course.priceValue) <= 0) {
      return res.status(400).json({ error: "Invalid course data" });
    }

    // Idempotency key must be generated once client-side and reused on retry
    if (!idempotencyKey) {
      return res.status(400).json({ error: "idempotencyKey is required" });
    }

    // ─────────────────────────────────────────────────
    // STEP 1: CHECK IDEMPOTENCY
    // If cacheExpiresAt has passed, request is NOT idempotent — process as new payment
    // ─────────────────────────────────────────────────
    const existing = await Payment.findOne({ where: { idempotencyKey } });

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
        userId: userId.toString(),        // ✅ from JWT — secure
        paymentId: payment.id,
        idempotencyKey,
      },
      success_url: successUrl,
      cancel_url: `${process.env.FRONTEND_URL}/courses`,
    });

    // ─────────────────────────────────────────────────
    // STEP 4: UPDATE payment + cache response
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

// ✅ GET PAYMENT STATUS — check if payment succeeded (useful when webhook is slow)
router.get("/status/:paymentId", protect, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Only allow user to check their own payment
    if (payment.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    return res.status(200).json({
      paymentId: payment.id,
      status: payment.status,
      courseId: payment.courseId,
      courseTitle: payment.courseTitle,
      amount: payment.amount,
      currency: payment.currency,
      gateway: payment.gateway,
      createdAt: payment.createdAt,
    });
  } catch (error) {
    console.error("❌ Payment Status Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch payment status" });
  }
});

export default router;
