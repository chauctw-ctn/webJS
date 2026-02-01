// Global variables
let map;
let markers = [];
let allStations = [];
let currentFilter = 'all';

/**
 * Khởi tạo Leaflet Map
 */
function initMap() {
    // Tọa độ trung tâm Cà Mau
    const center = [9.177, 105.15];
    
    // Tạo map với OpenStreetMap
    map = L.map('map', {
        scrollWheelZoom: true,
        wheelPxPerZoomLevel: 120
    }).setView(center, 14);
    
    // Thêm tile layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20
    }).addTo(map);
    
    // Tải dữ liệu ban đầu
    loadStations();
    
    // Setup event listeners
    setupEventListeners();
}

/**
 * Tải dữ liệu các trạm từ API
 */
async function loadStations() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/stations');
        const data = await response.json();
        
        if (data.success) {
            allStations = data.stations;
            updateStats(data.stations);
            displayMarkers(data.stations);
            
            // Hiển thị thời gian cập nhật
            console.log(`✅ Đã tải ${data.totalStations} trạm - Cập nhật lúc: ${new Date(data.timestamp).toLocaleString('vi-VN')}`);
        } else {
            console.error('Lỗi tải dữ liệu:', data.error);
            alert('Không thể tải dữ liệu trạm: ' + data.error);
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        alert('Không thể kết nối đến server');
    } finally {
        showLoading(false);
    }
}

/**
 * Làm mới dữ liệu các trạm (cập nhật popup đang mở mà không tạo lại markers)
 */
async function refreshStations() {
    try {
        const response = await fetch('/api/stations');
        const data = await response.json();
        
        if (data.success) {
            // Cập nhật allStations
            allStations = data.stations;
            updateStats(data.stations);
            
            // Cập nhật nội dung popup cho từng marker đang mở
            markers.forEach(marker => {
                // Tìm station data mới cho marker này
                const newStationData = allStations.find(s => s.id === marker.stationId);
                
                if (newStationData) {
                    // Cập nhật station data trong marker
                    marker.stationData = newStationData;
                    
                    // Nếu popup đang mở, cập nhật nội dung
                    if (marker.isPopupOpen()) {
                        const newContent = createPopupContent(newStationData);
                        marker.getPopup().setContent(newContent);
                        
                        // Fix zoom cho popup sau khi update content
                        setTimeout(() => {
                            const popupEl = marker.getPopup().getElement();
                            if (popupEl) {
                                const parent = popupEl.parentElement;
                                if (parent) {
                                    L.DomEvent.off(parent, 'wheel');
                                    L.DomEvent.off(parent, 'mousewheel');
                                    L.DomEvent.off(popupEl, 'wheel');
                                    L.DomEvent.off(popupEl, 'mousewheel');
                                }
                            }
                        }, 50);
                    }
                }
            });
            
            console.log(`🔄 Làm mới dữ liệu: ${data.totalStations} trạm - ${new Date(data.timestamp).toLocaleString('vi-VN')}`);
        }
    } catch (error) {
        console.error('Lỗi làm mới dữ liệu:', error);
    }
}

/**
 * Hiển thị markers trên bản đồ
 */
function displayMarkers(stations) {
    // Xóa markers cũ
    clearMarkers();
    
    // Tạo mảng lưu tọa độ
    const bounds = [];
    
    // Tạo markers mới
    stations.forEach(station => {
        if (!station.lat || !station.lng) return;
        
        const position = [station.lat, station.lng];
        
        // Thêm vào bounds
        bounds.push(position);
        
        // Tạo custom icon
        const iconColor = station.type === 'TVA' ? '#10b981' : '#fbbf24';
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${iconColor}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        
        // Tạo marker
        const marker = L.marker(position, { icon: customIcon }).addTo(map);
        
        // Lưu thông tin station vào marker
        marker.stationId = station.id;
        marker.stationName = station.name;
        marker.stationData = station; // Lưu toàn bộ data để cập nhật sau
        
        // Tạo label (tooltip) hiển thị luôn
        const tooltip = marker.bindTooltip(station.name, {
            permanent: true,
            direction: 'top',
            offset: [0, -8],
            className: 'station-label'
        });
        
        // Tạo popup content (có tên trạm)
        const popupContent = createPopupContent(station);
        
        // Bind popup chỉ hiện khi click
        const popup = marker.bindPopup(popupContent, {
            className: 'custom-popup',
            maxWidth: 280,
            closeButton: true,
            autoClose: false,
            closeOnClick: false
        });
        
        // Lưu popup reference vào marker
        marker.popupInstance = marker.getPopup();
        
        // Ẩn tooltip khi popup mở
        marker.on('popupopen', function() {
            this.closeTooltip();
            // Cập nhật checkbox tương ứng
            updateStationCheckbox(station.id, true);
            
            // Fix zoom issue: cho phép scroll qua popup xuống map
            setTimeout(() => {
                const popupEl = this.getPopup().getElement();
                if (popupEl) {
                    // Loại bỏ tất cả scroll event listeners của Leaflet
                    const parent = popupEl.parentElement;
                    if (parent) {
                        L.DomEvent.off(parent, 'wheel');
                        L.DomEvent.off(parent, 'mousewheel');
                        L.DomEvent.off(popupEl, 'wheel');
                        L.DomEvent.off(popupEl, 'mousewheel');
                    }
                }
            }, 50);
        });
        
        // Hiện lại tooltip khi popup đóng
        marker.on('popupclose', function() {
            this.openTooltip();
            // Cập nhật checkbox tương ứng
            updateStationCheckbox(station.id, false);
        });
        
        markers.push(marker);
    });
    
    // Auto zoom vừa khít tất cả trạm
    if (bounds.length > 0) {
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 14
        });
    }
}

/**
 * Tạo nội dung popup giống hình mẫu
 */
function createPopupContent(station) {
    const stationType = station.type.toLowerCase();
    const stationClass = stationType;
    
    let html = `
        <div class="station-popup ${stationClass}">
            <div class="popup-header">${station.name}</div>
            <div class="popup-time">${station.updateTime}</div>
            <div class="popup-data">
    `;
    
    // Hiển thị các thông số
    if (station.data && station.data.length > 0) {
        station.data.forEach(param => {
            // Làm ngắn tên thông số
            let shortName = param.name;
            if (param.name.includes('Áp lực') || param.name.includes('Ap luc')) shortName = 'Áp lực';
            else if (param.name.includes('Lưu lượng')) shortName = 'Lưu lượng';
            else if (param.name.includes('Chỉ số')) shortName = 'Chỉ số đh';
            else if (param.name.includes('Mực nước')) shortName = 'Mực nước';
            else if (param.name.includes('Nhiệt độ')) shortName = 'Nhiệt độ';
            else if (param.name.includes('Tổng')) shortName = 'Tổng LL';
            
            html += `
                <div class="data-row">
                    <span class="data-label">${shortName}</span>
                    <span class="data-value ${stationClass}">${param.value} ${param.unit}</span>
                </div>
            `;
        });
    } else {
        html += '<div class="no-data">Không có dữ liệu</div>';
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Xóa tất cả markers
 */
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

/**
 * Cập nhật thống kê
 */
function updateStats(stations) {
    const tvaStations = stations.filter(s => s.type === 'TVA');
    const mqttStations = stations.filter(s => s.type === 'MQTT');
    
    document.getElementById('tva-count').textContent = tvaStations.length;
    document.getElementById('mqtt-count').textContent = mqttStations.length;
    document.getElementById('total-count').textContent = stations.length;
    
    // Populate station checkbox list
    populateStationCheckboxList(stations);
}

/**
 * Populate danh sách checkbox trạm trong sidebar
 */
function populateStationCheckboxList(stations) {
    const listContainer = document.getElementById('station-checkbox-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    stations.forEach(station => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'station-checkbox';
        checkbox.value = station.id;
        checkbox.dataset.stationId = station.id;
        
        const iconColor = station.type === 'TVA' ? 'tva' : 'mqtt';
        const span = document.createElement('span');
        span.innerHTML = `<span class="filter-dot ${iconColor}"></span> ${station.name}`;
        
        label.appendChild(checkbox);
        label.appendChild(span);
        listContainer.appendChild(label);
        
        // Event listener cho checkbox
        checkbox.addEventListener('change', (e) => {
            handleStationCheckboxChange(station.id, e.target.checked);
            updateStationAllCheckbox();
            updateStationDropdownDisplay();
        });
    });
    
    // Setup event listener cho checkbox "Tất cả"
    const stationAllCheckbox = document.getElementById('station-all-checkbox');
    if (stationAllCheckbox) {
        stationAllCheckbox.addEventListener('change', (e) => {
            handleStationAllCheckboxChange(e.target.checked);
        });
    }
    
    updateStationDropdownDisplay();
}

/**
 * Cập nhật text hiển thị của dropdown
 */
function updateStationDropdownDisplay() {
    const displayText = document.querySelector('#station-display .selected-text');
    if (!displayText) return;
    
    const checkboxes = document.querySelectorAll('.station-checkbox:checked');
    const count = checkboxes.length;
    const totalStations = document.querySelectorAll('.station-checkbox').length;
    
    if (count === 0) {
        displayText.textContent = 'Chọn trạm...';
    } else if (count === totalStations) {
        displayText.textContent = 'Tất cả trạm';
    } else if (count === 1) {
        const stationName = checkboxes[0].parentElement.querySelector('span:last-child').textContent.trim();
        displayText.textContent = stationName;
    } else {
        displayText.textContent = `Đã chọn ${count} trạm`;
    }
}

/**
 * Xử lý khi check/uncheck checkbox "Tất cả"
 */
function handleStationAllCheckboxChange(isChecked) {
    const checkboxes = document.querySelectorAll('.station-checkbox');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked !== isChecked) {
            checkbox.checked = isChecked;
            const stationId = checkbox.dataset.stationId;
            handleStationCheckboxChange(stationId, isChecked);
        }
    });
    
    updateStationDropdownDisplay();
}

/**
 * Cập nhật trạng thái checkbox "Tất cả" dựa trên các checkbox trạm
 */
function updateStationAllCheckbox() {
    const stationAllCheckbox = document.getElementById('station-all-checkbox');
    if (!stationAllCheckbox) return;
    
    const checkboxes = document.querySelectorAll('.station-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.station-checkbox:checked');
    
    // Nếu tất cả đều checked thì check "Tất cả", ngược lại thì uncheck
    stationAllCheckbox.checked = checkboxes.length > 0 && checkboxes.length === checkedCheckboxes.length;
}

/**
 * Xử lý khi check/uncheck checkbox trạm
 */
function handleStationCheckboxChange(stationId, isChecked) {
    // Tìm marker tương ứng
    const marker = markers.find(m => m.stationId === stationId);
    if (!marker) return;
    
    if (isChecked) {
        // Mở popup của trạm
        marker.openPopup();
    } else {
        // Đóng popup
        marker.closePopup();
    }
}

/**
 * Cập nhật trạng thái checkbox khi popup mở/đóng
 */
function updateStationCheckbox(stationId, isChecked) {
    const checkbox = document.querySelector(`.station-checkbox[data-station-id="${stationId}"]`);
    if (checkbox) {
        checkbox.checked = isChecked;
    }
}

/**
 * Lọc trạm theo checkboxes
 */
function filterStations() {
    const filterAll = document.getElementById('filter-all');
    const filterTva = document.getElementById('filter-tva');
    const filterMqtt = document.getElementById('filter-mqtt');
    
    let filteredStations = [];
    
    if (filterAll && filterAll.checked) {
        // Show all stations
        filteredStations = allStations;
    } else {
        // Filter based on individual checkboxes
        if (filterTva && filterTva.checked) {
            filteredStations = filteredStations.concat(allStations.filter(s => s.type === 'TVA'));
        }
        if (filterMqtt && filterMqtt.checked) {
            filteredStations = filteredStations.concat(allStations.filter(s => s.type === 'MQTT'));
        }
    }
    
    displayMarkers(filteredStations);
}

/**
 * Hiển thị/ẩn loading
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Menu button toggle sidebar
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const mapElement = document.getElementById('map');
    
    if (menuBtn && sidebar && mapElement) {
        menuBtn.addEventListener('click', () => {
            const isHidden = sidebar.classList.toggle('hidden');
            
            if (isHidden) {
                mapElement.classList.remove('with-sidebar');
            } else {
                mapElement.classList.add('with-sidebar');
            }
            
            // Resize map sau khi toggle
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                }
            }, 350);
        });
    }
    
    // Dashboard button - Already on dashboard, just ensure it's active
    const dashboardBtn = document.getElementById('dashboard-btn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            // Already on dashboard page, do nothing or refresh
            window.location.href = '/';
        });
    }
    
    // Stats toggle button - redirect to stats page
    const statsToggleBtn = document.getElementById('stats-toggle-btn');
    if (statsToggleBtn) {
        statsToggleBtn.addEventListener('click', () => {
            window.location.href = '/stats.html';
        });
    }
    
    // Station dropdown toggle
    const stationDisplay = document.getElementById('station-display');
    const stationDropdown = document.getElementById('station-dropdown');
    
    if (stationDisplay && stationDropdown) {
        stationDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            stationDropdown.classList.toggle('open');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!stationDropdown.contains(e.target) && !stationDisplay.contains(e.target)) {
                stationDropdown.classList.remove('open');
            }
        });
    }
    
    // Checkbox event listeners
    const filterAll = document.getElementById('filter-all');
    const filterTva = document.getElementById('filter-tva');
    const filterMqtt = document.getElementById('filter-mqtt');
    
    // "Tất cả" checkbox handler
    if (filterAll) {
        filterAll.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Check all other checkboxes
                if (filterTva) filterTva.checked = true;
                if (filterMqtt) filterMqtt.checked = true;
            }
            filterStations();
        });
    }
    
    // Individual checkbox handlers
    if (filterTva) {
        filterTva.addEventListener('change', () => {
            // Uncheck "Tất cả" if individual is unchecked
            if (!filterTva.checked && filterAll) {
                filterAll.checked = false;
            }
            // Check "Tất cả" if both are checked
            if (filterTva.checked && filterMqtt && filterMqtt.checked && filterAll) {
                filterAll.checked = true;
            }
            filterStations();
        });
    }
    
    if (filterMqtt) {
        filterMqtt.addEventListener('change', () => {
            // Uncheck "Tất cả" if individual is unchecked
            if (!filterMqtt.checked && filterAll) {
                filterAll.checked = false;
            }
            // Check "Tất cả" if both are checked
            if (filterMqtt.checked && filterTva && filterTva.checked && filterAll) {
                filterAll.checked = true;
            }
            filterStations();
        });
    }
    
    // Auto refresh dữ liệu mỗi 30 giây (MQTT realtime) và mỗi 2 phút (TVA)
    setInterval(() => {
        console.log('🔄 Tự động làm mới dữ liệu...');
        refreshStations();
    }, 30 * 1000); // 30 giây
}

// Khởi tạo map khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});
