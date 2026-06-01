import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { createNotification } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const missingEnvVars = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"].filter(
  (key) => !process.env[key],
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing Razorpay environment variables: ${missingEnvVars.join(
      ", ",
    )}. Please check your .env file.`,
  );
}

// ✅ Initialize Razorpay safely
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Configure the rate limiter for payment creations
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    error: "Too many payment attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ CREATE ORDER
router.post("/create-order", protect, paymentLimiter, async (req, res) => {
  try {
    const { course } = req.body;

    if (
      !course ||
      !course.id ||
      !course.priceValue ||
      Number(course.priceValue) <= 0
    ) {
      return res.status(400).json({ error: "Invalid course data" });
    }

    const amount = Math.round(Number(course.priceValue) * 100);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_order_${course.id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("❌ Razorpay Order Error:", error);
    return res.status(500).json({ error: "Razorpay order creation failed" });
  }
});

// ✅ VERIFY PAYMENT
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      courseTitle,
    } = req.body;

    // SECURE: Grab the user ID from verified JWT token (not from req.body)
    const userId = req.user.id;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courseId ||
      !userId
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required parameters" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const user = await User.findByPk(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      let purchased = user.purchasedCourses || [];

      const alreadyPurchased = purchased.find(
        (c) => Number(c.courseId) === Number(courseId),
      );

      if (!alreadyPurchased) {
        purchased.push({
          courseId: Number(courseId),
          courseTitle: courseTitle || "Course",
          purchaseDate: new Date(),
          progress: {
            completedLessons: [],
            currentLesson: null,
          },
        });

        user.purchasedCourses = purchased;
        user.changed("purchasedCourses", true);
        await user.save();

        try {
          await createNotification(user.id, {
            title: "Course Enrolled 🎉",
            message: `You successfully enrolled in ${courseTitle || "a course"}`,
            type: "course",
            metadata: { courseId },
          });
        } catch (err) {
          console.error("Failed to create notification:", err);
        }

        
      } else {
        console.log("⚠️ Course already purchased:", courseId);
      }

      return res
        .status(200)
        .json({ success: true, message: "Payment verified successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Invalid signature" });
    }
  } catch (error) {
    console.error("❌ Razorpay Verify Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Payment verification failed" });
  }
});

export default router;