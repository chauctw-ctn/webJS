/**
 * Script để in dữ liệu từ TVA và MQTT
 * 
 * Cách sử dụng:
 * node print_data.js         - In tất cả dữ liệu
 * node print_data.js tva     - In dữ liệu TVA
 * node print_data.js mqtt    - In dữ liệu MQTT
 */

const { printTVAData, printMQTTData, printAllData } = require('./mqtt_client');

// Lấy tham số từ command line
const arg = process.argv[2];

if (arg === 'tva') {
    // In chỉ dữ liệu TVA
    printTVAData();
} else if (arg === 'mqtt') {
    // In chỉ dữ liệu MQTT
    printMQTTData();
} else {
    // In tất cả dữ liệu
    printAllData();
}
