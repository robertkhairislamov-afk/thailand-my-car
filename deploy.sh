#!/bin/bash

# Thailand My Car - Deployment Script
# This script deploys the application to VPS server

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="thailand-my-car"
DOCKER_IMAGE="thailand-my-car:latest"
CONTAINER_NAME="thailand-my-car"

# Step 1: Pull latest code
echo -e "${YELLOW}📦 Pulling latest code...${NC}"
git pull origin main || echo "No git repository or already up to date"

# Step 2: Stop existing container
echo -e "${YELLOW}🛑 Stopping existing container...${NC}"
docker-compose down || echo "No existing container to stop"

# Step 3: Build Docker image
echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
docker-compose build --no-cache

# Step 4: Start container
echo -e "${YELLOW}🚀 Starting container...${NC}"
docker-compose up -d

# Step 5: Wait for health check
echo -e "${YELLOW}⏳ Waiting for application to be ready...${NC}"
sleep 10

# Step 6: Check if container is running
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}Application is running on http://$(hostname -I | awk '{print $1}')${NC}"
else
    echo -e "${RED}❌ Deployment failed! Container is not running.${NC}"
    docker-compose logs
    exit 1
fi

# Step 7: Clean up old images
echo -e "${YELLOW}🧹 Cleaning up old Docker images...${NC}"
docker image prune -f

echo -e "${GREEN}✨ Deployment complete!${NC}"
