# Auto-Startup Guide

## ✅ Setup Complete!

Your Health Access Hub is now configured to **auto-start** when you open the Codespace.

---

## 📋 Quick Commands

### Check if everything is running:
```bash
bash check-status.sh
```

### Restart all servers:
```bash
bash restart-servers.sh
```

### View logs:
```bash
# Backend logs
tail -f /tmp/backend.log

# Frontend logs
tail -f /tmp/frontend.log
```

---

## 🔄 What Happens When You Close/Reopen

### When you **CLOSE** the Codespace:
- Codespace stops after idle timeout (default: 30 min, max: 4 hours)
- All servers stop
- Data in database is preserved

### When you **REOPEN** the Codespace:
1. Codespace container starts (~5-10 seconds)
2. Auto-startup script runs automatically
3. MySQL starts
4. Backend starts (port 5000)
5. Frontend starts (port 3000)
6. Everything is ready in **~15-20 seconds**!

---

## ⚙️ Extend Codespace Timeout

To keep your Codespace running longer:

1. Go to: https://github.com/settings/codespaces
2. Set **"Default idle timeout"** to **4 hours** (maximum)

---

## 🔍 Troubleshooting

### Servers not running after reopening?
```bash
# Check status first
bash check-status.sh

# If something is down, restart
bash restart-servers.sh
```

### Port 3000 not public?
1. Click **PORTS** tab (bottom panel in VS Code)
2. Right-click port **3000**
3. Select **Port Visibility** → **Public**

### Need to stop servers manually?
```bash
# Stop backend
pkill -f "node.*server.js"

# Stop frontend
pkill -f "react-scripts"

# Stop MySQL
sudo service mysql stop
```

---

## 📱 Your Public URL

**Frontend**: https://ideal-lamp-v69g77j74qgr2wvgx-3000.app.github.dev

(Make sure port 3000 is set to PUBLIC)

---

## ✨ That's it!

Everything will now start automatically when you reopen the Codespace. No manual commands needed! 🎉
