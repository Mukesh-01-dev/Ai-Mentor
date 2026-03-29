import User from "../models/User.js";

const getAdminUsers = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const query = String(q).trim().toLowerCase();

    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "avatar_url",
        "purchasedCourses",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    const normalized = users
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        joinedAt: user.createdAt,
        purchasedCourses: Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [],
        purchasedCoursesCount: Array.isArray(user.purchasedCourses) ? user.purchasedCourses.length : 0,
      }))
      .filter((user) => {
        if (!query) return true;
        return (
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
        );
      });

    res.json(normalized);
  } catch (error) {
    console.error("GET ADMIN USERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "role must be either user or admin" });
    }

    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ROLE ERROR:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
};

const deleteUserByAdmin = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    if (String(req.user.id) === String(targetUserId)) {
      return res.status(400).json({ message: "Admin cannot delete their own account from admin panel" });
    }

    const deletedCount = await User.destroy({ where: { id: targetUserId } });
    if (!deletedCount) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER BY ADMIN ERROR:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export {
  getAdminUsers,
  updateUserRole,
  deleteUserByAdmin,
};
