// Page Protection Script
function protectPage() {
    const protectedPages = [
        'dashboard.html',
        'planner.html',
        'tasks.html',
        'focus.html',
        'habits.html',
        'notes.html',
        'analytics.html',
        'premium.html',
        'profile.html',
        'settings.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const user = JSON.parse(localStorage.getItem('dailyworkai_user'));
        const token = localStorage.getItem('dailyworkai_token');
        
        if (!user || !token) {
            // Not logged in, redirect to login
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return false;
        }
        
        return true;
    }
    
    return true;
}

// Check on page load
document.addEventListener('DOMContentLoaded', function() {
    protectPage();
    
    // Setup logout button if exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authManager.logout();
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
        });
    }
    
    if (mobileCloseBtn && mobileMenu) {
        mobileCloseBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        }
    });
});