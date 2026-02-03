# 🚀 HƯỚNG DẪN DEPLOY LÊN RENDER (Node.js 20)

## Lỗi đã fix:
- ❌ **Lỗi cũ**: `ReferenceError: File is not defined` trên Node.js 18.x
- ✅ **Giải pháp**: Nâng cấp lên Node.js 20.x

## Các file đã cập nhật:
1. **package.json** - `engines.node` → `"20.x"`
2. **render.yaml** - Thêm `nodeVersion: "20"`
3. **.node-version** - File mới chỉ định version `20`

## Bước deploy:

### 1. Commit và push code
```bash
git add .
git commit -m "Fix: Upgrade to Node.js 20 to resolve File API error"
git push origin main
```

### 2. Render sẽ tự động deploy
- Render phát hiện `.node-version` và sử dụng Node.js 20
- Build command: `npm install`
- Start command: `node server.js`

### 3. Kiểm tra sau khi deploy
Kiểm tra các endpoint:
- https://cncm.onrender.com
- https://cncm.onrender.com/api/stations
- https://cncm.onrender.com/api/tva-status

## Tại sao Node.js 20?
- ✅ Hỗ trợ đầy đủ File API
- ✅ Cải thiện performance
- ✅ Các tính năng ES2023 mới
- ✅ Bảo mật tốt hơn
- ✅ Tương thích với undici và các dependencies hiện đại

## Nếu vẫn còn lỗi:
1. Xóa cache trên Render Dashboard
2. Clear build cache và redeploy
3. Kiểm tra logs: `https://dashboard.render.com`

## Environment Variables cần thiết:
- `NODE_ENV=production` (đã có trong render.yaml)

---
📅 Cập nhật: February 3, 2026
