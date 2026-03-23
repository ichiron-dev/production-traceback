# Production Traceback Dashboard

ระบบ Dashboard สำหรับติดตามและตรวจสอบข้อมูลการผลิต DENSO
สร้างด้วย **SvelteKit 5**, **Svelte 5 (Runes)** และ **Tailwind CSS v4**
เชื่อมต่อกับ **Rust gRPC backend** ผ่าน PostgreSQL

---

## Features

- **Dashboard Overview** — สรุปสถิติรายวัน กรองตามวันที่ แยกตาม production line
- **5 กระบวนการผลิต**
  - Laser Marking — ตรวจสอบรหัส code2d
  - Case Setting — ข้อมูลการประกอบ case
  - AEOI — ผลการตรวจสอบ (G/NG + อัตรา Pass%)
  - Damper Less — ข้อมูล damper
  - Pin Position — ผลการตรวจสอบ (G/NG + อัตรา Pass%)
- **Order Detail** — ติดตาม traceback ของแต่ละ code2d ทุก step
- **DataTable Component** — ตาราง sort / pagination / export Excel
- **gRPC Integration** — ดึงข้อมูลจาก Rust backend ผ่าน gRPC
- **TypeScript** — มี type ครบทุกไฟล์

---

## Tech Stack

| Tool | Version |
|------|---------|
| SvelteKit | ^2.55 |
| Svelte | ^5.53 |
| Tailwind CSS | ^4.2 |
| TypeScript | ^5.9 |
| Vite | ^8.0 |
| Bun | (recommended) |
| gRPC (`@grpc/grpc-js`) | ^1.x |

---

## Prerequisites

- [Bun](https://bun.sh/) หรือ Node.js 18+
- **Rust gRPC backend** ต้องรันอยู่ก่อน (ดู `../gRPC/denso/`)
- PostgreSQL database ที่มีข้อมูลการผลิต

---

## Getting Started (Development)

### 1. Clone และติดตั้ง dependencies

```bash
git clone https://github.com/ichiron-dev/production-traceback.git
cd production-traceback/production-traceback

bun install
```

### 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env
```

แก้ไข `.env` ให้ตรงกับ environment ของคุณ:

```env
# ที่อยู่ของ gRPC server (Rust backend)
GRPC_HOST=localhost:50051

# Path ไปยัง proto directory
GRPC_PROTO_DIR=../gRPC/denso/proto

# Base URL สำหรับรูปภาพพนักงาน
PUBLIC_EMP_IMAGE_BASE=http://<IMAGE_SERVER_IP>:<PORT>/emp_image_new
```

### 3. รัน gRPC Backend

```bash
cd ../gRPC/denso
cargo run
```

### 4. รัน Frontend

```bash
cd production-traceback
bun dev
```

เปิด [http://localhost:5173](http://localhost:5173)

---

## Deploy to Production (Server)

> **รันที่ server:** `it@server:~/program/service$`
> **Target path:** `/home/it/program/service/production-traceback/`

### ขั้นตอนที่ 1 — Build & Pack (บน dev machine)

```bash
cd production-traceback   # root ของ project

make          # clean → bun install → bun run build → pack → สร้าง deploy/
```

`make` จะสร้าง `deploy/` folder ที่พร้อม deploy:

```
deploy/
├── build/              # SvelteKit compiled output
├── node_modules/       # runtime gRPC packages เท่านั้น
├── package.json
├── .env                # (ถ้ามี)
└── setup_production_traceback.sh
```

> ดู target อื่น ๆ ด้วย `make help`

### ขั้นตอนที่ 2 — Upload ขึ้น Server

```bash
rsync -av --delete deploy/ it@<server-ip>:~/program/service/production-traceback/
```

### ขั้นตอนที่ 3 — Setup Systemd Service (บน server)

```bash
# SSH เข้า server
ssh it@<server-ip>

# รัน setup script
cd ~/program/service/production-traceback
sudo bash setup_production_traceback.sh
```

Script จะ:
1. ตรวจสอบ bun และไฟล์ที่จำเป็น
2. หยุด/ลบ service เดิม (ถ้ามี)
3. สร้าง systemd service ใหม่
4. `enable` + `start` service
5. แสดงผล live logs

### คำสั่ง Management บน Server

```bash
systemctl status production-traceback      # ดูสถานะ
systemctl restart production-traceback     # restart
systemctl stop production-traceback        # หยุด
journalctl -f -u production-traceback      # ดู logs แบบ live
```

---

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── DataTable.svelte       # ตาราง sort/pagination/export
│   │   ├── SessionGuard.svelte
│   │   ├── Sidebar.svelte
│   │   └── Topbar.svelte
│   ├── config/
│   │   └── nav.ts                 # เมนู navigation
│   ├── server/
│   │   └── grpc.ts                # gRPC client (server-only)
│   ├── types/
│   │   ├── grpc.ts                # types สำหรับ gRPC response
│   │   ├── pages.ts               # types สำหรับแต่ละ page (PageData)
│   │   └── table.ts               # types สำหรับ DataTable
│   └── utils/
│       └── excel.ts               # Excel export utility
└── routes/
    ├── +layout.svelte
    ├── login/
    └── dashboard/
        ├── +page.svelte           # Dashboard overview (date filter + stats)
        ├── +page.server.ts        # โหลดข้อมูลจาก gRPC DashboardService
        ├── data/
        │   ├── aeoi/              # ตาราง AEOI รายการ
        │   ├── case-setting/      # ตาราง Case Setting รายการ
        │   ├── damper-less/       # ตาราง Damper Less รายการ
        │   ├── laser-marking/     # ตาราง Laser Marking รายการ
        │   └── pin-position/      # ตาราง Pin Position รายการ
        └── orders/
            └── [id]/              # Order detail — traceback ทุก step
```

---

## Environment Variables

| Variable | ค่า default | หน้าที่ |
|----------|------------|---------|
| `GRPC_HOST` | `localhost:50051` | ที่อยู่ gRPC server |
| `GRPC_PROTO_DIR` | `../gRPC/denso/proto` | path ของ proto files |
| `PUBLIC_EMP_IMAGE_BASE` | — | Base URL รูปพนักงาน |

> `PUBLIC_` prefix → browser อ่านได้
> ไม่มี `PUBLIC_` → server-side เท่านั้น

---

## Related

- **gRPC Backend** → `../gRPC/denso/` (Rust + Tonic + sqlx)
- **Proto definitions** → `../gRPC/denso/proto/denso/`

---

## License

MIT
