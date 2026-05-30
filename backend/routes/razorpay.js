import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { createNotification } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const missingEnvVars = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"].filter(
  (key) => !process.env[key]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing Razorpay environment variables: ${missingEnvVars.join(", ")}`
  );
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ CREATE ORDER — with idempotency protection
router.post("/create-order", protect, async (req, res) => {
  try {
    const { course, idempotencyKey } = req.body;
    const userId = req.user.id; // ✅ from JWT — never trust req.body

    if (!course || !course.id || !course.priceValue || Number(course.priceValue) <= 0) {
      return res.status(400).json({ error: "Invalid course data" });
    }

    if (!idempotencyKey) {
      return res.status(400).json({ error: "idempotencyKey is required" });
    }

    // ─────────────────────────────────────────────────
    // STEP 1: CHECK IDEMPOTENCY
    // ─────────────────────────────────────────────────
    const existing = await Payment.findOne({ where: { idempotencyKey } });

    if (existing && existing.cachedResponse && existing.cacheExpiresAt > new Date()) {
      console.log(`[Idempotency] Returning cached Razorpay response for key: ${idempotencyKey}`);
      return res.status(200).json(existing.cachedResponse);
    }

    // ─────────────────────────────────────────────────
    // STEP 2: SAVE payment record FIRST
    // ─────────────────────────────────────────────────
    const amount = Math.round(Number(course.priceValue) * 100);

    const payment = await Payment.create({
      userId,
      courseId: course.id,
      courseTitle: course.title || "Course",
      amount,
      currency: "inr",
      status: "initiated",
      idempotencyKey,
      gateway: "razorpay",
      cacheExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // ─────────────────────────────────────────────────
    // STEP 3: CREATE Razorpay order
    // ─────────────────────────────────────────────────
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${course.id}_${Date.now()}`,
      notes: {
        paymentId: payment.id,
        userId: userId.toString(),
        courseId: course.id.toString(),
      },
    });

    // ─────────────────────────────────────────────────
    // STEP 4: UPDATE payment + cache
    // ─────────────────────────────────────────────────
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

    return res.status(200).json(cachedResponse);

  } catch (error) {
    console.error("❌ Razorpay Order Error:", error);
    return res.status(500).json({ error: "Razorpay order creation failed" });
  }
});

// ✅ VERIFY PAYMENT — signature check + enroll user
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      courseTitle,
    } = req.body;

    const userId = req.user.id; // ✅ from JWT — safe

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return res.status(400).json({ success: false, error: "Missing required parameters" });
    }

    // ─────────────────────────────────────────────────
    // VERIFY Razorpay signature
    // ─────────────────────────────────────────────────
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    // ─────────────────────────────────────────────────
    // UPDATE Payment record to success
    // ─────────────────────────────────────────────────
    await Payment.update(
      {
        status: "success",
        razorpayPaymentId: razorpay_payment_id,
      },
      { where: { razorpayOrderId: razorpay_order_id } }
    );

    // ─────────────────────────────────────────────────
    // ENROLL USER in course
    // ─────────────────────────────────────────────────
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    let purchased = user.purchasedCourses || [];
    const alreadyPurchased = purchased.find(
      (c) => Number(c.courseId) === Number(courseId)
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
        console.error("Notification error:", err);
      }

      console.log("✅ Course added after Razorpay payment:", courseId);
    } else {
      console.log("⚠️ Course already purchased:", courseId);
    }

    return res.status(200).json({ success: true, message: "Payment verified successfully" });

  } catch (error) {
    console.error("❌ Razorpay Verify Error:", error);
    return res.status(500).json({ success: false, error: "Payment verification failed" });
  }
});

export default router;
