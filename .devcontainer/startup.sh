#!/bin/bash

echo "🚀 Starting Health Access Hub..."

# Start MySQL
echo "📦 Starting MySQL..."
sudo service mysql start

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 5

# Check if MySQL is running
if sudo service mysql status | grep -q "active (running)"; then
    echo "✅ MySQL is running"
else
    echo "❌ MySQL failed to start"
    exit 1
fi

# Start Backend
echo "🔧 Starting Backend Server..."
cd /workspaces/Health-Access-Hub/backend
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend Server..."
cd /workspaces/Health-Access-Hub/frontend
BROWSER=none npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for servers to be ready
echo "⏳ Waiting for servers to start..."
sleep 5

echo ""
echo "✅ Health Access Hub is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 To check logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "⚠️  Remember to set port 3000 to PUBLIC in the PORTS tab!"
