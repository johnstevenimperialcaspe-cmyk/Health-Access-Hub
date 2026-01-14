// Script to fix user IDs in the database
// Run this script to ensure all users have correct IDs based on their role

import { pool } from '../mysql.js';

async function fixUserIds() {
  try {
    console.log('Starting user ID fix migration...\n');

    // Step 1: Show current state
    console.log('=== BEFORE FIX ===');
    const [beforeStats] = await pool.query(`
      SELECT 
        role,
        COUNT(*) as total_users,
        SUM(CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END) as with_student_id,
        SUM(CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END) as with_employee_id
      FROM users 
      GROUP BY role
      ORDER BY role
    `);
    console.table(beforeStats);

    // Step 2: Fix students
    console.log('\nFixing student IDs...');
    const [studentsResult] = await pool.query(`
      UPDATE users 
      SET 
        student_id = CONCAT('STU-', YEAR(created_at), '-', LPAD(id, 3, '0')),
        employee_id = NULL
      WHERE role = 'student' 
        AND (
          student_id IS NULL 
          OR student_id NOT LIKE 'STU-%'
          OR employee_id IS NOT NULL
        )
    `);
    console.log(`Updated ${studentsResult.affectedRows} student records`);

    // Step 3: Fix faculty
    console.log('\nFixing faculty IDs...');
    const [facultyResult] = await pool.query(`
      UPDATE users 
      SET 
        employee_id = CONCAT('PROF-', YEAR(created_at), '-', LPAD(id, 3, '0')),
        student_id = NULL
      WHERE role = 'faculty' 
        AND (
          employee_id IS NULL 
          OR employee_id NOT LIKE 'PROF-%'
          OR student_id IS NOT NULL
        )
    `);
    console.log(`Updated ${facultyResult.affectedRows} faculty records`);

    // Step 4: Fix non-academic staff
    console.log('\nFixing non-academic staff IDs...');
    const [nonAcademicResult] = await pool.query(`
      UPDATE users 
      SET 
        employee_id = CONCAT('STAFF-', YEAR(created_at), '-', LPAD(id, 3, '0')),
        student_id = NULL
      WHERE role = 'non_academic' 
        AND (
          employee_id IS NULL 
          OR employee_id NOT LIKE 'STAFF-%'
          OR student_id IS NOT NULL
        )
    `);
    console.log(`Updated ${nonAcademicResult.affectedRows} non-academic records`);

    // Step 5: Fix admin
    console.log('\nFixing admin IDs...');
    const [adminResult] = await pool.query(`
      UPDATE users 
      SET 
        employee_id = CONCAT('ADM-', YEAR(created_at), '-', LPAD(id, 3, '0')),
        student_id = NULL
      WHERE role = 'admin' 
        AND (
          employee_id IS NULL 
          OR employee_id NOT LIKE 'ADM-%'
          OR student_id IS NOT NULL
        )
    `);
    console.log(`Updated ${adminResult.affectedRows} admin records`);

    // Step 6: Fix medical staff
    console.log('\nFixing medical staff IDs...');
    const [medicalResult] = await pool.query(`
      UPDATE users 
      SET 
        employee_id = CONCAT('MED-', YEAR(created_at), '-', LPAD(id, 3, '0')),
        student_id = NULL
      WHERE role = 'medical_staff' 
        AND (
          employee_id IS NULL 
          OR employee_id NOT LIKE 'MED-%'
          OR student_id IS NOT NULL
        )
    `);
    console.log(`Updated ${medicalResult.affectedRows} medical staff records`);

    // Step 7: Show results
    console.log('\n=== AFTER FIX ===');
    const [afterStats] = await pool.query(`
      SELECT 
        role,
        COUNT(*) as total_users,
        SUM(CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END) as with_student_id,
        SUM(CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END) as with_employee_id
      FROM users 
      GROUP BY role
      ORDER BY role
    `);
    console.table(afterStats);

    // Step 8: Check for issues
    console.log('\n=== CHECKING FOR ISSUES ===');
    const [issues] = await pool.query(`
      SELECT 
        id,
        role,
        student_id,
        employee_id,
        'Both IDs present' as issue
      FROM users 
      WHERE student_id IS NOT NULL AND employee_id IS NOT NULL

      UNION ALL

      SELECT 
        id,
        role,
        student_id,
        employee_id,
        'Student with employee_id' as issue
      FROM users 
      WHERE role = 'student' AND employee_id IS NOT NULL

      UNION ALL

      SELECT 
        id,
        role,
        student_id,
        employee_id,
        'Faculty/Staff with student_id' as issue
      FROM users 
      WHERE role IN ('faculty', 'non_academic', 'admin', 'medical_staff') AND student_id IS NOT NULL
    `);

    if (issues.length > 0) {
      console.log('⚠️  Found issues:');
      console.table(issues);
    } else {
      console.log('✅ No issues found! All user IDs are correct.');
    }

    console.log('\n✅ User ID fix migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing user IDs:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
fixUserIds()
  .then(() => {
    console.log('\nMigration completed. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
