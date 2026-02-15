#!/bin/bash

echo "========================================"
echo "Starting Clarity Coach Platform"
echo "========================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down backends..."
    kill $PYTHON_PID $NODE_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Python backend
echo "[1/2] Starting Python Backend (Video Analysis) on port 8000..."
cd backend-python
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../logs/python-backend.log 2>&1 &
PYTHON_PID=$!
cd ..

sleep 3

# Start Node.js backend
echo "[2/2] Starting Node.js Backend (Audio Analysis) on port 3000..."
cd backend-node
node server.js > ../logs/node-backend.log 2>&1 &
NODE_PID=$!
cd ..

echo ""
echo "========================================"
echo "✅ Both backends are running!"
echo "========================================"
echo ""
echo "Python Backend: http://localhost:8000 (PID: $PYTHON_PID)"
echo "Node.js Backend: http://localhost:3000 (PID: $NODE_PID)"
echo ""
echo "🌐 Open your browser to: http://localhost:8000"
echo ""
echo "📋 Logs:"
echo "  - Python: logs/python-backend.log"
echo "  - Node.js: logs/node-backend.log"
echo ""
echo "Press Ctrl+C to stop both backends..."
echo ""

# Wait for both processes
wait $PYTHON_PID $NODE_PID
