-- Delete all medical_staff users from the database
DELETE FROM users WHERE role = 'medical_staff';

-- Verify deletion
SELECT COUNT(*) as remaining_medical_staff FROM users WHERE role = 'medical_staff';
