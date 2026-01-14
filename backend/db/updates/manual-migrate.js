import mysql from 'mysql2/promise';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'thesis1',
    multipleStatements: true
  });

  try {
    console.log('📖 Reading SQL file...');
    const sqlFile = join(__dirname, '2026-01-07-add-evaluation-and-enhanced-logbook.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🚀 Executing SQL migration...\n');
    
    // Execute the entire SQL file
    await connection.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify tables were created
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Current tables:');
    tables.forEach(row => console.log('  -', Object.values(row)[0]));
    
    // Check audit_logs columns
    const [columns] = await connection.query('DESCRIBE audit_logs');
    console.log('\n📊 audit_logs columns:');
    columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
    
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
