-- Fix User IDs Migration
-- This migration ensures all users have correctly formatted IDs based on their role
-- Date: December 4, 2025

-- Step 1: First, let's see what we're working with (informational - comment out if not needed)
SELECT 
  id, 
  role, 
  student_id, 
  employee_id, 
  CONCAT(first_name, ' ', last_name) AS name
FROM users 
ORDER BY role, id;

-- Step 2: Update students with missing or incorrect student_id format
-- Students should have student_id starting with 'STU-YYYY-XXX' and NULL employee_id
UPDATE users 
SET 
  student_id = CONCAT('STU-', YEAR(created_at), '-', LPAD(id, 3, '0')),
  employee_id = NULL
WHERE role = 'student' 
  AND (
    student_id IS NULL 
    OR student_id NOT LIKE 'STU-%'
    OR employee_id IS NOT NULL
  );

-- Step 3: Update faculty with missing or incorrect employee_id format
-- Faculty should have employee_id starting with 'PROF-YYYY-XXX' and NULL student_id
UPDATE users 
SET 
  employee_id = CONCAT('PROF-', YEAR(created_at), '-', LPAD(id, 3, '0')),
  student_id = NULL
WHERE role = 'faculty' 
  AND (
    employee_id IS NULL 
    OR employee_id NOT LIKE 'PROF-%'
    OR student_id IS NOT NULL
  );

-- Step 4: Update non_academic staff with missing or incorrect employee_id format
-- Non-academic should have employee_id starting with 'STAFF-YYYY-XXX' and NULL student_id
UPDATE users 
SET 
  employee_id = CONCAT('STAFF-', YEAR(created_at), '-', LPAD(id, 3, '0')),
  student_id = NULL
WHERE role = 'non_academic' 
  AND (
    employee_id IS NULL 
    OR employee_id NOT LIKE 'STAFF-%'
    OR student_id IS NOT NULL
  );

-- Step 5: Update admin with missing or incorrect employee_id format
-- Admins should have employee_id starting with 'ADM-YYYY-XXX' and NULL student_id
UPDATE users 
SET 
  employee_id = CONCAT('ADM-', YEAR(created_at), '-', LPAD(id, 3, '0')),
  student_id = NULL
WHERE role = 'admin' 
  AND (
    employee_id IS NULL 
    OR employee_id NOT LIKE 'ADM-%'
    OR student_id IS NOT NULL
  );

-- Step 6: Update medical_staff with missing or incorrect employee_id format
-- Medical staff should have employee_id starting with 'MED-YYYY-XXX' and NULL student_id
UPDATE users 
SET 
  employee_id = CONCAT('MED-', YEAR(created_at), '-', LPAD(id, 3, '0')),
  student_id = NULL
WHERE role = 'medical_staff' 
  AND (
    employee_id IS NULL 
    OR employee_id NOT LIKE 'MED-%'
    OR student_id IS NOT NULL
  );

-- Step 7: Verify results (informational)
SELECT 
  role,
  COUNT(*) as total_users,
  SUM(CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END) as with_student_id,
  SUM(CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END) as with_employee_id
FROM users 
GROUP BY role
ORDER BY role;

-- Step 8: Show any potential issues
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
WHERE role IN ('faculty', 'non_academic', 'admin', 'medical_staff') AND student_id IS NOT NULL;
