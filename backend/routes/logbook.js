import express from "express";
import { pool } from "../db/mysql.js";
import { auth, authorize } from "../middleware/authMiddleware.js";
import { logAction } from "../utils/audit.js";

const router = express.Router();

// Create a visit/log entry and save to health_records
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { idValue, role, date, time, purpose, name } = req.body || {};
    if (!idValue || !role || !date || !time || !purpose) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the user by student_id (for students) or employee_id (for others)
    let userRow;
    if (role === "student") {
      const [[u]] = await pool.query(
        "SELECT id FROM users WHERE student_id = ? AND is_active = 1 LIMIT 1",
        [idValue]
      );
      userRow = u;
    } else {
      const [[u]] = await pool.query(
        "SELECT id FROM users WHERE employee_id = ? AND is_active = 1 LIMIT 1",
        [idValue]
      );
      userRow = u;
    }

    if (!userRow) return res.status(404).json({ message: "User not found" });

    const notesObj = { time, role, name: name || null, recorded_by: req.user.id };

    const [result] = await pool.query(
      `INSERT INTO health_records (student_id, record_type, date_of_visit, medical_staff_id, chief_complaint, notes)
       VALUES (?, 'visit', ?, ?, ?, ?)`,
      [userRow.id, date, req.user.id, purpose, JSON.stringify(notesObj)]
    );

    await logAction({
      actorId: req.user.id,
      action: "CREATE",
      targetModel: "HealthRecord",
      targetId: result.insertId.toString(),
      summary: "Created logbook visit",
      ipAddress: req.ip,
    });

    res.status(201).json({ message: "Visit recorded", id: result.insertId });
  } catch (e) {
    console.error("Logbook create error:", e);
    res.status(500).json({ message: "Failed to create visit", error: e.message });
  }
});

// Get all visits (admin)
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT hr.id, hr.date_of_visit, hr.chief_complaint, hr.notes, u.first_name, u.middle_name, u.last_name, u.student_id, u.employee_id, u.role
       FROM health_records hr
       JOIN users u ON hr.student_id = u.id
       WHERE hr.record_type = 'visit'
       ORDER BY hr.date_of_visit DESC, hr.created_at DESC
       LIMIT 1000`
    );

    // parse notes JSON
    const visits = rows.map((r) => ({ ...r, notes: r.notes ? JSON.parse(r.notes) : null }));
    res.json({ visits });
  } catch (e) {
    console.error("Logbook list error:", e);
    res.status(500).json({ message: "Failed to list visits" });
  }
});

export default router;
