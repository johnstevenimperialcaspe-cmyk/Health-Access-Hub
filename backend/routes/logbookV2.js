import express from "express";
import { pool } from "../db/mysql.js";
import { auth, authorize } from "../middleware/authMiddleware.js";
import { logAction } from "../utils/audit.js";

const router = express.Router();

// ==========================================
// CREATE LOGBOOK ENTRY (Check-in)
// ==========================================
router.post("/check-in", auth, authorize("admin"), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { 
      patientId, 
      patientType, 
      visitDate, 
      checkInTime, 
      purpose, 
      appointmentId,
      notes
    } = req.body;

    // Validate patient exists
    const [[patient]] = await connection.query(
      `SELECT id, first_name, last_name, role FROM users WHERE id = ? AND is_active = 1`,
      [patientId]
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Verify patient type matches
    if (patient.role !== patientType) {
      return res.status(400).json({ message: "Patient type mismatch" });
    }

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO logbook_entries (
        patient_id, patient_type, visit_date, check_in_time, purpose, 
        appointment_id, recorded_by, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'checked_in')`,
      [
        patientId,
        patientType,
        visitDate,
        checkInTime,
        purpose,
        appointmentId || null,
        req.user.id,
        notes || null
      ]
    );

    // Update appointment status if linked
    if (appointmentId) {
      await connection.execute(
        `UPDATE appointments SET status = 'in_progress' WHERE id = ?`,
        [appointmentId]
      );
    }

    await logAction({
      actorId: req.user.id,
      action: "CREATE",
      targetModel: "LogbookEntry",
      targetId: result.insertId.toString(),
      summary: `Patient checked in: ${patient.first_name} ${patient.last_name}`,
      ipAddress: req.ip,
      metadata: { patientId, visitDate, purpose }
    });

    await connection.commit();

    res.status(201).json({
      message: "Patient checked in successfully",
      entryId: result.insertId,
      patient: {
        name: `${patient.first_name} ${patient.last_name}`,
        type: patientType
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Failed to check in patient", error: error.message });
  } finally {
    connection.release();
  }
});

// ==========================================
// PATIENT ACKNOWLEDGMENT (Manual/Digital Signature)
// ==========================================
router.post("/acknowledge/:id", auth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { signature } = req.body;

    // Get entry
    const [[entry]] = await connection.query(
      `SELECT * FROM logbook_entries WHERE id = ?`,
      [id]
    );

    if (!entry) {
      return res.status(404).json({ message: "Logbook entry not found" });
    }

    // Verify it's the patient acknowledging their own entry
    if (entry.patient_id !== req.user.id) {
      return res.status(403).json({ message: "You can only acknowledge your own visit" });
    }

    if (entry.patient_acknowledged_at) {
      return res.status(400).json({ message: "Already acknowledged" });
    }

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE logbook_entries 
       SET patient_signature = ?, 
           patient_acknowledged_at = NOW()
       WHERE id = ?`,
      [signature || null, id]
    );

    await logAction({
      actorId: req.user.id,
      action: "UPDATE",
      targetModel: "LogbookEntry",
      targetId: id,
      summary: `Acknowledged visit`,
      ipAddress: req.ip
    });

    await connection.commit();

    res.json({ message: "Visit acknowledged successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Acknowledgment error:", error);
    res.status(500).json({ message: "Failed to acknowledge visit" });
  } finally {
    connection.release();
  }
});

// ==========================================
// CHECK-OUT
// ==========================================
router.post("/check-out/:id", auth, authorize("admin"), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { checkOutTime, notes } = req.body;

    const [[entry]] = await connection.query(
      `SELECT * FROM logbook_entries WHERE id = ?`,
      [id]
    );

    if (!entry) {
      return res.status(404).json({ message: "Logbook entry not found" });
    }

    if (entry.status === 'completed') {
      return res.status(400).json({ message: "Patient already checked out" });
    }

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE logbook_entries 
       SET check_out_time = ?, 
           status = 'completed', 
           completed_at = NOW(),
           notes = CONCAT(COALESCE(notes, ''), '\n', COALESCE(?, ''))
       WHERE id = ?`,
      [checkOutTime, notes || '', id]
    );

    await logAction({
      actorId: req.user.id,
      action: "UPDATE",
      targetModel: "LogbookEntry",
      targetId: id,
      summary: "Patient checked out",
      ipAddress: req.ip
    });

    await connection.commit();

    res.json({ message: "Patient checked out successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Check-out error:", error);
    res.status(500).json({ message: "Failed to check out patient" });
  } finally {
    connection.release();
  }
});

// ==========================================
// GET LOGBOOK ENTRIES (Admin)
// ==========================================
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      patientType, 
      status,
      acknowledged,
      page = 1, 
      limit = 50 
    } = req.query;

    let whereConditions = [];
    let params = [];

    if (startDate) {
      whereConditions.push('le.visit_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('le.visit_date <= ?');
      params.push(endDate);
    }

    if (patientType) {
      whereConditions.push('le.patient_type = ?');
      params.push(patientType);
    }

    if (status) {
      whereConditions.push('le.status = ?');
      params.push(status);
    }

    if (acknowledged === 'true') {
      whereConditions.push('le.patient_acknowledged_at IS NOT NULL');
    } else if (acknowledged === 'false') {
      whereConditions.push('le.patient_acknowledged_at IS NULL');
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const [entries] = await pool.query(
      `SELECT 
        le.*,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.student_id,
        u.employee_id,
        u.department,
        u.course,
        u.position,
        recorder.first_name as recorder_first_name,
        recorder.last_name as recorder_last_name,
        a.appointment_date,
        a.appointment_time
      FROM logbook_entries le
      JOIN users u ON le.patient_id = u.id
      JOIN users recorder ON le.recorded_by = recorder.id
      LEFT JOIN appointments a ON le.appointment_id = a.id
      ${whereClause}
      ORDER BY le.visit_date DESC, le.check_in_time DESC
      LIMIT ? OFFSET ?`,
      params
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM logbook_entries le ${whereClause}`,
      params.slice(0, -2)
    );

    res.json({
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get logbook entries error:", error);
    res.status(500).json({ message: "Failed to fetch logbook entries" });
  }
});

// ==========================================
// GET LOGBOOK STATISTICS
// ==========================================
router.get("/stats", auth, authorize("admin"), async (req, res) => {
  try {
    const [todayStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_today,
        SUM(CASE WHEN status = 'checked_in' OR status = 'in_progress' THEN 1 ELSE 0 END) as currently_in,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_today,
        SUM(CASE WHEN patient_acknowledged_at IS NOT NULL THEN 1 ELSE 0 END) as acknowledged_today
      FROM logbook_entries
      WHERE visit_date = CURDATE()
    `);

    const [byType] = await pool.query(`
      SELECT 
        patient_type,
        COUNT(*) as total,
        AVG(TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time)) as avg_duration_minutes
      FROM logbook_entries
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND check_out_time IS NOT NULL
      GROUP BY patient_type
    `);

    const [dailyTrend] = await pool.query(`
      SELECT 
        visit_date,
        COUNT(*) as total_visits,
        SUM(CASE WHEN patient_acknowledged_at IS NOT NULL THEN 1 ELSE 0 END) as acknowledged
      FROM logbook_entries
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY visit_date
      ORDER BY visit_date
    `);

    res.json({
      today: todayStats[0],
      byType,
      dailyTrend
    });
  } catch (error) {
    console.error("Get logbook stats error:", error);
    res.status(500).json({ message: "Failed to fetch logbook statistics" });
  }
});

// ==========================================
// UPDATE LOGBOOK ENTRY (Edit)
// ==========================================
router.put("/:id", auth, authorize("admin"), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { purpose, notes, visitDate, checkInTime } = req.body;

    // Get existing entry
    const [[entry]] = await connection.query(
      `SELECT * FROM logbook_entries WHERE id = ?`,
      [id]
    );

    if (!entry) {
      return res.status(404).json({ message: "Logbook entry not found" });
    }

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE logbook_entries 
       SET purpose = ?, notes = ?, visit_date = ?, check_in_time = ?
       WHERE id = ?`,
      [purpose, notes || null, visitDate, checkInTime, id]
    );

    await logAction({
      actorId: req.user.id,
      action: "UPDATE",
      targetModel: "LogbookEntry",
      targetId: id,
      summary: `Updated logbook entry`,
      ipAddress: req.ip,
      metadata: { purpose, visitDate }
    });

    await connection.commit();

    res.json({ message: "Logbook entry updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Update entry error:", error);
    res.status(500).json({ message: "Failed to update entry" });
  } finally {
    connection.release();
  }
});

// ==========================================
// DELETE LOGBOOK ENTRY
// ==========================================
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    // Get existing entry
    const [[entry]] = await connection.query(
      `SELECT le.*, u.first_name, u.last_name 
       FROM logbook_entries le
       JOIN users u ON le.patient_id = u.id
       WHERE le.id = ?`,
      [id]
    );

    if (!entry) {
      return res.status(404).json({ message: "Logbook entry not found" });
    }

    await connection.beginTransaction();

    await connection.execute(
      `DELETE FROM logbook_entries WHERE id = ?`,
      [id]
    );

    await logAction({
      actorId: req.user.id,
      action: "DELETE",
      targetModel: "LogbookEntry",
      targetId: id,
      summary: `Deleted logbook entry for ${entry.first_name} ${entry.last_name}`,
      ipAddress: req.ip,
      metadata: { patientId: entry.patient_id, visitDate: entry.visit_date }
    });

    await connection.commit();

    res.json({ message: "Logbook entry deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Delete entry error:", error);
    res.status(500).json({ message: "Failed to delete entry" });
  } finally {
    connection.release();
  }
});

// ==========================================
// GET MY LOGBOOK ENTRIES (Patient View)
// ==========================================
router.get("/my-visits", auth, async (req, res) => {
  try {
    const allowedRoles = ['student', 'faculty', 'non_academic'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Only patients can view their visits" });
    }

    const [entries] = await pool.query(
      `SELECT 
        le.*,
        recorder.first_name as recorder_first_name,
        recorder.last_name as recorder_last_name
      FROM logbook_entries le
      JOIN users recorder ON le.recorded_by = recorder.id
      WHERE le.patient_id = ?
      ORDER BY le.visit_date DESC, le.check_in_time DESC
      LIMIT 50`,
      [req.user.id]
    );

    res.json({ entries });
  } catch (error) {
    console.error("Get my visits error:", error);
    res.status(500).json({ message: "Failed to fetch your visits" });
  }
});

// ==========================================
// GET PENDING ACKNOWLEDGMENTS (Patient View)
// ==========================================
router.get("/pending-acknowledgments", auth, async (req, res) => {
  try {
    const allowedRoles = ['student', 'faculty', 'non_academic'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Only patients can view pending acknowledgments" });
    }

    const [entries] = await pool.query(
      `SELECT 
        le.*,
        recorder.first_name as recorder_first_name,
        recorder.last_name as recorder_last_name
      FROM logbook_entries le
      JOIN users recorder ON le.recorded_by = recorder.id
      WHERE le.patient_id = ? 
      AND le.patient_acknowledged_at IS NULL
      ORDER BY le.visit_date DESC, le.check_in_time DESC`,
      [req.user.id]
    );

    res.json({ pendingEntries: entries });
  } catch (error) {
    console.error("Get pending acknowledgments error:", error);
    res.status(500).json({ message: "Failed to fetch pending acknowledgments" });
  }
});

export default router;
