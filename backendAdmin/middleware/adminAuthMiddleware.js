import jwt from "jsonwebtoken";
import { Admin } from "../models/index.js";

// @desc    Protect routes - Verify JWT Token
// @access  Private
export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findByPk(decoded.id);

    if (!req.admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized to access this route" });
  }
};

// @desc    Make sure admin is SuperAdmin
// @access  Private
export const superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "This action requires superadmin privileges" });
  }
};
