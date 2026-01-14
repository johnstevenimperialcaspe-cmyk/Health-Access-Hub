# 🚀 How to Run EARIST Health Access Hub

This guide will help you run the EARIST Health Access Hub application on both desktop and mobile devices.

## 📋 Prerequisites

Before running the application, make sure you have:

- **Node.js** (v14 or higher) installed
- **MySQL** database running
- **npm** or **yarn** package manager
- Both devices (PC and mobile) connected to the **same WiFi network**

---

## 🗄️ Step 1: Database Setup

1. **Start MySQL server** (XAMPP, WAMP, or standalone MySQL)

2. **Create the database:**
   ```sql
   CREATE DATABASE IF NOT EXISTS earist_health_hub;
   ```

3. **Import the database schema:**
   ```bash
   mysql -u root -p earist_health_hub < backend/db/thesis1.sql
   ```
   
   Or use phpMyAdmin to import `backend/db/thesis1.sql`

4. **Configure database connection:**
   
   Create/update `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=earist_health_hub
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

---

## 🔧 Step 2: Install Dependencies

### Backend Dependencies
```bash
cd backend
npm install
```

### Frontend Dependencies
```bash
cd frontend
npm install
```

---

## ▶️ Step 3: Start the Application

You need to run **TWO terminals** (one for backend, one for frontend):

### Terminal 1 - Start Backend Server

```bash
cd backend
npm start
```

**Expected output:**
```
============================================================
✓ Server running on all network interfaces
✓ Local:   http://localhost:5000
✓ Network: http://10.76.171.105:5000
✓ Health check: http://localhost:5000/api/health
✓ Register: POST http://localhost:5000/api/auth/register
✓ Login: POST http://localhost:5000/api/auth/login
============================================================
```

⚠️ **Important:** Note the **Network IP address** shown in the output (e.g., `10.76.171.105`)

---

### Terminal 2 - Start Frontend Server

```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://10.76.171.105:3000
```

---

## 💻 Step 4: Access the Application

### On Desktop/Laptop (Same Computer)
Open your browser and go to:
```
http://localhost:3000
```

### On Mobile Device (Same WiFi Network)
1. Make sure your mobile is connected to the **same WiFi** as your PC
2. Open your mobile browser and go to:
   ```
   http://YOUR_PC_IP:3000
   ```
   
   Example:
   ```
   http://10.76.171.105:3000
   ```

3. Replace `YOUR_PC_IP` with the **Network IP** shown when you started the servers

---

## 🔍 Finding Your PC's IP Address

### Windows:
1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
   ```
   IPv4 Address: 10.76.171.105
   ```

### macOS/Linux:
1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for your network interface (usually `en0` or `eth0`)

---

## 🎯 Quick Start Script

For convenience, you can create batch files to start both servers:

### Windows - `start.bat`
```batch
@echo off
echo Starting EARIST Health Access Hub...
echo.

start cmd /k "cd /d backend && npm start"
timeout /t 3 /nobreak > nul

start cmd /k "cd /d frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
```

### Linux/macOS - `start.sh`
```bash
#!/bin/bash
echo "Starting EARIST Health Access Hub..."
echo ""

# Start backend
gnome-terminal -- bash -c "cd backend && npm start; exec bash" &

# Wait 3 seconds
sleep 3

# Start frontend
gnome-terminal -- bash -c "cd frontend && npm start; exec bash" &

echo ""
echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
```

---

## 🔐 Default Login Credentials

### Admin Account
- **Email:** `admin@earist.edu.ph`
- **Password:** Check database or create via registration

### Student/Faculty/Non-Academic
Register through the application or contact administrator

---

## 🐛 Troubleshooting

### Port Already in Use
If you see "Port 3000/5000 already in use":

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Cannot Connect from Mobile
1. Check if both devices are on the **same WiFi network**
2. Verify **firewall** is not blocking ports 3000 and 5000
3. Make sure backend is running with `0.0.0.0` as host
4. Try accessing backend directly: `http://YOUR_PC_IP:5000/api/health`

### Database Connection Error
1. Ensure MySQL is running
2. Check database credentials in `backend/.env`
3. Verify database exists and schema is imported
4. Check MySQL is accepting connections on localhost

### Login Invalid Credentials
1. Make sure backend is running properly
2. Check browser console for errors
3. Verify database has user records
4. Try registering a new account first

---

## 📱 Mobile-Specific Notes

### For iOS (Safari):
- Safari may block mixed content (HTTP in production)
- Use HTTP for development on local network
- Ensure "Prevent Cross-Site Tracking" is disabled for development

### For Android (Chrome):
- Chrome works well with HTTP on local networks
- Clear cache if you see old versions
- Enable "Use Developer Options" if needed

---

## 🛑 Stopping the Application

1. **Stop Frontend:** Press `Ctrl + C` in the frontend terminal
2. **Stop Backend:** Press `Ctrl + C` in the backend terminal
3. **Stop MySQL:** Stop XAMPP/WAMP or MySQL service

---

## 📚 Additional Resources

- **API Documentation:** See `backend/routes/` for available endpoints
- **Database Schema:** `backend/db/thesis1.sql`
- **Environment Setup:** `backend/.env.example` and `frontend/.env`

---

## 🆘 Need Help?

If you encounter issues:
1. Check terminal outputs for error messages
2. Verify all prerequisites are installed
3. Ensure database is properly configured
4. Check network connectivity for mobile access
5. Review logs in browser console (F12)

---

## 🎉 Success!

If everything is working:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ Database connected
- ✅ Accessible from mobile devices on same network

**Enjoy using EARIST Health Access Hub!** 🏥
