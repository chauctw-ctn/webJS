// Smooth page transition để header không bị nhảy khi chuyển trang
(function() {
    'use strict';

    // Thêm smooth transition khi chuyển trang
    function smoothPageTransition(url) {
        // Collapse dashboard menu nếu đang mở
        const dashboardBtn = document.getElementById('dashboard-btn');
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardBtn && dashboardContent) {
            dashboardBtn.classList.remove('expanded');
            dashboardBtn.classList.remove('active');
            dashboardContent.classList.remove('active');
            dashboardContent.style.display = 'none';
        }
        
        // Close user dropdown if open
        const userDropdown = document.getElementById('user-dropdown');
        const userMenuBtn = document.getElementById('user-menu-btn');
        if (userDropdown) userDropdown.classList.remove('show');
        if (userMenuBtn) userMenuBtn.classList.remove('active');
        
        // Thêm class transitioning
        document.body.classList.add('page-transitioning');
        
        // Đợi animation hoàn thành rồi chuyển trang
        setTimeout(() => {
            window.location.href = url;
        }, 200);
    }

    // Intercept tất cả link clicks để thêm smooth transition
    document.addEventListener('DOMContentLoaded', function() {
        // Add loading class immediately
        document.body.classList.add('loading');

        // Tìm tất cả các link nội bộ
        const links = document.querySelectorAll('a[href^="/"]:not([target="_blank"]), a[href$=".html"]:not([target="_blank"])');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Chỉ áp dụng cho link nội bộ
                if (href && !href.startsWith('http') && !this.hasAttribute('target')) {
                    e.preventDefault();
                    smoothPageTransition(href);
                }
            });
        });

        // Xử lý nút "back" của browser
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                document.body.classList.remove('page-transitioning');
                document.body.classList.remove('loading');
            }
        });
    });

    // Export để sử dụng programmatically
    window.smoothNavigate = smoothPageTransition;
})();
