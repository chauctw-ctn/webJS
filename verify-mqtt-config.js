const fs = require('fs');
const { MQTT_STATION_COORDINATES } = require('./mqtt-coordinates');

// DEVICE_NAME_MAP từ mqtt_client.js
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

console.log('='.repeat(70));
console.log('KIỂM TRA CẤU HÌNH DỰ ÁN SAU KHI FIX');
console.log('='.repeat(70) + '\n');

// 1. Kiểm tra số lượng trạm
console.log('📊 1. SỐ LƯỢNG TRẠM:');
console.log(`   Tổng số trạm trong DEVICE_NAME_MAP: ${Object.keys(DEVICE_NAME_MAP).length}`);

// Loại bỏ trùng lặp (QT2 và QT2M)
const uniqueStations = new Set(Object.values(DEVICE_NAME_MAP));
console.log(`   Số trạm duy nhất (loại bỏ trùng): ${uniqueStations.size}\n`);

// 2. Kiểm tra tọa độ
console.log('📍 2. KIỂM TRA TỌA ĐỘ:');
const stationsWithoutCoords = [];
const stationsWithSameCoords = new Map();

for (const [deviceCode, fullName] of Object.entries(DEVICE_NAME_MAP)) {
    const coords = MQTT_STATION_COORDINATES[deviceCode];
    
    if (!coords) {
        stationsWithoutCoords.push({ deviceCode, fullName });
    } else {
        const key = `${coords.lat},${coords.lng}`;
        if (!stationsWithSameCoords.has(key)) {
            stationsWithSameCoords.set(key, []);
        }
        stationsWithSameCoords.get(key).push({ deviceCode, fullName });
    }
}

if (stationsWithoutCoords.length > 0) {
    console.log('   ❌ Trạm THIẾU tọa độ:');
    stationsWithoutCoords.forEach(s => {
        console.log(`      - ${s.deviceCode}: ${s.fullName}`);
    });
} else {
    console.log('   ✅ Tất cả trạm đều có tọa độ');
}

// 3. Kiểm tra tọa độ trùng (vấn đề)
console.log('\n⚠️  3. TRẠM CÓ CÙNG TỌA ĐỘ (VẤN ĐỀ):');
const problemCoords = [];
for (const [coord, stations] of stationsWithSameCoords.entries()) {
    if (stations.length > 1) {
        // Bỏ qua trường hợp QT2 và QT2M (đây là cùng 1 trạm)
        const deviceCodes = stations.map(s => s.deviceCode);
        if (deviceCodes.includes('QT2') && deviceCodes.includes('QT2M') && stations.length === 2) {
            continue; // OK - đây là trùng hợp lệ
        }
        problemCoords.push({ coord, stations });
    }
}

if (problemCoords.length > 0) {
    problemCoords.forEach((item, index) => {
        console.log(`\n   ${index + 1}. Tọa độ: ${item.coord}`);
        item.stations.forEach(s => {
            console.log(`      - ${s.deviceCode}: ${s.fullName}`);
        });
    });
} else {
    console.log('   ✅ Không có vấn đề về tọa độ trùng\n');
}

// 4. Danh sách trạm cuối cùng
console.log(`\n📋 4. DANH SÁCH TRẠM MQTT (${Object.keys(DEVICE_NAME_MAP).length} device codes):`);
console.log('='.repeat(70));

const sortedDevices = Object.entries(DEVICE_NAME_MAP).sort((a, b) => 
    a[0].localeCompare(b[0])
);

sortedDevices.forEach(([deviceCode, fullName], index) => {
    const coords = MQTT_STATION_COORDINATES[deviceCode];
    const coordStr = coords ? `${coords.lat}, ${coords.lng}` : '❌ THIẾU TỌA ĐỘ';
    console.log(`${String(index + 1).padStart(2)}. ${deviceCode.padEnd(15)} → ${fullName}`);
    console.log(`    📍 ${coordStr}`);
});

// 5. Kiểm tra dữ liệu thực tế
console.log('\n\n📊 5. DỮ LIỆU THỰC TẾ (data_mqtt.json):');
console.log('='.repeat(70));

try {
    const data = JSON.parse(fs.readFileSync('data_mqtt.json', 'utf8'));
    console.log(`Tổng số trạm có dữ liệu: ${data.totalStations}`);
    console.log(`Timestamp: ${data.timestamp}\n`);
    
    const activeStations = new Set();
    data.stations?.forEach(s => activeStations.add(s.station));
    
    const missingStations = [];
    for (const [deviceCode, fullName] of Object.entries(DEVICE_NAME_MAP)) {
        if (!activeStations.has(fullName)) {
            missingStations.push({ deviceCode, fullName });
        }
    }
    
    if (missingStations.length > 0) {
        console.log('❌ Trạm KHÔNG có dữ liệu:');
        missingStations.forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.deviceCode}: ${s.fullName}`);
        });
    } else {
        console.log('✅ Tất cả trạm đều có dữ liệu');
    }
    
} catch (error) {
    console.log(`❌ Lỗi đọc file: ${error.message}`);
}

console.log('\n' + '='.repeat(70));
console.log('✅ HOÀN TẤT KIỂM TRA');
console.log('='.repeat(70));
