import express from "express";
import { pool } from "../db/mysql.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get non-academic user profile
router.get("/profile", auth, async (req, res) => {
  try {
    if (req.user.role !== "non_academic") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await pool.query(
      `SELECT id, email, first_name, middle_name, last_name, employee_id, department, 
            position, phone_number, address, college
            FROM users WHERE id = ? AND role = 'non_academic'`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching non-academic profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update non-academic user profile
router.put("/profile", auth, async (req, res) => {
  try {
    if (req.user.role !== "non_academic") {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      firstName,
      middleName,
      lastName,
      phoneNumber,
      address,
      department,
      position,
      college,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE users 
            SET first_name = ?, last_name = ?, phone_number = ?, 
            address = ?, department = ?, position = ?, college = ?
            WHERE id = ? AND role = 'non_academic'`,
      [
        firstName,
        middleName,
        lastName,
        phoneNumber,
        address,
        department,
        position,
        college,
        req.user.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating non-academic profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get non-academic appointments
router.get("/appointments", auth, async (req, res) => {
  try {
    if (req.user.role !== "non_academic") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await pool.query(
      `SELECT a.*, u.first_name as staff_first_name, u.middle_name as staff_middle_name, u.last_name as staff_last_name 
            FROM appointments a 
            JOIN users u ON a.medical_staff_id = u.id 
            WHERE a.student_id = ? 
            ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching non-academic appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get non-academic health records
router.get("/health-records", auth, async (req, res) => {
  try {
    if (req.user.role !== "non_academic") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await pool.query(
      `SELECT hr.*, u.first_name as staff_first_name, u.last_name as staff_last_name 
            FROM health_records hr 
            JOIN users u ON hr.medical_staff_id = u.id 
            WHERE hr.student_id = ? 
            ORDER BY hr.date_of_visit DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching non-academic health records:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
