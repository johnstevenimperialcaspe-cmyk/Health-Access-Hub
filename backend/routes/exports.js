import express from "express";
import { Parser } from "json2csv";
import { auth, authorize } from "../middleware/authMiddleware.js";
import { pool } from "../db/mysql.js";

const router = express.Router();

router.get(
  "/health-records.csv",
  auth,
  authorize("admin", "medical_staff"),
  async (req, res) => {
    const [rows] = await pool.query(
      `SELECT hr.id, hr.record_type AS recordType, hr.date_of_visit AS dateOfVisit,
            stu.student_id AS studentStudentId, stu.first_name AS studentFirstName, stu.middle_name AS studentMiddleName, stu.last_name AS studentLastName,
            ms.employee_id AS medicalStaffEmployeeId, hr.status, hr.priority
       FROM health_records hr
       JOIN users stu ON stu.id = hr.student_id
       JOIN users ms ON ms.id = hr.medical_staff_id`
    );
    const fields = [
      "id",
      "recordType",
      "dateOfVisit",
      "studentStudentId",
      "studentFirstName",
      "studentMiddleName",
      "studentLastName",
      "medicalStaffEmployeeId",
      "status",
      "priority",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("health-records.csv");
    res.send(csv);
  }
);

router.get(
  "/appointments.csv",
  auth,
  authorize("admin", "medical_staff"),
  async (req, res) => {
    const [rows] = await pool.query(
      `SELECT a.id, a.appointment_date AS appointmentDate, a.appointment_time AS appointmentTime,
            stu.student_id AS studentStudentId, ms.employee_id AS medicalStaffEmployeeId, a.purpose, a.status
       FROM appointments a
       JOIN users stu ON stu.id = a.student_id
       JOIN users ms ON ms.id = a.medical_staff_id`
    );
    const fields = [
      "id",
      "appointmentDate",
      "appointmentTime",
      "studentStudentId",
      "medicalStaffEmployeeId",
      "purpose",
      "status",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("appointments.csv");
    res.send(csv);
  }
);

export default router;
