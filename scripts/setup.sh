#!/bin/bash
# setup.sh - Installs dependencies and prepares environment settings for both backend and frontend

echo "=========================================================="
echo "Initializing Stock Price Prediction System Setup..."
echo "=========================================================="

# 1. Setup Backend environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# 2. Setup Frontend dependencies
echo "Installing React frontend dependencies..."
cd frontend
npm install
cd ..

echo "=========================================================="
echo "Setup Complete! Run scripts/start.sh to run services."
echo "=========================================================="
