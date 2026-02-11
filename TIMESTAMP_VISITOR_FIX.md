# Timestamp Synchronization & Visitor Tracking - Hoàn tất ✅

## Tóm tắt các thay đổi mới nhất

### 1. Timestamp Synchronization (Đồng bộ timestamp)

**Vấn đề:**
- Các parameters của cùng một trạm đo cùng lúc nhưng có timestamp khác nhau
- Gây khó khăn trong phân tích dữ liệu và hiển thị

**Giải pháp:**
- Lấy `CURRENT_TIMESTAMP` một lần cho mỗi station
- Sử dụng timestamp đó cho TẤT CẢ parameters của station
- Đảm bảo tất cả dữ liệu cùng trạm cùng lúc có timestamp giống hệt nhau

**Code changes in [database.js](database.js):**
```javascript
// Lấy timestamp một lần cho toàn bộ station (đồng bộ tất cả parameters)
const stationTimestamp = (await client.query('SELECT CURRENT_TIMESTAMP as ts')).rows[0].ts;
const updateTime = stationTimestamp.toISOString();

// Lưu từng thông số với cùng timestamp
for (const param of station.data) {
    await client.query(
        `INSERT INTO tva_data (..., timestamp, update_time)
         VALUES (..., $6, $7)`,
        [..., stationTimestamp, updateTime]
    );
}
```

**Type mismatch fix:**
- Column `timestamp`: TIMESTAMPTZ (PostgreSQL native type)
- Column `update_time`: TEXT (legacy compatibility)
- Solution: Convert `stationTimestamp.toISOString()` cho update_time

**Test kết quả:**
```
✅ 5 parameters cùng timestamp: 2026-02-11T13:58:55.413Z
✅ Unique timestamps: 1 (perfect sync!)
```

### 2. Timezone Display Fix (Hiển thị múi giờ)

**Vấn đề:**
- Database lưu đúng GMT+7
- Frontend hiển thị theo timezone của browser
- User ở timezone khác sẽ thấy giờ sai

**Giải pháp:**
- Sử dụng `Intl.DateTimeFormat` với `timeZone: 'Asia/Ho_Chi_Minh'`
- Đảm bảo hiển thị luôn theo GMT+7 bất kể browser ở đâu

**Files changed:**
- [public/stats.js](public/stats.js) - `formatDate()`, `formatDateTime()`, `formatTime()`
- [public/scada.js](public/scada.js) - `updateLastUpdate()`
- [public/map.js](public/map.js) - `formatDateTime()`

**Before:**
```javascript
// Hiển thị theo timezone browser (sai!)
function formatDateTime(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');  // Browser timezone
    // ...
}
```

**After:**
```javascript
// Luôn hiển thị GMT+7 (đúng!)
function formatDateTime(date) {
    const d = new Date(date);
    const formatter = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',  // Force GMT+7
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    return formatter.format(d);
}
```

### 3. Visitor Tracking with Database

**Vấn đề:**
- Visitor count lưu trong RAM (in-memory)
- Bị reset mỗi khi restart server
- Không persistent

**Giải pháp:**
- Tạo bảng `visitor_stats` trong PostgreSQL
- Lưu `total_visitors` vào database
- `currentVisitors` và `todayVisitors` vẫn dùng RAM (real-time)

**Database Schema:**
```sql
CREATE TABLE visitor_stats (
    id SERIAL PRIMARY KEY,
    total_visitors BIGINT NOT NULL DEFAULT 20102347,
    today_date DATE NOT NULL DEFAULT CURRENT_DATE,
    today_visitors INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**Initial Count:** 20,102,347 lượt truy cập

**New Functions in [database.js](database.js):**
- `getVisitorStats()` - Lấy thống kê từ database
- `incrementVisitorCount()` - Tăng visitor count
- `setVisitorCount(total)` - Set visitor count (init/migration)

**Server Changes in [server.js](server.js):**
```javascript
// Before: RAM only
const visitorStats = {
    totalVisitors: 20102347  // Lost on restart!
};

// After: Database persistent
app.post('/api/visitors/register', async (req, res) => {
    if (!visitorStats.todayVisitors.has(sessionId)) {
        visitorStats.todayVisitors.add(sessionId);
        dbStats = await incrementVisitorCount();  // Save to DB
    }
});
```

**Features:**
- ✅ **Persistent:** Không bị reset khi restart
- ✅ **Auto reset:** `today_visitors` tự động reset mỗi ngày
- ✅ **Real-time:** `currentVisitors` vẫn track online users
- ✅ **Accurate:** Total count chính xác qua nhiều sessions

**Test:**
```bash
node test-visitor-db.js
```

Expected output:
```
✅ All tests passed!
📝 Summary:
   • Visitor count bắt đầu từ: 20,102,347
   • Dữ liệu được lưu trong PostgreSQL
   • Không bị reset khi restart server
   • Auto reset today_visitors mỗi ngày mới
```

## Timeline

| Date | Issue | Fixed |
|------|-------|-------|
| 2026-02-11 | Timestamp không đồng bộ giữa parameters | ✅ Sync timestamps |
| 2026-02-11 | Timezone hiển thị sai | ✅ Force GMT+7 display |
| 2026-02-11 | Visitor count bị reset | ✅ Database persistent |

## Testing

### Test timestamp sync:
```bash
node test-timestamp-sync.js
```

### Test visitor tracking:
```bash
node test-visitor-db.js
```

### Start server:
```bash
npm start
```

Check web interface:
- Map popups show correct GMT+7 time
- Stats table shows synchronized timestamps
- Visitor count persists across restarts

## Notes

1. **Timestamp columns:**
   - `timestamp` (TIMESTAMPTZ) - For queries and sorting
   - `update_time` (TEXT) - For legacy compatibility

2. **Timezone consistency:**
   - Database: Always GMT+7 (Asia/Ho_Chi_Minh)
   - Display: Always GMT+7 regardless of browser timezone

3. **Visitor tracking:**
   - Total count starts from 20,102,347
   - Increments only for new unique visitors each day
   - Current visitors = online users (RAM)
   - Today visitors = unique visitors today (RAM + DB check)
   - Total visitors = all-time count (PostgreSQL persistent)

---

✅ **All issues resolved!**

📊 System now has:
- Synchronized timestamps for multi-parameter stations
- Consistent GMT+7 timezone display
- Persistent visitor tracking in database
