import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import os from "os";
import { pool } from "./db/mysql.js";

import path from "path";
import { fileURLToPath } from "url";

// Import all routes
import authRoutes from "./routes/auth.js";
import appointmentsRoutes from "./routes/appointments.js";
import examinationsRoutes from "./routes/examinations.js";
import logbookRoutes from "./routes/logbook.js";
import logbookV2Routes from "./routes/logbookV2.js";
import evaluationsRoutes from "./routes/evaluations.js";
import usersRoutes from "./routes/users.js";
import healthRecordsRoutes from "./routes/healthRecords.js";
import notificationsRoutes from "./routes/notifications.js";
import exportsRoutes from "./routes/exports.js";
import nonAcademicRoutes from "./routes/non_academic.js";
import adminRoutes from "./routes/admin.js";
import auditLogsRoutes from "./routes/auditLogs.js";
import testRoutes from "./routes/test.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy - needed for Codespaces and rate limiting
app.set('trust proxy', 1);

/* -------------------- Middleware -------------------- */
// IMPORTANT: Body parser MUST come before routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS - Dynamic origin handling for development and production
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      // Allow all localhost origins
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow GitHub Codespaces origins
      if (origin.includes('app.github.dev') || origin.includes('github.dev')) {
        return callback(null, true);
      }
      
      // Allow any origin in development (fallback)
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use(helmet());
// Rate limiting: 1000 requests per 15 minutes per IP (more reasonable for web app)
// Skip rate limiting for successful requests to avoid blocking legitimate users
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased from 100 to 1000
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests from rate limit counting
    skipSuccessfulRequests: true,
    // Skip failed requests too (429s won't count against limit)
    skipFailedRequests: false,
  })
);

// Request logging middleware - BEFORE routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`   Original URL: ${req.originalUrl}`);
  console.log(`   Base URL: ${req.baseUrl}`);
  // Only log body for non-GET requests and if body exists
  if (req.method !== 'GET' && Object.keys(req.body || {}).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

/* -------------------- API Routes -------------------- */
console.log("\n=== Registering API Routes ===");

// Register all routes
console.log("Registering routes...");

if (authRoutes) {
  app.use("/api/auth", authRoutes);
  console.log("✓ Auth routes registered at /api/auth");
}

if (appointmentsRoutes) {
  app.use("/api/appointments", appointmentsRoutes);
  console.log("✓ Appointments routes registered at /api/appointments");
}

if (examinationsRoutes) {
  app.use("/api/examinations", examinationsRoutes);
  console.log("✓ Examinations routes registered at /api/examinations");
}

if (logbookRoutes) {
  app.use("/api/logbook", logbookRoutes);
  console.log("✓ Logbook routes registered at /api/logbook");
}

if (logbookV2Routes) {
  app.use("/api/logbook-v2", logbookV2Routes);
  console.log("✓ Logbook V2 routes registered at /api/logbook-v2");
}

if (evaluationsRoutes) {
  app.use("/api/evaluations", evaluationsRoutes);
  console.log("✓ Evaluations routes registered at /api/evaluations");
}

if (usersRoutes) {
  app.use("/api/users", usersRoutes);
  console.log("✓ Users routes registered at /api/users");
}

if (healthRecordsRoutes) {
  app.use("/api/health-records", healthRecordsRoutes);
  console.log("✓ Health records routes registered at /api/health-records");
}

if (notificationsRoutes) {
  app.use("/api/notifications", notificationsRoutes);
  console.log("✓ Notifications routes registered at /api/notifications");
}

if (exportsRoutes) {
  app.use("/api/exports", exportsRoutes);
  console.log("✓ Exports routes registered at /api/exports");
}

if (nonAcademicRoutes) {
  app.use("/api/non-academic", nonAcademicRoutes);
  console.log("✓ Non-academic routes registered at /api/non-academic");
}

if (adminRoutes) {
  app.use("/api/admin", adminRoutes);
  console.log("✓ Admin routes registered at /api/admin");
}

if (auditLogsRoutes) {
  app.use("/api/audit-logs", auditLogsRoutes);
  console.log("✓ Audit logs routes registered at /api/audit-logs");
}

if (testRoutes) {
  app.use("/api/test", testRoutes);
  console.log("✓ Test routes registered at /api/test");
}

console.log("=== All Routes Registered ===\n");

// Log all available routes
console.log("📋 Available Routes:");
console.log("  GET  /api/health");
console.log("  GET  /api/test/ping");
console.log("  GET  /api/test/all");
console.log("  GET  /api/users/profile");
console.log("  GET  /api/users");
console.log("  GET  /api/appointments");
console.log("  GET  /api/notifications");
console.log("  GET  /api/examinations");
console.log("  GET  /api/health-records");
console.log("\n");

/* -------------------- Health Check -------------------- */
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    server: "backend",
    port: process.env.PORT || 5000,
    routes: {
      auth: "/api/auth",
      appointments: "/api/appointments",
      healthRecords: "/api/health-records",
      notifications: "/api/notifications",
      examinations: "/api/examinations",
      users: "/api/users",
      admin: "/api/admin",
      auditLogs: "/api/audit-logs"
    }
  });
});

// Test endpoint to verify server is running
app.get("/", (req, res) => {
  res.json({ 
    message: "EARIST Health Access Hub Backend API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      appointments: "/api/appointments",
      healthRecords: "/api/health-records",
      notifications: "/api/notifications",
      examinations: "/api/examinations"
    }
  });
});

/* -------------------- DB Check -------------------- */
pool
  .getConnection()
  .then((conn) => {
    console.log("✓ MySQL connected successfully");
    console.log(`  Database: ${process.env.MYSQL_DATABASE || "thesis1"}`);
    console.log(`  Host: ${process.env.MYSQL_HOST || "127.0.0.1"}`);
    conn.release();
  })
  .catch((err) => {
    console.error("✗ MySQL connection failed!");
    console.error("  Error:", err.message);
    console.error("  Code:", err.code);
    console.error("  Please check:");
    console.error("    1. MySQL server is running");
    console.error("    2. Database credentials in .env file are correct");
    console.error("    3. Database 'thesis1' exists");
  });

/* -------------------- 404 Handler -------------------- */
app.use((req, res) => {
  console.error(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  console.error(`   Original URL: ${req.originalUrl}`);
  console.error(`   Base URL: ${req.baseUrl}`);
  console.error(`   Query params:`, req.query);
  
  // Check if the path is missing /api prefix
  if (!req.path.startsWith('/api')) {
    console.error(`   ⚠️  WARNING: Request path missing /api prefix!`);
    console.error(`   Expected: /api${req.path}`);
    console.error(`   Received: ${req.path}`);
  }
  
  res.status(404).json({ 
    message: "Route not found",
    path: req.path,
    originalUrl: req.originalUrl,
    method: req.method,
    hint: !req.path.startsWith('/api') ? "Request path should start with /api" : undefined,
    availableRoutes: [
      "GET /api/health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/appointments",
      "POST /api/appointments",
      "PUT /api/appointments/:id",
      "DELETE /api/appointments/:id",
      "GET /api/health-records",
      "POST /api/health-records",
      "PUT /api/health-records/:id",
      "DELETE /api/health-records/:id",
      "GET /api/health-records/stats/overview",
      "GET /api/notifications",
      "GET /api/examinations",
      "GET /api/users",
      "GET /api/users/profile",
      "GET /api/admin/stats/overview",
      "GET /api/audit-logs"
    ]
  });
});

/* -------------------- Error Handler -------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 5000;

// Get local IP address for display
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const localIP = getLocalIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`✓ Server running on all network interfaces`);
  console.log(`✓ Local:   http://localhost:${PORT}`);
  console.log(`✓ Network: http://${localIP}:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✓ Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`✓ Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`${"=".repeat(60)}\n`);
});

// Handle server errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});