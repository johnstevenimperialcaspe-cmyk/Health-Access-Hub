-- Backup your database first. Example:
-- mysqldump -u root -p thesis1 > thesis1-backup.sql

-- 1) Add 'professor' to role enum (modify to include all allowed roles)
ALTER TABLE `users`
  MODIFY COLUMN `role` ENUM('student','faculty','professor','admin','medical_staff','non_academic') NOT NULL DEFAULT 'student';

-- 2) Drop the unused columns
ALTER TABLE `users`
  DROP COLUMN IF EXISTS `specialization`,
  DROP COLUMN IF EXISTS `years_experience`;

-- Verify
SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('role','specialization','years_experience');

-- Note: Running these statements will modify the schema in-place. Make sure the application is stopped
-- or restarted after applying the changes.
