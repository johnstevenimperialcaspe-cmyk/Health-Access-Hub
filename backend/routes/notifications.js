import express from "express";
import { pool } from "../db/mysql.js";
import { auth, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all notifications for current user
router.get("/", auth, async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const isRead = req.query.isRead;
    const type = req.query.type;
    const priority = req.query.priority;

    const where = ["n.recipient_id = ?"];
    const params = [req.user.id];
    if (isRead !== undefined) {
      where.push("n.is_read = ?");
      params.push(isRead === "true" ? 1 : 0);
    }
    if (type) {
      where.push("n.type = ?");
      params.push(type);
    }
    if (priority) {
      where.push("n.priority = ?");
      params.push(priority);
    }
    const whereSql = `WHERE ${where.join(" AND ")}`;

    const [rows] = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS n.*, s.first_name AS sender_first_name, s.middle_name AS sender_middle_name, s.last_name AS sender_last_name, s.email AS sender_email, s.role AS sender_role
         FROM notifications n
         JOIN users s ON s.id = n.sender_id
         ${whereSql}
         ORDER BY n.created_at DESC
         LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );
    const [[{ total }]] = await pool.query("SELECT FOUND_ROWS() AS total");
    const [[{ unreadCount }]] = await pool.query(
      "SELECT COUNT(*) AS unreadCount FROM notifications WHERE recipient_id = ? AND is_read = 0",
      [req.user.id]
    );

    // NOTE: notifications table doesn't have read_at, expires_at, action_required, action_url, metadata columns
    const notifications = rows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      relatedRecordId: n.related_record_id,
      relatedAppointmentId: n.related_appointment_id,
      isRead: !!n.is_read,
      priority: n.priority,
      createdAt: n.created_at,
      sender: {
        firstName: n.sender_first_name,
        middleName: n.sender_middle_name,
        lastName: n.sender_last_name,
        email: n.sender_email,
        role: n.sender_role,
      },
    }));

    // Ensure we always return an array
    const notificationList = Array.isArray(notifications) ? notifications : [];
    const totalCount = total || 0;

    res.json({
      notifications: notificationList,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      total: totalCount,
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    console.error("Error code:", error.code);
    console.error("Error SQL state:", error.sqlState);
    console.error("Error SQL message:", error.sqlMessage);
    
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
      message: "Failed to retrieve notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Get notification statistics - MUST come before /:id route
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const [[{ totalNotifications }]] = await pool.query(
      "SELECT COUNT(*) AS totalNotifications FROM notifications WHERE recipient_id = ?",
      [req.user.id]
    );
    const [[{ unreadNotifications }]] = await pool.query(
      "SELECT COUNT(*) AS unreadNotifications FROM notifications WHERE recipient_id = ? AND is_read = 0",
      [req.user.id]
    );
    const readNotifications = totalNotifications - unreadNotifications;
    const [notificationsByType] = await pool.query(
      "SELECT type AS _id, COUNT(*) AS count FROM notifications WHERE recipient_id = ? GROUP BY type ORDER BY count DESC",
      [req.user.id]
    );
    const [notificationsByPriority] = await pool.query(
      "SELECT priority AS _id, COUNT(*) AS count FROM notifications WHERE recipient_id = ? GROUP BY priority ORDER BY count DESC",
      [req.user.id]
    );
    const [[{ recentNotifications }]] = await pool.query(
      "SELECT COUNT(*) AS recentNotifications FROM notifications WHERE recipient_id = ? AND created_at >= (NOW() - INTERVAL 7 DAY)",
      [req.user.id]
    );
    res.json({
      totalNotifications,
      unreadNotifications,
      readNotifications,
      notificationsByType,
      notificationsByPriority,
      recentNotifications,
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
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
      message: "Failed to retrieve notification statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Mark all as read - MUST come before /:id route
router.put("/read-all", auth, async (req, res) => {
  try {
    // NOTE: notifications table doesn't have read_at column, only is_read
    await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE recipient_id = ? AND is_read = 0",
      [req.user.id]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
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
      message: "Failed to mark all notifications as read",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Get single notification (marks as read) - MUST come after /stats/overview and /read-all
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, s.first_name AS sender_first_name, s.middle_name AS sender_middle_name, s.last_name AS sender_last_name
       FROM notifications n JOIN users s ON s.id = n.sender_id WHERE n.id = ? AND n.recipient_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Notification not found" });

    if (!rows[0].is_read) {
      await pool.query(
        "UPDATE notifications SET is_read = 1 WHERE id = ?",
        [req.params.id]
      );
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    // NOTE: notifications table doesn't have read_at column, only is_read
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
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
      message: "Failed to mark notification as read",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Delete notification
router.delete("/:id", auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM notifications WHERE id = ? AND recipient_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
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
      message: "Failed to delete notification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Create notification (admin, medical_staff)
router.post(
  "/",
  auth,
  authorize("admin", "medical_staff"),
  async (req, res) => {
    try {
      const {
        recipientId,
        type,
        title,
        message,
        priority,
        relatedRecordId,
        relatedAppointmentId,
      } = req.body;

      if (!recipientId || !type || !title || !message) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      // NOTE: notifications table only has: id, recipient_id, sender_id, type, title, message,
      // related_record_id, related_appointment_id, is_read, priority, created_at, updated_at
      await pool.query(
        `INSERT INTO notifications (recipient_id, sender_id, type, title, message, priority, related_record_id, related_appointment_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipientId,
          req.user.id,
          type,
          title,
          message,
          priority || "medium",
          relatedRecordId || null,
          relatedAppointmentId || null,
        ]
      );
      res.status(201).json({ message: "Notification created successfully" });
    } catch (error) {
      console.error("Create notification error:", error);
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
        message: "Failed to create notification",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
);

export default router;
