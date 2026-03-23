#!/bin/bash

# --- 1. ยกระดับสิทธิ์ถ้าไม่ได้รันด้วย sudo ---
if [[ $EUID -ne 0 ]]; then
   echo "🔐 This script requires sudo privileges. Asking for password..."
   exec sudo "$0" "$@"
fi

# --- 2. กำหนดตัวแปร ---
SERVICE_NAME="production-traceback"
BASE_DIR="/home/it/program/service/production-traceback"
BUILD_DIR="$BASE_DIR/build"
ENV_FILE="$BASE_DIR/.env"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

# หา path ของ bun
BUN_PATH=$(which bun 2>/dev/null || echo "/home/it/.bun/bin/bun")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting Deployment: $SERVICE_NAME"
echo "   Target : $BASE_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- 3. ตรวจสอบ bun ---
if [ ! -f "$BUN_PATH" ]; then
    echo "❌ Error: bun not found at $BUN_PATH"
    echo "👉 Install bun: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi
echo "✅ bun found at $BUN_PATH"

# --- 4. หยุดและล้าง Service เดิม ---
if [ -f "$SERVICE_FILE" ]; then
    echo "🛑 Stopping and cleaning up old service..."
    systemctl stop "$SERVICE_NAME" 2>/dev/null
    systemctl disable "$SERVICE_NAME" 2>/dev/null
    rm -f "$SERVICE_FILE"
    systemctl daemon-reload
    echo "✅ Cleanup finished."
fi

# --- 5. ตรวจสอบไฟล์ที่จำเป็น ---
# deploy/ ที่ได้จาก `make` จะมี: build/, node_modules/ (grpc), package.json, .env
if [ ! -f "$BUILD_DIR/index.js" ]; then
    echo "❌ Error: build/index.js not found at $BUILD_DIR"
    echo ""
    echo "👉 Build + pack ด้วย Makefile (บน dev machine):"
    echo "     cd /path/to/production-traceback"
    echo "     make"
    echo "     # สร้าง deploy/ folder อัตโนมัติ"
    echo ""
    echo "👉 แล้ว rsync deploy/ ขึ้น server:"
    echo "     rsync -av --delete deploy/ it@<server-ip>:$BASE_DIR/"
    echo ""
    echo "👉 แล้วรัน setup script บน server:"
    echo "     cd $BASE_DIR"
    echo "     sudo bash setup_production_traceback.sh"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found at $ENV_FILE"
    echo "👉 ไฟล์ .env ควรถูก copy มาพร้อมกับ deploy/ แล้ว"
    echo "   ถ้ายังไม่มี ให้สร้างไฟล์ .env ที่ $ENV_FILE ด้วยตนเอง"
    exit 1
fi

if [ ! -d "$BASE_DIR/node_modules" ]; then
    echo "⚠️  Warning: node_modules/ not found — gRPC packages may be missing"
    echo "   ตรวจสอบว่า rsync รวม node_modules/ มาด้วยหรือไม่"
fi

echo "✅ All required files found."

# --- 6. สร้างไฟล์ Systemd Service ---
echo "📝 Creating new service file..."
cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Production Traceback Web (SvelteKit + Bun)
After=network.target

[Service]
WorkingDirectory=$BASE_DIR
ExecStart=$BUN_PATH ./build/index.js
EnvironmentFile=$ENV_FILE
Restart=always
RestartSec=5
User=it

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Service file created at $SERVICE_FILE"

# --- 7. เปิดใช้งานและเริ่มรัน ---
echo "🔄 Reloading systemd and starting service..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl start "$SERVICE_NAME"

# --- 8. ตรวจสอบสถานะ ---
sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✨ SUCCESS: $SERVICE_NAME is now up and running!"
    echo "   Check status : systemctl status $SERVICE_NAME"
    echo "   Follow logs  : journalctl -f -u $SERVICE_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ FAILED: Service is not running. Check logs below."
    systemctl status "$SERVICE_NAME"
    exit 1
fi

echo ""
echo "📋 Showing logs (Press Ctrl+C to stop):"
journalctl -f -u "$SERVICE_NAME"
