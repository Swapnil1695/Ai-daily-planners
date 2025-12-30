// navigation.js - Unified navigation handling
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.initNavigation();
        this.setupEventListeners();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }

    initNavigation() {
        // Highlight active navigation item
        this.highlightActiveNav();
        
        // Initialize mobile menu
        this.initMobileMenu();
        
        // Initialize quick actions
        this.initQuickActions();
    }

    highlightActiveNav() {
        const navLinks = document.querySelectorAll('.nav-menu a, .landing-nav-links a');
        const currentPage = this.currentPage;
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    initMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
        `;
        document.body.appendChild(overlay);
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                overlay.style.display = sidebar.classList.contains('show') ? 'block' : 'none';
            });
            
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
            });
            
            // Close menu when clicking a link
            const navLinks = sidebar.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    sidebar.classList.remove('show');
                    overlay.style.display = 'none';
                });
            });
        }
    }

    initQuickActions() {
        // Initialize quick action buttons
        const quickActions = {
            'ai-schedule-btn': () => this.generateAISchedule(),
            'add-task-btn': () => this.navigateTo('tasks.html', { action: 'add' }),
            'start-focus-btn': () => this.navigateTo('focus.html', { action: 'start' }),
            'log-habit-btn': () => this.navigateTo('habits.html', { action: 'log' })
        };
        
        Object.keys(quickActions).forEach(btnId => {
            const button = document.getElementById(btnId);
            if (button) {
                button.addEventListener('click', quickActions[btnId]);
            }
        });
    }

    setupEventListeners() {
        // Handle logout
        const logoutButtons = document.querySelectorAll('#logout-btn, .logout-btn');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
        
        // Handle login redirect
        const loginButtons = document.querySelectorAll('#login-btn, .login-btn');
        loginButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('login.html');
            });
        });
        
        // Handle signup redirect
        const signupButtons = document.querySelectorAll('#signup-btn, .signup-btn');
        signupButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('signup.html');
            });
        });
        
        // Handle back to home
        const homeButtons = document.querySelectorAll('#home-btn, .home-btn');
        homeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('index.html');
            });
        });
    }

    async logout() {
        const confirmLogout = confirm('Are you sure you want to logout?');
        if (!confirmLogout) return;
        
        try {
            if (window.authManager) {
                await window.authManager.logout();
            } else {
                // Fallback to Firebase direct logout
                const auth = firebase.auth();
                await auth.signOut();
                localStorage.removeItem('dailyWorkAI_user');
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error during logout. Please try again.');
        }
    }

    navigateTo(page, params = {}) {
        let url = page;
        
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }
        
        window.location.href = url;
    }

    generateAISchedule() {
        const user = window.authManager?.getCurrentUser();
        if (!user) {
            alert('Please login to use AI features');
            this.navigateTo('login.html');
            return;
        }
        
        // Show AI schedule modal
        this.showAIScheduleModal();
    }

    showAIScheduleModal() {
        // Create modal for AI schedule
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-robot"></i> AI Schedule Generator</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>AI is generating your optimal daily schedule...</p>
                    <div class="ai-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-ai">Cancel</button>
                    <button class="btn" id="generate-ai">Generate Now</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Style the modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        `;
        
        // Close modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#cancel-ai').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Generate AI schedule
        modal.querySelector('#generate-ai').addEventListener('click', () => {
            this.generateSchedule();
        });
    }

    generateSchedule() {
        // Generate AI schedule based on user data
        const user = window.authManager?.getCurrentUser();
        const schedule = this.createAISchedule(user);
        
        // Show schedule
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <h4>Your AI-Generated Schedule</h4>
            <div class="ai-schedule">
                <pre>${schedule}</pre>
            </div>
            <div class="schedule-actions">
                <button class="btn" id="save-schedule">
                    <i class="fas fa-save"></i> Save to Tasks
                </button>
                <button class="btn btn-secondary" id="close-schedule">
                    Close
                </button>
            </div>
        `;
    }

    createAISchedule(user) {
        const times = [
            '8:00 AM - Morning Routine & Breakfast',
            '9:00 AM - Deep Work Session',
            '11:00 AM - Short Break & Habit Check',
            '11:15 AM - Continue Work Tasks',
            '1:00 PM - Lunch Break',
            '2:00 PM - Afternoon Focus Session',
            '4:00 PM - Review & Planning',
            '5:00 PM - Habit Completion',
            '6:00 PM - Evening Wind Down'
        ];
        
        let schedule = `📅 Daily Schedule for ${user?.displayName || 'User'}\n`;
        schedule += '='.repeat(40) + '\n\n';
        
        times.forEach((time, index) => {
            schedule += `${time}\n`;
            if (index === 0) schedule += `   • Morning exercise & healthy breakfast\n`;
            if (index === 1) schedule += `   • Focus on most important task\n`;
            if (index === 4) schedule += `   • Step away from screens, mindful eating\n`;
            if (index === 8) schedule += `   • Review day, plan for tomorrow\n\n`;
        });
        
        schedule += '💡 AI Tip: Take regular breaks to maintain productivity!';
        
        return schedule;
    }
}

// Initialize navigation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.navigationManager = new NavigationManager();
    });
} else {
    window.navigationManager = new NavigationManager();
}