import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  // 1️⃣ Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2️⃣ Ensure JWT secret exists
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT secret not configured" });
      }

      // 3️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4️⃣ Fetch user using Sequelize findByPk (not MongoDB findById)
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error("AUTH ERROR:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 5️⃣ No token provided
  return res.status(401).json({ message: "Not authorized, no token" });
};

export { protect };
