// backend/middleware/adminAuthMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
const ADMIN_TOKEN_TYPE = "admin";

const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT secret not configured" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.type !== ADMIN_TOKEN_TYPE) {
        return res.status(401).json({ message: "Invalid admin token" });
      }

      const admin = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error("ADMIN AUTH ERROR:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === "superAdmin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, superAdmin only" });
  }
};

const anyAdmin = (req, res, next) => {
  if (req.admin && (req.admin.role === "admin" || req.admin.role === "superAdmin")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin access required" });
  }
};

export { protectAdmin, superAdminOnly, anyAdmin };
