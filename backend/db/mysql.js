import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// Enhanced database connection pool configuration
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "thesis1",
  waitForConnections: true,
  connectionLimit: 20, // Increased from 10 to 20 for better concurrency
  queueLimit: 0, // No limit on queued requests
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000, // Increased to 60 seconds
  acquireTimeout: 60000, // Increased to 60 seconds
  // Connection pool options for stability
  multipleStatements: false,
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false,
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Reconnection settings
  reconnect: true,
});

// Test connection on startup
pool
  .getConnection()
  .then((connection) => {
    console.log("✓ Database connection pool initialized");
    console.log(`  Host: ${process.env.MYSQL_HOST || "127.0.0.1"}`);
    console.log(`  Database: ${process.env.MYSQL_DATABASE || "thesis1"}`);
    connection.release();
  })
  .catch((err) => {
    console.error("✗ Failed to initialize database connection pool");
    console.error("  Error:", err.message);
    console.error("  Please ensure:");
    console.error("    1. MySQL/MariaDB server is running");
    console.error("    2. Database credentials are correct in .env file");
    console.error("    3. Database 'thesis1' exists");
  });

// Handle pool errors
pool.on('connection', (connection) => {
  console.log(`[DB] New connection established as id ${connection.threadId}`);
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
    console.error('[DB] Connection lost or refused. Attempting to reconnect...');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[DB] Closing database connection pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[DB] Closing database connection pool...');
  await pool.end();
  process.exit(0);
});

export { pool };
