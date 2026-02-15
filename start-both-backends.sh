#!/bin/bash

# Clarity Coach - Start Both Backends
# This script starts both the Python MediaPipe backend and Node.js backend

echo "🚀 Starting Clarity Coach - Dual Backend Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python backend exists
PYTHON_BACKEND_DIR="/c/Users/samhi/Downloads/clarity-coach-cv/clarity-coach-cv/backend-python"
if [ ! -d "$PYTHON_BACKEND_DIR" ]; then
    echo -e "${RED}❌ Python backend not found at: $PYTHON_BACKEND_DIR${NC}"
    echo "Please verify the path to clarity-coach-cv/backend-python"
    exit 1
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $PYTHON_PID 2>/dev/null
    kill $NODE_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Python backend
echo -e "${BLUE}📹 Starting Python MediaPipe Backend (Port 8000)...${NC}"
cd "$PYTHON_BACKEND_DIR"

# Check if virtual environment exists
if [ -d ".venv" ]; then
    echo "Activating Python virtual environment..."
    source .venv/bin/activate 2>/dev/null || source .venv/Scripts/activate 2>/dev/null
fi

# Start Python backend in background
python run_server.py > ../python-backend.log 2>&1 &
PYTHON_PID=$!

# Wait a bit for Python backend to start
sleep 2

# Check if Python backend started successfully
if kill -0 $PYTHON_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Python backend started (PID: $PYTHON_PID)${NC}"
    echo "   Logs: clarity-coach-cv/python-backend.log"
    echo ""
else
    echo -e "${RED}❌ Failed to start Python backend${NC}"
    echo "Check clarity-coach-cv/python-backend.log for errors"
    exit 1
fi

# Start Node.js backend
echo -e "${BLUE}🎤 Starting Node.js Backend (Port 3000)...${NC}"
cd "/c/Users/samhi/Downloads/clarity-coach-frontend/clarity-coach-frontend"

# Start Node.js backend in background
node server.js > node-backend.log 2>&1 &
NODE_PID=$!

# Wait a bit for Node backend to start
sleep 2

# Check if Node backend started successfully
if kill -0 $NODE_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Node.js backend started (PID: $NODE_PID)${NC}"
    echo "   Logs: clarity-coach-frontend/node-backend.log"
    echo ""
else
    echo -e "${RED}❌ Failed to start Node.js backend${NC}"
    echo "Check clarity-coach-frontend/node-backend.log for errors"
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

# Success!
echo "================================================"
echo -e "${GREEN}🎉 Both backends are running!${NC}"
echo ""
echo "📍 URLs:"
echo "   Frontend:        http://localhost:3000"
echo "   Python Backend:  http://localhost:8000"
echo "   Python API Docs: http://localhost:8000/docs"
echo ""
echo "📊 Architecture:"
echo "   Frontend → Python (video analysis) → Node.js (audio transcription)"
echo ""
echo "📝 Logs:"
echo "   Python: clarity-coach-cv/python-backend.log"
echo "   Node:   clarity-coach-frontend/node-backend.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"

# Keep script running and wait for Ctrl+C
wait
