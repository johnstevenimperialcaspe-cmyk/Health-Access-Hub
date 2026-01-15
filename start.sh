#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "============================================================"
echo "  EARIST HEALTH ACCESS HUB - STARTING SERVERS"
echo "============================================================"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start Backend
echo -e "${BLUE}[1/2] Starting Backend Server...${NC}"
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="Backend Server" -- bash -c "cd '$SCRIPT_DIR/backend' && npm start; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -hold -title "Backend Server" -e "cd '$SCRIPT_DIR/backend' && npm start" &
else
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && npm start\"" &
fi

# Wait for backend to initialize
echo -e "${YELLOW}[INFO] Waiting for backend to initialize...${NC}"
sleep 5

# Start Frontend
echo ""
echo -e "${BLUE}[2/2] Starting Frontend Server...${NC}"
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="Frontend Server" -- bash -c "cd '$SCRIPT_DIR/frontend' && npm start; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -hold -title "Frontend Server" -e "cd '$SCRIPT_DIR/frontend' && npm start" &
else
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/frontend' && npm start\"" &
fi

echo ""
echo "============================================================"
echo "  SERVERS ARE STARTING..."
echo "============================================================"
echo ""
echo -e "  Backend:  ${GREEN}http://localhost:5000${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "  For mobile access, check the Network IP displayed"
echo "  in the Backend Server window."
echo ""
echo "  Mobile Access: http://YOUR_IP:3000"
echo "============================================================"
echo ""
