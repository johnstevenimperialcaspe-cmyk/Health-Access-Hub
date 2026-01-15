# 🚂 Railway Deployment Instructions

## ⚠️ Important: Monorepo Setup

This is a **monorepo** with separate backend and frontend. You must deploy them as **TWO separate services**.

---

## 🎯 Deployment Steps

### 1. Add MySQL Database

1. In Railway project, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Wait for provisioning (~30 seconds)

### 2. Deploy Backend Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select `Health-Access-Hub` repository
3. **IMPORTANT:** Click **"Settings"** → **"Service Settings"**
4. Set **Root Directory** to: `backend`
5. Set **Start Command** to: `node server.js`
6. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-strong-secret-here
   MYSQL_HOST=${{MySQL.MYSQL_HOST}}
   MYSQL_PORT=${{MySQL.MYSQL_PORT}}
   MYSQL_USER=${{MySQL.MYSQL_USER}}
   MYSQL_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
   MYSQL_DATABASE=${{MySQL.MYSQL_DATABASE}}
   ```
7. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**
8. Copy the backend URL (e.g., `https://backend-production-xxxx.up.railway.app`)

### 3. Deploy Frontend Service

1. Click **"+ New"** → **"GitHub Repo"** (same repo again)
2. Select `Health-Access-Hub` repository
3. **IMPORTANT:** Click **"Settings"** → **"Service Settings"**
4. Set **Root Directory** to: `frontend`
5. Set **Build Command** to: `npm run build`
6. Set **Start Command** to: `npx serve -s build -p $PORT`
7. Add environment variable:
   ```
   REACT_APP_API_URL=<your-backend-url-from-step-2>
   ```
8. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**

### 4. Import Database

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Connect to MySQL and import schema
railway connect MySQL

# In MySQL shell:
source backend/db/thesis1.sql;

# Update notification types
ALTER TABLE notifications MODIFY COLUMN type ENUM(
  'appointment_reminder',
  'appointment_update',
  'appointment_confirmation',
  'health_record_update',
  'system_alert',
  'message',
  'evaluation_request',
  'logbook_entry'
) NOT NULL;

exit;
```

### 5. Update User Passwords

Create and run this script:

```javascript
// update_passwords.js
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const pool = mysql.createPool({
  host: 'YOUR_RAILWAY_MYSQL_HOST',
  port: 'YOUR_RAILWAY_MYSQL_PORT',
  user: 'YOUR_RAILWAY_MYSQL_USER',
  password: 'YOUR_RAILWAY_MYSQL_PASSWORD',
  database: 'railway'
});

const hash = await bcrypt.hash('123456', 10);
await pool.query('UPDATE users SET password_hash = ?', [hash]);
console.log('✅ Passwords updated');
await pool.end();
```

---

## ✅ Deployment Checklist

- [ ] MySQL database created
- [ ] Backend service deployed (root directory: `backend`)
- [ ] Backend environment variables configured
- [ ] Backend domain generated
- [ ] Frontend service deployed (root directory: `frontend`)
- [ ] Frontend REACT_APP_API_URL set to backend URL
- [ ] Frontend domain generated
- [ ] Database schema imported
- [ ] User passwords updated
- [ ] Test login at frontend URL

---

## 🔧 Service Configuration

### Backend Service Settings:
- **Root Directory:** `backend`
- **Start Command:** `node server.js`
- **Watch Paths:** `backend/**`

### Frontend Service Settings:
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Start Command:** `npx serve -s build -p $PORT`
- **Watch Paths:** `frontend/**`

---

## 🚨 Common Issues

### Error: "No start command could be found"
- Make sure you set the **Root Directory** to `backend` or `frontend`
- Check that **Start Command** is explicitly set in service settings

### Build Failed
- Verify the root directory is correct
- Check that package.json exists in that directory
- Review build logs for specific errors

### Database Connection Failed
- Verify environment variables use `${{MySQL.VARIABLE}}` syntax
- Check MySQL service is running
- Ensure schema is imported

---

**Need help?** See full guide in `RAILWAY-DEPLOYMENT.md`
