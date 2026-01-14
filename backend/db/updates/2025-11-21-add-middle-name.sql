-- Migration: Add middle_name column to users table
-- Date: 2025-11-21
-- Purpose: Add middle_name field to store user middle names

ALTER TABLE users ADD COLUMN middle_name VARCHAR(50) DEFAULT NULL AFTER first_name;
