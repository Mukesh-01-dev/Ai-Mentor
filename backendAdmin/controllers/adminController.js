import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

// Define Admin model
const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("superadmin", "admin"),
      defaultValue: "admin",
    },
  },
  {
    timestamps: true,
    tableName: "Admins",
  }
);

// Add password hashing and comparison methods
Admin.beforeCreate(async (admin) => {
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
});

Admin.prototype.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Import models from main backend
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define User model to read from backend database
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: DataTypes.STRING,
    googleId: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    purchasedCourses: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    bookmarkedCourses: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    tableName: "Users",
  }
);

// Define Course model — ONLY columns that actually exist in the DB
// Actual columns: id, title, category, priceValue, currency, createdAt, updatedAt
const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    category: DataTypes.STRING,
    priceValue: DataTypes.FLOAT,
    currency: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: "published",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    tableName: "Courses",
  }
);

const CommunityPost = sequelize.define(
  "CommunityPost",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: DataTypes.TEXT,
    userId: DataTypes.UUID,
  },
  {
    timestamps: true,
    tableName: "CommunityPosts",
  }
);

const Report = sequelize.define(
  "Report",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    tableName: "Reports",
  }
);

// Setup Associations
Report.belongsTo(User, { foreignKey: "reporterId", as: "reporter" });
Report.belongsTo(CommunityPost, { foreignKey: "postId", as: "post" });
CommunityPost.belongsTo(User, { foreignKey: "userId", as: "author" });

const AdminNotification = sequelize.define(
  "AdminNotification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "general",
    },
    unread: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "AdminNotifications",
  }
);

let notificationSeedPromise = null;

const ensureNotificationSeed = async () => {
  if (!notificationSeedPromise) {
    notificationSeedPromise = (async () => {
      await AdminNotification.sync();
      const count = await AdminNotification.count();
      if (count > 0) {
        return;
      }

      const [latestCourse, latestUser, latestAdmin] = await Promise.all([
        Course.findOne({ attributes: ["title", "createdAt"], order: [["createdAt", "DESC"]] }),
        User.findOne({ attributes: ["name", "createdAt"], order: [["createdAt", "DESC"]] }),
        Admin.findOne({ attributes: ["name", "createdAt"], order: [["createdAt", "DESC"]] }),
      ]);

      const seedRows = [];

      if (latestUser) {
        seedRows.push({
          title: "New user joined",
          message: `${latestUser.name || "A user"} created a new account.`,
          type: "user",
          unread: true,
          createdAt: latestUser.createdAt,
          updatedAt: latestUser.createdAt,
        });
      }

      if (latestCourse) {
        seedRows.push({
          title: "Course update",
          message: `${latestCourse.title || "A course"} is available in catalog.`,
          type: "course",
          unread: true,
          createdAt: latestCourse.createdAt,
          updatedAt: latestCourse.createdAt,
        });
      }

      if (latestAdmin) {
        seedRows.push({
          title: "Admin activity",
          message: `${latestAdmin.name || "An admin"} has admin access.`,
          type: "admin",
          unread: false,
          createdAt: latestAdmin.createdAt,
          updatedAt: latestAdmin.createdAt,
        });
      }

      if (seedRows.length === 0) {
        seedRows.push({
          title: "Welcome",
          message: "Notification center is now active.",
          type: "system",
          unread: false,
        });
      }

      await AdminNotification.bulkCreate(seedRows);
    })().catch((error) => {
      notificationSeedPromise = null;
      throw error;
    });
  }

  await notificationSeedPromise;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new Admin (restricted to superAdmin)
// @route   POST /api/admin/register
// @access  Private/SuperAdmin
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  try {
    const adminExists = await Admin.findOne({ where: { email } });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: "admin",
    });

    res.status(201).json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("REGISTER ADMIN ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Login Admin
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("LOGIN ADMIN ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Current Admin Profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = async (req, res) => {
  if (req.admin) {
    res.json({
      id: req.admin.id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
    });
  } else {
    res.status(404).json({ message: "Admin not found" });
  }
};

// @desc    Delete an Admin (restricted to superAdmin)
// @route   DELETE /api/admin/:id
// @access  Private/SuperAdmin
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
    res.json({ message: "Admin removed" });
  } catch (error) {
    console.error("DELETE ADMIN ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Logout Admin
// @route   POST /api/admin/logout
// @access  Private
const logoutAdmin = async (req, res) => {
  res.json({ message: "Logged out successfully. Please remove your token on the client side." });
};

// @desc    Get all Enrollments
// @route   GET /api/admin/enrollments
// @access  Private
const getAllEnrollments = async (req, res) => {
  try {
    const { type = "stats" } = req.query;

    const users = await User.findAll({
      attributes: ["id", "purchasedCourses", "email", "name"],
    });

    const courses = await Course.findAll({
      attributes: ["id", "priceValue", "title"],
    });

    const coursePriceMap = {};
    courses.forEach(course => {
      coursePriceMap[course.id] = course.priceValue || 0;
    });

    if (type === "stats") {
      let totalEnrollments = 0;
      let totalRevenue = 0;
      let activeUsersSet = new Set();

      const now = new Date();
      const activeThresholdDays = 7;

      users.forEach(user => {
        const purchased = user.purchasedCourses || [];

        if (purchased.length > 0) {
          purchased.forEach(course => {
            totalEnrollments++;
            totalRevenue += coursePriceMap[course.courseId] || 0;

            if (course.progress?.lastWatched) {
              const lastWatched = new Date(course.progress.lastWatched);
              const diffDays = (now - lastWatched) / (1000 * 60 * 60 * 24);

              if (diffDays <= activeThresholdDays) {
                activeUsersSet.add(user.id);
              }
            }
          });
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          totalEnrollments,
          totalUsers: users.length,
          activeUsers: activeUsersSet.size,
          totalRevenue,
          totalCourses: courses.length,
        },
      });
    }

    if (type === "list") {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      let enrollments = [];

      users.forEach(user => {
        const purchased = user.purchasedCourses || [];

        purchased.forEach(course => {
          enrollments.push({
            user: user.name,
            email: user.email,
            course: course.courseTitle,
            date: course.purchaseDate,
            amount: coursePriceMap[course.courseId] || 0,
            status: "completed",
          });
        });
      });

      enrollments.sort((a, b) => new Date(b.date) - new Date(a.date));

      const total = enrollments.length;
      const start = (page - 1) * limit;
      const paginatedData = enrollments.slice(start, start + limit);

      return res.status(200).json({
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: paginatedData,
      });
    }

    res.status(400).json({ success: false, message: "Invalid type parameter" });
  } catch (error) {
    console.error("ENROLLMENTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all Payments
// @route   GET /api/admin/payments
// @access  Private
const getAllPayments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const search = String(req.query.search || "").trim().toLowerCase();

    const users = await User.findAll({
      attributes: ["id", "name", "email", "purchasedCourses"],
    });

    const courses = await Course.findAll({
      attributes: ["id", "title", "priceValue", "currency"],
    });

    const courseMap = {};
    courses.forEach((course) => {
      courseMap[String(course.id)] = {
        title: course.title,
        priceValue: Number(course.priceValue || 0),
        currency: course.currency || "INR",
      };
    });

    let payments = [];

    users.forEach((user) => {
      const purchased = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];

      purchased.forEach((item, index) => {
        if (!item || typeof item !== "object") {
          return;
        }

        const parsedCourseId = Number(item.courseId);
        if (!Number.isFinite(parsedCourseId)) {
          return;
        }

        const courseId = parsedCourseId;
        const courseInfo = courseMap[String(courseId)] || {};
        const rawAmount = item.amount ?? courseInfo.priceValue ?? 0;
        const parsedAmount = Number(rawAmount);
        const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
        const purchaseDate = item.purchaseDate || null;

        payments.push({
          paymentId: `${user.id}-${courseId}-${purchaseDate || index}`,
          userId: user.id,
          userName: user.name,
          email: user.email,
          courseId,
          courseTitle: item.courseTitle || courseInfo.title || `Course ${item.courseId}`,
          amount,
          currency: item.currency || courseInfo.currency || "INR",
          status: item.paymentStatus || "paid",
          paymentMethod: item.paymentMethod || null,
          transactionId: item.transactionId || item.orderId || null,
          purchaseDate,
        });
      });
    });

    if (search) {
      payments = payments.filter((payment) => {
        const text = [payment.userName, payment.email, payment.courseTitle, payment.transactionId]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(search);
      });
    }

    payments.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));

    const total = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const start = (page - 1) * limit;
    const data = payments.slice(start, start + limit);

    return res.status(200).json({
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
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all Courses
// @route   GET /api/admin/courses
// @access  Private
const getAllCourses = async (req, res) => {
  try {
    // Only select columns that actually exist in the Courses table
    const courses = await Course.findAll({
      attributes: ["id", "title", "category", "priceValue", "currency", "createdAt", "updatedAt"],
    });
    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("GET COURSES ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all Users
// @route   GET /api/admin/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "purchasedCourses", "createdAt"],
    });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all Admins
// @route   GET /api/admin/admins
// @access  Private
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ["id", "name", "email", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("GET ADMINS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
// @access  Private
const getAdminNotifications = async (req, res) => {
  try {
    await ensureNotificationSeed();
    const notifications = await AdminNotification.findAll({
      order: [["createdAt", "DESC"]],
      limit: 30,
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/admin/notifications/mark-all-read
// @access  Private
const markAllNotificationsRead = async (req, res) => {
  try {
    await AdminNotification.update({ unread: false }, { where: { unread: true } });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Mark one notification as read
// @route   PATCH /api/admin/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await AdminNotification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.unread = false;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error("MARK READ ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/admin/notifications/clear
// @access  Private
const clearAllNotifications = async (req, res) => {
  try {
    await AdminNotification.destroy({ where: {} });
    res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    console.error("CLEAR NOTIFICATIONS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const ensureReportSeed = async () => {
  try {
    await CommunityPost.sync();
    await Report.sync();

    const reportCount = await Report.count();
    if (reportCount > 0) return;

    // Get or create users
    let users = await User.findAll({ limit: 2 });
    if (users.length < 2) {
      const dummyUsers = await User.bulkCreate([
        {
          name: "John Reporter",
          email: "john@example.com",
          role: "user",
        },
        {
          name: "Alice Author",
          email: "alice@example.com",
          role: "user",
        },
      ]);
      users = dummyUsers;
    }

    // Get or create post
    let post = await CommunityPost.findOne();
    if (!post) {
      post = await CommunityPost.create({
        content: "This is a suspicious community post that might get reported.",
        userId: users[1].id,
      });
    }

    // Create dummy reports
    await Report.bulkCreate([
      {
        reporterId: users[0].id,
        postId: post.id,
        reason: "spam",
        description: "This looks like a spam message to me.",
        status: "pending",
      },
      {
        reporterId: users[0].id,
        postId: post.id,
        reason: "inappropriate",
        description: "The language used here is not suitable for the platform.",
        status: "resolved",
      },
    ]);

    console.log("✅ Reports seeded successfully!");
  } catch (error) {
    console.error("SEED REPORTS ERROR:", error.message);
  }
};

// @desc    Get all Reports
// @route   GET /api/admin/reports
// @access  Private
const getAllReports = async (req, res) => {
  try {
    await ensureReportSeed();
    const reports = await Report.findAll({
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "name", "email"],
        },
        {
          model: CommunityPost,
          as: "post",
          attributes: ["id", "content"],
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Create a new Course
// @route   POST /api/admin/courses
// @access  Private
const createCourse = async (req, res) => {
  try {
    const { title, category, priceValue, currency } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const course = await Course.create({
      title,
      category,
      priceValue: parseFloat(priceValue) || 0,
      currency: currency || "INR",
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  Admin,
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  deleteAdmin,
  logoutAdmin,
  getAllEnrollments,
  getAllPayments,
  getAllCourses,
  createCourse,
  getAllUsers,
  getAllAdmins,
  getAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  clearAllNotifications,
  getAllReports,
};
