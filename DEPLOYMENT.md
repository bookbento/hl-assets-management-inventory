# คู่มือการติดตั้งและ Deploy ระบบ (HL Assets Management Inventory)
คู่มือขั้นตอนการติดตั้งฐานข้อมูล, จัดเตรียมสภาพแวดล้อมระบบ, การรันแอปพลิเคชันด้วย **PM2** และการกำหนดค่า **Nginx (Reverse Proxy)** ร่วมกับ **Certbot SSL** สำหรับระบบ Backend (NestJS) และ Frontend (Next.js) อย่างเป็นทางการ

---

## 📌 โครงสร้างและ Port การทำงาน ของเซิร์ฟเวอร์
*   **Frontend (Next.js)**: ทำงานที่ Port `3000` (รันภายในเครื่องเซิร์ฟเวอร์)
*   **Backend (NestJS)**: ทำงานที่ Port `3001` (รันภายในเครื่องเซิร์ฟเวอร์)
*   **Database (PostgreSQL)**: พอร์ตภายในหรือภายนอกตามกำหนดค่า (เช่น `5432` หรือ `5433`)
*   **Nginx (Reverse Proxy)**: ทำหน้าที่รับ Request พอร์ตภายนอก `80 (HTTP)` และ `443 (HTTPS)` แล้วส่งต่อ (Proxy Pass) ไปยัง Frontend/Backend ตามพอร์ตภายในอย่างปลอดภัย
*   **พื้นที่จัดเก็บโปรเจกต์**: สามารถวางไว้ที่ใดก็ได้บนเซิร์ฟเวอร์ (เช่น `/var/www/coredesk/` หรือ `/home/ubuntu/HL-assets-management-inventory/` เป็นต้น)

---

## 🗄️ ขั้นตอนที่ 1: การตั้งค่าฐานข้อมูล (PostgreSQL & Prisma)

ก่อนทำการรันแอปพลิเคชันหรือใส่ข้อมูล จำเป็นอย่างยิ่งต้องสร้างโครงสร้างตาราง (Schema) และนำเข้าข้อมูลสำรอง (Backup Data) ให้เสร็จสิ้นเรียบร้อย

### 1. กำหนดค่าไฟล์เชื่อมต่อฐานข้อมูล
เปิดแก้ไขไฟล์ [.env](file:///c:/Bookbik/HL-assets-management-inventory/backend/.env) ในโฟลเดอร์ `backend/` ให้ถูกต้องตามค่าจริง:
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5433/it-assets-inventory?schema=public"
JWT_SECRET="YOUR_SUPER_SECRET_KEY"
```

### 2. สร้างโครงสร้างตารางข้อมูล (Database Schema)
รันคำสั่งเหล่านี้ในโฟลเดอร์ `backend/` บนเซิร์ฟเวอร์:
```bash
cd backend

# 1. ติดตั้ง dependencies ของฝั่ง Backend
npm install

# 2. สร้าง TypeScript types ของ Prisma Client ให้ตรงกับ schema ล่าสุด
npx prisma generate

# 3. นำโครงสร้าง Schema ล่าสุดไปสร้างตารางในฐานข้อมูลจริง (สำคัญมาก: ห้ามข้ามขั้นตอนนี้ก่อนรัน Seed)
npx prisma db push
```
> [!IMPORTANT]
> **ข้อควรระวัง**: ต้องมั่นใจว่ารันคำสั่ง `npx prisma db push` หรือทำการ Migrate สำเร็จแล้ว เพื่อป้องกันการเกิด Error `Table does not exist` ในระหว่างขั้นตอนการใส่ข้อมูลสำรอง (Seed)

### 3. กู้คืนข้อมูลจาก SQL Backup เข้าสู่ฐานข้อมูลจริง (Database Seeding)
เราได้ทำการเขียนระบบกู้คืนข้อมูลแบบ Type-safe และบูรณาการข้อมูลสำรอง (May 14, 2026) ลงในไฟล์ [seed.ts](file:///c:/Bookbik/HL-assets-management-inventory/backend/prisma/seed.ts) เรียบร้อยแล้ว สามารถเริ่มประมวลผลใส่ข้อมูลจริงด้วยคำสั่ง:
```bash
npx prisma db seed
```
*(ข้อมูลพนักงาน 16 คน, สินทรัพย์ IT 19 รายการ, ไลเซนส์ซอฟต์แวร์ 11 สิทธิ์, และข้อมูลประวัติล็อกอินของผู้ใช้งานระบบทั้งหมดจะถูกนำเข้าระบบโดยอัตโนมัติอย่างถูกต้อง)*

---

## ⚙️ ขั้นตอนที่ 2: การกำหนดค่าสภาพแวดล้อม (.env) และการ Build ระบบ

### 1. กำหนดค่าฝั่ง Frontend (`frontend/.env`)
ค่าของ `NEXT_PUBLIC_API_URL` จะถูกเขียนฝังลงไปในซอร์สโค้ดระหว่างประมวลผลการคอมไพล์ (Build) เสมอ ดังนั้นหากใช้งาน SSL (HTTPS) แล้ว ต้องกำหนดโปรโตคอลเป็น `https://` ดังนี้:
```env
# ตั้งค่าชี้ผ่าน Domain จริงที่ตั้งค่าผ่าน Nginx (แนะนำ HTTPS)
NEXT_PUBLIC_API_URL="https://coredesk.hylifeconnect.com/api"
NEXTAUTH_URL="https://coredesk.hylifeconnect.com"
NEXTAUTH_SECRET="your-secret-key-here-12345"
```

### 2. ทำการคอมไพล์ระบบ (Build Production Production Bundle)
รันคำสั่งรวบรวมไฟล์สำหรับทำงานในแบบ Production:

#### สั่ง Build Backend (NestJS):
```bash
cd backend
npm run build
```
*(จะได้โฟลเดอร์ผลลัพธ์เป็น `backend/dist` สำหรับใช้รันระบบจริง)*

#### สั่ง Build Frontend (Next.js Standalone):
```bash
cd ../frontend
npm install
npm run build
```
*(จะได้โฟลเดอร์ผลลัพธ์เป็น `frontend/.next` โดยจะอยู่ในโหมด Standalone ที่พร้อมนำไปเปิดรันบนเซิร์ฟเวอร์แบบเบาตัวที่สุด)*

---

## 🚀 ขั้นตอนที่ 3: การรันแอปพลิเคชันเบื้องหลังด้วย PM2

เพื่อให้แอปพลิเคชันของเราเปิดทำงานตลอด 24 ชั่วโมง แม้ปิดหน้าจอ Terminal หรือเซิร์ฟเวอร์เกิดการ Restart ตัวเอง

### 1. สั่งเปิดใช้งาน Backend (NestJS)
รันคำสั่งภายในโฟลเดอร์ `backend/`:
```bash
cd backend
pm2 start dist/main.js --name "hl-backend"
```

### 2. สั่งเปิดใช้งาน Frontend (Next.js Standalone Mode)
รันคำสั่งภายในโฟลเดอร์ `frontend/` (โหมด Standalone จะกินแรมน้อยและทำงานได้รวดเร็วมาก):
```bash
cd ../frontend
PORT=3000 pm2 start .next/standalone/server.js --name "hl-frontend"
```

### 3. ตรวจสอบสถานะการรันของ PM2
```bash
# ตรวจดูรายการและสถานะการทำงานของแอปพลิเคชัน
pm2 status

# เปิดหน้าต่างมอนิเตอร์ Logs การรับส่งข้อมูล
pm2 logs
```

### 4. การตั้งค่า PM2 Startup Service (systemd) เพื่อให้แอปพลิเคชันทำงานใหม่อัตโนมัติเมื่อเซิร์ฟเวอร์เปิดเครื่องหรือ Restart

เพื่อให้ PM2 รันแอปพลิเคชัน Backend และ Frontend ของเราขึ้นมาใหม่ทันทีหลังเซิร์ฟเวอร์โดน Reboot ให้ทำตามขั้นตอนดังนี้:

#### 1) รันคำสั่งสร้างสคริปต์ Startup
รันคำสั่งด้านล่างนี้ในฐานะผู้ใช้งานปกติ (ไม่ใช่ root) เพื่อให้ PM2 ตรวจสอบระบบและสร้างคำสั่ง systemd:
```bash
pm2 startup systemd
```

#### 2) คัดลอกคำสั่งพิเศษไปรันใน Terminal
เมื่อรันคำสั่งด้านบนสำเร็จ PM2 จะส่งคำสั่งยาวๆ ที่มีคำว่า `sudo env PATH=...` ออกมาให้ทางหน้าจอ ให้ทำการ **Copy คำสั่งนั้นทั้งหมด** แล้วนำมาวางรันใน Terminal อีกครั้ง เช่น:
```bash
# ตัวอย่างคำสั่งที่ได้ (ห้ามก๊อปปี้บรรทัดนี้โดยตรง ให้ใช้คำสั่งที่ได้จากหน้าจอเซิร์ฟเวอร์ของคุณเอง):
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

#### 3) สั่งเซฟรายการแอปพลิเคชันปัจจุบัน (สำคัญมาก!)
เมื่อจัดการสิทธิ์ systemd เรียบร้อยแล้ว ให้รันคำสั่งนี้เพื่อบันทึกสถานะของแอปพลิเคชันที่กำลังรันอยู่ (`hl-backend` และ `hl-frontend`) ลงในระบบความจำของ PM2:
```bash
pm2 save
```
*(หากรันคำสั่งสำเร็จ ระบบจะบันทึกค่าไว้ที่โฟลเดอร์ `~/.pm2/dump.pm2` และจะดึงค่านี้มารันใหม่ทันทีเมื่อเปิดเครื่องครั้งถัดไป)*

---

### 🛠️ คำสั่ง PM2 ที่จำเป็นและเกี่ยวข้องสำหรับการควบคุมระบบ

หากมีการปรับปรุงโค้ด, แก้ไขสิ่งแวดล้อม (.env) หรือต้องการจัดการบริการ ให้ใช้คำสั่งที่เกี่ยวข้องเหล่านี้:

#### 1) การอัปเดตและเริ่มระบบใหม่ (หลังจากเซฟค่าแล้ว)
*   **สั่ง Reload แอปพลิเคชันทั้งหมดแบบไม่มี Downtime (แนะนำสำหรับ Production)**:
    ```bash
    pm2 reload all
    ```
    *(คำสั่งนี้จะค่อยๆ ทยอยโหลดกระบวนการใหม่โดยหน้าเว็บยังใช้งานได้ปกติ)*
*   **สั่ง Restart แอปพลิเคชันทั้งหมดทันที (ปิดและเปิดใหม่)**:
    ```bash
    pm2 restart all
    ```
*   **สั่งให้ PM2 ไปดึงค่ารายการแอปพลิเคชันที่เซฟไว้ล่าสุดกลับมาทำงาน (ในกรณีที่หลุด)**:
    ```bash
    pm2 resurrect
    ```

#### 2) คำสั่งควบคุมเฉพาะเจาะจงรายบริการ
*   **สั่งหยุดการรันบริการชั่วคราว**:
    ```bash
    pm2 stop hl-backend
    pm2 stop hl-frontend
    ```
*   **สั่งเปิดบริการกลับมาใหม่**:
    ```bash
    pm2 start hl-backend
    pm2 start hl-frontend
    ```
*   **สั่งลบบริการออกจากรายการของ PM2**:
    ```bash
    pm2 delete hl-backend
    pm2 delete hl-frontend
    ```

#### 3) การมอนิเตอร์และตรวจสอบ
*   **ดูหน้าจอกราฟและสถิติ CPU / Memory แบบ Real-time**:
    ```bash
    pm2 monit
    ```
*   **ดูรายละเอียดเชิงลึกของแอปพลิเคชันที่เจาะจง**:
    ```bash
    pm2 show hl-frontend
    ```
*   **ล้างประวัติ Logs เก่าๆ เพื่อประหยัดพื้นที่ฮาร์ดดิสก์**:
    ```bash
    pm2 flush
    ```

---

## 🌐 ขั้นตอนที่ 4: การตั้งค่า Nginx (Reverse Proxy)

เราได้แยกความสอดคล้องและการกำหนดทิศทางการเชื่อมต่อ (Routing) ของระบบออกจากกันอย่างสิ้นเชิงในไฟล์ [coredesk.conf](file:///c:/Bookbik/HL-assets-management-inventory/coredesk.conf) เพื่อป้องกันปัญหา NextAuth ติดขัด:

1. **คัดลอกไฟล์คอนฟิก** ไปยังโฟลเดอร์การทำงานหลักของ Nginx:
   ```bash
   sudo cp coredesk.conf /etc/nginx/sites-available/hl-assets-inventory
   ```
2. **สร้าง Symbolic Link** เพื่อนำไปเปิดทำงาน:
   ```bash
   sudo ln -s /etc/nginx/sites-available/hl-assets-inventory /etc/nginx/sites-enabled/
   ```
3. **ตรวจสอบความถูกต้องและรูปแบบของ Nginx Config**:
   ```bash
   sudo nginx -t
   ```
4. **รีโหลดบริการของ Nginx** เพื่อเริ่มใช้คอนฟิกล่าสุด:
   ```bash
   sudo systemctl reload nginx
   ```

---

## 🔒 ขั้นตอนที่ 5: การติดตั้งและขอบริการ SSL (HTTPS) ด้วย Let's Encrypt

เพื่อความปลอดภัยสูงสุดและเพื่อให้ระบบ NextAuth ทำงานร่วมกับความปลอดภัย Secure Cookie บนเบราว์เซอร์ได้อย่างราบรื่น

### 1. การติดตั้ง Certbot
รันคำสั่งบน Ubuntu Server ของคุณ:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 2. สั่งขอ SSL Certificate และตั้งค่า Nginx อัตโนมัติ
```bash
sudo certbot --nginx -d coredesk.hylifeconnect.com
```
*   **การเลือกตัวเลือก**: หากระบบถามให้เลือกตัวเลือก Redirect หรือเปลี่ยนค่า ให้เลือกตกลงเพื่อให้ Certbot จัดการตั้งค่า Redirect จาก `HTTP (พอร์ต 80)` ไปสู่ `HTTPS (พอร์ต 443)` ให้ทันที
*   **ผลลัพธ์**: ตัวโปรแกรมจะเข้าไปเขียนโค้ดใบรับรองในไฟล์ [coredesk.conf](file:///c:/Bookbik/HL-assets-management-inventory/coredesk.conf) ของเราให้เองโดยสมบูรณ์

---

## 💡 สรุปการตั้งค่า Nginx Routing เพื่อความเข้าใจ (และวิธีการแก้ไขหากพบปัญหาหน้า Login)

ในไฟล์คอนฟิก [coredesk.conf](file:///c:/Bookbik/HL-assets-management-inventory/coredesk.conf) ล่าสุด มีโครงสร้างการแบ่งทิศทางของ API ไว้เป็นสัดส่วนเพื่อกันความสับสนของ URL:

*   **NextAuth APIs (`/api/auth/` ทุกเส้นทาง ยกเว้นการ login)**: จะถูกส่งไปประมวลผลที่ **Next.js Frontend (port 3000)** ทำให้ NextAuth รับส่ง Token, Session, และ Callback ได้ปกติ
*   **Backend Auth Login (`/api/auth/login` แบบจับคู่ตรงเป๊ะ)**: จะถูกส่งไปประมวลผลที่ **NestJS Backend (port 3001)** ที่เส้นทาง `/auth/login` เพื่อตรวจสอบรหัสผ่านจริง
*   **APIs ส่วนอื่นทั้งหมด (`/api/`)**: จะถูกส่งไปหา **NestJS Backend (port 3001)** โดยการตัด (Strip) Prefix คำว่า `/api` ออกโดยอัตโนมัติ

> [!TIP]
> ทุกครั้งที่ปรับปรุงไฟล์คอนฟิกบน Nginx ให้ใช้คำสั่ง `sudo nginx -t` เพื่อตรวจสอบเสมอ และรัน `sudo systemctl reload nginx` เพื่อให้การตั้งค่ามีผลทำงานจริงครับ
