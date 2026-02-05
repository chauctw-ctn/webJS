@echo off
REM Script kiểm tra toàn bộ hệ thống MQTT sau khi fix

echo =========================================
echo KIEM TRA HE THONG MQTT SAU KHI FIX
echo =========================================
echo.

echo 1. Kiem tra cau hinh...
node verify-mqtt-config.js

echo.
echo =========================================
echo 2. Khoi dong lai MQTT client...
echo =========================================
echo.
echo Nhan Ctrl+C de dung sau vai giay khi thay du lieu...
echo.

REM Khoi dong mqtt_client.js
node mqtt_client.js
