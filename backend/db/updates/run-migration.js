import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Load environment variables (from process env or backend/.env)
dotenv.config({ path: path.resolve(process.cwd(), "backend", ".env") });

async function run() {
  try {
    // ESM-compatible __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationFile = process.env.MIGRATION_FILE || process.argv[2] || "2025-11-17-remove-specialization.sql";
    const sqlPath = path.resolve(__dirname, migrationFile);
    if (!fs.existsSync(sqlPath)) {
      console.error("Migration file not found:", sqlPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, "utf8");

    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "thesis1",
      multipleStatements: true,
    });

    console.log("Connected to DB:", process.env.MYSQL_HOST || "127.0.0.1", "db:", process.env.MYSQL_DATABASE);

    const [results] = await conn.query(sql);
    console.log("Migration executed successfully.");
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(2);
  }
}

run();
