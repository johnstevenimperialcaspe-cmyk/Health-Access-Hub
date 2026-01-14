// Diagnostic script to check user password hashes
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

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

async function checkUsers() {
  try {
    console.log("=== User Password Hash Check ===\n");
    
    const [users] = await pool.query(
      `SELECT id, email, role, first_name, last_name, password_hash, is_active 
       FROM users 
       ORDER BY id`
    );

    console.log(`Found ${users.length} users:\n`);

    for (const user of users) {
      console.log(`User ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Name: ${user.first_name} ${user.last_name}`);
      console.log(`  Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`  Password Hash: ${user.password_hash ? 'Exists' : 'MISSING!'}`);
      if (user.password_hash) {
        console.log(`  Hash Length: ${user.password_hash.length} characters`);
        console.log(`  Hash Prefix: ${user.password_hash.substring(0, 20)}...`);
        // Check if it looks like a bcrypt hash (should start with $2a$, $2b$, or $2y$)
        const isBcrypt = /^\$2[ayb]\$/.test(user.password_hash);
        console.log(`  Valid Bcrypt Format: ${isBcrypt ? 'Yes' : 'NO - INVALID FORMAT!'}`);
      }
      console.log("");
    }

    // Test password comparison if email provided
    const testEmail = process.argv[2];
    const testPassword = process.argv[3];
    
    if (testEmail && testPassword) {
      console.log(`\n=== Testing Password for: ${testEmail} ===\n`);
      const normalizedEmail = testEmail.toLowerCase().trim();
      const [rows] = await pool.query(
        `SELECT id, email, password_hash FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1`,
        [normalizedEmail]
      );
      
      if (rows.length) {
        const user = rows[0];
        if (user.password_hash) {
          const match = await bcrypt.compare(testPassword, user.password_hash);
          console.log(`Password match: ${match ? '✓ YES' : '✗ NO'}`);
        } else {
          console.log("✗ No password hash found for this user");
        }
      } else {
        console.log(`✗ User not found: ${testEmail}`);
      }
    } else {
      console.log("\nTo test a password, run:");
      console.log(`  node check-user-password.js <email> <password>`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkUsers();

