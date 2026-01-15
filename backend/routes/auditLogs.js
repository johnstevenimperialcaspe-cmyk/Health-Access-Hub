// backend/routes/auditLogs.js
import express from "express";
import { pool } from "../db/mysql.js";
import { auth, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// GET AUDIT LOGS (Admin only)
// ==========================================
router.get("/", auth, authorize("admin"), async (req, res) => {
  try {
    const {
      userRole,
      action,
      targetModel,
      actorId,
      startDate,
      endDate,
      page = 1,
      limit = 100
    } = req.query;

    let whereConditions = [];
    let params = [];

    if (userRole) {
      whereConditions.push('al.user_role = ?');
      params.push(userRole);
    }

    if (action) {
      whereConditions.push('al.action = ?');
      params.push(action);
    }

    if (targetModel) {
      whereConditions.push('al.target_model = ?');
      params.push(targetModel);
    }

    if (actorId) {
      whereConditions.push('al.actor_id = ?');
      params.push(parseInt(actorId));
    }

    if (startDate) {
      whereConditions.push('DATE(al.created_at) >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('DATE(al.created_at) <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const [logs] = await pool.query(
      `SELECT 
        al.*,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.role,
        u.student_id,
        u.employee_id
      FROM audit_logs al
      JOIN users u ON al.actor_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?`,
      params
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM audit_logs al ${whereClause}`,
      params.slice(0, -2)
    );

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// ==========================================
// GET AUDIT LOG STATISTICS
// ==========================================
router.get("/stats", auth, authorize("admin"), async (req, res) => {
  try {
    const { period = 'week' } = req.query; // day, week, month

    const [byAction] = await pool.query(`
      SELECT 
        action,
        COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 ${period.toUpperCase()})
      GROUP BY action
      ORDER BY count DESC
    `);

    const [byRole] = await pool.query(`
      SELECT 
        user_role,
        COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 ${period.toUpperCase()})
      GROUP BY user_role
      ORDER BY count DESC
    `);

    const [byModel] = await pool.query(`
      SELECT 
        target_model,
        COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 ${period.toUpperCase()})
      GROUP BY target_model
      ORDER BY count DESC
    `);

    const [topUsers] = await pool.query(`
      SELECT 
        al.actor_id,
        u.first_name,
        u.last_name,
        u.role,
        COUNT(*) as action_count
      FROM audit_logs al
      JOIN users u ON al.actor_id = u.id
      WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 1 ${period.toUpperCase()})
      GROUP BY al.actor_id, u.first_name, u.last_name, u.role
      ORDER BY action_count DESC
      LIMIT 10
    `);

    const [dailyActivity] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_actions
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      byAction,
      byRole,
      byModel,
      topUsers,
      dailyActivity
    });
  } catch (error) {
    console.error("Get audit stats error:", error);
    res.status(500).json({ message: "Failed to fetch audit statistics" });
  }
});

// ==========================================
// GET USER ACTIVITY LOG (Admin only - view any user)
// ==========================================
router.get("/user/:userId", auth, authorize("admin"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const [logs] = await pool.query(
      `SELECT 
        al.*,
        u.first_name,
        u.last_name,
        u.role
      FROM audit_logs al
      JOIN users u ON al.actor_id = u.id
      WHERE al.actor_id = ?
      ORDER BY al.created_at DESC
      LIMIT ?`,
      [parseInt(userId), parseInt(limit)]
    );

    res.json({ logs });
  } catch (error) {
    console.error("Get user activity error:", error);
    res.status(500).json({ message: "Failed to fetch user activity" });
  }
});

// ==========================================
// GET MY ACTIVITY LOG (For logged-in user)
// ==========================================
router.get("/my-activity", auth, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const userId = req.user.id;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [logs] = await pool.query(
      `SELECT 
        al.*
      FROM audit_logs al
      WHERE al.actor_id = ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM audit_logs WHERE actor_id = ?`,
      [userId]
    );

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get my activity error:", error);
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
});

export default router;
