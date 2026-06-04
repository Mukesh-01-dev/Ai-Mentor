import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { createNotification } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import Payment from "../models/Payment.js";

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
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Too many payment attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ CREATE ORDER
router.post("/create-order", protect, paymentLimiter, async (req, res) => {
  try {
    const { course,idempotencyKey} = req.body;

    console.log("Incoming course for Razorpay:", course);
    console.log("Idempotency key received:", idempotencyKey);

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

// ✅ FIXED — check idempotency FIRST before creating order
if (!idempotencyKey) {
  return res.status(400).json({ error: "idempotencyKey is required" });
}

// Check if this key already exists — return cached response if so
const existing = await Payment.findOne({ where: { idempotencyKey } });
if (existing && existing.cachedResponse && Object.keys(existing.cachedResponse).length > 0) {
  console.log(`[Idempotency] Returning cached Razorpay response for key: ${idempotencyKey}`);
  return res.status(200).json(existing.cachedResponse);
}

// Save payment record FIRST before calling Razorpay
 console.log(`[Payment] 🔄 Initiating payment for course: ${course.title} | User: ${req.user.id}`);
const payment = await Payment.create({
  userId: req.user.id,
  courseId: course.id,
  courseTitle: course.title || "Course",
  amount,
  currency: "INR",
  status: "initiated",
  gateway: "razorpay",
  idempotencyKey,
  cacheExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
});

// NOW create Razorpay order
let order;
try {
    order = await razorpay.orders.create(options);
} catch (razorpayErr) {
    // Clean up the orphaned payment record
    await payment.update({ status: "failed" });
    console.log(`[Payment] ❌ Razorpay order creation failed | Status: failed`);
    throw razorpayErr; // re-throw to outer catch
}

// Cache the response
const cachedResponse = {
  orderId: order.id,
  amount: order.amount,
  currency: order.currency,
  paymentId: payment.id,
};

await payment.update({
  status: "processing",
  razorpayOrderId: order.id,
  cachedResponse,
});
console.log(`[Payment] ✅ Order created successfully | OrderId: ${order.id} | Status: processing`);

return res.status(200).json(cachedResponse);

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

       const payment = await Payment.findOne({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
    });

    if (payment) {
      await payment.update({
        status: "success",
        razorpayPaymentId: razorpay_payment_id,
      });
    }
    console.log(`[Payment] 💰 Payment verified | OrderId: ${razorpay_order_id} | PaymentId: ${razorpay_payment_id} | Status: success`);
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
    console.log(`[Payment] ❌ Invalid signature | OrderId: ${razorpay_order_id} | Status: failed`);
    return res
      .status(500)
      .json({ success: false, error: "Payment verification failed" });
  }
});

export default router;