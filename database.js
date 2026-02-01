const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tạo hoặc mở database
const dbPath = path.join(__dirname, 'water_monitoring.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Lỗi kết nối database:', err.message);
    } else {
        console.log('✅ Đã kết nối tới SQLite database:', dbPath);
    }
});

/**
 * Khởi tạo các bảng trong database
 */
function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Bảng lưu dữ liệu TVA
            db.run(`
                CREATE TABLE IF NOT EXISTS tva_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    station_name TEXT NOT NULL,
                    station_id TEXT NOT NULL,
                    parameter_name TEXT NOT NULL,
                    value REAL,
                    unit TEXT,
                    timestamp DATETIME NOT NULL,
                    update_time TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Lỗi tạo bảng tva_data:', err.message);
                } else {
                    console.log('✅ Bảng tva_data đã sẵn sàng');
                    // Tạo indexes
                    db.run('CREATE INDEX IF NOT EXISTS idx_tva_station ON tva_data(station_name)');
                    db.run('CREATE INDEX IF NOT EXISTS idx_tva_timestamp ON tva_data(timestamp)');
                    db.run('CREATE INDEX IF NOT EXISTS idx_tva_parameter ON tva_data(parameter_name)');
                }
            });

            // Bảng lưu dữ liệu MQTT
            db.run(`
                CREATE TABLE IF NOT EXISTS mqtt_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    station_name TEXT NOT NULL,
                    station_id TEXT NOT NULL,
                    device_name TEXT,
                    parameter_name TEXT NOT NULL,
                    value REAL,
                    unit TEXT,
                    timestamp DATETIME NOT NULL,
                    update_time TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Lỗi tạo bảng mqtt_data:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Bảng mqtt_data đã sẵn sàng');
                    // Tạo indexes
                    db.run('CREATE INDEX IF NOT EXISTS idx_mqtt_station ON mqtt_data(station_name)');
                    db.run('CREATE INDEX IF NOT EXISTS idx_mqtt_timestamp ON mqtt_data(timestamp)');
                    db.run('CREATE INDEX IF NOT EXISTS idx_mqtt_parameter ON mqtt_data(parameter_name)');
                    resolve();
                }
            });

            // Bảng lưu thông tin trạm
            db.run(`
                CREATE TABLE IF NOT EXISTS stations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    station_id TEXT UNIQUE NOT NULL,
                    station_name TEXT NOT NULL,
                    station_type TEXT NOT NULL,
                    latitude REAL,
                    longitude REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Lỗi tạo bảng stations:', err.message);
                } else {
                    console.log('✅ Bảng stations đã sẵn sàng');
                }
            });
        });
    });
}

/**
 * Lưu dữ liệu TVA vào database
 */
function saveTVAData(stations) {
    return new Promise((resolve, reject) => {
        if (!stations || stations.length === 0) {
            resolve(0);
            return;
        }

        const timestamp = new Date().toISOString();
        let savedCount = 0;
        let errors = [];

        db.serialize(() => {
            const stmt = db.prepare(`
                INSERT INTO tva_data (station_name, station_id, parameter_name, value, unit, timestamp, update_time)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            stations.forEach(station => {
                const stationId = `tva_${station.station.replace(/\s+/g, '_')}`;
                
                // Lưu thông tin trạm
                saveStationInfo(stationId, station.station, 'TVA', null, null);

                // Lưu từng thông số
                if (station.data && Array.isArray(station.data)) {
                    station.data.forEach(param => {
                        stmt.run(
                            station.station,
                            stationId,
                            param.name,
                            param.value,
                            param.unit,
                            timestamp,
                            station.updateTime || timestamp,
                            (err) => {
                                if (err) {
                                    errors.push(`${station.station} - ${param.name}: ${err.message}`);
                                } else {
                                    savedCount++;
                                }
                            }
                        );
                    });
                }
            });

            stmt.finalize((err) => {
                if (err) {
                    reject(err);
                } else {
                    if (errors.length > 0) {
                        console.warn(`⚠️ Có ${errors.length} lỗi khi lưu dữ liệu TVA`);
                    }
                    resolve(savedCount);
                }
            });
        });
    });
}

/**
 * Lưu dữ liệu MQTT vào database
 */
function saveMQTTData(stations) {
    return new Promise((resolve, reject) => {
        if (!stations || stations.length === 0) {
            resolve(0);
            return;
        }

        const timestamp = new Date().toISOString();
        let savedCount = 0;
        let errors = [];

        db.serialize(() => {
            const stmt = db.prepare(`
                INSERT INTO mqtt_data (station_name, station_id, device_name, parameter_name, value, unit, timestamp, update_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            stations.forEach(station => {
                const stationId = `mqtt_${station.station.replace(/\s+/g, '_')}`;
                
                // Lưu thông tin trạm
                saveStationInfo(stationId, station.station, 'MQTT', station.lat, station.lng);

                // Lưu từng thông số
                if (station.data && Array.isArray(station.data)) {
                    station.data.forEach(param => {
                        stmt.run(
                            station.station,
                            stationId,
                            station.deviceName || '',
                            param.name,
                            param.value,
                            param.unit,
                            timestamp,
                            station.updateTime || timestamp,
                            (err) => {
                                if (err) {
                                    errors.push(`${station.station} - ${param.name}: ${err.message}`);
                                } else {
                                    savedCount++;
                                }
                            }
                        );
                    });
                }
            });

            stmt.finalize((err) => {
                if (err) {
                    reject(err);
                } else {
                    if (errors.length > 0) {
                        console.warn(`⚠️ Có ${errors.length} lỗi khi lưu dữ liệu MQTT`);
                    }
                    resolve(savedCount);
                }
            });
        });
    });
}

/**
 * Lưu hoặc cập nhật thông tin trạm
 */
function saveStationInfo(stationId, stationName, stationType, lat, lng) {
    db.run(`
        INSERT INTO stations (station_id, station_name, station_type, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(station_id) DO UPDATE SET
            station_name = excluded.station_name,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            updated_at = CURRENT_TIMESTAMP
    `, [stationId, stationName, stationType, lat, lng], (err) => {
        if (err) {
            console.error(`❌ Lỗi lưu thông tin trạm ${stationId}:`, err.message);
        }
    });
}

/**
 * Lấy dữ liệu thống kê từ database
 */
function getStatsData(options) {
    return new Promise((resolve, reject) => {
        const {
            stationIds = [],
            stationType = 'all', // 'all', 'TVA', 'MQTT'
            parameterName = 'all',
            startDate,
            endDate,
            limit = 10000
        } = options;

        let queries = [];
        let params = [];

        // Build separate queries for TVA and MQTT
        if (stationType === 'all' || stationType === 'TVA') {
            let tvaQuery = 'SELECT *, "TVA" as source FROM tva_data WHERE 1=1';
            let tvaParams = [];
            
            if (stationIds.length > 0) {
                const placeholders = stationIds.map(() => '?').join(',');
                tvaQuery += ` AND station_id IN (${placeholders})`;
                tvaParams.push(...stationIds);
            }
            
            if (parameterName !== 'all') {
                tvaQuery += ` AND LOWER(parameter_name) = LOWER(?)`;
                tvaParams.push(parameterName);
            }
            
            if (startDate) {
                tvaQuery += ` AND timestamp >= ?`;
                tvaParams.push(startDate);
            }
            
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setDate(endDateTime.getDate() + 1);
                tvaQuery += ` AND timestamp < ?`;
                tvaParams.push(endDateTime.toISOString());
            }
            
            queries.push({ query: tvaQuery, params: tvaParams });
        }

        if (stationType === 'all' || stationType === 'MQTT') {
            let mqttQuery = 'SELECT *, "MQTT" as source FROM mqtt_data WHERE 1=1';
            let mqttParams = [];
            
            if (stationIds.length > 0) {
                const placeholders = stationIds.map(() => '?').join(',');
                mqttQuery += ` AND station_id IN (${placeholders})`;
                mqttParams.push(...stationIds);
            }
            
            if (parameterName !== 'all') {
                mqttQuery += ` AND LOWER(parameter_name) = LOWER(?)`;
                mqttParams.push(parameterName);
            }
            
            if (startDate) {
                mqttQuery += ` AND timestamp >= ?`;
                mqttParams.push(startDate);
            }
            
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setDate(endDateTime.getDate() + 1);
                mqttQuery += ` AND timestamp < ?`;
                mqttParams.push(endDateTime.toISOString());
            }
            
            queries.push({ query: mqttQuery, params: mqttParams });
        }

        // Execute queries and combine results
        const allResults = [];
        let completed = 0;

        queries.forEach(({ query, params: queryParams }) => {
            db.all(query, queryParams, (err, rows) => {
                if (err) {
                    console.error('Query error:', err);
                } else {
                    allResults.push(...rows);
                }
                
                completed++;
                if (completed === queries.length) {
                    // Sort by timestamp and limit
                    allResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    resolve(allResults.slice(0, limit));
                }
            });
        });

        // Handle case when no queries
        if (queries.length === 0) {
            resolve([]);
        }
    });
}

/**
 * Lấy danh sách các thông số có sẵn
 */
function getAvailableParameters() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT parameter_name FROM (
                SELECT parameter_name FROM tva_data
                UNION
                SELECT parameter_name FROM mqtt_data
            ) ORDER BY parameter_name
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(r => r.parameter_name));
            }
        });
    });
}

/**
 * Lấy danh sách trạm từ database
 */
function getStations() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM stations ORDER BY station_name', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Xóa dữ liệu cũ (tùy chọn)
 */
function cleanOldData(daysToKeep = 90) {
    return new Promise((resolve, reject) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffISO = cutoffDate.toISOString();

        db.serialize(() => {
            db.run('DELETE FROM tva_data WHERE timestamp < ?', [cutoffISO]);
            db.run('DELETE FROM mqtt_data WHERE timestamp < ?', [cutoffISO], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

/**
 * Đóng kết nối database
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✅ Đã đóng kết nối database');
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    initDatabase,
    saveTVAData,
    saveMQTTData,
    getStatsData,
    getAvailableParameters,
    getStations,
    saveStationInfo,
    cleanOldData,
    closeDatabase
};
