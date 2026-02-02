# ✅ Deployment Checklist - Render.com

## Các vấn đề đã fix:

### 1. ❌ SQLite3 "invalid ELF header"
**Nguyên nhân:** Module compiled trên Windows không chạy được trên Linux

**Giải pháp:**
- ✅ Thêm `build.sh` script
- ✅ Cấu hình `render.yaml` với build command
- ✅ Update `.npmrc` (chỉ dùng cho production)

**Status:** FIXED - Render sẽ rebuild sqlite3 khi deploy

---

### 2. ❌ MODULE_NOT_FOUND (axios, cheerio)
**Nguyên nhân:** getKeyTVA.js cần axios và cheerio để crawl dữ liệu TVA

**Giải pháp:**
- ✅ Thêm `axios@^1.6.7` vào dependencies
- ✅ Thêm `cheerio@^1.0.0-rc.12` vào dependencies

**Status:** FIXED - Dependencies đã được thêm vào package.json

---

## 📦 Dependencies hiện tại:

```json
{
  "axios": "^1.6.7",       // ✅ Web scraping HTTP requests
  "cheerio": "^1.0.0-rc.12", // ✅ HTML parsing (TVA data)
  "express": "^4.18.2",    // ✅ Web server
  "mqtt": "^4.3.7",        // ✅ MQTT client
  "sqlite3": "^5.1.7"      // ✅ Database
}
```

---

## 🚀 Deployment Flow:

1. **Git Push** → Trigger deployment
2. **Render Build:**
   ```bash
   bash build.sh
   ├─ npm install (axios, cheerio, express, mqtt, sqlite3)
   └─ npm rebuild --build-from-source sqlite3
   ```
3. **Verify SQLite3:** Check version
4. **Start Server:** `node server.js`

---

## ✓ Expected Logs:

### Build Phase:
```
🚀 Starting deployment build...
📦 Installing dependencies...
added 123 packages
🔨 Rebuilding sqlite3 for Linux...
✅ Verifying sqlite3...
SQLite3 version: 5.1.7
✅ Build completed successfully!
```

### Runtime Phase:
```
✅ Đã kết nối tới SQLite database: /opt/render/project/src/water_monitoring.db
✅ Bảng tva_data đã sẵn sàng
✅ Bảng mqtt_data đã sẵn sàng
✅ Database đã sẵn sàng
🔌 Đang khởi động MQTT client...
✅ MQTT client đã kết nối
📊 Đang tải dữ liệu TVA lần đầu...
🔄 Đang cập nhật dữ liệu TVA...
✅ Đã cập nhật dữ liệu TVA
💾 Đã lưu X bản ghi TVA vào database
🚀 Server đang chạy tại: http://0.0.0.0:10000
```

---

## 🔍 Troubleshooting:

### Nếu vẫn gặp lỗi SQLite3:
1. Clear build cache trên Render Dashboard
2. Manual deployment với clear cache
3. Check logs: `/opt/render/project/src`

### Nếu vẫn gặp lỗi MODULE_NOT_FOUND:
1. Verify package.json có đầy đủ dependencies
2. Check build logs: "added X packages"
3. Kiểm tra node_modules được tạo

### Nếu getKeyTVA.js không chạy:
```bash
# Test locally
node getKeyTVA.js

# Expected output:
✅ Đã gửi form đăng nhập!
🔍 Tìm thấy X segment dữ liệu
📊 DỮ LIỆU QUAN TRẮC CÀ MAU
💾 Đã lưu dữ liệu vào file: data_quantrac.json
```

---

## 📊 Health Check:

**Endpoint:** `/api/stations`

**Expected Response:**
```json
{
  "success": true,
  "totalStations": 30,
  "stations": [...],
  "timestamp": "2026-02-02T..."
}
```

**Status Code:** 200 OK

---

## 🔐 Environment Variables (Optional):

Nếu cần thêm biến môi trường, update `render.yaml`:

```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: TVA_USERNAME
    value: ctncamau@quantrac.net
  - key: TVA_PASSWORD
    sync: false  # Secret value
```

---

## ⚡ Performance Notes:

- Build time: ~2-3 phút (do rebuild sqlite3)
- Start time: ~5-10 giây
- Health check interval: 30s
- Auto-restart: Enabled
- Persistent disk: 1GB cho database

---

## 📝 Next Steps:

1. ✅ Monitor deployment logs
2. ✅ Verify health check passes
3. ✅ Test API endpoints
4. ✅ Check TVA data update (mỗi 5 phút)
5. ✅ Monitor database size

---

**Last Updated:** 2026-02-02
**Deployment Status:** Ready to deploy
**Branch:** main
