const fs = require('fs');

console.log('📊 DANH SÁCH TRẠM MQTT ĐANG HOẠT ĐỘNG\n');

// Danh sách trạm theo cấu hình
const DEVICE_NAME_MAP = {
    'G15': 'GIẾNG SỐ 15',
    'G18': 'GIẾNG SỐ 18',
    'G29A': 'GIẾNG SỐ 29A',
    'G30A': 'GIẾNG SỐ 30A',
    'G31B': 'GIẾNG SỐ 31B',
    'GS1_NM2': 'NHÀ MÁY SỐ 1 - GIẾNG SỐ 2',
    'GS2_NM1': 'NHÀ MÁY SỐ 2 - GIẾNG SỐ 1',
    'GTACVAN': 'GIẾNG TẮC VẠN',
    'QT1_NM2': 'QT1-NM2 (Quan trắc NM2)',
    'QT2': 'QT2 (182/GP-BTNMT)',
    'QT2_NM2': 'QT2-NM2 (Quan trắc NM2)',
    'QT2M': 'QT2 (182/GP-BTNMT)',
    'QT5': 'QT5 (Quan trắc)'
};

// Đọc dữ liệu thực tế
try {
    const data = JSON.parse(fs.readFileSync('data_mqtt.json', 'utf8'));
    
    console.log(`Timestamp: ${data.timestamp}`);
    console.log(`Tổng số trạm trong file: ${data.totalStations}\n`);
    
    console.log('=' .repeat(70));
    console.log('TRẠM ĐANG CÓ DỮ LIỆU:');
    console.log('='.repeat(70) + '\n');
    
    if (data.stations && data.stations.length > 0) {
        data.stations.forEach((station, index) => {
            console.log(`${index + 1}. ${station.station}`);
            console.log(`   📍 Tọa độ: ${station.lat}, ${station.lng}`);
            console.log(`   🕐 Cập nhật: ${station.updateTime}`);
            console.log(`   📊 Số thông số: ${station.data?.length || 0}`);
            console.log();
        });
    } else {
        console.log('   ❌ Không có trạm nào\n');
    }
    
    console.log('='.repeat(70));
    console.log('SO SÁNH VỚI CẤU HÌNH:');
    console.log('='.repeat(70) + '\n');
    
    const activeStations = new Set();
    data.stations?.forEach(s => {
        activeStations.add(s.station);
    });
    
    console.log(`📋 Tổng số trạm trong cấu hình: ${Object.keys(DEVICE_NAME_MAP).length}`);
    console.log(`✅ Trạm đang có dữ liệu: ${activeStations.size}`);
    console.log(`❌ Trạm KHÔNG có dữ liệu: ${Object.keys(DEVICE_NAME_MAP).length - activeStations.size}\n`);
    
    console.log('TRẠM KHÔNG CÓ DỮ LIỆU:\n');
    
    const missingStations = [];
    for (const [deviceCode, fullName] of Object.entries(DEVICE_NAME_MAP)) {
        if (!activeStations.has(fullName)) {
            missingStations.push({ deviceCode, fullName });
        }
    }
    
    if (missingStations.length > 0) {
        missingStations.forEach((station, index) => {
            console.log(`${index + 1}. ${station.fullName} (${station.deviceCode})`);
        });
    } else {
        console.log('   ✅ Tất cả trạm đều có dữ liệu');
    }
    
} catch (error) {
    console.error('❌ Lỗi:', error.message);
}
