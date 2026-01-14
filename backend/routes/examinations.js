import express from "express";
import { pool } from "../db/mysql.js";
import { auth, authorize } from "../middleware/authMiddleware.js";
import { logAction } from "../utils/audit.js";

const router = express.Router();

// Helper function to create notification
const createNotification = async (recipientId, senderId, type, title, message, relatedRecordId = null) => {
  try {
    await pool.query(
      `INSERT INTO notifications (recipient_id, sender_id, type, title, message, related_record_id, priority)
       VALUES (?, ?, ?, ?, ?, ?, 'medium')`,
      [recipientId, senderId, type, title, message, relatedRecordId]
    );
  } catch (err) {
    console.error("Error creating notification:", err);
    // Don't throw - notification failure shouldn't break the main operation
  }
};

// Create physical/medical examination -> stored in health_records
router.post(
  "/",
  auth,
  authorize("admin", "faculty", "student", "non_academic"),
  async (req, res) => {
    try {
      const {
        userId,
        userType,
        studentId,
        employeeId,
        date,
        physical = {},
        medical = {},
      } = req.body || {};
      
      // Support both new (userId/userType) and old (studentId/employeeId) formats
      if (!userId && !studentId && !employeeId) {
        return res
          .status(400)
          .json({ message: "userId or studentId/employeeId is required" });
      }

      let subject; // the user the exam is for
      
      // New format: userId + userType (preferred for admin input)
      if (userId) {
        const [[u]] = await pool.query(
          "SELECT id, student_id, employee_id, role FROM users WHERE id = ? AND is_active = 1 LIMIT 1",
          [userId]
        );
        if (!u) return res.status(404).json({ message: "User not found" });
        subject = u;
      }
      // Old format: studentId
      else if (studentId) {
        const [[u]] = await pool.query(
          "SELECT id, student_id, role FROM users WHERE student_id = ? AND is_active = 1 LIMIT 1",
          [studentId]
        );
        if (!u) return res.status(404).json({ message: "Student not found" });
        subject = u;
      } 
      // Old format: employeeId
      else {
        // For faculty and non-academic staff, search by employee_id
        const [[u]] = await pool.query(
          "SELECT id, employee_id, role FROM users WHERE employee_id = ? AND is_active = 1 LIMIT 1",
          [employeeId]
        );
        if (!u) return res.status(404).json({ message: "User not found" });
        subject = u;
      }

      // If a student/faculty/non_academic is creating, force self-service only
      // Admin can create for anyone
      if (["student", "faculty", "non_academic"].includes(req.user.role) && subject.id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You can only save your own examination" });
      }

      // Calculate BMI if height and weight are provided
      let bmi = null;
      if (physical.height && physical.weight) {
        const heightInMeters = physical.height / 100;
        bmi = (physical.weight / (heightInMeters * heightInMeters)).toFixed(2);
      }

      // Insert into health_records with 'Physical/Medical Examination' as chief_complaint
      // Admin (doctor) records exams; medical_staff_id holds admin ID or null for self-service
      // NOTE: health_records table uses 'student_id' column, not 'user_id'
      const medicalStaffId = req.user.role === "admin" ? req.user.id : null;
      const [result] = await pool.query(
        `INSERT INTO health_records (student_id, record_type, date_of_visit, medical_staff_id, chief_complaint, 
          vital_blood_pressure, vital_heart_rate, vital_respiratory_rate, vital_temperature, vital_weight, vital_height, diagnosis, treatment, notes) 
        VALUES (?, 'examination', ?, ?, 'Physical/Medical Examination', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subject.id,
          date,
          medicalStaffId,
          physical.bloodPressure || null,
          physical.heartRate || null,
          physical.respiratoryRate || null,
          physical.temperature || null,
          physical.weight || null,
          physical.height || null,
          medical.findings || null,
          medical.recommendation || null,
          JSON.stringify({ physical, medical }),
        ]
      );

      logAction({
        actorId: req.user.id,
        action: "CREATE",
        targetModel: "HealthRecord",
        targetId: result.insertId.toString(),
        summary: "Created examination",
        ipAddress: req.ip,
      });

      // Create notification for examination creation
      await createNotification(
        subject.id,
        req.user.id,
        "health_record_update",
        "Examination Recorded",
        `Your physical and medical examination record has been successfully created.`,
        result.insertId
      );

      res.status(201).json({ message: "Examination created" });
    } catch (e) {
      console.error("========== CREATE EXAMINATION ERROR ==========");
      console.error("Error message:", e.message);
      console.error("Error code:", e.code);
      console.error("Error SQL state:", e.sqlState);
      console.error("Error SQL message:", e.sqlMessage);
      console.error("Full error stack:", e.stack);
      console.error("Request body:", req.body);
      console.error("==============================================");
      res.status(500).json({ 
        message: "Failed to create examination",
        error: process.env.NODE_ENV === "development" ? {
          message: e.message,
          code: e.code,
          sqlState: e.sqlState,
          sqlMessage: e.sqlMessage
        } : undefined
      });
    }
  }
);

// Get all examinations (admin only)
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const studentId = req.query.studentId;

    const where = ["hr.chief_complaint = 'Physical/Medical Examination'"];
    const params = [];
    if (studentId) {
      where.push("u.student_id = ?");
      params.push(studentId);
    }
    const whereSql = `WHERE ${where.join(" AND ")}`;

    // NOTE: health_records uses student_id, need to join correctly
    const [rows] = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS hr.*, u.first_name,  u.middle_name, u.last_name, u.student_id AS user_student_id, u.employee_id AS user_employee_id, u.role AS user_role, u.course, u.year_level, u.department, u.position, u.address, u.birthday, u.phone_number,
       ms.first_name AS ms_first_name, ms.middle_name AS ms_middle_name, ms.last_name AS ms_last_name
       FROM health_records hr 
       JOIN users u ON hr.student_id = u.id 
       LEFT JOIN users ms ON hr.medical_staff_id = ms.id
       ${whereSql} 
       ORDER BY hr.date_of_visit DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );
    const [[{ total }]] = await pool.query("SELECT FOUND_ROWS() AS total");

    // Ensure we always return an array
    const examList = Array.isArray(rows) ? rows : [];
    const totalCount = total || 0;

    res.json({
      examinations: examList,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      total: totalCount,
    });
  } catch (e) {
    console.error("Get examinations error:", e);
    console.error("Error code:", e.code);
    console.error("Error SQL state:", e.sqlState);
    console.error("Error SQL message:", e.sqlMessage);
    
    // Handle database connection errors
    if (e.code === "ECONNREFUSED" || e.code === "ENOTFOUND" || e.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).json({ 
        message: "Database connection failed. Please try again later." 
      });
    }
    
    // Handle SQL errors
    if (e.code && e.code.startsWith("ER_")) {
      return res.status(500).json({ 
        message: "Database error occurred",
        error: process.env.NODE_ENV === "development" ? e.sqlMessage : undefined
      });
    }
    
    res.status(500).json({ 
      message: "Failed to retrieve examinations",
      error: process.env.NODE_ENV === "development" ? e.message : undefined
    });
  }
});

// Get single examination
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT hr.*, u.first_name, u.middle_name, u.last_name, u.student_id AS user_student_id, u.employee_id AS user_employee_id, u.role AS user_role, u.course, u.year_level, u.department, u.position, u.address, u.birthday, u.phone_number,
       ms.first_name AS ms_first_name, ms.middle_name AS ms_middle_name, ms.last_name AS ms_last_name
       FROM health_records hr 
       JOIN users u ON hr.student_id = u.id 
       LEFT JOIN users ms ON hr.medical_staff_id = ms.id
       WHERE hr.id = ? AND hr.chief_complaint = 'Physical/Medical Examination'`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Examination not found" });

    const exam = rows[0];
    // NOTE: health_records uses student_id column
    if (
      req.user.role !== "admin" &&
      req.user.role !== "medical_staff" &&
      exam.student_id !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(exam);
  } catch (e) {
    console.error("Get examination error:", e);
    console.error("Error code:", e.code);
    
    // Handle database connection errors
    if (e.code === "ECONNREFUSED" || e.code === "ENOTFOUND" || e.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).json({ 
        message: "Database connection failed. Please try again later." 
      });
    }
    
    // Handle SQL errors
    if (e.code && e.code.startsWith("ER_")) {
      return res.status(500).json({ 
        message: "Database error occurred",
        error: process.env.NODE_ENV === "development" ? e.sqlMessage : undefined
      });
    }
    
    res.status(500).json({ 
      message: "Failed to retrieve examination",
      error: process.env.NODE_ENV === "development" ? e.message : undefined
    });
  }
});

// Update examination
router.put(
  "/:id",
  auth,
  authorize("admin", "medical_staff", "student", "professor"),
  async (req, res) => {
    try {
      const { physical = {}, medical = {} } = req.body;

      // NOTE: health_records table uses 'student_id' column, not 'user_id'
      const [[exam]] = await pool.query(
        "SELECT student_id FROM health_records WHERE id = ? AND chief_complaint = 'Physical/Medical Examination'",
        [req.params.id]
      );
      if (!exam)
        return res.status(404).json({ message: "Examination not found" });

      if (
        !["admin", "medical_staff"].includes(req.user.role) &&
        exam.student_id !== req.user.id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      // NOTE: vital_bmi column doesn't exist in health_records table
      await pool.query(
        "UPDATE health_records SET vital_blood_pressure = ?, vital_heart_rate = ?, vital_respiratory_rate = ?, vital_temperature = ?, vital_weight = ?, vital_height = ?, diagnosis = ?, treatment = ?, notes = ? WHERE id = ?",
        [
          physical.bloodPressure || null,
          physical.heartRate || null,
          physical.respiratoryRate || null,
          physical.temperature || null,
          physical.weight || null,
          physical.height || null,
          medical.findings || null,
          medical.recommendation || null,
          JSON.stringify({ physical, medical }),
          req.params.id,
        ]
      );

      logAction({
        actorId: req.user.id,
        action: "UPDATE",
        targetModel: "HealthRecord",
        targetId: req.params.id,
        summary: "Updated examination",
        ipAddress: req.ip,
      });

      // Create notification for examination update
      await createNotification(
        exam.student_id,
        req.user.id,
        "health_record_update",
        "Examination Updated",
        `Your physical and medical examination record has been updated.`,
        req.params.id
      );

      res.json({ message: "Examination updated" });
    } catch (e) {
      console.error("Update examination error:", e);
      console.error("Error code:", e.code);
      console.error("Error SQL state:", e.sqlState);
      console.error("Error SQL message:", e.sqlMessage);
      
      // Handle database connection errors
      if (e.code === "ECONNREFUSED" || e.code === "ENOTFOUND" || e.code === "PROTOCOL_CONNECTION_LOST") {
        return res.status(503).json({ 
          message: "Database connection failed. Please try again later." 
        });
      }
      
      // Handle SQL errors
      if (e.code && e.code.startsWith("ER_")) {
        return res.status(500).json({ 
          message: "Database error occurred",
          error: process.env.NODE_ENV === "development" ? e.sqlMessage : undefined
        });
      }
      
      res.status(500).json({ 
        message: "Failed to update examination",
        error: process.env.NODE_ENV === "development" ? e.message : undefined
      });
    }
  }
);

// Delete examination
router.delete(
  "/:id",
  auth,
  authorize("admin", "student", "faculty"),
  async (req, res) => {
    try {
      const examId = req.params.id;
      // NOTE: health_records table uses 'student_id' column, not 'user_id'
      const [[rec]] = await pool.query(
        'SELECT id, student_id FROM health_records WHERE id = ? AND chief_complaint = "Physical/Medical Examination" LIMIT 1',
        [examId]
      );
      if (!rec)
        return res.status(404).json({ message: "Examination not found" });
      if (
        !["admin"].includes(req.user.role) &&
        Number(rec.student_id) !== Number(req.user.id)
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      const [result] = await pool.query(
        "DELETE FROM health_records WHERE id = ?",
        [examId]
      );
      if (!result.affectedRows)
        return res.status(400).json({ message: "Failed to delete" });
      logAction({
        actorId: req.user.id,
        action: "DELETE",
        targetModel: "HealthRecord",
        targetId: String(examId),
        summary: "Deleted examination",
        ipAddress: req.ip,
      });
      res.json({ message: "Examination deleted" });
    } catch (e) {
      console.error("Delete examination error:", e);
      console.error("Error code:", e.code);
      
      // Handle database connection errors
      if (e.code === "ECONNREFUSED" || e.code === "ENOTFOUND" || e.code === "PROTOCOL_CONNECTION_LOST") {
        return res.status(503).json({ 
          message: "Database connection failed. Please try again later." 
        });
      }
      
      // Handle SQL errors
      if (e.code && e.code.startsWith("ER_")) {
        return res.status(500).json({ 
          message: "Database error occurred",
          error: process.env.NODE_ENV === "development" ? e.sqlMessage : undefined
        });
      }
      
      res.status(500).json({ 
        message: "Failed to delete examination",
        error: process.env.NODE_ENV === "development" ? e.message : undefined
      });
    }
  }
);

// Fallback delete (POST)
router.post(
  "/:id/delete",
  auth,
  authorize("admin", "medical_staff", "student", "professor"),
  async (req, res) => {
    try {
      const examId = req.params.id;
      // NOTE: health_records table uses 'student_id' column, not 'user_id'
      const [[rec]] = await pool.query(
        'SELECT id, student_id FROM health_records WHERE id = ? AND chief_complaint = "Physical/Medical Examination" LIMIT 1',
        [examId]
      );
      if (!rec)
        return res.status(404).json({ message: "Examination not found" });
      if (
        !["admin", "medical_staff"].includes(req.user.role) &&
        Number(rec.student_id) !== Number(req.user.id)
      ) {
        return res.status(403).json({ message: "Access denied" });
      }
      const [result] = await pool.query(
        "DELETE FROM health_records WHERE id = ?",
        [examId]
      );
      if (!result.affectedRows)
        return res.status(400).json({ message: "Failed to delete" });
      logAction({
        actorId: req.user.id,
        action: "DELETE",
        targetModel: "HealthRecord",
        targetId: String(examId),
        summary: "Deleted examination",
        ipAddress: req.ip,
      });
      res.json({ message: "Examination deleted" });
    } catch (e) {
      console.error("Delete examination (POST) error:", e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
