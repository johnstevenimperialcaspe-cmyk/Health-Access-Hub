#!/bin/bash
# Quick restart script if you need to manually restart

echo "🔄 Restarting Health Access Hub servers..."

# Kill existing processes
pkill -f "node.*server.js"
pkill -f "react-scripts"
sleep 2

# Run startup script
bash /workspaces/Health-Access-Hub/.devcontainer/startup.sh
