# Hệ Thống Quan Trắc Nước - Web Server

Web server hiển thị các trạm quan trắc TVA và MQTT lên bản đồ Google Maps.

## 📋 Yêu cầu

- Node.js (v14 trở lên)
- Các package: express
- Google Maps API Key

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install express
```

### 2. Cấu hình Google Maps API Key

Mở file `public/index.html` và thay thế `YOUR_GOOGLE_MAPS_API_KEY` bằng API key của bạn:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap" async defer></script>
```

**Cách lấy Google Maps API Key:**
1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project hiện có
3. Bật Maps JavaScript API
4. Tạo credentials (API Key)
5. Copy API key vào file `index.html`

## 💻 Chạy Server

```bash
node server.js
```

Server sẽ chạy tại: **http://localhost:3000**

## 📡 API Endpoints

### 1. Lấy tất cả trạm (TVA + MQTT)
```
GET /api/stations
```

**Response:**
```json
{
  "success": true,
  "totalStations": 32,
  "stations": [...],
  "timestamp": "2026-01-31T14:30:00.000Z"
}
```

### 2. Lấy chỉ trạm TVA
```
GET /api/stations/tva
```

### 3. Lấy chỉ trạm MQTT
```
GET /api/stations/mqtt
```

### 4. Lấy chi tiết một trạm
```
GET /api/station/:id
```

**Ví dụ:** `/api/station/tva_NHÀ_MÁY_SỐ_1_-_GIẾNG_SỐ_1`

## 🗺️ Tính năng

### Giao diện Web
- ✅ Hiển thị bản đồ Google Maps
- ✅ Markers cho các trạm TVA (màu xanh lá) và MQTT (màu cam)
- ✅ Thống kê tổng quan
- ✅ Bộ lọc theo loại trạm (Tất cả / TVA / MQTT)
- ✅ Chi tiết trạm khi click vào marker
- ✅ Auto refresh mỗi 5 phút
- ✅ Responsive design

### Thông tin hiển thị
- Tên trạm
- Loại trạm (TVA/MQTT)
- Tọa độ (lat, lng)
- Thời gian cập nhật
- Các thông số đo (Nhiệt độ, Mực nước, Lưu lượng, v.v.)
- Giới hạn cho phép (chỉ TVA)

## 📁 Cấu trúc thư mục

```
webJS/
├── server.js                    # Express server
├── mqtt_client.js               # MQTT client
├── mqtt-coordinates.js          # Tọa độ trạm MQTT
├── tva-coordinates.js           # Tọa độ trạm TVA
├── data_quantrac.json           # Dữ liệu TVA
├── data_mqtt.json               # Dữ liệu MQTT
├── public/
│   ├── index.html              # Giao diện web
│   ├── styles.css              # Styling
│   └── map.js                  # Logic Google Maps
└── README_SERVER.md            # File này
```

## 🔧 Cấu hình

### Thay đổi Port
Mở `server.js` và sửa:
```javascript
const PORT = 3000; // Đổi thành port khác
```

### Thay đổi thời gian auto refresh
Mở `public/map.js` và sửa:
```javascript
setInterval(() => {
    loadStations();
}, 5 * 60 * 1000); // 5 phút = 5 * 60 * 1000 ms
```

## 🎨 Tùy chỉnh màu sắc

### Màu markers
Mở `public/map.js`, tìm hàm `displayMarkers()`:
```javascript
const icon = {
    fillColor: station.type === 'TVA' ? '#10b981' : '#f59e0b', // Đổi màu tại đây
    // TVA: #10b981 (xanh lá)
    // MQTT: #f59e0b (cam)
};
```

### Màu theme
Mở `public/styles.css` và sửa các gradient:
```css
.header {
    background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
}
```

## 🚨 Xử lý lỗi

### Lỗi: "Cannot find module 'express'"
```bash
npm install express
```

### Lỗi: Không hiển thị bản đồ
- Kiểm tra Google Maps API Key
- Mở Console trình duyệt (F12) để xem lỗi
- Đảm bảo đã bật Maps JavaScript API

### Lỗi: Không có dữ liệu
- Kiểm tra file `data_quantrac.json` và `data_mqtt.json` có tồn tại
- Chạy MQTT client trước: `node mqtt_client.js`

## 📞 Hỗ trợ

**Công ty Cổ phần Cấp nước Cà Mau**
- Địa chỉ: 204 Quang Trung, phường Tân Thành, tỉnh Cà Mau
- Hotline: 02903 836 360 - 02903 836 723
- Fax: 0290 383 6723

---

Made with ❤️ for Công ty Cấp nước Cà Mau
