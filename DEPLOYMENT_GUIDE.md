# 🚀 Hướng dẫn Deploy Todo App lên Production

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Render.com account (free)
- MongoDB Atlas account (đã có)

---

## 🔧 BƯỚC 1: Chuẩn bị Backend

### 1.1 Thêm start script
✅ **Đã làm**: Backend `package.json` có `"start": "node src/server.js"`

### 1.2 Kiểm tra các env variables cần thiết
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
PORT=5000
GOOGLE_CLIENT_ID=...
EMAIL_USER=...
EMAIL_PASSWORD=...
FRONTEND_URL=http://localhost:5173  # Sẽ update sau
```

### 1.3 Đẩy code lên GitHub
```bash
cd todo_app_be
git add .
git commit -m "Add start script for production"
git push origin main
```

---

## 📤 BƯỚC 2: Deploy Backend lên Render.com

### 2.1 Tạo Web Service trên Render
1. Vào https://render.com
2. Đăng nhập bằng GitHub account
3. Bấm **"New +"** → **"Web Service"**
4. Chọn repo **`TodoApp_BE`**
5. Điền thông tin:
   - **Name:** `todo-app-backend` (hoặc tên khác)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (hoặc paid)

### 2.2 Thêm Environment Variables
Bấm vào **"Environment"** tab, thêm:
```
MONGO_URI = mongodb+srv://akali:CoUxUxhzMCGnbpuB@gmw.lkuzm1i.mongodb.net/?appName=GMW
JWT_SECRET = asdklalksdnwklasdczxcdaszxcasd
GOOGLE_CLIENT_ID = 806695546504-pjbedm9jb0hbh8lclbjrt2p08jvsn83m.apps.googleusercontent.com
EMAIL_USER = akalilane00@gmail.com
EMAIL_PASSWORD = ybne fofz fouu pvgc
FRONTEND_URL = http://localhost:5173  # Sẽ update sau deploy frontend
PORT = 5000
```

### 2.3 Deploy
- Bấm **"Create Web Service"**
- Đợi ≈ 2-5 phút
- Sẽ có URL như: `https://todo-app-backend.onrender.com`
- **⚠️ Lưu URL này** (sẽ dùng cho frontend)

---

## 🎨 BƯỚC 3: Chuẩn bị Frontend

### 3.1 Cập nhật `.env.production`
```bash
# .env.production
VITE_GOOGLE_CLIENT_ID=806695546504-pjbedm9jb0hbh8lclbjrt2p08jvsn83m.apps.googleusercontent.com
VITE_API_URL=https://todo-app-backend.onrender.com/api
VITE_SOCKET_URL=https://todo-app-backend.onrender.com
```

### 3.2 Đẩy code lên GitHub
```bash
cd todo_app_fe
git add .
git commit -m "Add production env variables"
git push origin main
```

---

## 📦 BƯỚC 4: Deploy Frontend lên Vercel

### 4.1 Tạo Project trên Vercel
1. Vào https://vercel.com
2. Đăng nhập bằng GitHub
3. Bấm **"Add New"** → **"Project"**
4. Search và select repo **`TodoApp_FE`**

### 4.2 Configure Project
Vercel sẽ auto-detect React + Vite, điều chỉnh:
- **Framework Preset:** React
- **Build Command:** `npm run build` (mặc định)
- **Output Directory:** `dist` (mặc định)

### 4.3 Thêm Environment Variables
Bấm tab **"Environment Variables"**, thêm:
```
VITE_GOOGLE_CLIENT_ID = 806695546504-pjbedm9jb0hbh8lclbjrt2p08jvsn83m.apps.googleusercontent.com
VITE_API_URL = https://todo-app-backend.onrender.com/api
VITE_SOCKET_URL = https://todo-app-backend.onrender.com
```

### 4.4 Deploy
- Bấm **"Deploy"**
- Đợi ≈ 1-3 phút
- Sẽ có URL như: `https://todo-app-fe.vercel.app`

---

## ✅ BƯỚC 5: Cập nhật Backend FRONTEND_URL

Sau khi frontend deploy xong, cập nhật backend:

1. Vào Render dashboard → chọn `todo-app-backend`
2. Bấm vào **"Environment"**
3. Cập nhật `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://todo-app-fe.vercel.app
   ```
4. Bấm **"Save"** → Backend sẽ auto-redeploy

---

## 🧪 BƯỚC 6: Kiểm tra

### 6.1 Test Backend API
```bash
# Mở terminal/Postman
curl https://todo-app-backend.onrender.com/api/users

# Kết quả: [users] hoặc error (bình thường)
```

### 6.2 Test Frontend
1. Vào `https://todo-app-fe.vercel.app`
2. Đăng nhập test
3. Tạo board → tạo card → xem activity realtime
4. Kiểm tra socket.io connection (F12 → Console)

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Kiểm tra `VITE_API_URL` ở Vercel env vars đúng không
- Backend phải chạy (`npm start` từ start script)

### "Socket connection failed"
- Kiểm tra `VITE_SOCKET_URL` chính xác
- Backend phải enable Socket.io (✅ đã có)

### "Email not sending"
- Email password phải là **Gmail App Password** (không phải password thường)
- Enable "Less secure app access" ở Gmail settings

### "CORS error"
- Backend đã có `cors()` middleware, bình thường
- Nếu lỗi: update backend CORS settings

### "Render free tier sleeping"
- Free tier Render tự stop sau 15 phút idle
- Solution: Upgrade lên paid hoặc dùng Railway/Heroku

---

## 📱 Optional: Livekit/Custom Domain

### Thêm custom domain (Vercel)
1. Vào Vercel → Project Settings
2. Tab **"Domains"**
3. Thêm domain của bạn (mua từ Namecheap, GoDaddy, etc)
4. Follow hướng dẫn DNS

---

## 🔐 Security Checklist

- ✅ `.env` không push lên GitHub (.gitignore)
- ✅ Email password là App Password (không password chính)
- ✅ JWT_SECRET là string ngẫu nhiên dài
- ✅ Google OAuth credentials valid
- ✅ MongoDB firewall cho phép connection từ Render

---

## 🎉 Done!

Ứng dụng đã deploy! 
- **Frontend:** https://todo-app-fe.vercel.app
- **Backend:** https://todo-app-backend.onrender.com

Enjoy! 🚀
