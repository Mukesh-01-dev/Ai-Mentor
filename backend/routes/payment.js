import express from "express";
import Stripe from "stripe";
import rateLimit from "express-rate-limit"; // 1️⃣ Import express-rate-limit
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 2️⃣ Configure the rate limiter for payment creations
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 request per windowMs
  message: {
    error: "Too many payment attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// ✅ CREATE CHECKOUT SESSION (3️⃣ Injected paymentLimiter middleware)
router.post("/create-checkout-session", protect, paymentLimiter, async (req, res) => {
  try {
    const { course } = req.body;

    console.log("Incoming course:", course);

    // ✅ Validate course data
    if (
      !course ||
      !course.id ||
      !course.title ||
      !course.priceValue ||
      Number(course.priceValue) <= 0
    ) {
      return res.status(400).json({
        error: "Invalid course data",
      });
    }

    // ✅ Convert price safely (₹ → paise)
    const amount = Math.round(Number(course.priceValue) * 100);

    // ✅ Build success URL
    const successUrl = `${process.env.FRONTEND_URL}/success?courseId=${course.id}&title=${encodeURIComponent(course.title)}`;

    console.log("✅ SUCCESS URL:", successUrl); // 🔥 DEBUG

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.title,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      // ✅ SECURE FIX: Bind the verified user ID from JWT token to metadata
      metadata: {
        courseId: course.id.toString(),
        courseTitle: course.title,
        userId: req.user.id.toString(), // Attaches the secure user ID from the token
      },

      success_url: successUrl,

      cancel_url: `${process.env.FRONTEND_URL}/courses`,
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error("❌ Stripe Error:", error.message);

    return res.status(500).json({
      error: "Stripe session failed",
    });
  }
});

export default router;