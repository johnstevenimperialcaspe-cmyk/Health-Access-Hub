import express from "express";
import { pool } from "../db/mysql.js";
import { auth, authorize } from "../middleware/authMiddleware.js";
import { logAction } from "../utils/audit.js";

const router = express.Router();

// ==========================================
// CREATE EVALUATION (All patient types)
// ==========================================
router.post("/", auth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      appointmentId,
      healthRecordId,
      visitDate,
      ratingStaffCourtesy,
      ratingWaitingTime,
      ratingFacilityCleanliness,
      ratingServiceQuality,
      comments,
      suggestions,
      wouldRecommend
    } = req.body;

    // Validate user role
    const allowedRoles = ['student', 'faculty', 'non_academic'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Only patients can submit evaluations" });
    }

    // Validate ratings (1-5)
    const ratings = [ratingStaffCourtesy, ratingWaitingTime, ratingFacilityCleanliness, ratingServiceQuality];
    if (ratings.some(r => !r || isNaN(r) || r < 1 || r > 5)) {
      return res.status(400).json({ message: "Ratings must be between 1 and 5" });
    }

    // Calculate overall rating
    const ratingOverall = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);

    // Convert visitDate to MySQL DATE format (YYYY-MM-DD)
    const formattedVisitDate = visitDate ? new Date(visitDate).toISOString().split('T')[0] : null;

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO service_evaluations (
        patient_id, patient_type, appointment_id, health_record_id, visit_date,
        rating_staff_courtesy, rating_waiting_time, rating_facility_cleanliness, 
        rating_service_quality, rating_overall, comments, suggestions, 
        would_recommend, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        req.user.role,
        appointmentId || null,
        healthRecordId || null,
        formattedVisitDate,
        ratingStaffCourtesy,
        ratingWaitingTime,
        ratingFacilityCleanliness,
        ratingServiceQuality,
        ratingOverall,
        comments || null,
        suggestions || null,
        wouldRecommend !== false,
        req.ip
      ]
    );

    await logAction({
      actorId: req.user.id,
      action: "CREATE",
      targetModel: "ServiceEvaluation",
      targetId: result.insertId.toString(),
      summary: `Submitted service evaluation (Rating: ${ratingOverall}/5)`,
      ipAddress: req.ip,
      metadata: { ratingOverall, visitDate }
    });

    await connection.commit();

    res.status(201).json({
      message: "Thank you for your feedback!",
      evaluationId: result.insertId,
      ratingOverall
    });
  } catch (error) {
    await connection.rollback();
    console.error("Evaluation creation error:", error);
    res.status(500).json({ message: "Failed to submit evaluation", error: error.message });
  } finally {
    connection.release();
  }
});

// ==========================================
// GET EVALUATIONS - Admin View (All)
// ==========================================
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { patientType, startDate, endDate, minRating, source, page = 1, limit = 50 } = req.query;
    
    let whereConditions = [];
    let params = [];

    if (patientType && ['student', 'faculty', 'non_academic'].includes(patientType)) {
      whereConditions.push('se.patient_type = ?');
      params.push(patientType);
    }

    if (startDate) {
      whereConditions.push('se.visit_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('se.visit_date <= ?');
      params.push(endDate);
    }

    if (minRating) {
      whereConditions.push('se.rating_overall >= ?');
      params.push(parseFloat(minRating));
    }

    // Filter by source (appointment or logbook)
    if (source === 'appointment') {
      whereConditions.push('se.appointment_id IS NOT NULL');
    } else if (source === 'logbook') {
      whereConditions.push('se.health_record_id IS NOT NULL');
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const [evaluations] = await pool.query(
      `SELECT 
        se.*,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.student_id,
        u.employee_id,
        u.department,
        u.course,
        u.position,
        a.id as appointment_number,
        a.appointment_date,
        a.appointment_time,
        a.purpose as appointment_purpose,
        CASE 
          WHEN se.appointment_id IS NOT NULL THEN 'appointment'
          WHEN se.health_record_id IS NOT NULL THEN 'logbook'
          ELSE 'other'
        END as evaluation_source
      FROM service_evaluations se
      JOIN users u ON se.patient_id = u.id
      LEFT JOIN appointments a ON se.appointment_id = a.id
      ${whereClause}
      ORDER BY se.submitted_at DESC
      LIMIT ? OFFSET ?`,
      params
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM service_evaluations se ${whereClause}`,
      params.slice(0, -2)
    );

    res.json({
      evaluations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get evaluations error:", error);
    res.status(500).json({ message: "Failed to fetch evaluations" });
  }
});

// ==========================================
// GET EVALUATION STATISTICS - Admin
// ==========================================
router.get("/stats", auth, authorize("admin"), async (req, res) => {
  try {
    const { period = 'month' } = req.query; // month, quarter, year

    const [overall] = await pool.query(`
      SELECT 
        COUNT(*) as total_evaluations,
        AVG(rating_overall) as avg_rating,
        AVG(rating_staff_courtesy) as avg_staff_courtesy,
        AVG(rating_waiting_time) as avg_waiting_time,
        AVG(rating_facility_cleanliness) as avg_facility_cleanliness,
        AVG(rating_service_quality) as avg_service_quality,
        SUM(CASE WHEN would_recommend = 1 THEN 1 ELSE 0 END) as would_recommend_count
      FROM service_evaluations
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 1 ${period.toUpperCase()})
    `);

    const [byPatientType] = await pool.query(`
      SELECT 
        patient_type,
        COUNT(*) as total,
        AVG(rating_overall) as avg_rating,
        SUM(CASE WHEN would_recommend = 1 THEN 1 ELSE 0 END) as would_recommend_count
      FROM service_evaluations
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 1 ${period.toUpperCase()})
      GROUP BY patient_type
    `);

    const [ratingDistribution] = await pool.query(`
      SELECT 
        FLOOR(rating_overall) as rating_floor,
        COUNT(*) as count
      FROM service_evaluations
      WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 1 ${period.toUpperCase()})
      GROUP BY FLOOR(rating_overall)
      ORDER BY rating_floor
    `);

    const [recentComments] = await pool.query(`
      SELECT 
        se.id,
        se.comments,
        se.suggestions,
        se.rating_overall,
        se.visit_date,
        se.patient_type,
        u.first_name,
        u.last_name
      FROM service_evaluations se
      JOIN users u ON se.patient_id = u.id
      WHERE se.comments IS NOT NULL OR se.suggestions IS NOT NULL
      ORDER BY se.submitted_at DESC
      LIMIT 10
    `);

    res.json({
      overall: overall[0],
      byPatientType,
      ratingDistribution,
      recentComments
    });
  } catch (error) {
    console.error("Get evaluation stats error:", error);
    res.status(500).json({ message: "Failed to fetch evaluation statistics" });
  }
});

// ==========================================
// GET MY EVALUATIONS (Patient View)
// ==========================================
router.get("/my-evaluations", auth, async (req, res) => {
  try {
    const allowedRoles = ['student', 'faculty', 'non_academic'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Only patients can view their evaluations" });
    }

    const [evaluations] = await pool.query(
      `SELECT * FROM service_evaluations 
       WHERE patient_id = ? 
       ORDER BY submitted_at DESC`,
      [req.user.id]
    );

    res.json({ evaluations });
  } catch (error) {
    console.error("Get my evaluations error:", error);
    res.status(500).json({ message: "Failed to fetch your evaluations" });
  }
});

export default router;
