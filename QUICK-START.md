# 🚀 Health Access Hub - Quick Start Guide

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn package manager

---

## 🔧 Initial Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

The backend uses environment variables from `.env` file:

```bash
# backend/.env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password123
MYSQL_DATABASE=thesis1

JWT_SECRET=earist_health_hub_jwt_secret_key_2026
PORT=5000

# Email settings (optional)
EMAIL_USER=
EMAIL_PASSWORD=
```

---

## 🗄️ Database Setup

### 1. Start MySQL Service

```bash
# Linux/Ubuntu
sudo service mysql start

# Check MySQL status
sudo service mysql status

# macOS (using Homebrew)
brew services start mysql

# Windows
net start MySQL80
```

### 2. Import Database Schema

```bash
# From the project root
mysql -h 127.0.0.1 -u root -ppassword123 thesis1 < backend/db/thesis1.sql
```

### 3. Run Database Migrations

```bash
# Create evaluation and logbook tables
mysql -h 127.0.0.1 -u root -ppassword123 thesis1 << 'EOF'
-- Create service_evaluations table
CREATE TABLE IF NOT EXISTS service_evaluations (
  id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id INT(10) UNSIGNED NOT NULL,
  patient_type ENUM('student', 'faculty', 'non_academic') NOT NULL,
  appointment_id INT(10) UNSIGNED DEFAULT NULL,
  health_record_id INT(10) UNSIGNED DEFAULT NULL,
  visit_date DATE NOT NULL,
  rating_staff_courtesy TINYINT(1) NOT NULL,
  rating_waiting_time TINYINT(1) NOT NULL,
  rating_facility_cleanliness TINYINT(1) NOT NULL,
  rating_service_quality TINYINT(1) NOT NULL,
  rating_overall DECIMAL(3,2) NOT NULL,
  comments TEXT DEFAULT NULL,
  suggestions TEXT DEFAULT NULL,
  would_recommend BOOLEAN DEFAULT TRUE,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  ip_address VARCHAR(45) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_patient_id (patient_id),
  KEY idx_visit_date (visit_date),
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create logbook_entries table
CREATE TABLE IF NOT EXISTS logbook_entries (
  id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id INT(10) UNSIGNED NOT NULL,
  patient_type ENUM('student', 'faculty', 'non_academic', 'admin') NOT NULL,
  visit_date DATE NOT NULL,
  check_in_time TIME NOT NULL,
  check_out_time TIME DEFAULT NULL,
  purpose VARCHAR(255) NOT NULL,
  appointment_id INT(10) UNSIGNED DEFAULT NULL,
  patient_signature TEXT DEFAULT NULL,
  patient_acknowledged_at TIMESTAMP NULL DEFAULT NULL,
  recorded_by INT(10) UNSIGNED NOT NULL,
  notes TEXT DEFAULT NULL,
  status ENUM('checked_in', 'in_progress', 'completed', 'cancelled') DEFAULT 'checked_in',
  completed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  KEY idx_patient_id (patient_id),
  KEY idx_visit_date (visit_date),
  KEY idx_status (status),
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
EOF
```

### 4. Set User Passwords

All users need password `123456`:

```bash
cd backend
node -e "
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'password123',
    database: 'thesis1'
  });
  
  const hash = await bcrypt.hash('123456', 10);
  await pool.query('UPDATE users SET password_hash = ?', [hash]);
  console.log('✅ All user passwords updated to: 123456');
  await pool.end();
}

updatePasswords().catch(console.error);
"
```

---

## 🚀 Starting the Application

### Option 1: Using the Start Script (Recommended)

```bash
# Make the script executable
chmod +x start.sh

# Run the start script
./start.sh
```

### Option 2: Manual Start

#### Terminal 1 - Backend Server

```bash
cd backend
npm start
```

You should see:
```
✓ Server running on all network interfaces
✓ Local:   http://localhost:5000
✓ MySQL connected successfully
```

#### Terminal 2 - Frontend Server

```bash
cd frontend
npm start
```

You should see:
```
Compiled successfully!

You can now view frontend in the browser.
  Local:            http://localhost:3000
```

### Option 3: Background Processes

```bash
# Start backend in background
cd backend && nohup npm start > /tmp/backend.log 2>&1 &

# Start frontend in background
cd frontend && BROWSER=none nohup npm start > /tmp/frontend.log 2>&1 &

# Check logs
tail -f /tmp/backend.log
tail -f /tmp/frontend.log
```

---

## 🌐 Accessing the Application

### Local Development

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

### GitHub Codespaces

If running in Codespaces, make ports public:

```bash
gh codespace ports visibility 3000:public -c $CODESPACE_NAME
gh codespace ports visibility 5000:public -c $CODESPACE_NAME
```

Then access via:
- **Frontend:** `https://{codespace-name}-3000.app.github.dev`
- **Backend:** `https://{codespace-name}-5000.app.github.dev`

---

## 🔑 Default Login Credentials

All users have the password: **`123456`**

### Test Accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `marin.ff.bsinfotech@gmail.com` | `123456` |
| Student | `navarrosa.at.bsinfotech@gmail.com` | `123456` |
| Faculty | `torno.j.bsinfotech@gmail.com` | `123456` |
| Non-Academic | `tomas.r.bsinfotech@gmail.com` | `123456` |

---

## 🛠️ Troubleshooting

### MySQL Connection Issues

**Error:** `ECONNREFUSED 127.0.0.1:3306`

**Solution:**
```bash
# Check if MySQL is running
ps aux | grep mysqld

# Start MySQL if not running
sudo service mysql start

# Verify connection
mysql -h 127.0.0.1 -u root -ppassword123 -e "SELECT 1"
```

### Login 401 Error

**Error:** Invalid email or password

**Solution:**
```bash
# Reset passwords
cd backend
node -e "
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
async function fix() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'password123',
    database: 'thesis1'
  });
  const hash = await bcrypt.hash('123456', 10);
  await pool.query('UPDATE users SET password_hash = ?', [hash]);
  console.log('Passwords reset!');
  await pool.end();
}
fix();
"
```

### Port Already in Use

**Error:** Port 3000 or 5000 already in use

**Solution:**
```bash
# Kill processes on port 5000
lsof -ti:5000 | xargs kill -9

# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9
```

### Missing Tables

**Error:** Table 'thesis1.service_evaluations' doesn't exist

**Solution:**
```bash
# Re-run migrations (see Database Setup step 3)
```

---

## 📊 Verify Setup

Run these commands to verify everything is working:

```bash
# 1. Check MySQL tables
mysql -h 127.0.0.1 -u root -ppassword123 thesis1 -e "SHOW TABLES;"

# Expected output:
# appointments
# audit_logs
# health_records
# logbook_entries
# notifications
# service_evaluations
# users

# 2. Check backend health
curl http://localhost:5000/api/health

# Expected: {"status":"OK",...}

# 3. Check frontend
curl -s http://localhost:3000 | grep -o "<title>.*</title>"

# Expected: <title>EARIST Health Hub</title>
```

---

## 🔄 Stopping the Application

```bash
# Stop backend
pkill -f "node.*server.js"

# Stop frontend
pkill -f "react-scripts"

# Stop MySQL (if needed)
sudo service mysql stop
```

---

## 📝 Development Notes

### Backend Structure
- `backend/server.js` - Main server file
- `backend/routes/` - API route handlers
- `backend/db/` - Database configuration and migrations
- `backend/middleware/` - Authentication and authorization

### Frontend Structure
- `frontend/src/pages/` - Page components (admin, student, faculty)
- `frontend/src/components/` - Reusable components
- `frontend/src/context/` - React context (auth, etc.)
- `frontend/src/utils/` - Utilities and axios config

### API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/users/profile` - Get current user profile
- `GET /api/appointments` - Get appointments
- `GET /api/audit-logs` - Get audit logs
- `GET /api/evaluations` - Get evaluations

---

## 📚 Additional Resources

- [Backend Routes Documentation](backend/FIX-ROUTES.md)
- [Database Migration Guide](backend/db/updates/MIGRATION-SUMMARY.md)
- [Auto-Startup Guide](AUTO-STARTUP.md)

---

## ⚠️ Important Notes

1. **Self-registration is disabled** - Only admins can create new user accounts
2. **User IDs are auto-generated** based on role and cannot be manually changed
3. **All passwords are bcrypt hashed** for security
4. **JWT tokens expire after 7 days** - users will need to login again

---

## ✅ Quick Start Checklist

- [ ] MySQL service is running
- [ ] Database schema imported
- [ ] Migrations applied
- [ ] User passwords set
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server started (port 5000)
- [ ] Frontend server started (port 3000)
- [ ] Can access http://localhost:3000
- [ ] Can login with test credentials

**Happy coding! 🎉**
