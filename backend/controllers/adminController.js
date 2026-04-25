import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Complaint from "../models/Complaint.js";

const ADMIN_TOKEN_TYPE = "admin";

const generateToken = (id) =>
  jwt.sign({ id, type: ADMIN_TOKEN_TYPE }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePurchased = (value) => (Array.isArray(value) ? value : []);

const mapCourseById = (courses) => {
  const result = {};
  for (const course of courses) {
    result[String(course.id)] = course;
  }
  return result;
};

const flattenEnrollments = (users, courseMap) => {
  const rows = [];

  for (const user of users) {
    const purchasedCourses = normalizePurchased(user.purchasedCourses);
    for (let idx = 0; idx < purchasedCourses.length; idx += 1) {
      const purchase = purchasedCourses[idx];
      if (!purchase || typeof purchase !== "object") continue;

      const courseId = Number(purchase.courseId);
      if (!Number.isFinite(courseId)) continue;

      const course = courseMap[String(courseId)];
      const amount = Number(
        purchase.amount ??
          purchase.priceValue ??
          course?.priceValue ??
          0
      );
      const progressPercent = Number(
        purchase.progress?.progressPercent ??
          purchase.progress?.percent ??
          (normalizePurchased(purchase.progress?.completedLessons).length > 0
            ? 25
            : 0)
      );

      const status =
        purchase.status ||
        (progressPercent >= 100 ? "completed" : progressPercent > 0 ? "in_progress" : "active");

      rows.push({
        enrollmentId: `${user.id}-${courseId}-${purchase.purchaseDate || idx}`,
        userId: user.id,
        userName: user.name,
        email: user.email,
        courseId,
        courseTitle:
          purchase.courseTitle || course?.title || `Course ${courseId}`,
        purchaseDate: purchase.purchaseDate || null,
        amount: Number.isFinite(amount) ? amount : 0,
        currency: purchase.currency || course?.currency || "INR",
        paymentStatus: purchase.paymentStatus || "paid",
        paymentMethod: purchase.paymentMethod || null,
        transactionId: purchase.transactionId || purchase.orderId || null,
        progressPercent: Number.isFinite(progressPercent) ? progressPercent : 0,
        status,
      });
    }
  }

  rows.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));
  return rows;
};

const sanitizeAdmin = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  createdAt: admin.createdAt,
});

const loginAdmin = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      ...sanitizeAdmin(admin),
      token: generateToken(admin.id),
    });
  } catch (error) {
    console.error("LOGIN ADMIN ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const logoutAdmin = async (_req, res) => {
  res.json({ message: "Logged out successfully. Please clear the JWT on client side." });
};

const getAdminProfile = async (req, res) => {
  if (!req.admin) {
    return res.status(404).json({ message: "Admin not found" });
  }
  return res.json(sanitizeAdmin(req.admin));
};

const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body || {};

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const safeRole = role === "superAdmin" ? "superAdmin" : "admin";
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists with this email" });
    }

    const admin = await Admin.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password,
      role: safeRole,
    });

    return res.status(201).json({
      success: true,
      data: sanitizeAdmin(admin),
    });
  } catch (error) {
    console.error("REGISTER ADMIN ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 10), 1), 100);
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "").trim();

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role === "admin" || role === "superAdmin") {
      where.role = role;
    }

    const { rows, count } = await Admin.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit,
    });

    return res.json({
      success: true,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      data: rows.map(sanitizeAdmin),
    });
  } catch (error) {
    console.error("GET ADMINS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const adminToDelete = await Admin.findByPk(id);
    if (!adminToDelete) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (adminToDelete.id === req.admin.id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    await adminToDelete.destroy();
    return res.json({ success: true, message: "Admin removed" });
  } catch (error) {
    console.error("DELETE ADMIN ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getDashboardSummary = async (_req, res) => {
  try {
    const [users, courses, complaints] = await Promise.all([
      User.findAll({ attributes: ["id", "name", "email", "createdAt", "purchasedCourses"] }),
      Course.findAll({ attributes: ["id", "title", "priceValue", "currency"] }),
      Complaint.findAll({ attributes: ["id", "status", "createdAt"], order: [["createdAt", "DESC"]], limit: 30 }),
    ]);

    const courseMap = mapCourseById(courses);
    const enrollments = flattenEnrollments(users, courseMap);

    const recentUsers = [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }));

    const recentEnrollments = enrollments.slice(0, 8);
    const recentPayments = enrollments.slice(0, 8).map((row) => ({
      paymentId: row.enrollmentId,
      userName: row.userName,
      email: row.email,
      courseTitle: row.courseTitle,
      amount: row.amount,
      currency: row.currency,
      purchaseDate: row.purchaseDate,
      status: row.paymentStatus,
    }));

    const monthlyMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = { label: d.toLocaleString("en-US", { month: "short" }), enrollments: 0, revenue: 0 };
    }

    for (const row of enrollments) {
      if (!row.purchaseDate) continue;
      const d = new Date(row.purchaseDate);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[key]) continue;
      monthlyMap[key].enrollments += 1;
      monthlyMap[key].revenue += Number(row.amount || 0);
    }

    const charts = Object.values(monthlyMap);
    const paymentsTotal = enrollments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const pendingComplaints = complaints.filter((c) => c.status !== "resolved").length;

    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers: users.length,
          totalCourses: courses.length,
          totalEnrollments: enrollments.length,
          totalPayments: paymentsTotal,
          totalComplaints: complaints.length,
          pendingComplaints,
        },
        recent: {
          users: recentUsers,
          enrollments: recentEnrollments,
          payments: recentPayments,
        },
        charts,
      },
    });
  } catch (error) {
    console.error("DASHBOARD SUMMARY ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 10), 1), 100);
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "").trim();

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ["id", "name", "email", "role", "purchasedCourses", "createdAt"],
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit,
    });

    const data = rows.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      purchasedCoursesCount: normalizePurchased(user.purchasedCourses).length,
      createdAt: user.createdAt,
    }));

    return res.json({
      success: true,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      data,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!["user", "admin", "superAdmin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role === "superAdmin" && req.admin.role !== "superAdmin") {
      return res.status(403).json({ message: "Only super admin can assign superAdmin role" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: "User role updated",
      data: { id: user.id, role: user.role },
    });
  } catch (error) {
    console.error("UPDATE USER ROLE ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 10), 1), 100);
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (category) where.category = category;

    const { rows, count } = await Course.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit,
    });

    return res.json({
      success: true,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    console.error("GET COURSES ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllEnrollments = async (req, res) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 10), 1), 100);
    const search = String(req.query.search || "").trim().toLowerCase();
    const courseId = Number(req.query.courseId);
    const userId = String(req.query.userId || "").trim();
    const status = String(req.query.status || "").trim();

    const [users, courses] = await Promise.all([
      User.findAll({ attributes: ["id", "name", "email", "purchasedCourses"] }),
      Course.findAll({ attributes: ["id", "title", "priceValue", "currency"] }),
    ]);

    const rows = flattenEnrollments(users, mapCourseById(courses)).filter((row) => {
      if (Number.isFinite(courseId) && row.courseId !== courseId) return false;
      if (userId && row.userId !== userId) return false;
      if (status && row.status !== status) return false;
      if (!search) return true;

      const haystack = `${row.userName} ${row.email} ${row.courseTitle}`.toLowerCase();
      return haystack.includes(search);
    });

    const total = rows.length;
    const data = rows.slice((page - 1) * limit, page * limit);

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error("GET ENROLLMENTS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 10), 1), 100);
    const search = String(req.query.search || "").trim().toLowerCase();
    const status = String(req.query.status || "").trim();
    const courseId = Number(req.query.courseId);
    const userId = String(req.query.userId || "").trim();

    const [users, courses] = await Promise.all([
      User.findAll({ attributes: ["id", "name", "email", "purchasedCourses"] }),
      Course.findAll({ attributes: ["id", "title", "priceValue", "currency"] }),
    ]);

    const payments = flattenEnrollments(users, mapCourseById(courses)).filter((row) => {
      if (Number.isFinite(courseId) && row.courseId !== courseId) return false;
      if (userId && row.userId !== userId) return false;
      if (status && row.paymentStatus !== status) return false;

      if (!search) return true;
      const haystack = `${row.userName} ${row.email} ${row.courseTitle} ${row.transactionId || ""}`.toLowerCase();
      return haystack.includes(search);
    });

    const total = payments.length;
    const totalAmount = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const data = payments.slice((page - 1) * limit, page * limit).map((row) => ({
      paymentId: row.enrollmentId,
      userId: row.userId,
      userName: row.userName,
      email: row.email,
      courseId: row.courseId,
      courseTitle: row.courseTitle,
      amount: row.amount,
      currency: row.currency,
      status: row.paymentStatus,
      paymentMethod: row.paymentMethod,
      transactionId: row.transactionId,
      purchaseDate: row.purchaseDate,
    }));

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalPayments: total,
        totalAmount,
      },
      data,
    });
  } catch (error) {
    console.error("GET PAYMENTS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 10), 1), 100);
    const status = String(req.query.status || "").trim();
    const search = String(req.query.search || "").trim();
    const priority = String(req.query.priority || "").trim();

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where[Op.or] = [
        { subject: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Complaint.findAndCountAll({
      where,
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit,
    });

    return res.json({
      success: true,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    console.error("GET COMPLAINTS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const { status, adminNotes, resolution } = req.body || {};
    const allowedStatus = ["open", "in_progress", "resolved", "closed"];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status) complaint.status = status;
    if (typeof adminNotes === "string") complaint.adminNotes = adminNotes.trim();
    if (typeof resolution === "string") complaint.resolution = resolution.trim();
    if (status === "resolved") {
      complaint.resolvedAt = new Date();
      complaint.resolvedByAdminId = req.admin.id;
    }

    await complaint.save();
    return res.json({ success: true, data: complaint });
  } catch (error) {
    console.error("UPDATE COMPLAINT STATUS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  deleteAdmin,
  logoutAdmin,
  getAllAdmins,
  getDashboardSummary,
  getAllEnrollments,
  getAllPayments,
  getAllCourses,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllComplaints,
  updateComplaintStatus,
  ADMIN_TOKEN_TYPE,
};
