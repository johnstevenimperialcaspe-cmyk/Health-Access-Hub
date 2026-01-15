// backend/routes/appointments.js
import express from "express";
import { pool } from "../db/mysql.js";
import { auth } from "../middleware/authMiddleware.js";
import { logAction } from "../utils/audit.js";
import { sendMail } from "../utils/mailer.js";

const router = express.Router();

// Helper function to create notification
const createNotification = async (recipientId, senderId, type, title, message, relatedAppointmentId = null) => {
  try {
    await pool.query(
      `INSERT INTO notifications (recipient_id, sender_id, type, title, message, related_appointment_id, priority)
       VALUES (?, ?, ?, ?, ?, ?, 'medium')`,
      [recipientId, senderId, type, title, message, relatedAppointmentId]
    );
  } catch (err) {
    console.error("Error creating notification:", err);
    // Don't throw - notification failure shouldn't break the main operation
  }
};

/* -------------------------------------------------------------
   GET /api/appointments
   • admin → all + filters
   • student → only own
   • others → empty
   ------------------------------------------------------------- */
router.get("/", auth, async (req, res) => {
  try {
    // Verify appointments table structure - get actual column names
    let actualColumns = [];
    try {
      const [columns] = await pool.query("SHOW COLUMNS FROM appointments");
      actualColumns = columns.map(col => col.Field);
      console.log("Appointments table columns:", actualColumns);
      
      // Check if medical_staff_id exists (it shouldn't)
      if (actualColumns.includes('medical_staff_id')) {
        console.error("ERROR: medical_staff_id column EXISTS in appointments table!");
        console.error("This column should NOT exist according to the schema.");
      }
    } catch (colCheckErr) {
      console.error("Error checking table structure:", colCheckErr);
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

            // --- Role-based access control ---
            // Students, faculty, and non-academic staff can only see their own appointments
            if (["student", "faculty", "non_academic"].includes(req.user.role)) {
              where.push("a.user_id = ?");
              params.push(req.user.id);
            } else if (req.user.role !== "admin") {
              return res.json({
                appointments: [],
                total: 0,
                pagination: { page, limit, total: 0, totalPages: 0 },
              });
            }

    // --- Optional filters (admin only) ---
    if (req.user.role === "admin") {
      const { studentId, status, dateFrom, dateTo } = req.query;
      if (studentId) {
        where.push("u.student_id = ?");
        params.push(studentId);
      }
      if (status) {
        where.push("a.status = ?");
        params.push(status);
      }
      if (dateFrom) {
        where.push("a.appointment_date >= ?");
        params.push(dateFrom);
      }
      if (dateTo) {
        where.push("a.appointment_date <= ?");
        params.push(dateTo);
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Build the SELECT query - only select columns that exist in appointments table
    // NOTE: medical_staff_id does NOT exist in appointments table - do NOT reference it
    const selectQuery = `SELECT
         a.id,
         a.user_id,
         a.appointment_date,
         a.appointment_time,
         a.purpose,
         a.status,
         a.notes,
         a.duration,
         a.created_at,
         u.student_id,
         u.first_name   AS user_first_name,
         u.middle_name  AS user_middle_name,
         u.last_name    AS user_last_name,
         u.email        AS user_email,
         u.course,
         u.year_level
       FROM appointments a
       LEFT JOIN users u ON a.user_id = u.id
       ${whereSql}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT ? OFFSET ?`;

    // Debug: Log the query to verify it's correct
    console.log("Appointments query:", selectQuery);
    console.log("Query params:", [...params, limit, offset]);

    // --- Paginated results ---
    const [rows] = await pool.query(selectQuery, [...params, limit, offset]);

    // --- Total count ---
    // Need to join users table if WHERE clause references it
    let countQuery;
    if (whereSql.includes("u.student_id")) {
      // Admin filter by student_id - need JOIN
      countQuery = `SELECT COUNT(*) AS total 
                    FROM appointments a 
                    LEFT JOIN users u ON a.user_id = u.id 
                    ${whereSql}`;
    } else {
      // Student query or admin without student filter - no JOIN needed
      countQuery = `SELECT COUNT(*) AS total 
                    FROM appointments a 
                    ${whereSql}`;
    }
    
    console.log("Count query:", countQuery);
    console.log("Count params:", params);
    
    const [[{ total }]] = await pool.query(countQuery, params);

    // Ensure we always return an array
    const appointments = Array.isArray(rows) ? rows : [];

    res.json({
      appointments: appointments,
      total: total || 0,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (err) {
    console.error("========== GET /appointments ERROR ==========");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error SQL state:", err.sqlState);
    console.error("Error SQL message:", err.sqlMessage);
    console.error("Full error stack:", err.stack);
    console.error("==============================================");
    
    // Handle database connection errors
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(503).json({ 
        message: "Database connection failed. Please try again later.",
        appointments: [],
        total: 0,
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      });
    }
    
    // Handle SQL errors
    if (err.code && err.code.startsWith("ER_")) {
      return res.status(500).json({ 
        message: "Database error occurred",
        error: process.env.NODE_ENV === "development" ? err.sqlMessage : undefined,
        appointments: [],
        total: 0,
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      });
    }
    
    // Send detailed error in development, generic in production
    const errorResponse = {
      message: "Failed to retrieve appointments",
      error: process.env.NODE_ENV === "development" ? {
        message: err.message,
        code: err.code,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage
      } : undefined,
      appointments: [],
      total: 0,
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
    
    res.status(500).json(errorResponse);
  }
});

/* Helper function to validate appointment constraints */
const validateAppointmentConstraints = async (appointment_date, appointment_time) => {
  const errors = [];

  // 1. Check if date is Monday-Friday (0=Sunday, so 1-5 are Mon-Fri)
  const dateObj = new Date(appointment_date);
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    errors.push("Appointments can only be scheduled Monday to Friday.");
  }

  // 2. Check if time is between 7:00 AM and 6:00 PM (18:00)
  const [hours, minutes] = appointment_time.split(":").map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const minTime = 7 * 60; // 7:00 AM
  const maxTime = 18 * 60; // 6:00 PM
  
  if (timeInMinutes < minTime || timeInMinutes > maxTime) {
    errors.push("Appointments can only be scheduled between 7:00 AM and 6:00 PM.");
  }

  // 3. Check if date already has 50 appointments
  const [[slotCheck]] = await pool.query(
    `SELECT COUNT(*) as slot_count FROM appointments 
     WHERE DATE(appointment_date) = DATE(?) 
     AND status != 'cancelled'`,
    [appointment_date]
  );
  
  if (slotCheck.slot_count >= 50) {
    errors.push("All appointment slots for this date are fully booked.");
  }

  return errors;
};

/* Helper function to get available slots for a date */
const getAvailableSlots = async (appointment_date) => {
  const [[result]] = await pool.query(
    `SELECT COUNT(*) as booked_slots FROM appointments 
     WHERE DATE(appointment_date) = DATE(?) 
     AND status != 'cancelled'`,
    [appointment_date]
  );
  
  const bookedSlots = result.booked_slots || 0;
  const availableSlots = Math.max(0, 50 - bookedSlots);
  
  return {
    date: appointment_date,
    booked_slots: bookedSlots,
    available_slots: availableSlots,
    is_fully_booked: bookedSlots >= 50
  };
};

/* GET /api/appointments/slots/availability/:date
   Returns slot availability for a specific date
   ------------------------------------------------------------- */
router.get("/slots/availability/:date", auth, async (req, res) => {
  try {
    const { date } = req.params;
    const availability = await getAvailableSlots(date);
    res.json(availability);
  } catch (err) {
    console.error("GET /appointments/slots/availability/:date error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------------------------
   POST /api/appointments
   ------------------------------------------------------------- */
router.post("/", auth, async (req, res) => {
  try {
    // Allow students, faculty, and non-academic staff to create appointments
    if (!["student", "faculty", "non_academic"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { appointment_date, appointment_time, purpose, duration, notes } = req.body;
    if (!appointment_date || !appointment_time || !purpose) {
      return res.status(400).json({ message: "Date, time, and purpose are required" });
    }

    // Validate appointment constraints
    const validationErrors = await validateAppointmentConstraints(appointment_date, appointment_time);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Appointment validation failed",
        errors: validationErrors 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO appointments (user_id, appointment_date, appointment_time, purpose, duration, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [req.user.id, appointment_date, appointment_time, purpose, duration || 30, notes || null]
    );

    logAction({
      actorId: req.user.id,
      action: "CREATE",
      targetModel: "Appointment",
      targetId: String(result.insertId),
      summary: `Booked appointment for ${appointment_date}`,
      ipAddress: req.ip,
    });

    // Get user details for notifications
    const [[userRow]] = await pool.query(
      "SELECT email, first_name, middle_name, last_name, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    // Determine user type display name
    const roleDisplayName = 
      req.user.role === "student" ? "Student" :
      req.user.role === "faculty" ? "Faculty" :
      req.user.role === "non_academic" ? "Non-Academic Staff" :
      req.user.role;

    const userName = `${userRow?.first_name || ""} ${userRow?.middle_name || ""} ${userRow?.last_name || ""}`.trim() || "Unknown User";

    // 1. Create notification for the user (self-notification)
    await createNotification(
      req.user.id,
      req.user.id,
      "appointment_reminder",
      "Appointment Scheduled",
      `Your appointment for ${purpose} on ${appointment_date} at ${appointment_time} has been scheduled successfully.`,
      result.insertId
    );

    // 2. Create notification for ALL ADMINS
    try {
      // Get all admin users
      const [[adminCount]] = await pool.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = 1"
      );

      if (adminCount && adminCount.count > 0) {
        const [adminUsers] = await pool.query(
          "SELECT id, email, first_name, middle_name, last_name FROM users WHERE role = 'admin' AND is_active = 1"
        );

        // Create notification for each admin
        for (const admin of adminUsers) {
          const adminNotificationMessage = `New appointment request from ${roleDisplayName} ${userName}. Purpose: ${purpose} | Date: ${appointment_date} | Time: ${appointment_time}`;
          
          await createNotification(
            admin.id,
            req.user.id,
            "appointment_reminder",
            `New Appointment Request — ${purpose}`,
            adminNotificationMessage,
            result.insertId
          );

          // Send email to admin
          try {
            if (admin.email) {
              const adminName = `${admin.first_name || ""} ${admin.middle_name || ""} ${admin.last_name || ""}`.trim() || "Admin";
              const emailSubject = `New Appointment Request — ${purpose}`;
              const emailText = `Hello ${adminName},\n\nA new appointment has been submitted in the EARIST Health Access Hub.\n\nAppointment Details:\n- User Type: ${roleDisplayName}\n- Name: ${userName}\n- Email: ${userRow?.email || "N/A"}\n- Purpose: ${purpose}\n- Preferred Date: ${appointment_date}\n- Preferred Time: ${appointment_time}\n\nPlease log in to your Admin Dashboard to review and manage this appointment.\n\nThank you,\nEARIST Health Access Hub System`;
              
              const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #333; margin: 0 0 20px 0;">New Appointment Request</h2>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                      <h3 style="color: #0066cc; margin-top: 0;">Appointment Information</h3>
                      
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #eee;">
                          <td style="padding: 12px 0; font-weight: bold; color: #555; width: 35%;">User Type:</td>
                          <td style="padding: 12px 0; color: #333;">${roleDisplayName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                          <td style="padding: 12px 0; font-weight: bold; color: #555;">Name:</td>
                          <td style="padding: 12px 0; color: #333;">${userName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                          <td style="padding: 12px 0; font-weight: bold; color: #555;">Email:</td>
                          <td style="padding: 12px 0; color: #333;"><a href="mailto:${userRow?.email || ''}">${userRow?.email || 'N/A'}</a></td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                          <td style="padding: 12px 0; font-weight: bold; color: #555;">Purpose:</td>
                          <td style="padding: 12px 0; color: #333;">${purpose}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                          <td style="padding: 12px 0; font-weight: bold; color: #555;">Preferred Date:</td>
                          <td style="padding: 12px 0; color: #333;">${appointment_date}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; font-weight: bold; color: #555;">Preferred Time:</td>
                          <td style="padding: 12px 0; color: #333;">${appointment_time}</td>
                        </tr>
                      </table>
                    </div>

                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0066cc;">
                      <p style="margin: 0; color: #0066cc;"><strong>Action Required:</strong> Please log in to your Admin Dashboard to review and manage this appointment.</p>
                    </div>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <p style="color: #666; font-size: 14px; margin: 0;">
                      Thank you,<br/>
                      <strong>EARIST Health Access Hub System</strong>
                    </p>
                  </div>
                </div>
              `;

              const emailInfo = await sendMail({ 
                to: admin.email, 
                subject: emailSubject, 
                text: emailText,
                html: emailHtml 
              });
              
              if (emailInfo && emailInfo.skipped) {
                console.log(`Admin email to ${admin.email}: EMAIL_USER not configured; skipping.`);
              } else {
                console.log(`Admin notification email sent to ${admin.email}:`, emailInfo?.messageId || "OK");
              }
            }
          } catch (adminMailErr) {
            console.error(`Failed to send admin email to ${admin.email}:`, adminMailErr.message);
          }
        }
      }
    } catch (adminNotifErr) {
      console.error("Error creating admin notifications:", adminNotifErr.message);
      // Don't throw - continue even if admin notification fails
    }

    // 3. Send email to the user (appointment confirmation)
    try {
      if (userRow && userRow.email) {
        const to = userRow.email;
        const name = userName;
        const subject = "EARIST Health Hub — Appointment Scheduled";
        const text = `Hello ${name || "User"},\n\nYour appointment for ${purpose} on ${appointment_date} at ${appointment_time} has been scheduled successfully.\n\nThank you,\nEARIST Health Access Hub`;
        const html = `<p>Hello ${name || "User"},</p><p>Your appointment for <strong>${purpose}</strong> on <strong>${appointment_date}</strong> at <strong>${appointment_time}</strong> has been scheduled successfully.</p><p>Thank you,<br/>EARIST Health Access Hub</p>`;

        const info = await sendMail({ to, subject, text, html });
        if (info && info.skipped) {
          console.log("User email not sent: EMAIL_USER not configured; skipping.");
        } else {
          console.log("User appointment email sent:", info?.messageId || info);
        }
      }
    } catch (mailErr) {
      console.error("Failed to send user appointment email:", mailErr);
    }

    res
      .status(201)
      .json({ id: result.insertId, message: "Appointment scheduled" });
  } catch (err) {
    console.error("POST /appointments error:", err.message);
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
      message: "Failed to create appointment",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

/* -------------------------------------------------------------
   PUT /api/appointments/:id
   ------------------------------------------------------------- */
router.put("/:id", auth, async (req, res) => {
  try {
    const apptId = req.params.id;
    const updates = req.body;

    console.log('received data:', apptId, updates);

    // Only select columns that actually exist in appointments table
    const [[appt]] = await pool.query(
      `SELECT id, user_id, appointment_date, appointment_time, purpose, status, notes, duration, created_at, updated_at 
       FROM appointments WHERE id = ?`,
      [apptId]
    );
    if (!appt) return res.status(404).json({ message: "Not found" });

    const isOwner = appt.user_id === req.user.id;
    const isAdminOrStaff = ["admin", "medical_staff"].includes(req.user.role);
    if (!isOwner && !isAdminOrStaff) {
      return res.status(403).json({ message: "Access denied" });
    }

    const setParts = [];
    const values = [];
    Object.keys(updates).forEach((k) => {
      if (updates[k] !== undefined) {
        setParts.push(`${k} = ?`);
        values.push(updates[k]);
      }
    });
    if (!setParts.length)
      return res.status(400).json({ message: "No updates" });

    values.push(apptId);
    await pool.query(
      `UPDATE appointments SET ${setParts.join(", ")} WHERE id = ?`,
      values
    );

    await logAction({
      actorId: req.user.id,
      action: "UPDATE",
      targetModel: "Appointment",
      targetId: apptId,
      summary: "Updated appointment",
      ipAddress: req.ip,
    });

    // Create notification for appointment update
    await createNotification(
      appt.user_id,
      req.user.id,
      "appointment_reminder",
      "Appointment Updated",
      `Your appointment has been updated successfully.`,
      apptId
    );

    res.json({ message: "Updated" });
  } catch (err) {
    console.error("PUT /appointments/:id error:", err.message);
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
      message: "Failed to update appointment",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

/* -------------------------------------------------------------
   DELETE /api/appointments/:id
   ------------------------------------------------------------- */
router.delete("/:id", auth, async (req, res) => {
  try {
    const apptId = req.params.id;
    const [[appt]] = await pool.query(
      "SELECT user_id FROM appointments WHERE id = ?",
      [apptId]
    );
    if (!appt) return res.status(404).json({ message: "Not found" });

    if (appt.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await pool.query("DELETE FROM appointments WHERE id = ?", [apptId]);

    logAction({
      actorId: req.user.id,
      action: "DELETE",
      targetModel: "Appointment",
      targetId: apptId,
      summary: "Cancelled appointment",
      ipAddress: req.ip,
    });

    // Create notification for appointment cancellation
    await createNotification(
      appt.user_id,
      req.user.id,
      "appointment_reminder",
      "Appointment Cancelled",
      `Your appointment has been cancelled.`,
      apptId
    );

    res.json({ message: "Cancelled" });
  } catch (err) {
    console.error("DELETE /appointments/:id error:", err.message);
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
      message: "Failed to delete appointment",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

export default router;
