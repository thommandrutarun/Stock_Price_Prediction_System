#!/bin/bash
# start.sh - Starts Flask API and React Vite dev servers concurrently

echo "=========================================================="
echo "Starting Stock Price Prediction System Services..."
echo "=========================================================="

# Start Flask Backend
echo "Launching Flask API server on port 5000..."
source venv/bin/activate
python backend/run.py &

# Start React Frontend
echo "Launching Vite React dev server on port 5173..."
cd frontend
npm run dev &

# Wait for background processes to finish
wait
