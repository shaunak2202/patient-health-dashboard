#!/usr/bin/env bash
# Start all three services for local development.
# Prerequisites: Python 3.11+, Node 20+, MongoDB running on :27017

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Training ML models..."
cd "$ROOT/ml-service"
pip install -q -r requirements.txt
python train_model.py

echo "==> Starting ML service (port 8000)..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
ML_PID=$!

echo "==> Installing server dependencies..."
cd "$ROOT/server"
npm install --silent

echo "==> Starting Express server (port 5000)..."
node index.js &
SERVER_PID=$!

echo "==> Installing client dependencies..."
cd "$ROOT/client"
npm install --silent

echo "==> Starting React dev server (port 3000)..."
npm run dev &
CLIENT_PID=$!

echo ""
echo "All services started:"
echo "  React  → http://localhost:3000"
echo "  API    → http://localhost:5000"
echo "  ML     → http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."

trap "kill $ML_PID $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
