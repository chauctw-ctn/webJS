const mqtt = require('mqtt');

// Cấu hình MQTT
const MQTT_BROKER = 'mqtt://14.225.252.85';
const MQTT_PORT = 1883;
const MQTT_TOPIC = 'telemetry';

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

// Lưu các device đã phát hiện
const detectedDevices = new Map();
let messageCount = 0;
let startTime = Date.now();

console.log('🔍 GIÁM SÁT MQTT BROKER - TOPIC: telemetry');
console.log('='.repeat(70));
console.log(`Broker: ${MQTT_BROKER}:${MQTT_PORT}`);
console.log(`Thời gian giám sát: 30 giây`);
console.log('='.repeat(70) + '\n');

console.log('🔌 Đang kết nối...\n');

const client = mqtt.connect(MQTT_BROKER, {
    port: MQTT_PORT,
    clean: true,
    connectTimeout: 10000,
    clientId: 'monitor_' + Math.random().toString(16).substr(2, 8)
});

client.on('connect', () => {
    console.log('✅ Đã kết nối MQTT broker\n');
    
    client.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('❌ Lỗi subscribe:', err);
            process.exit(1);
        }
        console.log(`📡 Đã subscribe vào topic: ${MQTT_TOPIC}`);
        console.log('⏳ Đang lắng nghe dữ liệu...\n');
        console.log('='.repeat(70) + '\n');
    });
});

client.on('message', (topic, message) => {
    try {
        const messageStr = message.toString();
        
        // Bỏ qua message không hợp lệ
        if (!messageStr || !messageStr.startsWith('{')) {
            return;
        }
        
        const payload = JSON.parse(messageStr);
        
        if (!payload.d || !Array.isArray(payload.d)) {
            return;
        }
        
        messageCount++;
        const timestamp = payload.ts || new Date().toISOString();
        
        console.log(`📩 Message #${messageCount} - ${new Date(timestamp).toLocaleString('vi-VN')}`);
        console.log(`   Số thông số: ${payload.d.length}`);
        
        // Phân tích từng tag
        payload.d.forEach(item => {
            const tag = item.tag;
            const value = item.value;
            
            if (!tag) return;
            
            // Parse device code
            const parts = tag.split('_');
            let deviceCode = parts[0];
            let parameterType = parts.slice(1).join('_');
            
            // Xử lý trường hợp đặc biệt
            if (parts.length > 2 && (parts[0] === 'GS1' || parts[0] === 'GS2' || parts[0] === 'QT1' || parts[0] === 'QT2')) {
                deviceCode = parts[0] + '_' + parts[1];
                parameterType = parts.slice(2).join('_');
            }
            
            // Lưu device
            if (!detectedDevices.has(deviceCode)) {
                detectedDevices.set(deviceCode, {
                    deviceCode: deviceCode,
                    fullName: DEVICE_NAME_MAP[deviceCode] || 'KHÔNG XÁC ĐỊNH',
                    tags: new Set(),
                    firstSeen: timestamp,
                    lastSeen: timestamp,
                    messageCount: 0,
                    inConfig: !!DEVICE_NAME_MAP[deviceCode]
                });
            }
            
            const device = detectedDevices.get(deviceCode);
            device.tags.add(tag);
            device.lastSeen = timestamp;
            device.messageCount++;
            
            console.log(`   - ${tag} = ${value} [${deviceCode}]`);
        });
        
        console.log();
        
    } catch (error) {
        console.error('❌ Lỗi parse message:', error.message);
    }
});

client.on('error', (error) => {
    console.error('❌ Lỗi MQTT:', error.message);
});

// Timeout sau 30 giây
setTimeout(() => {
    console.log('\n' + '='.repeat(70));
    console.log('📊 KẾT QUẢ GIÁM SÁT');
    console.log('='.repeat(70) + '\n');
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Thời gian giám sát: ${elapsed} giây`);
    console.log(`📨 Tổng số message nhận được: ${messageCount}`);
    console.log(`🔢 Số device phát hiện: ${detectedDevices.size}\n`);
    
    if (detectedDevices.size > 0) {
        console.log('='.repeat(70));
        console.log('DANH SÁCH DEVICE ĐANG HOẠT ĐỘNG:');
        console.log('='.repeat(70) + '\n');
        
        let index = 1;
        const sortedDevices = Array.from(detectedDevices.values()).sort((a, b) => 
            a.deviceCode.localeCompare(b.deviceCode)
        );
        
        sortedDevices.forEach(device => {
            const status = device.inConfig ? '✅' : '⚠️ ';
            console.log(`${index}. ${status} ${device.deviceCode} - ${device.fullName}`);
            console.log(`   Tags: ${Array.from(device.tags).join(', ')}`);
            console.log(`   Lần đầu: ${new Date(device.firstSeen).toLocaleString('vi-VN')}`);
            console.log(`   Lần cuối: ${new Date(device.lastSeen).toLocaleString('vi-VN')}`);
            console.log(`   Số lần xuất hiện: ${device.messageCount}`);
            console.log();
            index++;
        });
        
        // Kiểm tra device nào thiếu
        console.log('='.repeat(70));
        console.log('SO SÁNH VỚI CẤU HÌNH:');
        console.log('='.repeat(70) + '\n');
        
        const activeDevices = new Set(detectedDevices.keys());
        const configDevices = Object.keys(DEVICE_NAME_MAP);
        
        console.log(`📋 Tổng số device trong cấu hình: ${configDevices.length}`);
        console.log(`✅ Device đang hoạt động: ${detectedDevices.size}`);
        
        const missingDevices = configDevices.filter(d => !activeDevices.has(d));
        console.log(`❌ Device KHÔNG hoạt động: ${missingDevices.length}\n`);
        
        if (missingDevices.length > 0) {
            console.log('DEVICE KHÔNG HOẠT ĐỘNG:\n');
            missingDevices.forEach((deviceCode, i) => {
                console.log(`${i + 1}. ${deviceCode} - ${DEVICE_NAME_MAP[deviceCode]}`);
            });
            console.log();
        }
        
        // Kiểm tra device không có trong config
        const unknownDevices = Array.from(detectedDevices.values()).filter(d => !d.inConfig);
        if (unknownDevices.length > 0) {
            console.log('⚠️  DEVICE KHÔNG CÓ TRONG CẤU HÌNH:\n');
            unknownDevices.forEach((device, i) => {
                console.log(`${i + 1}. ${device.deviceCode}`);
                console.log(`   Tags: ${Array.from(device.tags).join(', ')}`);
            });
        }
    } else {
        console.log('❌ Không phát hiện device nào trong thời gian giám sát');
    }
    
    console.log('\n' + '='.repeat(70));
    client.end();
    process.exit(0);
}, 30000);

// Ctrl+C handler
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Dừng giám sát...');
    client.end();
    process.exit(0);
});
