import express from "express";
import Stripe from "stripe";
import { protect } from "../middleware/authMiddleware.js";
import Course from "../models/Course.js";

console.log("paymentRoutes file loaded");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/test", (req, res) => {
  console.log("GET /api/payments/test hit");
  res.json({ message: "Payment route working" });
});

router.post("/create-checkout-session", protect, async (req, res) => {
  console.log("POST /api/payments/create-checkout-session hit");

  try {
    const { courseId } = req.body;

    console.log("courseId received:", courseId);
    console.log("req.user:", req.user);

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

  const course = await Course.findByPk(courseId);
console.log("course found:", course);

if (!course) {
  return res.status(404).json({ message: "Course not found" });
}

const coursePrice = Number(String(course.price).replace(/[^\d.]/g, ""));
console.log("raw course.price:", course.price);
console.log("converted coursePrice:", coursePrice);

if (Number.isNaN(coursePrice) || coursePrice <= 0) {
  return res.status(400).json({
    message: "Invalid course price. Price must be greater than 0.",
  });
}

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.title,
            },
            unit_amount: Math.round(coursePrice * 100), // rupees -> paise
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/courses?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/course/${courseId}`,
      metadata: {
        userId: String(req.user.id),
        courseId: String(course.id),
        courseTitle: course.title,
      },
    });

    console.log("Stripe session created:", session.id);

    return res.json({ url: session.url });
  } catch (error) {
    console.error("CREATE CHECKOUT SESSION ERROR:", error);
    return res.status(500).json({
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
});

export default router;