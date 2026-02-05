const fs = require('fs');

console.log('🔍 KIỂM TRA TRẠM QT4\n');

// Check in DEVICE_NAME_MAP
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
    'QT4': 'QT4 (Quan trắc)',
    'QT5': 'QT5 (Quan trắc)',
    'LUULUONG1': 'TRẠM ĐO LƯU LƯỢNG 1'
};

console.log('📋 1. DEVICE_NAME_MAP:');
if (DEVICE_NAME_MAP['QT4']) {
    console.log(`   ✅ Có QT4: "${DEVICE_NAME_MAP['QT4']}"\n`);
} else {
    console.log('   ❌ KHÔNG có QT4\n');
}

// Check in mqtt-coordinates.js
const { MQTT_STATION_COORDINATES } = require('./mqtt-coordinates');

console.log('📍 2. MQTT_STATION_COORDINATES:');
if (MQTT_STATION_COORDINATES['QT4']) {
    const coords = MQTT_STATION_COORDINATES['QT4'];
    console.log(`   ✅ Có QT4: lat=${coords.lat}, lng=${coords.lng}\n`);
} else {
    console.log('   ❌ KHÔNG có QT4\n');
}

// Check in data_mqtt.json
console.log('📊 3. DỮ LIỆU MQTT (data_mqtt.json):');
try {
    const data = JSON.parse(fs.readFileSync('data_mqtt.json', 'utf8'));
    
    console.log(`   Timestamp: ${data.timestamp}`);
    console.log(`   Tổng số trạm: ${data.totalStations}\n`);
    
    // Tìm QT4 trong stations
    const qt4Station = data.stations?.find(s => 
        s.station === 'QT4 (Quan trắc)' || 
        s.station.includes('QT4')
    );
    
    if (qt4Station) {
        console.log('   ✅ CÓ dữ liệu QT4:');
        console.log(`      Tên: ${qt4Station.station}`);
        console.log(`      Cập nhật: ${qt4Station.updateTime}`);
        console.log(`      Tọa độ: ${qt4Station.lat}, ${qt4Station.lng}`);
        console.log(`      Số thông số: ${qt4Station.data?.length || 0}`);
        if (qt4Station.data && qt4Station.data.length > 0) {
            console.log('      Dữ liệu:');
            qt4Station.data.forEach(d => {
                console.log(`        - ${d.name || 'N/A'}: ${d.value} ${d.unit}`);
            });
        }
    } else {
        console.log('   ❌ KHÔNG có dữ liệu QT4 trong stations');
    }
    
    // Tìm trong deviceGroups
    console.log('\n   DeviceGroups:');
    if (data.deviceGroups && data.deviceGroups['QT4']) {
        console.log('   ✅ CÓ QT4 trong deviceGroups:');
        const qt4 = data.deviceGroups['QT4'];
        console.log(`      Last update: ${qt4.lastUpdate}`);
        console.log(`      Parameters: ${Object.keys(qt4.parameters).join(', ')}`);
    } else {
        console.log('   ❌ KHÔNG có QT4 trong deviceGroups');
    }
    
} catch (error) {
    console.log(`   ❌ Lỗi đọc file: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('📝 KẾT LUẬN:\n');

const hasInMap = !!DEVICE_NAME_MAP['QT4'];
const hasCoords = !!MQTT_STATION_COORDINATES['QT4'];

console.log(`QT4 trong cấu hình: ${hasInMap && hasCoords ? '✅ CÓ' : '❌ KHÔNG'}`);
console.log(`QT4 trong dữ liệu thực tế: Xem phần 3 ở trên`);
