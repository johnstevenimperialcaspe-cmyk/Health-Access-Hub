#!/bin/bash
# Check if servers are running

echo "🔍 Checking server status..."
echo ""

# Check backend
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Backend is running (PID: $(pgrep -f 'node.*server.js'))"
else
    echo "❌ Backend is NOT running"
fi

# Check frontend
if pgrep -f "react-scripts" > /dev/null; then
    echo "✅ Frontend is running (PID: $(pgrep -f 'react-scripts'))"
else
    echo "❌ Frontend is NOT running"
fi

# Check MySQL
if sudo service mysql status | grep -q "active (running)"; then
    echo "✅ MySQL is running"
else
    echo "❌ MySQL is NOT running"
fi

echo ""
echo "📊 Port Status:"
netstat -tlnp 2>/dev/null | grep -E ':(3000|5000)' || echo "No ports listening"
