import express from "express";
import { pool } from "../db/mysql.js";
import { auth, authorize } from "../middleware/authMiddleware.js";

import bcrypt from "bcryptjs";
import { logAction } from "../utils/audit.js";

const router = express.Router();

// GET /api/admin/stats/overview
// Returns aggregated counts used by the admin dashboard
router.get("/stats/overview", auth, authorize("admin"), async (req, res) => {
  try {
    // Total users (students, faculty, non-academic)
    const [[{ totalUsers }]] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users WHERE role IN ('student','faculty','non_academic')"
    );

    // Total appointments (exclude cancelled if desired)
    const [[{ totalAppointments }]] = await pool.query(
      "SELECT COUNT(*) AS totalAppointments FROM appointments WHERE status IS NULL OR status != 'cancelled'"
    );

    // Upcoming appointments (date in future OR today with time later than now)
    const [[{ upcomingAppointments }]] = await pool.query(
      `SELECT COUNT(*) AS upcomingAppointments FROM appointments
       WHERE ((appointment_date > CURDATE())
       OR (appointment_date = CURDATE() AND appointment_time > CURTIME()))
       AND (status IS NULL OR status != 'cancelled')`
    );

    // Total health records
    const [[{ totalHealthRecords }]] = await pool.query(
      "SELECT COUNT(*) AS totalHealthRecords FROM health_records"
    );

    // Unread notifications
    const [[{ unreadNotifications }]] = await pool.query(
      "SELECT COUNT(*) AS unreadNotifications FROM notifications WHERE is_read = 0"
    );

    res.json({
      totalUsers: totalUsers || 0,
      totalAppointments: totalAppointments || 0,
      upcomingAppointments: upcomingAppointments || 0,
      totalHealthRecords: totalHealthRecords || 0,
      unreadNotifications: unreadNotifications || 0,
    });
  } catch (err) {
    console.error("GET /api/admin/stats/overview error:", err);
    console.error("Error code:", err.code);
    console.error("Error SQL state:", err.sqlState);
    console.error("Error SQL message:", err.sqlMessage);
    
    // Handle database connection errors
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).json({ 
        message: "Database connection failed. Please try again later." 
      });
    }
    
    // Handle SQL errors
    if (err.code && err.code.startsWith("ER_")) {
      return res.status(500).json({ 
        message: "Database error occurred",
        error: process.env.NODE_ENV === "development" ? err.sqlMessage : undefined
      });
    }
    
    res.status(500).json({ 
      message: "Failed to retrieve admin statistics",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Admin create user
router.post(
  "/create-user",
  auth,
  authorize("admin"),
  async (req, res) => {
    try {
      console.log("=== POST /api/admin/create-user ===");
      console.log("Request received");
      console.log("User:", req.user);
      
      const body = req.body || {};
      console.log("Body:", body);
      
      const {
        role,
        first_name,
        middle_name,
        last_name,
        email,
        password,
        student_id,
        employee_id,
        department,
        position,
        course,
        college,
        year_level,
        section,
        student_type,
        birthday,
        age,
      } = body;

      if (!role || !first_name || !last_name || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Require admin to provide a password; disallow auto-generation
      if (!password || String(password).trim() === "") {
        return res.status(400).json({ message: "Password is required when creating a user" });
      }

      const allowed = ["student", "faculty", "admin", "non_academic"];
      if (!allowed.includes(role)) return res.status(400).json({ message: "Invalid role" });

      // Check duplicates
      const [existing] = await pool.query(
        "SELECT id FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1",
        [String(email).toLowerCase().trim()]
      );
      if (existing.length) return res.status(400).json({ message: "Email already exists" });

      // Hash provided password
      const password_hash = await bcrypt.hash(String(password), 10);

      // Generate IDs if not provided
      const year = new Date().getFullYear();
      const prefixMap = { student: "STU", faculty: "PROF", admin: "ADM", non_academic: "STAFF" };
      const idColumn = role === "student" ? "student_id" : "employee_id";
      let generatedId = null;
      if (!student_id && !employee_id) {
        const prefix = prefixMap[role] || "USR";
        const [[{ nextSeq }]] = await pool.query(
          `SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(${idColumn}, '-', -1) AS UNSIGNED)), 0) + 1 AS nextSeq FROM users WHERE ${idColumn} LIKE ?`,
          [`${prefix}-${year}-%`]
        );
        generatedId = `${prefix}-${year}-${nextSeq.toString().padStart(3, "0")}`;
      }

      const fields = [];
      const values = [];

      if (role === "student") {
        fields.push("student_id");
        values.push(student_id || generatedId);
      } else {
        fields.push("employee_id");
        values.push(employee_id || generatedId);
      }

      fields.push("email", "password_hash", "role", "first_name", "middle_name", "last_name", "is_active");
      values.push(String(email).toLowerCase().trim(), password_hash, role, first_name, middle_name || "", last_name, 1);

      // Add optional fields if provided
      if (department) {
        fields.push("department");
        values.push(department);
      }
      if (position) {
        fields.push("position");
        values.push(position);
      }
      if (course) {
        fields.push("course");
        values.push(course);
      }
      if (college) {
        fields.push("college");
        values.push(college);
      }
      if (year_level) {
        fields.push("year_level");
        values.push(year_level);
      }
      if (section) {
        fields.push("section");
        values.push(section);
      }
      if (student_type) {
        fields.push("student_type");
        values.push(student_type);
      }
      if (birthday) {
        fields.push("birthday");
        values.push(birthday);
      }
      if (age) {
        fields.push("age");
        values.push(parseInt(age, 10));
      }

      const placeholders = fields.map(() => "?").join(", ");
      const [result] = await pool.query(
        `INSERT INTO users (${fields.join(", ")}) VALUES (${placeholders})`,
        values
      );

      logAction({
        actorId: req.user.id,
        action: "CREATE",
        targetModel: "User",
        targetId: result.insertId.toString(),
        summary: `Admin created user (${role})`,
        ipAddress: req.ip,
      });

      // Return created user id only; do not return plaintext passwords
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error("POST /api/admin/create-user error:", err);
      res.status(500).json({ message: "Failed to create user", error: err.message });
    }
  }
);

export default router;
