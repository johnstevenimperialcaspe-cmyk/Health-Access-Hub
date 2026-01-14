-- Remove professor role from the system
-- 1. Update role enum to remove 'professor'
ALTER TABLE users
  MODIFY COLUMN `role` ENUM('student','faculty','admin','non_academic') NOT NULL DEFAULT 'student';

-- 2. Convert any existing 'professor' users to 'faculty'
UPDATE users SET role = 'faculty' WHERE role = 'professor';

-- Verify conversion
SELECT role, COUNT(*) as count FROM users GROUP BY role;
