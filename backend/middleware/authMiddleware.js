import jwt from "jsonwebtoken";
import { pool } from "../db/mysql.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      "SELECT id, role, is_active FROM users WHERE id = ? LIMIT 1",
      [decoded.id]
    );
    if (!rows.length) {
      return res.status(401).json({ message: "Token is not valid" });
    }
    const dbUser = rows[0];
    if (!dbUser.is_active) {
      return res.status(401).json({ message: "Account is deactivated" });
    }
    req.user = { id: dbUser.id, role: dbUser.role };
    
    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log("Auth middleware - User authenticated:", {
        userId: req.user.id,
        userRole: req.user.role,
        route: req.path,
      });
    }
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    // Check if it's a database connection error
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.error("Database connection error - MySQL server is not running or not accessible");
      return res.status(503).json({ 
        message: "Database connection failed. Please ensure MySQL server is running.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
    
    // JWT verification errors
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token is not valid or expired" });
    }
    
    res.status(401).json({ message: "Token is not valid" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Normalize roles - trim whitespace and convert to lowercase for comparison
    const userRole = String(req.user.role).trim().toLowerCase();
    const normalizedRequestedRoles = roles.map(r => String(r).trim().toLowerCase());

    // Check if user role matches any of the requested roles
    const allowed = normalizedRequestedRoles;

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log("Authorization check:", {
        userRole: userRole,
        originalUserRole: req.user.role,
        allowedRoles: allowed,
        requestedRoles: normalizedRequestedRoles,
        isAllowed: allowed.includes(userRole),
      });
    }

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(", ")}. Your role: ${req.user.role}`,
        userRole: req.user.role,
        requiredRoles: roles,
      });
    }
    next();
  };
};

export { auth, authorize };
