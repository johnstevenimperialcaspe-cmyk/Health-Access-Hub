import { pool } from "./db/mysql.js";

async function clearAuditLogs() {
  try {
    console.log("🗑️  Clearing all audit logs from Railway MySQL...\n");

    // Count before deletion
    const [[{ before }]] = await pool.query(`SELECT COUNT(*) as before FROM audit_logs`);
    console.log(`📊 Current audit logs: ${before}`);

    // Delete all audit logs
    const [result] = await pool.query(`DELETE FROM audit_logs`);
    console.log(`✅ Deleted ${result.affectedRows} audit log entries`);

    // Verify empty
    const [[{ after }]] = await pool.query(`SELECT COUNT(*) as after FROM audit_logs`);
    console.log(`📊 Remaining logs: ${after}`);

    // Reset auto-increment to start fresh
    await pool.query(`ALTER TABLE audit_logs AUTO_INCREMENT = 1`);
    console.log("🔄 Reset auto-increment to 1");

    console.log("\n✅ Audit logs cleared successfully!");
    console.log("\n💡 Next: Perform actions to test logging (login, appointments, etc.)");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

clearAuditLogs();
