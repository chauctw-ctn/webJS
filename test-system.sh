#!/bin/bash
# Script kiểm tra toàn bộ hệ thống MQTT sau khi fix

echo "========================================="
echo "KIỂM TRA HỆ THỐNG MQTT SAU KHI FIX"
echo "========================================="
echo ""

echo "1. Kiểm tra cấu hình..."
node verify-mqtt-config.js

echo ""
echo "========================================="
echo "2. Khởi động lại MQTT client..."
echo "========================================="
echo ""
echo "Nhấn Ctrl+C để dừng sau vài giây khi thấy dữ liệu..."
echo ""

# Khởi động mqtt_client.js trong nền
node mqtt_client.js
