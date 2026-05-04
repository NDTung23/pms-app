# PMS — Project Management System

## Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas

---

## Chạy local

### 1. Backend
```bash
cd backend
npm install
# Tạo file .env (xem .env.example)
npm run dev
```

### 2. Frontend
```bash
npm install
npm run dev
```

---

## Deploy

### Backend → Render.com

1. Tạo tài khoản tại [render.com](https://render.com)
2. Bấm **New → Web Service**
3. Kết nối GitHub repo
4. Chọn thư mục `backend/`
5. Điền các biến môi trường:
   - `MONGO_URI` = connection string MongoDB Atlas
   - `JWT_SECRET` = chuỗi bí mật bất kỳ
   - `CLIENT_URL` = URL frontend Vercel (điền sau)
6. Bấm **Deploy**
7. Copy URL backend (dạng `https://pms-backend.onrender.com`)

### Frontend → Vercel.com

1. Tạo tài khoản tại [vercel.com](https://vercel.com)
2. Bấm **New Project**
3. Kết nối GitHub repo
4. Chọn thư mục gốc (`pms-app/`)
5. Thêm biến môi trường:
   - `VITE_API_URL` = `https://pms-backend.onrender.com/api`
6. Bấm **Deploy**
7. Copy URL frontend → cập nhật `CLIENT_URL` bên Render

### MongoDB Atlas — Cho phép IP Render
1. Vào **Network Access**
2. Thêm `0.0.0.0/0` để cho phép mọi IP

---

## Tài khoản mặc định
Sau khi deploy, đăng ký tài khoản đầu tiên rồi vào MongoDB Atlas đổi `role` thành `admin`.
