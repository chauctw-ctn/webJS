// Tọa độ các trạm MQTT
const MQTT_STATION_COORDINATES = {
    // Device codes
    'QT1_NM2': { lat: 9.205658, lng: 105.12963 },
    'QT2_NM2': { lat: 9.203337, lng: 105.129712 },
    'QT2M': { lat: 9.179219, lng: 105.139376 },
    'QT5': { lat: 9.178642307966712, lng: 105.1542747288355 },
    'GS1_NM2': { lat: 9.205104, lng: 105.131994 },
    'GS2_NM1': { lat: 9.173416, lng: 105.209793 },
    'G15': { lat: 9.1835, lng: 105.152611 },
    'G18': { lat: 9.175669, lng: 105.170509 },
    'G31B': { lat: 9.206425975447889, lng: 105.16646383795273 },
    'GTACVAN': { lat: 9.163367389961877, lng: 105.25151245767171 },
    'G29A': { lat: 9.14649, lng: 105.139282 },
    'G30A': { lat: 9.165363, lng: 105.157047 },
    'QT2': { lat: 9.179219, lng: 105.139376 },  // Same as QT2M
    'LUULUONG1': { lat: 9.205658, lng: 105.12963 },  // Placeholder - update if different
    
    // Full station names (mapped from DEVICE_NAME_MAP)
    'GIẾNG SỐ 15': { lat: 9.1835, lng: 105.152611 },
    'GIẾNG SỐ 18': { lat: 9.175669, lng: 105.170509 },
    'GIẾNG SỐ 29A': { lat: 9.14649, lng: 105.139282 },
    'GIẾNG SỐ 30A': { lat: 9.165363, lng: 105.157047 },
    'GIẾNG SỐ 31B': { lat: 9.206425975447889, lng: 105.16646383795273 },
    'NHÀ MÁY SỐ 1 - GIẾNG SỐ 2': { lat: 9.205104, lng: 105.131994 },
    'NHÀ MÁY SỐ 2 - GIẾNG SỐ 1': { lat: 9.173416, lng: 105.209793 },
    'GIẾNG TẮC VẠN': { lat: 9.163367389961877, lng: 105.25151245767171 },
    'QT1-NM2 (Quan trắc NM2)': { lat: 9.205658, lng: 105.12963 },
    'QT2 (182/GP-BTNMT)': { lat: 9.179219, lng: 105.139376 },
    'QT2-NM2 (Quan trắc NM2)': { lat: 9.203337, lng: 105.129712 },
    'QT5 (Quan trắc)': { lat: 9.178642307966712, lng: 105.1542747288355 }
};

module.exports = { MQTT_STATION_COORDINATES };
