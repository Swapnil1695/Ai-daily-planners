// common-header.js - Shared header functionality
class CommonHeader {
    constructor() {
        this.initDropdowns();
        this.initSearch();
        this.initNotifications();
    }

    initDropdowns() {
        // Profile dropdown
        const profileDropdown = document.getElementById('header-profile');
        const dropdownMenu = document.getElementById('profile-dropdown');
        
        if (profileDropdown && dropdownMenu) {
            profileDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }
        
        // Notification dropdown
        const notificationBell = document.querySelector('.notification-bell');
        const notificationPanel = document.querySelector('.notification-panel');
        
        if (notificationBell && notificationPanel) {
            notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationPanel.classList.toggle('show');
            });
            
            document.addEventListener('click', () => {
                notificationPanel.classList.remove('show');
            });
        }
    }

    initSearch() {
        const searchInput = document.querySelector('.search-box input');
        const searchButton = document.querySelector('.search-box button');
        
        if (searchInput && searchButton) {
            searchButton.addEventListener('click', () => this.performSearch(searchInput.value));
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }
    }

    performSearch(query) {
        if (!query.trim()) return;
        
        console.log('Searching for:', query);
        // In a real app, this would trigger a search
        alert(`Search functionality would search for: "${query}"`);
        
        // For demo purposes, show search results
        this.showSearchResults(query);
    }

    showSearchResults(query) {
        // This is a demo function
        const results = [
            { type: 'task', title: `Task related to "${query}"`, description: 'Found in your tasks' },
            { type: 'note', title: `Note about "${query}"`, description: 'Found in your notes' },
            { type: 'habit', title: `Habit "${query}"`, description: 'Found in your habits' }
        ];
        
        // Show results in a modal or dropdown
        console.log('Search results:', results);
    }

    initNotifications() {
        // Load notifications
        this.loadNotifications();
        
        // Set up notification polling
        setInterval(() => this.checkNewNotifications(), 30000); // Every 30 seconds
    }

    async loadNotifications() {
        const user = window.authManager?.getCurrentUser();
        if (!user) return;
        
        try {
            // In a real app, fetch from Firestore
            const notifications = [
                { id: 1, type: 'task', message: 'Task "Morning Routine" due soon', time: '5 min ago', read: false },
                { id: 2, type: 'system', message: 'Welcome to Daily Work AI!', time: '1 hour ago', read: true },
                { id: 3, type: 'achievement', message: '7-day streak achieved!', time: '2 hours ago', read: true }
            ];
            
            this.displayNotifications(notifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    displayNotifications(notifications) {
        const notificationList = document.querySelector('.notification-list');
        if (!notificationList) return;
        
        notificationList.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notif.type)}"></i>
                </div>
                <div class="notification-content">
                    <p>${notif.message}</p>
                    <div class="notification-time">${notif.time}</div>
                </div>
            </div>
        `).join('');
        
        // Update notification count
        const unreadCount = notifications.filter(n => !n.read).length;
        const countBadge = document.querySelector('.notification-count');
        if (countBadge) {
            countBadge.textContent = unreadCount;
            countBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    getNotificationIcon(type) {
        const icons = {
            task: 'tasks',
            system: 'info-circle',
            achievement: 'trophy',
            reminder: 'bell',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'bell';
    }

    async checkNewNotifications() {
        // Check for new notifications
        const user = window.authManager?.getCurrentUser();
        if (!user) return;
        
        // In a real app, this would check Firestore for new notifications
        console.log('Checking for new notifications...');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.commonHeader = new CommonHeader();
    });
} else {
    window.commonHeader = new CommonHeader();
}