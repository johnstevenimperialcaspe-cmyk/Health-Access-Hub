// Quick diagnostic script to check backend configuration
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("=== Backend Configuration Check ===\n");

// Check environment variables
console.log("1. Environment Variables:");
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? "✓ Set" : "✗ NOT SET (REQUIRED!)"}`);
console.log(`   MYSQL_HOST: ${process.env.MYSQL_HOST || "127.0.0.1 (default)"}`);
console.log(`   MYSQL_PORT: ${process.env.MYSQL_PORT || "3306 (default)"}`);
console.log(`   MYSQL_USER: ${process.env.MYSQL_USER || "root (default)"}`);
console.log(`   MYSQL_PASSWORD: ${process.env.MYSQL_PASSWORD ? "✓ Set" : "✗ NOT SET"}`);
console.log(`   MYSQL_DATABASE: ${process.env.MYSQL_DATABASE || "thesis1 (default)"}`);
console.log(`   PORT: ${process.env.PORT || "5000 (default)"}\n`);

// Test database connection
console.log("2. Database Connection Test:");
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "thesis1",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then(async (conn) => {
    console.log("   ✓ Database connection successful!");
    
    // Test query
    try {
      const [rows] = await conn.query("SELECT COUNT(*) as count FROM users");
      console.log(`   ✓ Users table accessible (${rows[0].count} users found)`);
    } catch (err) {
      console.log(`   ✗ Error querying users table: ${err.message}`);
    }
    
    conn.release();
    process.exit(0);
  })
  .catch((err) => {
    console.log("   ✗ Database connection FAILED!");
    console.log(`   Error: ${err.message}`);
    console.log(`   Code: ${err.code}`);
    console.log("\n   Troubleshooting:");
    console.log("   1. Make sure MySQL/MariaDB server is running");
    console.log("   2. Check your .env file in the backend folder");
    console.log("   3. Verify database credentials are correct");
    console.log("   4. Ensure database 'thesis1' exists");
    process.exit(1);
  });

