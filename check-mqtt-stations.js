const { MQTT_STATION_COORDINATES } = require('./mqtt-coordinates');

// Check for duplicate coordinates
const coordMap = new Map();
const duplicates = [];

for (const [stationName, coords] of Object.entries(MQTT_STATION_COORDINATES)) {
    const key = `${coords.lat},${coords.lng}`;
    if (coordMap.has(key)) {
        duplicates.push({
            coord: key,
            stations: [coordMap.get(key), stationName]
        });
    } else {
        coordMap.set(key, stationName);
    }
}

console.log('📊 KIỂM TRA TRẠM MQTT\n');
console.log(`Tổng số entry trong MQTT_STATION_COORDINATES: ${Object.keys(MQTT_STATION_COORDINATES).length}`);

// Count unique device codes vs full names
const deviceCodes = Object.keys(MQTT_STATION_COORDINATES).filter(k => !k.includes(' ') && !k.includes('('));
const fullNames = Object.keys(MQTT_STATION_COORDINATES).filter(k => k.includes(' ') || k.includes('('));

console.log(`\n📍 Phân loại:`);
console.log(`  - Device codes: ${deviceCodes.length}`);
console.log(`  - Full names: ${fullNames.length}`);

if (duplicates.length > 0) {
    console.log('\n⚠️  CẢNH BÁO: Phát hiện các trạm có cùng tọa độ:\n');
    duplicates.forEach((dup, i) => {
        console.log(`${i + 1}. Tọa độ: ${dup.coord}`);
        dup.stations.forEach(s => console.log(`   - ${s}`));
        console.log();
    });
} else {
    console.log('\n✅ Không có trạm nào bị trùng tọa độ');
}

// Check specific stations
console.log('\n🔍 KIỂM TRA CÁC TRẠM CỤ THỂ:\n');

const stationsToCheck = [
    'LUULUONG1',
    'TRẠM ĐO LƯU LƯỢNG 1',
    'QT1_NM2',
    'QT1-NM2 (Quan trắc NM2)'
];

stationsToCheck.forEach(station => {
    const coords = MQTT_STATION_COORDINATES[station];
    if (coords) {
        console.log(`✓ ${station}`);
        console.log(`  Tọa độ: ${coords.lat}, ${coords.lng}\n`);
    } else {
        console.log(`✗ ${station} - KHÔNG TÌM THẤY\n`);
    }
});

// Load DEVICE_NAME_MAP from mqtt_client.js
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

console.log('\n📋 DANH SÁCH TRẠM MQTT (theo DEVICE_NAME_MAP):\n');
let index = 1;
for (const [deviceCode, fullName] of Object.entries(DEVICE_NAME_MAP)) {
    const coords = MQTT_STATION_COORDINATES[deviceCode];
    if (coords) {
        console.log(`${index}. ${fullName} (${deviceCode})`);
        console.log(`   📍 ${coords.lat}, ${coords.lng}`);
        index++;
    } else {
        console.log(`${index}. ${fullName} (${deviceCode}) - ⚠️ THIẾU TỌA ĐỘ`);
        index++;
    }
}

console.log(`\n📊 Tổng số trạm MQTT: ${Object.keys(DEVICE_NAME_MAP).length}`);
