// backend/routes/healthRecords.js
import express from "express";
import { pool } from "../db/mysql.js";
import { auth, authorize } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import { logAction } from "../utils/audit.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const uniq = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniq + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const upload = multer({ storage });

/* -------------------------------------------------------------
   GET /api/health-records
   • admin → all (filterable)
   • student/faculty/non_academic → only own
   ------------------------------------------------------------- */
router.get(
  "/",
  auth,
  authorize("admin", "medical_staff", "student", "faculty", "non_academic"),
  async (req, res) => {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const offset = (page - 1) * limit;

      const where = [];
      const params = [];

      // NOTE: health_records table uses 'student_id' column, not 'user_id'
      // For students, faculty, and non-academic staff, show only their own records
      if (["student", "faculty", "non_academic"].includes(req.user.role)) {
        where.push("hr.student_id = ?");
        params.push(req.user.id);
      }

      if (!["student", "faculty", "non_academic"].includes(req.user.role)) {
        const { studentId, recordType, dateFrom, dateTo } = req.query;
        if (studentId) {
          where.push("u.student_id = ?");
          params.push(studentId);
        }
        if (recordType) {
          where.push("hr.record_type = ?");
          params.push(recordType);
        }
        // NOTE: status and priority columns don't exist in health_records table
        if (dateFrom) {
          where.push("hr.date_of_visit >= ?");
          params.push(dateFrom);
        }
        if (dateTo) {
          where.push("hr.date_of_visit <= ?");
          params.push(dateTo);
        }
      }

      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

      // Build JOIN clause - always join users for student info, and medical staff if needed
      // NOTE: health_records uses student_id, not user_id
      const [rows] = await pool.query(
        `SELECT
         hr.id,
         hr.student_id,
         hr.record_type,
         hr.date_of_visit,
         hr.chief_complaint,
         hr.diagnosis,
         hr.treatment,
        hr.vital_blood_pressure,
        hr.vital_heart_rate,
        hr.vital_respiratory_rate,
        hr.vital_temperature,
         hr.vital_weight,
         hr.vital_height,
         hr.notes,
         hr.attachments,
         hr.created_at,
         hr.updated_at,
         u.student_id AS user_student_id,
         u.employee_id AS user_employee_id,
         u.role AS user_role,
         u.first_name   AS student_first_name,
         u.middle_name  AS student_middle_name,
         u.last_name    AS student_last_name,
         ms.employee_id AS ms_employee_id,
         ms.first_name  AS ms_first_name,
         ms.middle_name AS ms_middle_name,
         ms.last_name   AS ms_last_name
       FROM health_records hr
       LEFT JOIN users u ON hr.student_id = u.id
       LEFT JOIN users ms ON hr.medical_staff_id = ms.id
       ${whereSql}
       ORDER BY hr.date_of_visit DESC
       LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Count query - need JOIN if WHERE references users table
      const needsUserJoin = whereSql.includes("u.student_id");
      const countFromSql = needsUserJoin
        ? `FROM health_records hr LEFT JOIN users u ON hr.student_id = u.id ${whereSql}`
        : `FROM health_records hr ${whereSql}`;
      
      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total ${countFromSql}`,
        params
      );

      // Ensure we always return an array
      const recordsList = Array.isArray(rows) ? rows : [];
      const totalCount = total || 0;

      res.json({
        healthRecords: recordsList,
        total: totalCount,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (err) {
      console.error("========== GET /health-records ERROR ==========");
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);
      console.error("Error SQL state:", err.sqlState);
      console.error("Error SQL message:", err.sqlMessage);
      console.error("Full error stack:", err.stack);
      console.error("==============================================");
      res.status(500).json({ 
        message: "Failed to retrieve health records",
        error: process.env.NODE_ENV === "development" ? {
          message: err.message,
          code: err.code,
          sqlState: err.sqlState,
          sqlMessage: err.sqlMessage
        } : undefined
      });
    }
  }
);

/* -------------------------------------------------------------
   GET /api/health-records/stats/overview
   IMPORTANT: This must come before /:id route to avoid matching
   ------------------------------------------------------------- */
router.get(
  "/stats/overview",
  auth,
  authorize("admin"),
  async (req, res) => {
    try {
      const [[{ totalRecords }]] = await pool.query(
        "SELECT COUNT(*) AS totalRecords FROM health_records"
      );
      
      // NOTE: status, priority, follow_up_required columns don't exist in health_records table
      // Return 0 for these stats since the columns don't exist
      const activeRecords = 0;
      const resolvedRecords = totalRecords;
      const followUpRequired = 0;
      const urgentRecords = 0;

      const [recordsByType] = await pool.query(
        "SELECT record_type AS _id, COUNT(*) AS count FROM health_records GROUP BY record_type ORDER BY count DESC"
      );
      const [recordsByMonth] = await pool.query(`
      SELECT YEAR(date_of_visit) AS year, MONTH(date_of_visit) AS month, COUNT(*) AS count
      FROM health_records
      WHERE date_of_visit >= (CURDATE() - INTERVAL 12 MONTH)
      GROUP BY year, month
      ORDER BY year, month
    `);
      
      // NOTE: priority column doesn't exist, return empty array
      const priorityDistribution = [];

      res.json({
        totalRecords,
        activeRecords,
        resolvedRecords,
        followUpRequired,
        urgentRecords,
        recordsByType,
        recordsByMonth,
        priorityDistribution,
      });
    } catch (err) {
      console.error("GET /stats/overview error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* -------------------------------------------------------------
   POST /api/health-records/:id/attachments
   ------------------------------------------------------------- */
router.post(
  "/:id/attachments",
  auth,
  authorize("admin"),
  upload.array("attachments", 5),
  async (req, res) => {
    try {
      const id = req.params.id;
      const newFiles = req.files.map((f) => f.filename);

      const [[rec]] = await pool.query(
        "SELECT attachments FROM health_records WHERE id = ?",
        [id]
      );
      if (!rec) return res.status(404).json({ message: "Not found" });

      const current = rec.attachments ? JSON.parse(rec.attachments) : [];
      const updated = JSON.stringify([...current, ...newFiles]);

      await pool.query(
        "UPDATE health_records SET attachments = ? WHERE id = ?",
        [updated, id]
      );

      await logAction({
        actorId: req.user.id,
        action: "UPLOAD",
        targetModel: "HealthRecord",
        targetId: id,
        summary: `Uploaded ${newFiles.length} attachment(s)`,
        ipAddress: req.ip,
      });

      res.json({ message: "Uploaded", attachments: newFiles });
    } catch (err) {
      console.error("POST /attachments error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* -------------------------------------------------------------
   POST /api/health-records
   Create a new health record
   ------------------------------------------------------------- */
router.post(
  "/",
  auth,
  authorize("admin"),
  async (req, res) => {
    try {
      const {
        student_id,
        record_type,
        date_of_visit,
        chief_complaint,
        diagnosis,
        treatment,
        vital_blood_pressure,
        vital_heart_rate,
        vital_respiratory_rate,
        vital_temperature,
        vital_weight,
        vital_height,
        notes,
      } = req.body;

      if (!student_id || !record_type || !date_of_visit) {
        return res.status(400).json({
          message: "student_id, record_type, and date_of_visit are required",
        });
      }

      // Verify student exists
      const [[student]] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND role IN ('student', 'faculty', 'non_academic')",
        [student_id]
      );
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const [result] = await pool.query(
        `INSERT INTO health_records (
          student_id, record_type, date_of_visit, medical_staff_id,
          chief_complaint, diagnosis, treatment,
          vital_blood_pressure, vital_heart_rate, vital_respiratory_rate, vital_temperature,
          vital_weight, vital_height, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student_id,
          record_type,
          date_of_visit,
          req.user.id,
          chief_complaint || null,
          diagnosis || null,
          treatment || null,
          vital_blood_pressure || null,
          vital_heart_rate || null,
          vital_respiratory_rate || null,
          vital_temperature || null,
          vital_weight || null,
          vital_height || null,
          notes || null,
        ]
      );

      await logAction({
        actorId: req.user.id,
        action: "CREATE",
        targetModel: "HealthRecord",
        targetId: String(result.insertId),
        summary: `Created health record: ${record_type}`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        id: result.insertId,
        message: "Health record created successfully",
      });
    } catch (err) {
      console.error("POST /health-records error:", err.message);
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
        message: "Failed to create health record",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  }
);

/* -------------------------------------------------------------
   PUT /api/health-records/:id
   Update a health record
   ------------------------------------------------------------- */
router.put(
  "/:id",
  auth,
  authorize("admin"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;

      // Check if record exists
      const [[record]] = await pool.query(
        "SELECT id, student_id FROM health_records WHERE id = ?",
        [id]
      );
      if (!record) {
        return res.status(404).json({ message: "Health record not found" });
      }

      // Build update query
      const allowedFields = [
        "record_type",
        "date_of_visit",
        "chief_complaint",
        "diagnosis",
        "treatment",
        "vital_blood_pressure",
        "vital_respiratory_rate",
        "vital_heart_rate",
        "vital_temperature",
        "vital_weight",
        "vital_height",
        "notes",
      ];

      const setParts = [];
      const values = [];

      allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
          setParts.push(`${field} = ?`);
          values.push(updates[field]);
        }
      });

      if (setParts.length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      values.push(id);
      await pool.query(
        `UPDATE health_records SET ${setParts.join(", ")} WHERE id = ?`,
        values
      );

      await logAction({
        actorId: req.user.id,
        action: "UPDATE",
        targetModel: "HealthRecord",
        targetId: id,
        summary: "Updated health record",
        ipAddress: req.ip,
      });

      res.json({ message: "Health record updated successfully" });
    } catch (err) {
      console.error("PUT /health-records/:id error:", err.message);
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
        message: "Failed to update health record",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  }
);

/* -------------------------------------------------------------
   DELETE /api/health-records/:id
   Delete a health record
   ------------------------------------------------------------- */
router.delete(
  "/:id",
  auth,
  authorize("admin"),
  async (req, res) => {
    try {
      const id = req.params.id;

      // Check if record exists
      const [[record]] = await pool.query(
        "SELECT id FROM health_records WHERE id = ?",
        [id]
      );
      if (!record) {
        return res.status(404).json({ message: "Health record not found" });
      }

      await pool.query("DELETE FROM health_records WHERE id = ?", [id]);

      await logAction({
        actorId: req.user.id,
        action: "DELETE",
        targetModel: "HealthRecord",
        targetId: id,
        summary: "Deleted health record",
        ipAddress: req.ip,
      });

      res.json({ message: "Health record deleted successfully" });
    } catch (err) {
      console.error("DELETE /health-records/:id error:", err.message);
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
        message: "Failed to delete health record",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  }
);

/* -------------------------------------------------------------
   GET /api/health-records/:id
   Get a single health record
   ------------------------------------------------------------- */
router.get(
  "/:id",
  auth,
  authorize("admin", "student", "faculty", "non_academic"),
  async (req, res) => {
    try {
      const id = req.params.id;

      const [rows] = await pool.query(
        `SELECT
         hr.id,
         hr.student_id,
         hr.record_type,
         hr.date_of_visit,
         hr.chief_complaint,
         hr.diagnosis,
         hr.treatment,
         hr.vital_blood_pressure,
         hr.vital_heart_rate,
         hr.vital_respiratory_rate,
         hr.vital_temperature,
         hr.vital_weight,
         hr.vital_height,
         hr.notes,
         hr.attachments,
         hr.created_at,
         hr.updated_at,
         u.student_id AS user_student_id,
         u.employee_id AS user_employee_id,
         u.role AS user_role,
         u.first_name   AS student_first_name,
         u.middle_name  AS student_middle_name,
         u.last_name    AS student_last_name,
         u.course,
         u.year_level,
         u.department,
         u.position,
         u.address,
         u.birthday,
         u.phone_number,
         ms.employee_id AS ms_employee_id,
         ms.first_name  AS ms_first_name,
         ms.last_name   AS ms_last_name
       FROM health_records hr
       LEFT JOIN users u ON hr.student_id = u.id
       LEFT JOIN users ms ON hr.medical_staff_id = ms.id
       WHERE hr.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Health record not found" });
      }

      const record = rows[0];

      // Check access: students/faculty/non_academic can only see their own
      if (
        ["student", "faculty", "non_academic"].includes(req.user.role) &&
        record.student_id !== req.user.id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(record);
    } catch (err) {
      console.error("GET /health-records/:id error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
