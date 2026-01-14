// Simple test routes to verify everything is working
import express from "express";
import { pool } from "../db/mysql.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Simple test endpoint - no auth required
router.get("/ping", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Test route is working!",
    timestamp: new Date().toISOString()
  });
});

// Database connection test
router.get("/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as test, NOW() as current_time");
    res.json({ 
      status: "OK", 
      message: "Database connection successful!",
      data: rows[0]
    });
  } catch (err) {
    res.status(500).json({ 
      status: "ERROR", 
      message: "Database connection failed",
      error: err.message,
      code: err.code
    });
  }
});

// Test auth middleware
router.get("/auth-test", auth, (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Authentication is working!",
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });
});

// Test query to users table
router.get("/users-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM users");
    res.json({ 
      status: "OK", 
      message: "Users table query successful!",
      userCount: rows[0].count
    });
  } catch (err) {
    res.status(500).json({ 
      status: "ERROR", 
      message: "Users table query failed",
      error: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage
    });
  }
});

// Test query to appointments table
router.get("/appointments-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM appointments");
    res.json({ 
      status: "OK", 
      message: "Appointments table query successful!",
      appointmentCount: rows[0].count
    });
  } catch (err) {
    res.status(500).json({ 
      status: "ERROR", 
      message: "Appointments table query failed",
      error: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage
    });
  }
});

// Test query to health_records table
router.get("/health-records-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM health_records");
    res.json({ 
      status: "OK", 
      message: "Health records table query successful!",
      recordCount: rows[0].count
    });
  } catch (err) {
    res.status(500).json({ 
      status: "ERROR", 
      message: "Health records table query failed",
      error: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage
    });
  }
});

// Test query to notifications table
router.get("/notifications-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM notifications");
    res.json({ 
      status: "OK", 
      message: "Notifications table query successful!",
      notificationCount: rows[0].count
    });
  } catch (err) {
    res.status(500).json({ 
      status: "ERROR", 
      message: "Notifications table query failed",
      error: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage
    });
  }
});

// Comprehensive system test
router.get("/all", async (req, res) => {
  const results = {
    server: "OK",
    database: "FAILED",
    tables: {},
    timestamp: new Date().toISOString()
  };

  try {
    // Test database connection
    await pool.query("SELECT 1");
    results.database = "OK";

    // Test all tables
    const tables = ["users", "appointments", "health_records", "notifications"];
    
    for (const table of tables) {
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        results.tables[table] = {
          status: "OK",
          count: rows[0].count
        };
      } catch (err) {
        results.tables[table] = {
          status: "ERROR",
          error: err.message,
          code: err.code
        };
      }
    }
  } catch (err) {
    results.database = "ERROR";
    results.databaseError = err.message;
    results.databaseCode = err.code;
  }

  res.json(results);
});

export default router;

