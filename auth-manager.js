// auth-manager.js - Global authentication state manager
class AuthManager {
    constructor() {
        this.user = null;
        this.unsubscribeAuth = null;
        this.pagesInitialized = new Set();
        this.authListeners = [];
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        // Load Firebase SDKs dynamically if not loaded
        this.loadFirebaseSDKs().then(() => {
            this.setupAuthListener();
            this.checkPageState();
        });
    }

    loadFirebaseSDKs() {
        return new Promise((resolve) => {
            // Check if Firebase is already loaded
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                resolve();
                return;
            }

            // Load Firebase scripts
            const scripts = [
                'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js',
                'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js',
                'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js'
            ];

            let loaded = 0;
            const totalScripts = scripts.length;

            scripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => {
                    loaded++;
                    if (loaded === totalScripts) {
                        // Initialize Firebase
                        firebase.initializeApp({
                            apiKey: "AIzaSyAUKRuFgZIAO8MaWlMv32s55EOWAVRmB2o",
                            authDomain: "ai-web-9392e.firebaseapp.com",
                            projectId: "ai-web-9392e",
                            storageBucket: "ai-web-9392e.firebasestorage.app",
                            messagingSenderId: "116138523194",
                            appId: "1:116138523194:web:f37a49f16c7c26a8245303",
                            measurementId: "G-TFH9TTVM9T"
                        });
                        resolve();
                    }
                };
                document.head.appendChild(script);
            });
        });
    }

    setupAuthListener() {
        const auth = firebase.auth();
        
        this.unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                this.user = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                    photoURL: firebaseUser.photoURL,
                    emailVerified: firebaseUser.emailVerified
                };
                
                // Store in localStorage for persistence
                localStorage.setItem('dailyWorkAI_user', JSON.stringify(this.user));
                
                // Create/update user document in Firestore
                await this.createUserDocument(firebaseUser);
                
                console.log('User logged in:', this.user.email);
            } else {
                // User is signed out
                this.user = null;
                localStorage.removeItem('dailyWorkAI_user');
                console.log('User logged out');
            }
            
            // Update UI on all initialized pages
            this.updateAllPages();
            
            // Check if we need to redirect
            this.checkPageState();
            
            // Notify listeners
            this.notifyAuthListeners();
        });
        
        // Also check localStorage for cached user
        const cachedUser = localStorage.getItem('dailyWorkAI_user');
        if (cachedUser && !this.user) {
            this.user = JSON.parse(cachedUser);
            this.updateAllPages();
        }
    }

    async createUserDocument(firebaseUser) {
        try {
            const db = firebase.firestore();
            const userRef = db.collection('users').doc(firebaseUser.uid);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                await userRef.set({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                    photoURL: firebaseUser.photoURL || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    plan: 'free',
                    preferences: {
                        theme: 'light',
                        notifications: true,
                        dailyReminders: true
                    }
                });
                
                console.log('User document created');
            } else {
                // Update last login
                await userRef.update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error creating user document:', error);
        }
    }

    updateAllPages() {
        // Update user info in UI
        this.updateUserUI();
        
        // Update sidebar navigation
        this.updateNavigation();
        
        // Update page-specific content
        this.updatePageContent();
    }

    updateUserUI() {
        // Update user name
        const userNameElements = document.querySelectorAll('#user-name, .user-name, .profile-name, .header-user-name');
        userNameElements.forEach(element => {
            if (this.user) {
                element.textContent = this.user.displayName;
                element.style.display = '';
            } else {
                element.textContent = 'Guest';
            }
        });
        
        // Update user email
        const userEmailElements = document.querySelectorAll('#user-email, .user-email, .profile-email');
        userEmailElements.forEach(element => {
            if (this.user) {
                element.textContent = this.user.email;
                element.style.display = '';
            } else {
                element.textContent = 'Not logged in';
            }
        });
        
        // Update user avatar
        const userAvatarElements = document.querySelectorAll('#user-avatar, .user-avatar, .profile-avatar, .header-user-avatar');
        userAvatarElements.forEach(element => {
            if (this.user) {
                if (this.user.photoURL) {
                    element.src = this.user.photoURL;
                } else {
                    // Generate avatar based on name
                    const name = this.user.displayName || this.user.email.split('@')[0];
                    element.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=150`;
                }
                element.style.display = '';
            } else {
                element.src = 'https://ui-avatars.com/api/?name=Guest&background=95a5a6&color=fff&size=150';
            }
        });
        
        // Update logout button visibility
        const logoutButtons = document.querySelectorAll('#logout-btn, .logout-btn');
        logoutButtons.forEach(button => {
            if (this.user) {
                button.style.display = 'flex';
            } else {
                button.style.display = 'none';
            }
        });
        
        // Update login button visibility
        const loginButtons = document.querySelectorAll('#login-btn, .login-btn');
        loginButtons.forEach(button => {
            if (this.user) {
                button.style.display = 'none';
            } else {
                button.style.display = 'flex';
            }
        });
    }

    updateNavigation() {
        // Update active page based on current URL
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (href === 'dashboard.html' && currentPage === '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Show/hide premium link based on user plan
        const premiumLinks = document.querySelectorAll('a[href*="premium"]');
        premiumLinks.forEach(link => {
            if (this.user && this.user.plan === 'premium') {
                link.innerHTML = '<i class="fas fa-crown"></i> Premium (Active)';
                link.classList.add('premium-active');
            }
        });
    }

    updatePageContent() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        switch(currentPage) {
            case 'dashboard.html':
                this.updateDashboard();
                break;
            case 'profile.html':
                this.updateProfile();
                break;
            case 'tasks.html':
                this.updateTasks();
                break;
            case 'analytics.html':
                this.updateAnalytics();
                break;
            default:
                // Generic update for other pages
                this.updateGenericPage();
        }
    }

    updateDashboard() {
        if (!this.user) return;
        
        // Update dashboard stats with user-specific data
        const statsElements = {
            'user-tasks-count': '0',
            'user-focus-time': '0h 0m',
            'user-habit-streak': '0',
            'user-productivity': '0%'
        };
        
        Object.keys(statsElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = statsElements[id];
            }
        });
        
        // Update welcome message
        const welcomeMsg = document.getElementById('welcome-message');
        if (welcomeMsg) {
            const hour = new Date().getHours();
            let greeting = 'Good morning';
            if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
            if (hour >= 17) greeting = 'Good evening';
            
            welcomeMsg.textContent = `${greeting}, ${this.user.displayName.split(' ')[0]}!`;
        }
    }

    updateProfile() {
        if (!this.user) return;
        
        // Fill profile form with user data
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            document.getElementById('profile-name')?.value = this.user.displayName || '';
            document.getElementById('profile-email')?.value = this.user.email || '';
            document.getElementById('profile-avatar-url')?.value = this.user.photoURL || '';
        }
        
        // Update profile stats
        const stats = document.querySelectorAll('.profile-stat-value');
        stats.forEach(stat => {
            // In a real app, these would come from Firestore
            if (stat.id === 'profile-tasks-completed') stat.textContent = '42';
            if (stat.id === 'profile-focus-hours') stat.textContent = '24.5';
            if (stat.id === 'profile-habit-streak') stat.textContent = '14';
            if (stat.id === 'profile-productivity') stat.textContent = '78%';
        });
    }

    updateTasks() {
        if (!this.user) return;
        
        // Update task list with user-specific tasks
        const taskList = document.getElementById('task-list');
        if (taskList) {
            // In a real app, this would fetch from Firestore
            taskList.innerHTML = `
                <div class="task-item">
                    <input type="checkbox" class="task-checkbox">
                    <div class="task-content">
                        <h5>Welcome to Daily Work AI, ${this.user.displayName.split(' ')[0]}!</h5>
                        <p>Start by adding your first task</p>
                    </div>
                    <div class="task-actions">
                        <button><i class="fas fa-edit"></i></button>
                        <button><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }
    }

    updateAnalytics() {
        if (!this.user) return;
        
        // Update analytics with user-specific data
        const analyticsElements = {
            'analytics-productivity-score': '78%',
            'analytics-task-completion': '85%',
            'analytics-focus-time': '2.5h',
            'analytics-habit-consistency': '92%'
        };
        
        Object.keys(analyticsElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = analyticsElements[id];
            }
        });
    }

    updateGenericPage() {
        // Generic updates for other pages
        if (!this.user) return;
        
        // Update any user-specific elements
        const userSpecificElements = document.querySelectorAll('[data-user-specific]');
        userSpecificElements.forEach(element => {
            if (element.dataset.userSpecific === 'name') {
                element.textContent = this.user.displayName;
            } else if (element.dataset.userSpecific === 'email') {
                element.textContent = this.user.email;
            }
        });
    }

    checkPageState() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const publicPages = ['index.html', 'login.html', 'signup.html'];
        const protectedPages = ['dashboard.html', 'tasks.html', 'focus.html', 'habits.html', 
                               'notes.html', 'analytics.html', 'premium.html', 'profile.html', 
                               'settings.html'];
        
        // If user is not logged in and trying to access protected page
        if (!this.user && protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
            return;
        }
        
        // If user is logged in and trying to access auth pages
        if (this.user && (currentPage === 'login.html' || currentPage === 'signup.html')) {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    addAuthListener(callback) {
        this.authListeners.push(callback);
        if (this.user) {
            callback(this.user, true);
        }
    }

    removeAuthListener(callback) {
        const index = this.authListeners.indexOf(callback);
        if (index > -1) {
            this.authListeners.splice(index, 1);
        }
    }

    notifyAuthListeners() {
        this.authListeners.forEach(callback => {
            callback(this.user, this.user !== null);
        });
    }

    async login(email, password) {
        try {
            const auth = firebase.auth();
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signup(email, password, name) {
        try {
            const auth = firebase.auth();
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update display name
            await userCredential.user.updateProfile({
                displayName: name
            });
            
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            const auth = firebase.auth();
            await auth.signOut();
            this.user = null;
            localStorage.removeItem('dailyWorkAI_user');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    getCurrentUser() {
        return this.user;
    }

    isAuthenticated() {
        return this.user !== null;
    }

    updateUserProfile(updates) {
        if (!this.user) return Promise.reject('No user logged in');
        
        return new Promise(async (resolve, reject) => {
            try {
                const auth = firebase.auth();
                const user = auth.currentUser;
                
                if (updates.displayName) {
                    await user.updateProfile({
                        displayName: updates.displayName
                    });
                    this.user.displayName = updates.displayName;
                }
                
                if (updates.photoURL) {
                    await user.updateProfile({
                        photoURL: updates.photoURL
                    });
                    this.user.photoURL = updates.photoURL;
                }
                
                // Update in localStorage
                localStorage.setItem('dailyWorkAI_user', JSON.stringify(this.user));
                
                // Update UI
                this.updateUserUI();
                
                resolve(this.user);
            } catch (error) {
                reject(error.message);
            }
        });
    }
}

// Create global instance
window.authManager = new AuthManager();