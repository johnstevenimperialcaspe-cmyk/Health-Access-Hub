# 🚀 Health Access Hub - Latest Run Guide

## Para ma-apply ang lahat ng latest fixes at updates

---

## ⚡ QUICK START (Recommended)

### Option 1: ONE-LINE START (Background)

```bash
cd /workspaces/Health-Access-Hub && \
pkill -f "node.*server.js" ; pkill -f "react-scripts" ; sleep 3 && \
nohup bash -c "cd backend && npm start" > /tmp/backend.log 2>&1 & \
nohup bash -c "cd frontend && BROWSER=none npm start" > /tmp/frontend.log 2>&1 & \
sleep 15 && \
echo "✅ Servers starting..." && \
echo "📊 Backend log: tail -f /tmp/backend.log" && \
echo "🎨 Frontend log: tail -f /tmp/frontend.log"
```

---

## 📋 STEP-BY-STEP GUIDE

### 1️⃣ Stop Running Servers

```bash
# Stop backend
pkill -f "node.*server.js"

# Stop frontend  
pkill -f "react-scripts"

# Or kill by specific port
lsof -ti:5000 | xargs kill -9  # Backend port
lsof -ti:3000 | xargs kill -9  # Frontend port
```

### 2️⃣ Verify MySQL is Running

```bash
# Check MySQL status
ps aux | grep mysqld | grep -v grep

# If not running, start it
sudo service mysql start

# Verify connection
mysql -h 127.0.0.1 -u root -ppassword123 -e "SELECT 1"
```

### 3️⃣ Start Backend Server

**Terminal 1:**
```bash
cd /workspaces/Health-Access-Hub/backend
npm start
```

**Expected Output:**
```
✓ Database connection pool initialized
  Host: 127.0.0.1
  Database: thesis1
✓ MySQL connected successfully
✓ Server running on all network interfaces
✓ Local:   http://localhost:5000
✓ Network: http://10.0.1.75:5000
```

### 4️⃣ Start Frontend Server

**Terminal 2:**
```bash
cd /workspaces/Health-Access-Hub/frontend
BROWSER=none npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://10.0.1.75:3000
```

### 5️⃣ Make Ports Public (GitHub Codespaces)

```bash
gh codespace ports visibility 3000:public -c $CODESPACE_NAME
gh codespace ports visibility 5000:public -c $CODESPACE_NAME
```

---

## 🌐 Access URLs

### Local Development
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### GitHub Codespaces
- **Frontend:** https://ideal-lamp-v69g77j74qgr2wvgx-3000.app.github.dev
- **Backend:** https://ideal-lamp-v69g77j74qgr2wvgx-5000.app.github.dev

---

## 🔑 Login Credentials

**All users password:** `123456`

| Role | Email |
|------|-------|
| **Admin** | marin.ff.bsinfotech@gmail.com |
| Student | navarrosa.at.bsinfotech@gmail.com |
| Faculty | torno.j.bsinfotech@gmail.com |
| Non-Academic | tomas.r.bsinfotech@gmail.com |

---

## ✅ Latest Fixes Applied

### Database Updates:
- ✅ All 7 tables created:
  - `users`
  - `appointments`
  - `health_records`
  - `notifications` (with updated types)
  - `audit_logs`
  - `service_evaluations` (NEW)
  - `logbook_entries` (NEW)

### Notification Types Fixed:
- ✅ `appointment_reminder`
- ✅ `appointment_update` (FIXED)
- ✅ `appointment_confirmation` (ADDED)
- ✅ `health_record_update`
- ✅ `system_alert`
- ✅ `message`
- ✅ `evaluation_request` (ADDED)
- ✅ `logbook_entry` (ADDED)

### Authentication:
- ✅ All user passwords set to: `123456`
- ✅ Proper bcrypt hashing
- ✅ JWT tokens working

---

## 🔍 Verify Everything is Working

```bash
# 1. Check all database tables
mysql -h 127.0.0.1 -u root -ppassword123 thesis1 -e "SHOW TABLES;"

# 2. Check backend health
curl http://localhost:5000/api/health

# 3. Check if frontend is running
curl -s http://localhost:3000 | head -5

# 4. Check server processes
ps aux | grep -E "node.*server|react-scripts" | grep -v grep

# 5. Check logs (if running in background)
tail -f /tmp/backend.log
tail -f /tmp/frontend.log
```

---

## 📊 Check Logs

### Backend Logs
```bash
# If running in foreground - check terminal output
# If running in background:
tail -f /tmp/backend.log

# Filter for errors only
tail -f /tmp/backend.log | grep -i error

# Check specific features
tail -f /tmp/backend.log | grep -i "login\|notification\|database"
```

### Frontend Logs
```bash
# If running in background:
tail -f /tmp/frontend.log

# Check compilation status
tail -f /tmp/frontend.log | grep -i "compiled\|error"
```

---

## 🛠️ Troubleshooting

### Servers Not Starting?

```bash
# Check if ports are already in use
lsof -i :5000
lsof -i :3000

# Kill processes on those ports
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Restart servers
```

### MySQL Connection Failed?

```bash
# Check MySQL is running
ps aux | grep mysqld

# Start MySQL
sudo service mysql start

# Verify database exists
mysql -h 127.0.0.1 -u root -ppassword123 -e "SHOW DATABASES LIKE 'thesis1';"
```

### Frontend Shows 502 Error?

```bash
# Check if frontend is compiled
tail -20 /tmp/frontend.log

# Look for "Compiled successfully!"
# If not found, restart frontend
```

### Login 401 Error?

```bash
# Reset user passwords
cd /workspaces/Health-Access-Hub/backend
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
  console.log('✅ Passwords reset to: 123456');
  await pool.end();
}
fix();
"
```

### Notifications Not Creating?

**Already Fixed!** The notification types have been updated. Just restart the backend.

---

## 🔄 Complete Fresh Restart

If everything is broken, run this complete reset:

```bash
# 1. Stop all servers
pkill -f "node" ; sleep 2

# 2. Verify MySQL is running
sudo service mysql status || sudo service mysql start

# 3. Start backend in background
cd /workspaces/Health-Access-Hub/backend
nohup npm start > /tmp/backend.log 2>&1 &

# 4. Wait for backend to initialize
sleep 10

# 5. Start frontend in background
cd /workspaces/Health-Access-Hub/frontend
BROWSER=none nohup npm start > /tmp/frontend.log 2>&1 &

# 6. Wait for frontend to compile
sleep 20

# 7. Check status
echo "Backend:" && curl -s http://localhost:5000/api/health | head -1
echo "Frontend:" && curl -s http://localhost:3000 | head -1

# 8. Make ports public (Codespaces only)
gh codespace ports visibility 3000:public -c $CODESPACE_NAME
gh codespace ports visibility 5000:public -c $CODESPACE_NAME

echo "✅ Done! Check: https://$CODESPACE_NAME-3000.app.github.dev"
```

---

## 📱 Features Now Working

- ✅ User Authentication & Login
- ✅ Admin Dashboard
- ✅ Appointments Management
- ✅ Health Records
- ✅ Notifications (all types)
- ✅ Audit Logs
- ✅ Service Evaluations
- ✅ Enhanced Logbook
- ✅ User Management

---

## 💡 Pro Tips

1. **Always check logs** when something isn't working:
   ```bash
   tail -f /tmp/backend.log
   ```

2. **Clear browser cache** if frontend doesn't update:
   - Press `Ctrl + Shift + R` (hard reload)

3. **Check database tables** before reporting issues:
   ```bash
   mysql -h 127.0.0.1 -u root -ppassword123 thesis1 -e "SHOW TABLES;"
   ```

4. **Monitor backend requests** in real-time:
   ```bash
   tail -f /tmp/backend.log | grep POST
   ```

---

## 🎯 Quick Commands Reference

```bash
# Stop all
pkill -f "node"

# Start backend only
cd backend && npm start

# Start frontend only  
cd frontend && BROWSER=none npm start

# Check backend
curl http://localhost:5000/api/health

# Check frontend
curl http://localhost:3000

# View backend logs
tail -f /tmp/backend.log

# View frontend logs
tail -f /tmp/frontend.log

# Restart MySQL
sudo service mysql restart

# Check running servers
ps aux | grep -E "node|react" | grep -v grep
```

---

**Last Updated:** January 15, 2026

**Status:** ✅ All systems operational with latest fixes applied

🚀 **Happy coding!**
