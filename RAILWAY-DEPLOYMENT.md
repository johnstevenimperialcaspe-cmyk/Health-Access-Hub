# 🚂 Railway Deployment Guide - Health Access Hub

Complete step-by-step guide to deploy your Health Access Hub on **Railway.app** (one platform for everything!)

---

## 🎯 Why Railway?

✅ **All-in-One Platform**: Frontend + Backend + MySQL Database  
✅ **$5 Free Credits/Month**: Perfect for thesis/demo projects  
✅ **No Cold Starts**: Unlike Render free tier  
✅ **Auto-Deploy**: Push to GitHub = Auto deploy  
✅ **Super Simple**: Minimal configuration needed  

---

## 📋 What You'll Deploy

```
Railway Project
├── MySQL Database (thesis1)
├── Backend Service (Node.js/Express on port 5000)
└── Frontend Service (React build served via 'serve')
```

---

## 🚀 Step-by-Step Deployment

### **STEP 1: Sign Up on Railway**

1. Go to https://railway.app
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your repositories
4. You'll get **$5 free credits/month** (auto-renews)

### **STEP 2: Create New Project**

1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Choose **"johnstevenimperialcaspe-cmyk/Health-Access-Hub"**
4. Railway will create an empty project

### **STEP 3: Add MySQL Database**

1. In your project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Railway will provision a MySQL instance (takes ~30 seconds)
4. Click on the **MySQL service** card
5. Go to **"Variables"** tab
6. Copy these values (you'll need them later):
   ```
   MYSQL_HOST
   MYSQL_PORT
   MYSQL_USER
   MYSQL_PASSWORD
   MYSQL_DATABASE
   ```

### **STEP 4: Import Database Schema**

**Option A: Using Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Connect to MySQL
railway connect MySQL

# Once connected to MySQL shell:
source /workspaces/Health-Access-Hub/backend/db/thesis1.sql

# Exit MySQL
exit
```

**Option B: Using MySQL Client**

```bash
# Use the connection details from Step 3
mysql -h <MYSQL_HOST> -P <MYSQL_PORT> -u <MYSQL_USER> -p<MYSQL_PASSWORD> <MYSQL_DATABASE> < backend/db/thesis1.sql

# Run migrations
mysql -h <MYSQL_HOST> -P <MYSQL_PORT> -u <MYSQL_USER> -p<MYSQL_DATABASE> << 'SQL'
-- Update notification types
ALTER TABLE notifications 
MODIFY COLUMN type ENUM(
  'appointment_reminder',
  'appointment_update',
  'appointment_confirmation',
  'health_record_update',
  'system_alert',
  'message',
  'evaluation_request',
  'logbook_entry'
) NOT NULL;
SQL
```

### **STEP 5: Deploy Backend Service**

1. In your project, click **"+ New"** → **"GitHub Repo"**
2. Select **"johnstevenimperialcaspe-cmyk/Health-Access-Hub"** (same repo)
3. Railway will ask about monorepo - Click **"Configure"**
4. Set **Root Directory**: `/backend`
5. Click **"Deploy"**

**Configure Backend Environment Variables:**

1. Click on the **backend service** card
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these:

```bash
# Node environment
NODE_ENV=production
PORT=5000

# JWT Secret (generate a strong one)
JWT_SECRET=earist_health_hub_production_secret_2026_railway_xyz

# Database connection (reference MySQL service)
MYSQL_HOST=${{MySQL.MYSQL_HOST}}
MYSQL_PORT=${{MySQL.MYSQL_PORT}}
MYSQL_USER=${{MySQL.MYSQL_USER}}
MYSQL_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
MYSQL_DATABASE=${{MySQL.MYSQL_DATABASE}}
```

**Note:** The `${{MySQL.VARIABLE}}` syntax automatically references your MySQL service variables!

4. Click **"Settings"** tab
5. Under **"Deploy"**, set:
   - **Start Command**: `node server.js`
   - **Build Command**: Leave empty (or `npm install`)
6. Click **"Deploy"** to restart

7. Once deployed, go to **"Settings"** → **"Networking"**
8. Click **"Generate Domain"** to get a public URL
9. **Copy this URL** - you'll need it for frontend!
   - Example: `https://health-hub-backend-production.up.railway.app`

### **STEP 6: Set User Passwords**

**Important:** Railway MySQL uses different credentials. Update passwords:

```bash
# Create a temporary script
cat > /tmp/update_railway_passwords.js << 'SCRIPT'
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const pool = mysql.createPool({
  host: 'YOUR_RAILWAY_MYSQL_HOST',
  port: 'YOUR_RAILWAY_MYSQL_PORT', 
  user: 'YOUR_RAILWAY_MYSQL_USER',
  password: 'YOUR_RAILWAY_MYSQL_PASSWORD',
  database: 'railway' // or your database name
});

async function updatePasswords() {
  const hash = await bcrypt.hash('123456', 10);
  const [result] = await pool.query('UPDATE users SET password_hash = ?', [hash]);
  console.log(`✅ Updated ${result.affectedRows} user passwords to: 123456`);
  await pool.end();
}

updatePasswords().catch(console.error);
SCRIPT

# Update the credentials in the file
nano /tmp/update_railway_passwords.js

# Run it (from backend directory)
cd /workspaces/Health-Access-Hub/backend
node /tmp/update_railway_passwords.js
```

### **STEP 7: Deploy Frontend Service**

1. In your Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select **"johnstevenimperialcaspe-cmyk/Health-Access-Hub"** (same repo again)
3. Click **"Configure"**
4. Set **Root Directory**: `/frontend`
5. Click **"Deploy"**

**Configure Frontend Environment Variables:**

1. Click on the **frontend service** card
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add:

```bash
# Backend API URL (use the URL from Step 5)
REACT_APP_API_URL=https://health-hub-backend-production.up.railway.app
```

4. Click **"Settings"** tab
5. Under **"Deploy"**, set:
   - **Build Command**: `npm run build`
   - **Start Command**: `npx serve -s build -p $PORT`
6. Click **"Deploy"** to restart

7. Once deployed, go to **"Settings"** → **"Networking"**
8. Click **"Generate Domain"** to get your frontend URL
   - Example: `https://health-hub-frontend-production.up.railway.app`

### **STEP 8: Verify Deployment**

**Test Backend:**
```bash
# Health check
curl https://your-backend-url.up.railway.app/api/health

# Should return: {"status":"OK","timestamp":"..."}
```

**Test Frontend:**
1. Visit your frontend URL in browser
2. Try logging in with:
   - Email: `marin.ff.bsinfotech@gmail.com`
   - Password: `123456`
3. Check browser console for errors
4. Verify all features work

---

## 🔧 Configuration Files Created

These files are now in your repository:

1. **`railway.json`** - Railway configuration
2. **`backend/Procfile`** - Backend start command
3. **`frontend/Procfile`** - Frontend start command
4. **`frontend/.env.production`** - Production environment variables
5. **Updated `frontend/src/utils/axios.js`** - Production API URL support

---

## 🔄 Auto-Deploy Setup

**Railway automatically redeploys when you push to GitHub!**

```bash
# Make changes to your code
git add .
git commit -m "feat: Add new feature"
git push

# Railway detects the push and automatically:
# 1. Pulls latest code
# 2. Rebuilds services
# 3. Deploys updates
# 🎉 Your changes are live in ~2-3 minutes!
```

**Control Auto-Deploy:**
- Go to service → **"Settings"** → **"Source"**
- Toggle **"Automatic Deployments"** on/off
- Set **"Watch Paths"** to only deploy when specific folders change:
  - Backend: `/backend/**`
  - Frontend: `/frontend/**`

---

## 💰 Cost & Resource Usage

### Free Tier ($5 credits/month)

| Service | Resource Usage | Estimated Cost |
|---------|----------------|----------------|
| MySQL Database | ~1GB storage | ~$1/month |
| Backend Service | ~0.5GB RAM | ~$2/month |
| Frontend Service | ~0.5GB RAM | ~$2/month |
| **TOTAL** | | **~$5/month** |

**Your free credits cover this perfectly!** ✅

### Usage Tips to Stay Free:
- Delete unused deployments
- Use single replica (already configured)
- Monitor usage in Railway dashboard
- Railway shows credit usage in real-time

---

## 📊 Monitoring Your Services

### Railway Dashboard

1. **Overview**: See all services at a glance
2. **Metrics**: CPU, memory, network usage
3. **Logs**: Click any service → "Logs" tab
4. **Deployments**: View deployment history

### View Logs

```bash
# Using Railway CLI
railway logs backend
railway logs frontend
railway logs MySQL

# Or in dashboard: Click service → "Logs" tab
```

### Set Up Alerts

1. Go to **Project Settings** → **"Notifications"**
2. Connect your Discord/Slack/Email
3. Get notified of:
   - Deployment failures
   - Service crashes
   - Resource limits

---

## 🚨 Troubleshooting

### Issue 1: Backend Won't Start

**Symptoms:**
- Backend service shows "Crashed" status
- Logs show "Error: Cannot find module"

**Solutions:**
```bash
# Check package.json is in backend folder
# Verify start command is: node server.js
# Check environment variables are set
# Look at logs for specific error
```

### Issue 2: Database Connection Failed

**Symptoms:**
- Backend logs: "ECONNREFUSED" or "Access denied"

**Solutions:**
1. Verify MySQL service is running
2. Check environment variables reference MySQL correctly:
   ```
   MYSQL_HOST=${{MySQL.MYSQL_HOST}}
   ```
3. Ensure database schema is imported
4. Check MySQL logs for errors

### Issue 3: Frontend Can't Connect to Backend

**Symptoms:**
- Browser console: "Network Error"
- API calls failing

**Solutions:**
1. Verify `REACT_APP_API_URL` is set correctly
2. Check backend is running (visit health endpoint)
3. Verify CORS is configured (already done in server.js)
4. Check browser network tab for actual error

### Issue 4: Environment Variables Not Working

**Symptoms:**
- Backend can't connect to database
- Frontend using wrong API URL

**Solutions:**
1. Environment variables must be set BEFORE deployment
2. After adding variables, click "Deploy" to restart
3. Check variable names match exactly (case-sensitive)
4. Verify Railway variable references: `${{ServiceName.VARIABLE}}`

### Issue 5: Build Failures

**Symptoms:**
- Deployment stuck at "Building"
- Build logs show errors

**Solutions:**
```bash
# Frontend build errors
# - Check package.json has correct dependencies
# - Verify build command: npm run build
# - Check for TypeScript/ESLint errors

# Backend build errors
# - Verify type: "module" in package.json
# - Check all imports use .js extensions
# - Verify node version compatibility
```

---

## 🔐 Security Best Practices

### Generate Strong JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use this as JWT_SECRET in Railway
```

### Environment Variables Checklist

- [ ] Never commit `.env` files to Git
- [ ] Use strong, unique passwords
- [ ] Rotate JWT_SECRET periodically
- [ ] Use Railway's secret variables for sensitive data
- [ ] Don't log sensitive information

### Database Security

- [ ] Regular backups (Railway Pro has auto-backups)
- [ ] Use strong MySQL password (auto-generated)
- [ ] Don't expose MySQL port publicly
- [ ] Use Railway's internal networking

---

## 📱 Custom Domain Setup (Optional)

### Add Custom Domain to Frontend

1. Click frontend service → **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Enter your domain: `health-hub.yourdomain.com`
4. Railway provides DNS instructions
5. Add CNAME record to your domain DNS:
   ```
   CNAME health-hub -> your-frontend.up.railway.app
   ```
6. SSL certificate auto-provisioned ✅

### Add Custom Domain to Backend

1. Click backend service → **"Settings"** → **"Domains"**
2. Add: `api.yourdomain.com`
3. Update frontend `REACT_APP_API_URL`:
   ```
   REACT_APP_API_URL=https://api.yourdomain.com
   ```

---

## 🔄 Database Backup & Restore

### Manual Backup

```bash
# Connect via Railway CLI
railway connect MySQL

# Or use mysqldump
mysqldump -h <HOST> -P <PORT> -u <USER> -p<PASSWORD> railway > backup-$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
mysql -h <HOST> -P <PORT> -u <USER> -p<PASSWORD> railway < backup-20260115.sql
```

### Automated Backups

**Railway Pro** includes automatic daily backups.

**Free Tier Alternative:**
```bash
# Create a GitHub Action to backup database weekly
# Store backups in repository or external storage
```

---

## 📚 Useful Railway CLI Commands

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs backend
railway logs frontend

# Run commands in service context
railway run node script.js

# Connect to MySQL
railway connect MySQL

# Open service in browser
railway open

# Check status
railway status

# Environment variables
railway variables
```

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [x] Railway account created
- [x] GitHub repository connected
- [x] Configuration files added (railway.json, Procfiles)
- [x] Production environment variables configured
- [x] Frontend axios.js updated for production

### During Deployment
- [ ] MySQL database created on Railway
- [ ] Database schema imported (thesis1.sql)
- [ ] Migrations run (notification types, etc.)
- [ ] User passwords set to bcrypt hash of '123456'
- [ ] Backend service deployed
- [ ] Backend environment variables set
- [ ] Backend domain generated
- [ ] Frontend service deployed
- [ ] Frontend REACT_APP_API_URL set to backend URL
- [ ] Frontend domain generated

### Post-Deployment
- [ ] Backend health endpoint working
- [ ] Frontend loads in browser
- [ ] Login works with test credentials
- [ ] All database tables accessible
- [ ] Notifications working
- [ ] Appointments can be created
- [ ] Auto-deploy configured
- [ ] Monitoring set up
- [ ] Documentation updated with live URLs

---

## 🆘 Need Help?

1. **Check Logs First**: Railway Dashboard → Service → Logs
2. **Railway Discord**: https://discord.gg/railway
3. **Railway Docs**: https://docs.railway.app
4. **Railway Status**: https://status.railway.app

---

## 📝 Quick Reference

### Your URLs
```
Frontend:  https://[your-frontend-service].up.railway.app
Backend:   https://[your-backend-service].up.railway.app
MySQL:     Internal Railway network only
```

### Login Credentials
```
Admin Email:    marin.ff.bsinfotech@gmail.com
Password:       123456
```

### Important Files
```
/railway.json                      - Railway configuration
/backend/Procfile                  - Backend start command
/backend/server.js                 - Main backend entry point
/frontend/Procfile                 - Frontend start command
/frontend/.env.production          - Production env vars
/frontend/src/utils/axios.js       - API configuration
```

---

**Ready to deploy!** 🚀

**Estimated Time:** 20-30 minutes  
**Total Cost:** FREE ($5 monthly credits)  
**Difficulty:** ⭐⭐☆☆☆ Easy

**Next Step:** Go to https://railway.app and click "New Project"!
