import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import { createNotification } from "../controllers/notificationController.js";
// 1️⃣ Import the protect middleware safely
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Initialize Razorpay safely
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ CREATE ORDER (2️⃣ Added 'protect' here)
router.post("/create-order", protect, async (req, res) => {
    try {
        const { course } = req.body;

        console.log("Incoming course for Razorpay:", course);

        // ✅ Validate course data
        if (
            !course ||
            !course.id ||
            !course.priceValue ||
            Number(course.priceValue) <= 0
        ) {
            return res.status(400).json({
                error: "Invalid course data",
            });
        }

        // ✅ Convert price safely (₹ → paise)
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

        return res.status(500).json({
            error: "Razorpay order creation failed",
        });
    }
});

// ✅ VERIFY PAYMENT (2️⃣ Added 'protect' here)
router.post("/verify", protect, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courseId,
            courseTitle,
            // ❌ REMOVED: userId from req.body to stop ID spoofing attacks
        } = req.body;

        // 3️⃣ SECURE UPGRADE: Grab the user ID straight from the verified JWT token
        const userId = req.user.id;

        // Validate request parameters (Checking verified userId instead of req.body)
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId || !userId) {
            return res.status(400).json({ success: false, error: "Missing required parameters" });
        }

        // Create signature payload
        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        // Verify signature
        if (razorpay_signature === expectedSign) {
            // Payment is successful, update user's purchased courses
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ success: false, error: "User not found" });
            }

            let purchased = user.purchasedCourses || [];

            // Check duplicate
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
                    console.error("Failed to create notification:", err);
                }

                console.log("✅ Course added after Razorpay payment:", courseId);
            } else {
                console.log("⚠️ Course already purchased:", courseId);
            }

            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, error: "Invalid signature" });
        }
    } catch (error) {
        console.error("❌ Razorpay Verify Error:", error);
        return res.status(500).json({ success: false, error: "Payment verification failed" });
    }
});

export default router;