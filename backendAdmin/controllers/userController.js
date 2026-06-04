import { User } from "../models/index.js";

export const getAllUsers = async (req, res) => {
  try {
    // page aur limit query se lo
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // skip calculate karo
    const offset = (page - 1) * limit;

    const { search, status } = req.query;
const { Op } = await import("sequelize");

const where = {};

if (search) {
  where[Op.or] = [
    { name: { [Op.iLike]: `%${search}%` } },
    { email: { [Op.iLike]: `%${search}%` } },
  ];
}

if (status && status !== "all") {
  where.status = status;
}

const users = await User.findAndCountAll({
  attributes: [
    "id",
    "name",
    "email",
    "role",
    "purchasedCourses",
    "createdAt",
    "status",
  ],
  where,
  limit,
  offset,
  order: [["createdAt", "DESC"]],
});

    res.status(200).json({
      success: true,
      totalUsers: users.count,
      currentPage: page,
      totalPages: Math.ceil(users.count / limit),
      data: users.rows,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error.message || error);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "on-hold"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error.message || error);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error.message || error);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};
