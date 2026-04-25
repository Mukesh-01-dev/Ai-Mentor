import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Course from "../models/Course.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new Admin (restricted to superAdmin)
// @route   POST /api/admin/register
// @access  Private/SuperAdmin
const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const adminExists = await Admin.findOne({ where: { email } });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || "admin",
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

    // prevent superAdmin from deleting themselves
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

// @desc    Logout Admin / Clear Cookie (if using cookies)
// @route   POST /api/admin/logout
// @access  Private
const logoutAdmin = async (req, res) => {
  res.json({ message: "Logged out successfully. Please remove your token on the client side." });
};

//
const getAllEnrollments = async (req, res) => {
  try {
    const { type = "stats" } = req.query;

    // 👉 Fetch required data
    const users = await User.findAll({
      attributes: ["id", "purchasedCourses", "email", "name"],
    });

    const courses = await Course.findAll({
      attributes: ["id", "priceValue", "title"],
    });

    // 👉 Create course price map
    const coursePriceMap = {};
    courses.forEach(course => {
      coursePriceMap[course.id] = course.priceValue || 0;
    });

    //stats start
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

            // 💰 Revenue
            totalRevenue += coursePriceMap[course.courseId] || 0;

            // ⚡ Active Users (lastWatched within 7 days)
            if (course.progress?.lastWatched) {
              const lastWatched = new Date(course.progress.lastWatched);
              const diffDays =
                (now - lastWatched) / (1000 * 60 * 60 * 24);

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
        },
      });
    }
    //stats ends

    //list
    if (type === "list") {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      let enrollments = [];

      users.forEach(user => {
        const purchased = user.purchasedCourses || [];

        purchased.forEach(course => {
          enrollments.push({
            userName: user.name,
            email: user.email,
            courseTitle: course.courseTitle,
            purchaseDate: course.purchaseDate,
            amount: coursePriceMap[course.courseId] || 0,
          });
        });
      });

      // 👉 Sort by latest purchase
      enrollments.sort(
        (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
      );

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
    //list ends

    //recent starts
    if (type === "recent") {
      const limit = Math.min(parseInt(req.query.limit) || 10, 20);

      let enrollments = [];

      users.forEach(user => {
        const purchased = user.purchasedCourses || [];

        purchased.forEach(course => {
          enrollments.push({
            userName: user.name,
            email: user.email,
            courseTitle: course.courseTitle,
            purchaseDate: course.purchaseDate,
            amount: coursePriceMap[course.courseId] || 0,
          });
        });
      });

      // 🔥 Sort latest first
      enrollments.sort(
        (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
      );

      return res.status(200).json({
        success: true,
        count: Math.min(limit, enrollments.length),
        data: enrollments.slice(0, limit),
      });
    }
    //recent ends 

    //top courses start
    if (type === "top-courses") {
      const limit = Math.min(parseInt(req.query.limit) || 5, 10);

      const courseCountMap = {};

      // Step 1 & 2: Count frequency
      users.forEach(user => {
        const purchased = user.purchasedCourses || [];

        purchased.forEach(course => {
          if (!courseCountMap[course.courseId]) {
            courseCountMap[course.courseId] = 0;
          }
          courseCountMap[course.courseId]++;
        });
      });

      // Step 3: Convert to array
      let result = Object.keys(courseCountMap).map(courseId => ({
        courseId: Number(courseId),
        totalPurchases: courseCountMap[courseId],
      }));

      // Step 4: Add course title
      result = result.map(item => ({
        ...item,
        courseTitle: courses.find(c => c.id === item.courseId)?.title || "Unknown",
      }));

      // Step 5: Sort
      result.sort((a, b) => b.totalPurchases - a.totalPurchases);

      return res.status(200).json({
        success: true,
        count: Math.min(limit, result.length),
        data: result.slice(0, limit),
      });
    }
    //top courses ends

    //user id starts
    if (type === "user") {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const purchased = user.purchasedCourses || [];

      let totalSpent = 0;

      const enrollments = purchased.map(course => {
        const amount = coursePriceMap[course.courseId] || 0;
        totalSpent += amount;

        return {
          courseId: course.courseId,
          courseTitle: course.courseTitle,
          purchaseDate: course.purchaseDate,
          amount,
          progressPercent: course.progress?.progressPercent || 0,
          lastWatched: course.progress?.lastWatched || null,
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          totalCoursesPurchased: enrollments.length,
          totalSpent,
          enrollments,
        },
      });
    }
    //user id ends

    //course starts
    if (type === "course") {
      const { courseId } = req.query;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: "courseId is required",
        });
      }

      const course = courses.find(c => c.id == courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      let totalEnrollments = 0;
      let activeUsersSet = new Set();

      const now = new Date();
      const activeThresholdDays = 7;

      let usersList = [];

      users.forEach(user => {
        const purchased = user.purchasedCourses || [];

        purchased.forEach(c => {
          if (c.courseId == courseId) {
            totalEnrollments++;

            usersList.push({
              userName: user.name,
              email: user.email,
              purchaseDate: c.purchaseDate,
              progressPercent: c.progress?.progressPercent || 0,
            });

            if (c.progress?.lastWatched) {
              const lastWatched = new Date(c.progress.lastWatched);
              const diffDays =
                (now - lastWatched) / (1000 * 60 * 60 * 24);

              if (diffDays <= activeThresholdDays) {
                activeUsersSet.add(user.id);
              }
            }
          }
        });
      });

      return res.status(200).json({
        success: true,
        data: {
          course: {
            id: course.id,
            title: course.title,
            price: course.priceValue,
          },
          totalEnrollments,
          activeUsers: activeUsersSet.size,
          users: usersList,
        },
      });
    }
    //course ends

    // fallback
    res.status(400).json({
      success: false,
      message: "Invalid type parameter",
    });

  } catch (error) {
    console.error("ENROLLMENTS ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

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
      const purchased = Array.isArray(user.purchasedCourses)
        ? user.purchasedCourses
        : [];

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
          courseTitle:
            item.courseTitle || courseInfo.title || `Course ${item.courseId}`,
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
        const text = [
          payment.userName,
          payment.email,
          payment.courseTitle,
          payment.transactionId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(search);
      });
    }

    payments.sort(
      (a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0)
    );

    const total = payments.length;
    const totalAmount = payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

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
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) { 
    console.error("GET COURSES ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "purchasedCourses", "createdAt"],
    });
    res.status(200).json({ 
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

export {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  deleteAdmin,
  logoutAdmin,
  getAllEnrollments,
  getAllPayments,
  getAllCourses,
  getAllUsers,
};
