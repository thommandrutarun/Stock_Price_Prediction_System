#!/bin/bash
# deploy.sh - Bundles React production assets and spins up container orchestrations

echo "=========================================================="
echo "Compiling and Staging Containerized Staging..."
echo "=========================================================="

cd deployment/docker
docker-compose down
docker-compose up --build -d

echo "=========================================================="
echo "Deployment Complete! Service running in background."
echo "=========================================================="
