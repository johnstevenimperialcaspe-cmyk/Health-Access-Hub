-- Migration: Add Service Evaluations and Enhanced Logbook
-- Date: 2026-01-07
-- Description: Adds evaluation system for patients and enhanced logbook with patient acknowledgment

-- ==========================================
-- TABLE 1: Service Evaluations
-- ==========================================
CREATE TABLE `service_evaluations` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_id` INT(10) UNSIGNED NOT NULL,
  `patient_type` ENUM('student', 'faculty', 'non_academic') NOT NULL,
  `appointment_id` INT(10) UNSIGNED DEFAULT NULL,
  `health_record_id` INT(10) UNSIGNED DEFAULT NULL,
  `visit_date` DATE NOT NULL,
  
  -- Rating Categories (1-5 scale)
  `rating_staff_courtesy` TINYINT(1) NOT NULL COMMENT '1-5: Staff Courtesy & Professionalism',
  `rating_waiting_time` TINYINT(1) NOT NULL COMMENT '1-5: Waiting Time',
  `rating_facility_cleanliness` TINYINT(1) NOT NULL COMMENT '1-5: Facility Cleanliness',
  `rating_service_quality` TINYINT(1) NOT NULL COMMENT '1-5: Overall Service Quality',
  `rating_overall` DECIMAL(3,2) NOT NULL COMMENT 'Auto-calculated average',
  
  -- Feedback
  `comments` TEXT DEFAULT NULL,
  `suggestions` TEXT DEFAULT NULL,
  `would_recommend` BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `ip_address` VARCHAR(45) DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_patient_type` (`patient_type`),
  KEY `idx_visit_date` (`visit_date`),
  KEY `idx_appointment_id` (`appointment_id`),
  KEY `idx_health_record_id` (`health_record_id`),
  KEY `idx_submitted_at` (`submitted_at`),
  
  CONSTRAINT `fk_evaluation_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_evaluation_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_evaluation_health_record` FOREIGN KEY (`health_record_id`) REFERENCES `health_records` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================
-- TABLE 2: Enhanced Logbook (NO QR Code)
-- ==========================================
CREATE TABLE `logbook_entries` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_id` INT(10) UNSIGNED NOT NULL,
  `patient_type` ENUM('student', 'faculty', 'non_academic', 'admin') NOT NULL,
  
  -- Visit Information
  `visit_date` DATE NOT NULL,
  `check_in_time` TIME NOT NULL,
  `check_out_time` TIME DEFAULT NULL,
  `purpose` VARCHAR(255) NOT NULL,
  `appointment_id` INT(10) UNSIGNED DEFAULT NULL COMMENT 'Link to appointment if booked',
  
  -- Patient Acknowledgment (Digital Signature or Checkbox)
  `patient_signature` TEXT DEFAULT NULL COMMENT 'Base64 digital signature or name',
  `patient_acknowledged_at` TIMESTAMP NULL DEFAULT NULL,
  
  -- Admin/Staff Details
  `recorded_by` INT(10) UNSIGNED NOT NULL COMMENT 'Admin/staff who recorded',
  `notes` TEXT DEFAULT NULL,
  
  -- Status Tracking
  `status` ENUM('checked_in', 'in_progress', 'completed', 'cancelled') DEFAULT 'checked_in',
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  
  -- Metadata
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  
  PRIMARY KEY (`id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_visit_date` (`visit_date`),
  KEY `idx_check_in_time` (`check_in_time`),
  KEY `idx_status` (`status`),
  KEY `idx_recorded_by` (`recorded_by`),
  KEY `idx_appointment_id` (`appointment_id`),
  
  CONSTRAINT `fk_logbook_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_logbook_recorded_by` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_logbook_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================
-- TABLE 3: Enhanced Audit Logs (Add columns to existing table)
-- ==========================================
ALTER TABLE `audit_logs` 
  ADD COLUMN IF NOT EXISTS `user_role` VARCHAR(50) DEFAULT NULL AFTER `actor_id`,
  ADD COLUMN IF NOT EXISTS `details` TEXT DEFAULT NULL AFTER `metadata`;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS `idx_user_role` ON `audit_logs` (`user_role`);
CREATE INDEX IF NOT EXISTS `idx_target_model` ON `audit_logs` (`target_model`);

-- ==========================================
-- VIEWS for Analytics
-- ==========================================

-- View: Evaluation Summary by Month
CREATE OR REPLACE VIEW `v_evaluation_summary` AS
SELECT 
  DATE_FORMAT(visit_date, '%Y-%m') AS month,
  patient_type,
  COUNT(*) AS total_evaluations,
  AVG(rating_overall) AS avg_rating,
  AVG(rating_staff_courtesy) AS avg_staff_courtesy,
  AVG(rating_waiting_time) AS avg_waiting_time,
  AVG(rating_facility_cleanliness) AS avg_facility_cleanliness,
  AVG(rating_service_quality) AS avg_service_quality,
  SUM(CASE WHEN would_recommend = 1 THEN 1 ELSE 0 END) AS would_recommend_count,
  (SUM(CASE WHEN would_recommend = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100) AS recommend_percentage
FROM service_evaluations
GROUP BY DATE_FORMAT(visit_date, '%Y-%m'), patient_type;

-- View: Logbook Daily Summary
CREATE OR REPLACE VIEW `v_logbook_daily_summary` AS
SELECT 
  visit_date,
  patient_type,
  COUNT(*) AS total_visits,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_visits,
  SUM(CASE WHEN patient_acknowledged_at IS NOT NULL THEN 1 ELSE 0 END) AS acknowledged_visits,
  AVG(TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time)) AS avg_visit_duration_minutes
FROM logbook_entries
GROUP BY visit_date, patient_type;

-- View: Audit Logs Summary
CREATE OR REPLACE VIEW `v_audit_summary` AS
SELECT 
  DATE(created_at) AS log_date,
  user_role,
  action,
  target_model,
  COUNT(*) AS action_count
FROM audit_logs
GROUP BY DATE(created_at), user_role, action, target_model;
