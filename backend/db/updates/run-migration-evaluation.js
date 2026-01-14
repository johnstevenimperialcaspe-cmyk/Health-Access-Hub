// Run migration for evaluation and logbook system
import { pool } from "../mysql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log("🚀 Starting migration: Add Evaluation and Enhanced Logbook...\n");
    
    // Read SQL file
    const sqlFile = path.join(__dirname, "2026-01-07-add-evaluation-and-enhanced-logbook.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");
    
    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    await connection.beginTransaction();
    
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Skip comments
        if (statement.trim().startsWith("--")) {
          continue;
        }
        
        console.log(`[${i + 1}/${statements.length}] Executing...`);
        
        await connection.query(statement);
        successCount++;
        console.log("✅ Success\n");
        
      } catch (error) {
        // If table/column already exists, skip gracefully
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
            error.code === 'ER_DUP_FIELDNAME' ||
            error.sqlMessage?.includes('already exists')) {
          console.log(`⚠️  Already exists, skipping\n`);
          skipCount++;
        } else {
          console.error(`❌ Error: ${error.message}`);
          throw error;
        }
      }
    }
    
    await connection.commit();
    
    console.log("\n✨ Migration completed successfully!");
    console.log(`   Executed: ${successCount} statements`);
    console.log(`   Skipped: ${skipCount} statements (already exist)`);
    console.log("\n📊 New tables created:");
    console.log("   - service_evaluations");
    console.log("   - logbook_entries");
    console.log("\n📊 Enhanced tables:");
    console.log("   - audit_logs (added user_role and details columns)");
    console.log("\n📊 Views created:");
    console.log("   - v_evaluation_summary");
    console.log("   - v_logbook_daily_summary");
    console.log("   - v_audit_summary");
    
  } catch (error) {
    await connection.rollback();
    console.error("\n❌ Migration failed!");
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run migration
runMigration();
