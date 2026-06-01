#!/bin/bash
# HouseOS — pull latest code and restart (run from Oracle VM)
set -e
APP_DIR="/home/ubuntu/houseos"

echo "Pulling latest from GitHub..."
cd "$APP_DIR" && git pull origin main

echo "Installing any new dependencies..."
cd "$APP_DIR/server" && npm install --production

echo "Restarting PM2..."
cd "$APP_DIR" && pm2 restart houseos-api

echo "Done! Status:"
pm2 status houseos-api
