// backend/routes/users.js
import express from "express";
import { pool } from "../db/mysql.js";
import { auth, authorize } from "../middleware/authMiddleware.js";
import { logAction } from "../utils/audit.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Get current user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, student_id, employee_id, email, role, first_name, middle_name, last_name, department, course, year_level, position, college, phone_number, address, birthday, age, section, student_type, guardian_name, guardian_contact, years_of_service, office_location, license_number, shift_schedule, employment_type, supervisor, emergency_name, emergency_phone, emergency_address, is_active FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Profile not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Get profile error:", err);
    console.error("Error code:", err.code);
    
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
      message: "Failed to retrieve profile",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Update current user profile
router.put("/profile", auth, async (req, res) => {
  try {
    // Allow users to set their own IDs
    const allowedFields = [
      "student_id",
      "employee_id",
      "first_name",
      "middle_name",
      "last_name",
      "email",
      "address",
      "birthday",
      "age",
      "phone_number",
      "college",
      "course",
      "year_level",
      "section",
      "student_type",
      "guardian_name",
      "guardian_contact",
      "department",
      "position",
      "years_of_service",
      "office_location",
      "license_number",
      "shift_schedule",
      "employment_type",
      "supervisor",
      "emergency_name",
      "emergency_phone",
      "emergency_address",
    ];

    // Validate email uniqueness if email is being updated
    if (req.body.email) {
      const [currentEmail] = await pool.query(
        "SELECT email FROM users WHERE id = ?",
        [req.user.id]
      );
      if (currentEmail.length && currentEmail[0].email !== req.body.email) {
        const [existingEmail] = await pool.query(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [req.body.email, req.user.id]
        );
        if (existingEmail.length > 0) {
          return res.status(400).json({ 
            message: "Email already in use by another user" 
          });
        }
      }
    }

    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }
    if (updates.length === 0)
      return res.status(400).json({ message: "No fields to update" });

    params.push(req.user.id);
    const [result] = await pool.query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params
    );
    if (!result.affectedRows)
      return res.status(404).json({ message: "Profile not found" });

    // Log action
    logAction({
      actorId: req.user.id,
      action: "UPDATE",
      targetModel: "User",
      targetId: req.user.id,
      summary: "Updated own profile",
      ipAddress: req.ip,
    });

    // Return updated profile with all fields
    const [updated] = await pool.query(
      "SELECT id, student_id, employee_id, email, role, first_name, middle_name, last_name, department, course, year_level, position, college, phone_number, address, birthday, age, section, student_type, guardian_name, guardian_contact, years_of_service, office_location, license_number, shift_schedule, employment_type, supervisor, emergency_name, emergency_phone, emergency_address, is_active FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error("Update profile error:", err);
    console.error("Error code:", err.code);
    
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
      message: "Failed to update profile",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Passwords required" });
    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const [rows] = await pool.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHash,
      req.user.id,
    ]);

    logAction({
      actorId: req.user.id,
      action: "PASSWORD_CHANGE",
      targetModel: "User",
      targetId: req.user.id,
      summary: "Changed own password",
      ipAddress: req.ip,
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    console.error("Error code:", err.code);
    
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
      message: "Failed to change password",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Get user stats (admin only)
router.get("/stats", auth, authorize("admin"), async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );
    const [[{ activeUsers }]] = await pool.query(
      "SELECT COUNT(*) AS activeUsers FROM users WHERE is_active = 1"
    );
    const inactiveUsers = totalUsers - activeUsers;

    const [usersByRole] = await pool.query(
      "SELECT role AS _id, COUNT(*) AS count FROM users GROUP BY role ORDER BY count DESC"
    );
    const [usersByDepartment] = await pool.query(
      'SELECT department AS _id, COUNT(*) AS count FROM users WHERE department IS NOT NULL AND department <> "" GROUP BY department ORDER BY count DESC'
    );
    const [[{ recentRegistrations }]] = await pool.query(
      "SELECT COUNT(*) AS recentRegistrations FROM users WHERE created_at >= (NOW() - INTERVAL 30 DAY)"
    );
    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      usersByDepartment,
      recentRegistrations,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin only)
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search || "";
    const role = req.query.role;
    const department = req.query.department;

    const params = [];
    let whereSql = "WHERE 1=1";

    if (search) {
      whereSql += " AND (first_name LIKE ? OR middle_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR student_id LIKE ? OR employee_id LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (role) {
      whereSql += " AND role = ?";
      params.push(role);
    }

    if (department) {
      whereSql += " AND department = ?";
      params.push(department);
    }

    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS 
         id,
         student_id,
         employee_id,
         first_name,
         middle_name,
         last_name,
         email,
         role,
         department,
         position,
         college,
         course,
         year_level,
         section,
         student_type,
         is_active,
         created_at 
       FROM users ${whereSql} 
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [totalRows] = await pool.query("SELECT FOUND_ROWS() AS total");
    const total = totalRows[0].total;

    // Ensure we always return an array
    const userList = Array.isArray(rows) ? rows : [];
    const totalCount = total || 0;

    res.json({
      users: userList,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      total: totalCount,
    });
  } catch (err) {
    console.error("Get users error:", err);
    console.error("Error code:", err.code);
    
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
      message: "Failed to retrieve users",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// ROUTE FOR FACULTIES - MUST come before /:id route
router.get("/faculty", auth, authorize("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, employee_id, first_name, middle_name, last_name, email, department, position
       FROM users 
       WHERE role IN ('faculty','professor')`
    );
    res.json({ faculty: rows });
  } catch (err) {
    console.error("Get faculty error:", err);
    console.error("Error code:", err.code);
    
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
      message: "Failed to retrieve faculty",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Get single user (admin only)
router.get("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Get user error:", err);
    console.error("Error code:", err.code);
    
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
      message: "Failed to retrieve user",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Update user (admin only)
router.put("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    // Prevent manual editing of user IDs - they are auto-generated based on role
    if (req.body.student_id || req.body.employee_id || req.body.faculty_id) {
      return res.status(400).json({ 
        message: "User IDs cannot be manually changed. They are auto-generated based on the user's role." 
      });
    }

    const allowedFields = [
      "first_name",
      "middle_name",
      "last_name",
      "email",
      "address",
      "birthday",
      "age",
      "phone_number",
      "college",
      "course",
      "year_level",
      "section",
      "student_type",
      "guardian_name",
      "guardian_contact",
      "department",
      "position",
      "years_of_service",
      "office_location",
      "license_number",
      "shift_schedule",
      "employment_type",
      "supervisor",
      "emergency_name",
      "emergency_phone",
      "emergency_address",
      "role",
    ];

    const updates = [];
    const params = [];
    
    // If role is being changed, we need to update the appropriate ID field
    let roleChanged = false;
    let newRole = null;
    if (req.body.role !== undefined) {
      const [currentUser] = await pool.query(
        "SELECT role FROM users WHERE id = ?",
        [req.params.id]
      );
      if (currentUser.length && currentUser[0].role !== req.body.role) {
        roleChanged = true;
        newRole = req.body.role;
      }
    }

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }
    
    // If role changed, clear old ID and set new one based on new role
    if (roleChanged) {
      const year = new Date().getFullYear();
      const prefixMap = {
        student: "STU",
        faculty: "PROF",
        admin: "ADM",
        non_academic: "STAFF",
        medical_staff: "MED",
      };
      const prefix = prefixMap[newRole] || "USR";
      const idColumn = newRole === "student" ? "student_id" : "employee_id";
      const otherIdColumn = newRole === "student" ? "employee_id" : "student_id";
      
      // Get next sequence number for this role
      const [[{ nextSeq }]] = await pool.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(${idColumn}, '-', -1) AS UNSIGNED)), 0) + 1 AS nextSeq 
         FROM users WHERE ${idColumn} LIKE ?`,
        [`${prefix}-${year}-%`]
      );
      
      const generatedId = `${prefix}-${year}-${nextSeq.toString().padStart(3, "0")}`;
      
      // Set the correct ID column and clear the other one
      updates.push(`${idColumn} = ?`);
      params.push(generatedId);
      updates.push(`${otherIdColumn} = NULL`);
    }

    if (updates.length === 0)
      return res.status(400).json({ message: "No fields to update" });

    params.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params
    );
    if (!result.affectedRows)
      return res.status(404).json({ message: "User not found" });

    logAction({
      actorId: req.user.id,
      action: "UPDATE",
      targetModel: "User",
      targetId: req.params.id,
      summary: `Updated user ${req.params.id}`,
      ipAddress: req.ip,
    });

    const [updated] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    res.json(updated[0]);
  } catch (err) {
    console.error("Update user error:", err);
    console.error("Error code:", err.code);
    
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
      message: "Failed to update user",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Delete user (admin only)
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!result.affectedRows)
      return res.status(404).json({ message: "User not found" });

    logAction({
      actorId: req.user.id,
      action: "DELETE",
      targetModel: "User",
      targetId: req.params.id,
      summary: `Deleted user ${req.params.id}`,
      ipAddress: req.ip,
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    console.error("Error code:", err.code);
    
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
      message: "Failed to delete user",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Deactivate user (admin only)
router.put("/:id/deactivate", auth, authorize("admin"), async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?",
      [req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ message: "User not found" });

    logAction({
      actorId: req.user.id,
      action: "DEACTIVATE",
      targetModel: "User",
      targetId: req.params.id,
      summary: `Deactivated user ${req.params.id}`,
      ipAddress: req.ip,
    });

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Deactivate user error:", error);
    console.error("Error code:", error.code);
    
    // Handle database connection errors
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND" || error.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).json({ 
        message: "Database connection failed. Please try again later." 
      });
    }
    
    // Handle SQL errors
    if (error.code && error.code.startsWith("ER_")) {
      return res.status(500).json({ 
        message: "Database error occurred",
        error: process.env.NODE_ENV === "development" ? error.sqlMessage : undefined
      });
    }
    
    res.status(500).json({ 
      message: "Failed to deactivate user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Reactivate user (admin only)
router.put("/:id/activate", auth, authorize("admin"), async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE users SET is_active = 1, updated_at = NOW() WHERE id = ?",
      [req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ message: "User not found" });
    logAction({
      actorId: req.user.id,
      action: "ACTIVATE",
      targetModel: "User",
      targetId: req.params.id,
      summary: `Activated user ${req.params.id}`,
      ipAddress: req.ip,
    });
    res.json({ message: "User activated successfully" });
  } catch (error) {
    console.error("Activate user error:", error);
    console.error("Error code:", error.code);
    
    // Handle database connection errors
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND" || error.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).json({ 
        message: "Database connection failed. Please try again later." 
      });
    }
    
    // Handle SQL errors
    if (error.code && error.code.startsWith("ER_")) {
      return res.status(500).json({ 
        message: "Database error occurred",
        error: process.env.NODE_ENV === "development" ? error.sqlMessage : undefined
      });
    }
    
    res.status(500).json({ 
      message: "Failed to activate user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

export default router;
