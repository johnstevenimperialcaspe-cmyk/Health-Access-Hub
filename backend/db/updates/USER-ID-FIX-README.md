# User ID Fix Migration

## Overview
This migration fixes the user ID system to ensure all users have correctly formatted IDs based on their role. The system now enforces that:

- **Students** have `student_id` in format: `STU-YYYY-XXX` (e.g., `STU-2025-001`)
- **Faculty** have `employee_id` in format: `PROF-YYYY-XXX` (e.g., `PROF-2025-001`)
- **Non-Academic Staff** have `employee_id` in format: `STAFF-YYYY-XXX` (e.g., `STAFF-2025-001`)
- **Admin** have `employee_id` in format: `ADM-YYYY-XXX` (e.g., `ADM-2025-001`)
- **Medical Staff** have `employee_id` in format: `MED-YYYY-XXX` (e.g., `MED-2025-001`)

Each user should only have ONE ID field populated based on their role:
- Students: `student_id` is set, `employee_id` is NULL
- All others: `employee_id` is set, `student_id` is NULL

## What Was Changed

### 1. Backend Route Protection
**Files Modified:**
- `backend/routes/users.js`

**Changes:**
- User profile update endpoint (`PUT /api/users/profile`) now prevents manual editing of `student_id` and `employee_id`
- Admin user update endpoint (`PUT /api/users/:id`) also prevents manual ID changes
- When admin changes a user's role, the system automatically generates the correct ID format
- IDs are now auto-generated based on role and cannot be manually edited

### 2. Database Migration Scripts
**Files Created:**
- `backend/db/updates/2025-12-04-fix-user-ids.sql` - SQL migration script
- `backend/db/updates/fix-user-ids.js` - JavaScript migration script

## How to Run the Migration

### Option 1: Using JavaScript Script (Recommended)

1. Open a terminal in the backend directory:
```powershell
cd backend
```

2. Run the migration script:
```powershell
node db/updates/fix-user-ids.js
```

3. The script will:
   - Show the current state of user IDs
   - Fix all incorrect IDs
   - Show the results after fixing
   - Report any issues found

### Option 2: Using SQL Script

1. Open phpMyAdmin or MySQL Workbench
2. Select your database (`thesis1`)
3. Open the SQL file: `backend/db/updates/2025-12-04-fix-user-ids.sql`
4. Execute the script
5. Check the results in the output

## What the Migration Does

### For Each Role:

1. **Students (role = 'student')**
   - Sets `student_id` = `STU-YYYY-XXX` (if missing or incorrect)
   - Sets `employee_id` = NULL (clears if present)

2. **Faculty (role = 'faculty')**
   - Sets `employee_id` = `PROF-YYYY-XXX` (if missing or incorrect)
   - Sets `student_id` = NULL (clears if present)

3. **Non-Academic Staff (role = 'non_academic')**
   - Sets `employee_id` = `STAFF-YYYY-XXX` (if missing or incorrect)
   - Sets `student_id` = NULL (clears if present)

4. **Admin (role = 'admin')**
   - Sets `employee_id` = `ADM-YYYY-XXX` (if missing or incorrect)
   - Sets `student_id` = NULL (clears if present)

5. **Medical Staff (role = 'medical_staff')**
   - Sets `employee_id` = `MED-YYYY-XXX` (if missing or incorrect)
   - Sets `student_id` = NULL (clears if present)

## ID Format Explanation

Format: `PREFIX-YEAR-SEQUENCE`

- **PREFIX**: Role-based identifier (STU, PROF, STAFF, ADM, MED)
- **YEAR**: Year when the account was created (from `created_at`)
- **SEQUENCE**: 3-digit sequential number (001, 002, 003, etc.)

Examples:
- `STU-2025-001` - First student registered in 2025
- `PROF-2025-042` - 42nd faculty member registered in 2025
- `STAFF-2024-015` - 15th non-academic staff registered in 2024

## Verification

After running the migration, you can verify the results:

```sql
-- Check user ID distribution by role
SELECT 
  role,
  COUNT(*) as total_users,
  SUM(CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END) as with_student_id,
  SUM(CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END) as with_employee_id
FROM users 
GROUP BY role;

-- View all users with their IDs
SELECT 
  id,
  role,
  student_id,
  employee_id,
  CONCAT(first_name, ' ', last_name) as name,
  created_at
FROM users
ORDER BY role, id;
```

## Important Notes

1. **Automatic ID Generation**: When new users register, their IDs are automatically generated based on their role. The system finds the highest sequence number for that role and year, then increments it.

2. **ID Changes Prevented**: Users can no longer manually edit their `student_id` or `employee_id` through the profile update endpoint. This prevents data inconsistencies.

3. **Role Changes**: When an admin changes a user's role, the system automatically:
   - Generates a new ID in the correct format for the new role
   - Clears the old ID field
   - Sets the new ID field

4. **Unique Constraints**: The database has unique constraints on both `student_id` and `employee_id` columns to prevent duplicates.

5. **Backwards Compatibility**: Existing health records and appointments are linked by the internal user `id` (primary key), not by `student_id` or `employee_id`, so changing these display IDs won't break relationships.

## Troubleshooting

### If the migration fails:

1. **Database Connection Error**: 
   - Check that MySQL is running
   - Verify database credentials in `.env`

2. **Permission Error**:
   - Ensure the database user has UPDATE privileges

3. **Duplicate Key Error**:
   - This shouldn't happen with the current logic, but if it does, check for manually created users with duplicate IDs

### To rollback (not recommended):
The migration doesn't delete data, it only updates ID fields. If you need to rollback:
- Restore from a database backup taken before the migration
- Or manually update the affected records

## Testing

After migration, test the following:

1. ✅ User login works correctly
2. ✅ Profile displays correct ID based on role
3. ✅ Users cannot manually edit their IDs
4. ✅ Admin can change user roles (ID auto-updates)
5. ✅ New user registration generates correct IDs
6. ✅ Health records show correct user IDs
7. ✅ Excel export shows correct IDs

## Support

If you encounter any issues with the migration, check:
1. Database server logs
2. Application error logs
3. Migration script output

Contact the development team if issues persist.
