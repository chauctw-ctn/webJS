# Hệ Thống Lưu Trữ Dữ Liệu SQL

## Tổng Quan
Hệ thống đã được nâng cấp để lưu trữ dữ liệu từ MQTT và TVA vào cơ sở dữ liệu SQLite và cung cấp API để lấy dữ liệu thống kê.

## Tính Năng Mới

### 1. Lưu Trữ Dữ Liệu Tự Động
- **Dữ liệu TVA**: Tự động lưu vào SQL mỗi 5 phút
- **Dữ liệu MQTT**: Tự động lưu vào SQL mỗi 5 phút
- **Dọn dẹp dữ liệu cũ**: Tự động xóa dữ liệu cũ hơn 90 ngày (chạy mỗi 24 giờ)

### 2. Cấu Trúc Database

#### Bảng `tva_data`
Lưu trữ dữ liệu từ các trạm TVA:
- `id`: ID tự tăng
- `station_name`: Tên trạm
- `station_id`: Mã trạm (dạng tva_*)
- `parameter_name`: Tên thông số
- `value`: Giá trị
- `unit`: Đơn vị
- `timestamp`: Thời gian đo
- `update_time`: Thời gian cập nhật
- `created_at`: Thời gian tạo record

#### Bảng `mqtt_data`
Lưu trữ dữ liệu từ các trạm MQTT:
- `id`: ID tự tăng
- `station_name`: Tên trạm
- `station_id`: Mã trạm (dạng mqtt_*)
- `device_name`: Tên thiết bị
- `parameter_name`: Tên thông số
- `value`: Giá trị
- `unit`: Đơn vị
- `timestamp`: Thời gian đo
- `update_time`: Thời gian cập nhật
- `created_at`: Thời gian tạo record

#### Bảng `stations`
Lưu trữ thông tin các trạm:
- `id`: ID tự tăng
- `station_id`: Mã trạm (unique)
- `station_name`: Tên trạm
- `station_type`: Loại trạm (TVA/MQTT)
- `latitude`: Vĩ độ
- `longitude`: Kinh độ
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

### 3. API Mới

#### GET /api/stats
Lấy dữ liệu thống kê từ SQL database.

**Query Parameters:**
- `stations`: Danh sách ID trạm, phân cách bởi dấu phẩy (vd: `tva_QUAN_TRAC_1,mqtt_GIENG_SO_15`)
- `type`: Loại trạm (`all`, `TVA`, `MQTT`)
- `parameter`: Tên thông số hoặc `all`
- `startDate`: Ngày bắt đầu (YYYY-MM-DD)
- `endDate`: Ngày kết thúc (YYYY-MM-DD)
- `limit`: Giới hạn số bản ghi (mặc định 10000)

**Ví dụ:**
```
GET /api/stats?stations=tva_QUAN_TRAC_1&type=TVA&parameter=all&startDate=2026-02-01&endDate=2026-02-01&limit=1000
```

**Response:**
```json
{
  "success": true,
  "totalRecords": 150,
  "data": [
    {
      "id": 1,
      "station_name": "QUAN TRAC 1",
      "station_id": "tva_QUAN_TRAC_1",
      "parameter_name": "Mực nước",
      "value": 25.5,
      "unit": "m",
      "timestamp": "2026-02-01T10:30:00.000Z",
      "source": "TVA"
    },
    ...
  ],
  "query": {
    "stationIds": ["tva_QUAN_TRAC_1"],
    "stationType": "TVA",
    "parameterName": "all",
    "startDate": "2026-02-01",
    "endDate": "2026-02-01",
    "limit": 1000
  }
}
```

#### GET /api/stats/parameters
Lấy danh sách các thông số có sẵn trong database.

**Response:**
```json
{
  "success": true,
  "parameters": [
    "Lưu lượng",
    "Mực nước",
    "Nhiệt độ nước",
    "Tổng lưu lượng"
  ]
}
```

#### GET /api/stats/stations
Lấy danh sách các trạm từ database.

**Response:**
```json
{
  "success": true,
  "totalStations": 25,
  "stations": [
    {
      "id": 1,
      "station_id": "tva_QUAN_TRAC_1",
      "station_name": "QUAN TRAC 1",
      "station_type": "TVA",
      "latitude": 9.1526,
      "longitude": 105.1843,
      "created_at": "2026-02-01T03:45:12.000Z",
      "updated_at": "2026-02-01T03:45:12.000Z"
    },
    ...
  ]
}
```

### 4. Trang Thống Kê

Trang thống kê (`/stats.html`) đã được cập nhật để sử dụng API mới:
- Tự động lấy dữ liệu từ SQL database
- Hiển thị dữ liệu thực tế thay vì dữ liệu giả lập
- Hỗ trợ lọc theo trạm, thông số, và khoảng thời gian

## File Mới

### database.js
Module quản lý database SQLite với các chức năng:
- `initDatabase()`: Khởi tạo các bảng
- `saveTVAData(stations)`: Lưu dữ liệu TVA
- `saveMQTTData(stations)`: Lưu dữ liệu MQTT
- `getStatsData(options)`: Lấy dữ liệu thống kê
- `getAvailableParameters()`: Lấy danh sách thông số
- `getStations()`: Lấy danh sách trạm
- `cleanOldData(daysToKeep)`: Dọn dẹp dữ liệu cũ
- `closeDatabase()`: Đóng kết nối database

## Cài Đặt

### Dependencies Mới
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mqtt": "^4.3.7",
    "sqlite3": "^5.x.x"
  }
}
```

### Cài đặt:
```bash
npm install
```

## Sử Dụng

### Khởi động server:
```bash
node server.js
```

Server sẽ tự động:
1. Khởi tạo database nếu chưa tồn tại
2. Kết nối MQTT broker
3. Lưu dữ liệu TVA và MQTT định kỳ mỗi 5 phút
4. Dọn dẹp dữ liệu cũ mỗi 24 giờ

### Xem dữ liệu:
- Bản đồ: http://localhost:3000
- Thống kê: http://localhost:3000/stats.html

## Lưu Ý

1. **File database**: `water_monitoring.db` sẽ được tạo tự động trong thư mục gốc
2. **Dung lượng**: Database sẽ tự động dọn dẹp dữ liệu cũ hơn 90 ngày
3. **Backup**: Nên backup file `water_monitoring.db` định kỳ
4. **Performance**: Các index đã được tạo để tối ưu hóa truy vấn

## Kiểm Tra Dữ Liệu

### Sử dụng SQLite CLI:
```bash
sqlite3 water_monitoring.db

# Xem số lượng bản ghi
SELECT COUNT(*) FROM tva_data;
SELECT COUNT(*) FROM mqtt_data;

# Xem dữ liệu mới nhất
SELECT * FROM tva_data ORDER BY timestamp DESC LIMIT 10;
SELECT * FROM mqtt_data ORDER BY timestamp DESC LIMIT 10;

# Xem danh sách trạm
SELECT * FROM stations;
```

## Khắc Phục Sự Cố

### Database bị lỗi:
```bash
# Xóa và tạo lại database
rm water_monitoring.db
node server.js
```

### Không có dữ liệu:
- Kiểm tra kết nối MQTT
- Kiểm tra file `data_quantrac.json` và `data_mqtt.json`
- Xem log trong console

### API trả về lỗi:
- Kiểm tra các tham số query
- Xem console log để biết chi tiết lỗi
- Kiểm tra database có tồn tại không

## Cập Nhật Tương Lai

Các tính năng có thể thêm:
- Export dữ liệu ra Excel/CSV
- Tạo báo cáo tự động
- Thông báo khi có dữ liệu bất thường
- Tích hợp với hệ thống khác qua API
- Dashboard thời gian thực
