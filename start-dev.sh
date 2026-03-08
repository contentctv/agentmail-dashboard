#!/bin/bash
# Development launcher for AgentMail Dashboard
# Starts backend (FastAPI) and frontend (Vite) simultaneously

set -e

echo "=================================================="
echo "AgentMail Dashboard - Development Environment"
echo "=================================================="
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/app" ]; then
    echo "❌ Backend not found. Please run from repository root."
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Check if Python venv exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Set environment variables
export AGENTMAIL_WEBHOOK_SECRET=${AGENTMAIL_WEBHOOK_SECRET:-test-secret-key}
export DATABASE_URL=${DATABASE_URL:-sqlite:///./database/emails.db}

echo "✅ Environment configured"
echo "   Webhook Secret: $AGENTMAIL_WEBHOOK_SECRET"
echo "   Database: $DATABASE_URL"
echo ""

# Create database directory if it doesn't exist
mkdir -p database

echo "🚀 Starting services..."
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start backend in background
echo "[Backend] Starting FastAPI server..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend in background
echo "[Frontend] Starting Vite dev server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for processes
wait
