import jwt from "jsonwebtoken";
import { Admin } from "../models/index.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  try {
    const adminExists = await Admin.findOne({ where: { email } });
    if (adminExists) return res.status(400).json({ message: "Admin already exists" });
    const admin = await Admin.create({ name, email, password, role: "admin" });
    res.status(201).json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email } });
    if (admin && (await admin.matchPassword(password))) {
      res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, token: generateToken(admin.id) });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAdminProfile = async (req, res) => {
  if (req.admin) {
    res.json({ id: req.admin.id, name: req.admin.name, email: req.admin.email, role: req.admin.role });
  } else {
    res.status(404).json({ message: "Admin not found" });
  }
};

export const logoutAdmin = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const adminToDelete = await Admin.findByPk(id);
    if (!adminToDelete) return res.status(404).json({ message: "Admin not found" });
    if (adminToDelete.id === req.admin.id) return res.status(400).json({ message: "You cannot delete yourself" });
    await adminToDelete.destroy();
    res.json({ message: "Admin removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({ attributes: ["id", "name", "email", "role", "createdAt"], order: [["createdAt", "DESC"]] });
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
