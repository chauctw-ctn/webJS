# BÁO CÁO FIX DỰ ÁN MQTT

## ✅ ĐÃ HOÀN THÀNH

### 1. Loại bỏ QT4
- ❌ **QT4 (Quan trắc)** đã bị loại bỏ khỏi toàn bộ cấu hình
- **Lý do**: Trạm QT4 không có dữ liệu từ MQTT broker
- **File đã sửa**:
  - `mqtt_client.js` - DEVICE_NAME_MAP
  - `mqtt-coordinates.js` - MQTT_STATION_COORDINATES
  - `monitor-mqtt-telemetry.js`
  - `list-active-mqtt-stations.js`
  - `check-mqtt-stations.js`

### 2. Số lượng trạm sau khi fix
- **14 device codes** trong DEVICE_NAME_MAP
- **13 trạm duy nhất** (QT2 và QT2M là cùng 1 trạm)
- **13 trạm có dữ liệu** trong data_mqtt.json

## ⚠️ VẤN ĐỀ CÒN LẠI

### LUULUONG1 (TRẠM ĐO LƯU LƯỢNG 1) - Cần xem xét

**Vấn đề 1: Tọa độ trùng với QT1-NM2**
- LUULUONG1: `9.205658, 105.12963`
- QT1_NM2: `9.205658, 105.12963` (TRÙNG!)
- Hai trạm này hiển thị chồng lên nhau trên bản đồ

**Vấn đề 2: Dữ liệu MQTT không chuẩn**
- Tag MQTT: chỉ có `LUULUONG1` (không có parameter type)
- Giá trị: `73` (không có tên thông số, không có đơn vị)
- Các trạm khác có format: `DEVICECODE_PARAMETERTYPE` (VD: `G30A_LUULUONG`)

**Đề xuất giải pháp:**

**Phương án 1: Loại bỏ LUULUONG1**
- Vì dữ liệu không chuẩn và tọa độ trùng
- Giữ lại QT1-NM2 (dữ liệu chuẩn hơn)

**Phương án 2: Cập nhật tọa độ LUULUONG1**
- Cần biết vị trí thực tế của trạm đo lưu lượng
- Sửa tag MQTT từ thiết bị để có format chuẩn `LUULUONG1_LUULUONG`

## 📊 DANH SÁCH 13 TRẠM HOẠT ĐỘNG

1. ✅ G15 - GIẾNG SỐ 15
2. ✅ G18 - GIẾNG SỐ 18
3. ✅ G29A - GIẾNG SỐ 29A
4. ✅ G30A - GIẾNG SỐ 30A
5. ✅ G31B - GIẾNG SỐ 31B
6. ✅ GS1_NM2 - NHÀ MÁY SỐ 1 - GIẾNG SỐ 2
7. ✅ GS2_NM1 - NHÀ MÁY SỐ 2 - GIẾNG SỐ 1
8. ✅ GTACVAN - GIẾNG TẮC VẠN
9. ✅ QT1_NM2 - QT1-NM2 (Quan trắc NM2)
10. ✅ QT2/QT2M - QT2 (182/GP-BTNMT)
11. ✅ QT2_NM2 - QT2-NM2 (Quan trắc NM2)
12. ✅ QT5 - QT5 (Quan trắc)
13. ⚠️ LUULUONG1 - TRẠM ĐO LƯU LƯỢNG 1 (có vấn đề)

## 🔧 SCRIPT ĐÃ TẠO

- `verify-mqtt-config.js` - Kiểm tra cấu hình
- `monitor-mqtt-telemetry.js` - Giám sát MQTT broker
- `list-active-mqtt-stations.js` - Liệt kê trạm hoạt động
- `check-mqtt-stations.js` - Kiểm tra trạm và tọa độ
- `check-qt4.js` - Kiểm tra QT4 (không cần nữa)

## 🎯 KHUYẾN NGHỊ TIẾP THEO

1. **Quyết định về LUULUONG1**: Loại bỏ hoặc cập nhật tọa độ?
2. **Kiểm tra thiết bị MQTT**: Đảm bảo tất cả thiết bị gửi tag đúng format
3. **Test hệ thống**: Khởi động lại server và kiểm tra bản đồ
