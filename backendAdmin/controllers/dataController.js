import { User, Course, CommunityPost, Report } from "../models/index.js";

const ensureReportSeed = async () => {
  try {
    await CommunityPost.sync();
    await Report.sync();
    if (await Report.count() > 0) return;
    let users = await User.findAll({ limit: 2 });
    if (users.length < 2) {
      users = await User.bulkCreate([
        { name: "John Reporter", email: "john@example.com", role: "user" },
        { name: "Alice Author", email: "alice@example.com", role: "user" },
      ]);
    }
    let post = await CommunityPost.findOne();
    if (!post) {
      post = await CommunityPost.create({ content: "This is a suspicious community post that might get reported.", userId: users[1].id });
    }
    await Report.bulkCreate([
      { reporterId: users[0].id, postId: post.id, reason: "spam", description: "This looks like a spam message to me.", status: "pending" },
      { reporterId: users[0].id, postId: post.id, reason: "inappropriate", description: "The language used here is not suitable for the platform.", status: "resolved" },
    ]);
  } catch (error) {
    console.error("SEED REPORTS ERROR:", error.message);
  }
};

export const getAllEnrollments = async (req, res) => {
  try {
    const { type = "stats" } = req.query;
    const users = await User.findAll({ attributes: ["id", "purchasedCourses", "email", "name"] });
    const courses = await Course.findAll({ attributes: ["id", "priceValue", "title"] });
    const coursePriceMap = {};
    courses.forEach(c => coursePriceMap[c.id] = c.priceValue || 0);

    if (type === "stats") {
      let totalEnrollments = 0, totalRevenue = 0, activeUsersSet = new Set();
      const now = new Date(), activeThresholdDays = 7;
      users.forEach(u => {
        (u.purchasedCourses || []).forEach(c => {
          totalEnrollments++;
          totalRevenue += coursePriceMap[c.courseId] || 0;
          if (c.progress?.lastWatched && (now - new Date(c.progress.lastWatched)) / (1000 * 60 * 60 * 24) <= activeThresholdDays) activeUsersSet.add(u.id);
        });
      });
      return res.json({ success: true, data: { totalEnrollments, totalUsers: users.length, activeUsers: activeUsersSet.size, totalRevenue, totalCourses: courses.length } });
    }

    if (type === "list") {
      const page = parseInt(req.query.page) || 1, limit = Math.min(parseInt(req.query.limit) || 10, 50);
      let enrollments = [];
      users.forEach(u => (u.purchasedCourses || []).forEach(c => enrollments.push({ user: u.name, email: u.email, course: c.courseTitle, date: c.purchaseDate, amount: coursePriceMap[c.courseId] || 0, status: "completed" })));
      enrollments.sort((a, b) => new Date(b.date) - new Date(a.date));
      const total = enrollments.length, start = (page - 1) * limit;
      return res.json({ success: true, total, page, limit, totalPages: Math.ceil(total / limit), data: enrollments.slice(start, start + limit) });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1), limit = Math.min(parseInt(req.query.limit) || 10, 100), search = String(req.query.search || "").trim().toLowerCase();
    const [users, courses] = await Promise.all([User.findAll({ attributes: ["id", "name", "email", "purchasedCourses"] }), Course.findAll({ attributes: ["id", "title", "priceValue", "currency"] })]);
    const courseMap = {};
    courses.forEach(c => courseMap[String(c.id)] = { title: c.title, priceValue: Number(c.priceValue || 0), currency: c.currency || "INR" });
    let payments = [];
    users.forEach(u => (u.purchasedCourses || []).forEach((item, idx) => {
      const courseInfo = courseMap[String(item.courseId)] || {};
      payments.push({ paymentId: `${u.id}-${item.courseId}-${item.purchaseDate || idx}`, userId: u.id, userName: u.name, email: u.email, courseId: item.courseId, courseTitle: item.courseTitle || courseInfo.title, amount: item.amount ?? courseInfo.priceValue ?? 0, currency: item.currency || courseInfo.currency, status: item.paymentStatus || "paid", transactionId: item.transactionId || item.orderId, purchaseDate: item.purchaseDate });
    }));
    if (search) payments = payments.filter(p => [p.userName, p.email, p.courseTitle, p.transactionId].filter(Boolean).join(" ").toLowerCase().includes(search));
    payments.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));
    const total = payments.length, start = (page - 1) * limit;
    res.json({ success: true, page, limit, total, totalPages: Math.ceil(total / limit), summary: { totalPayments: total, totalAmount: payments.reduce((s, p) => s + Number(p.amount || 0), 0) }, data: payments.slice(start, start + limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllReports = async (req, res) => {
  try {
    await ensureReportSeed();
    const reports = await Report.findAll({
      include: [
        { model: User, as: "reporter", attributes: ["id", "name", "email"] },
        { model: CommunityPost, as: "post", attributes: ["id", "content"], include: [{ model: User, as: "author", attributes: ["id", "name"] }] }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
