import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

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

export { registerAdmin, loginAdmin, getAdminProfile, deleteAdmin, logoutAdmin };
