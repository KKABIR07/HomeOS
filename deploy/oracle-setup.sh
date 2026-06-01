#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# HouseOS — Oracle Cloud Ubuntu setup script
# Run as: sudo bash oracle-setup.sh
# Tested on: Ubuntu 22.04 LTS (Oracle Cloud Free Tier)
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_URL="https://github.com/KKABIR07/HomeOS.git"
APP_DIR="/home/ubuntu/houseos"
NODE_VERSION="20"

echo "============================================"
echo "  HouseOS Backend — Oracle Cloud Setup"
echo "============================================"

# ── 1. System update ──────────────────────────────────────────────────────────
echo "[1/9] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git nginx ufw

# ── 2. Node.js ────────────────────────────────────────────────────────────────
echo "[2/9] Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs
echo "  Node: $(node -v) | npm: $(npm -v)"

# ── 3. PM2 ────────────────────────────────────────────────────────────────────
echo "[3/9] Installing PM2..."
npm install -g pm2

# ── 4. Clone repo ─────────────────────────────────────────────────────────────
echo "[4/9] Cloning repository..."
if [ -d "$APP_DIR" ]; then
  echo "  Directory exists — pulling latest..."
  cd "$APP_DIR" && git pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
fi

# ── 5. Install server dependencies ────────────────────────────────────────────
echo "[5/9] Installing server dependencies..."
cd "$APP_DIR/server"
npm install --production

# ── 6. Create .env ────────────────────────────────────────────────────────────
echo "[6/9] Creating .env file..."
if [ ! -f "$APP_DIR/server/.env" ]; then
cat > "$APP_DIR/server/.env" << 'ENVEOF'
PORT=5000
NODE_ENV=production
MONGODB_URI=REPLACE_WITH_YOUR_MONGODB_URI
JWT_SECRET=REPLACE_WITH_STRONG_SECRET_KEY
JWT_EXPIRE=7d
CLIENT_URL=https://houseos-zeta.vercel.app
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_USER=
EMAIL_PASS=
ENVEOF
  echo "  .env created at $APP_DIR/server/.env — EDIT IT before starting the app!"
else
  echo "  .env already exists — skipping."
fi

# ── 7. PM2 ecosystem config ───────────────────────────────────────────────────
echo "[7/9] Writing PM2 ecosystem config..."
cat > "$APP_DIR/ecosystem.config.js" << 'PMEOF'
module.exports = {
  apps: [{
    name: 'houseos-api',
    script: './server/index.js',
    cwd: '/home/ubuntu/houseos',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production' },
    error_file: '/home/ubuntu/houseos/logs/err.log',
    out_file: '/home/ubuntu/houseos/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
}
PMEOF
mkdir -p "$APP_DIR/logs"

# ── 8. Nginx config ───────────────────────────────────────────────────────────
echo "[8/9] Configuring Nginx..."
cat > /etc/nginx/sites-available/houseos << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    # CORS pre-flight handled by Express — Nginx just proxies
    location /api/ {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:5000/api/health;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/houseos /etc/nginx/sites-enabled/houseos
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 9. Firewall ───────────────────────────────────────────────────────────────
echo "[9/9] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 5000/tcp
ufw --force enable

echo ""
echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "  NEXT STEPS:"
echo "  1. Edit your .env:   nano $APP_DIR/server/.env"
echo "  2. Start the app:    cd $APP_DIR && pm2 start ecosystem.config.js"
echo "  3. Save PM2 startup: pm2 save && pm2 startup"
echo "  4. Test health:      curl http://localhost/health"
echo ""
echo "  Your API will be at: http://<YOUR-ORACLE-IP>/api"
echo "============================================"
