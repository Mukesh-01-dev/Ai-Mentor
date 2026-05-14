import dotenv from "dotenv";
import { connectDB, sequelize } from "../config/db.js";
import { User, Course } from "../models/index.js";
import { Op, Sequelize } from "sequelize";

dotenv.config();

const seedPaymentData = async () => {
  try {
    await connectDB();
    await User.sync({ alter: true });
    await Course.sync({ alter: true });

    // ✅ Fix: Check if any user has a non-empty purchasedCourses JSON array
    const existingPayment = await User.findOne({
      where: Sequelize.where(
        Sequelize.fn("json_array_length", Sequelize.col("purchasedCourses")),
        {
          [Op.gt]: 0,
        },
      ),
    });
    // if (existingPayment) {
    //   console.log("Payment data already exists. Skipping seed.");
    //   process.exit(0);
    // }

    // ---------- 1. Create sample courses ----------
    const sampleCourses = [
      { title: "Mastering React", priceValue: 499, currency: "INR" },
      { title: "Node.js for Backend", priceValue: 699, currency: "INR" },
      { title: "Full‑Stack Web Dev", priceValue: 999, currency: "INR" },
    ];

    const createdCourses = [];
    for (const courseData of sampleCourses) {
      const [course, created] = await Course.findOrCreate({
        where: { title: courseData.title },
        defaults: courseData,
      });
      createdCourses.push(course);
      if (created) console.log(`Created course: ${course.title}`);
    }

    // ---------- 2. Create users with realistic transactions ----------
    const sampleUsers = [
      {
        name: "Rahul Sharma",
        firstName: "Rahul",
        lastName: "Sharma",
        email: "rahul@example.com",
        role: "user",
        purchasedCourses: [
          {
            courseId: createdCourses[0].id,
            courseTitle: createdCourses[0].title,
            amount: createdCourses[0].priceValue,
            currency: "INR",
            paymentStatus: "paid",
            transactionId: "GP-UPI-AXI-2025-0012345678",
            purchaseDate: new Date("2025-01-15"),
          },
          {
            courseId: createdCourses[1].id,
            courseTitle: createdCourses[1].title,
            amount: createdCourses[1].priceValue,
            currency: "INR",
            paymentStatus: "paid",
            transactionId: "UTR-2025-02-10-9876543210",
            purchaseDate: new Date("2025-02-10"),
          },
        ],
      },
      {
        name: "Priya Mehta",
        firstName: "Priya",
        lastName: "Mehta",
        email: "priya@example.com",
        role: "user",
        purchasedCourses: [
          {
            courseId: createdCourses[2].id,
            courseTitle: createdCourses[2].title,
            amount: createdCourses[2].priceValue,
            currency: "INR",
            paymentStatus: "paid",
            transactionId: "T10F8G6H4J2K1L9M7N5P3R0Q.token.2025-03-05",
            purchaseDate: new Date("2025-03-05"),
          },
        ],
      },
      {
        name: "Amit Kumar",
        firstName: "Amit",
        lastName: "Kumar",
        email: "amit@example.com",
        role: "user",
        purchasedCourses: [
          {
            courseId: createdCourses[0].id,
            courseTitle: createdCourses[0].title,
            amount: createdCourses[0].priceValue,
            currency: "INR",
            paymentStatus: "paid",
            transactionId: "HDFC-25-03-20-123456789012",
            purchaseDate: new Date("2025-03-20"),
          },
        ],
      },
    ];

    for (const userData of sampleUsers) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData,
      });
      if (created) console.log(`Created user: ${user.name} (${user.email})`);
    }

    console.log("✅ Payment seed data inserted successfully.");
    console.log(
      "📊 Summary: 3 courses created, 3 users with 4 payment records.",
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed payment data:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close().catch(() => {});
  }
};

seedPaymentData();
