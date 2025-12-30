// firebase-auth.js
// Daily Work AI Firebase Authentication & Database

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUKRuFgZIAO8MaWlMv32s55EOWAVRmB2o",
    authDomain: "ai-web-9392e.firebaseapp.com",
    projectId: "ai-web-9392e",
    storageBucket: "ai-web-9392e.firebasestorage.app",
    messagingSenderId: "116138523194",
    appId: "1:116138523194:web:f37a49f16c7c26a8245303",
    measurementId: "G-TFH9TTVM9T"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Authentication State Listener
function initAuthStateListener() {
    auth.onAuthStateChanged((user) => {
        const publicPages = ['index.html', 'login.html', 'signup.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (user) {
            // User is signed in
            console.log('User signed in:', user.email);
            
            // Update user data in localStorage
            updateUserData(user);
            
            // Update UI with user data
            updateUserUI(user);
            
            // If on public page, redirect to dashboard
            if (publicPages.includes(currentPage)) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // User is signed out
            console.log('User signed out');
            localStorage.removeItem('user');
            
            // If on protected page, redirect to login
            if (!publicPages.includes(currentPage) && currentPage !== '' && currentPage !== 'index.html') {
                window.location.href = 'login.html';
            }
        }
    });
}

// Update user data in localStorage
function updateUserData(user) {
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        lastLogin: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
}

// Update UI with user data
function updateUserUI(user) {
    // Update all user name elements
    document.querySelectorAll('.user-name').forEach(element => {
        if (user.displayName) {
            element.textContent = user.displayName;
        } else if (user.email) {
            element.textContent = user.email.split('@')[0];
        }
    });
    
    // Update all user email elements
    document.querySelectorAll('.user-email').forEach(element => {
        if (user.email) {
            element.textContent = user.email;
        }
    });
    
    // Update all user avatar elements
    document.querySelectorAll('.user-avatar').forEach(element => {
        if (user.photoURL) {
            element.src = user.photoURL;
        } else if (user.email) {
            const name = user.displayName || user.email.split('@')[0];
            element.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4361ee&color=fff&size=150`;
        }
    });
    
    // Update profile page if exists
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    
    if (profileName && user.displayName) {
        profileName.value = user.displayName;
    }
    
    if (profileEmail && user.email) {
        profileEmail.value = user.email;
    }
    
    if (profileAvatar && user.photoURL) {
        profileAvatar.src = user.photoURL;
    }
}

// Get current user
function getCurrentUser() {
    return auth.currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
    return auth.currentUser !== null;
}

// Sign out
async function signOut() {
    try {
        // Set user offline status
        const user = auth.currentUser;
        if (user) {
            await db.collection('status').doc(user.uid).set({
                state: 'offline',
                last_changed: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Sign out
        await auth.signOut();
        
        // Clear localStorage
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Error signing out: ' + error.message);
    }
}

// Email/Password Sign Up
async function signUpWithEmail(name, email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update profile with name
        await user.updateProfile({
            displayName: name
        });
        
        // Send email verification
        await user.sendEmailVerification();
        
        // Create user document
        await createUserDocument(user, { displayName: name });
        
        // Log activity
        await logActivity(user.uid, {
            type: 'auth',
            action: 'signup',
            message: 'User signed up with email'
        });
        
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Email/Password Sign In
async function signInWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user document
        await updateUserDocument(user.uid, {
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Log activity
        await logActivity(user.uid, {
            type: 'auth',
            action: 'login',
            message: 'User signed in with email'
        });
        
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Google Sign In
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const userCredential = await auth.signInWithPopup(provider);
        const user = userCredential.user;
        
        // Create/update user document
        await createUserDocument(user);
        
        // Log activity
        await logActivity(user.uid, {
            type: 'auth',
            action: 'login',
            message: 'User signed in with Google',
            provider: 'google'
        });
        
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// GitHub Sign In
async function signInWithGitHub() {
    try {
        const provider = new firebase.auth.GithubAuthProvider();
        const userCredential = await auth.signInWithPopup(provider);
        const user = userCredential.user;
        
        // Create/update user document
        await createUserDocument(user);
        
        // Log activity
        await logActivity(user.uid, {
            type: 'auth',
            action: 'login',
            message: 'User signed in with GitHub',
            provider: 'github'
        });
        
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Create user document in Firestore
async function createUserDocument(user, additionalData = {}) {
    try {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            await userRef.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                plan: 'free',
                preferences: {
                    theme: 'light',
                    notifications: true,
                    dailyReminders: true,
                    weeklyReports: false,
                    autoSchedule: true
                },
                stats: {
                    tasksCompleted: 0,
                    focusSessions: 0,
                    totalFocusTime: 0,
                    habitStreak: 0,
                    productivityScore: 0
                },
                ...additionalData
            });
            
            // Create initial data collections
            await createInitialCollections(user.uid);
            
            console.log('User document created:', user.uid);
        } else {
            // Update last login
            await userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        return userRef;
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
}

// Update user document
async function updateUserDocument(userId, data) {
    try {
        await db.collection('users').doc(userId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating user document:', error);
        throw error;
    }
}

// Create initial collections for new user
async function createInitialCollections(userId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Create default tasks
        const defaultTasks = [
            {
                title: 'Welcome to Daily Work AI!',
                description: 'Explore the dashboard and set up your preferences',
                completed: true,
                priority: 'high',
                category: 'welcome',
                dueDate: today,
                time: '09:00',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                title: 'Set Your Daily Goals',
                description: 'Define what you want to accomplish today',
                completed: false,
                priority: 'high',
                category: 'planning',
                dueDate: today,
                time: '10:00',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                title: 'Try AI Schedule Generator',
                description: 'Let AI create your optimal daily schedule',
                completed: false,
                priority: 'medium',
                category: 'ai',
                dueDate: today,
                time: '11:00',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];
        
        for (const task of defaultTasks) {
            await db.collection('users').doc(userId).collection('tasks').add(task);
        }
        
        // Create default habits
        const defaultHabits = [
            {
                name: 'Morning Routine',
                description: 'Start your day with purpose',
                frequency: 'daily',
                streak: 1,
                bestStreak: 1,
                completedToday: true,
                category: 'health',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                name: 'Daily Planning',
                description: 'Plan your day for maximum productivity',
                frequency: 'daily',
                streak: 0,
                bestStreak: 0,
                completedToday: false,
                category: 'productivity',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];
        
        for (const habit of defaultHabits) {
            await db.collection('users').doc(userId).collection('habits').add(habit);
        }
        
        // Create welcome note
        await db.collection('users').doc(userId).collection('notes').add({
            title: 'Welcome to Daily Work AI!',
            content: 'This is your personal workspace. You can create notes, track habits, manage tasks, and let AI optimize your schedule. Start by exploring the dashboard and setting up your preferences.',
            category: 'welcome',
            tags: ['welcome', 'getting-started'],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Initial collections created for user:', userId);
    } catch (error) {
        console.error('Error creating initial collections:', error);
    }
}

// Log activity
async function logActivity(userId, activity) {
    try {
        await db.collection('users').doc(userId).collection('activity').add({
            ...activity,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Set user online status
async function setUserOnlineStatus(userId, isOnline) {
    try {
        await db.collection('status').doc(userId).set({
            state: isOnline ? 'online' : 'offline',
            last_changed: firebase.firestore.FieldValue.serverTimestamp(),
            userId: userId
        });
    } catch (error) {
        console.error('Error setting user status:', error);
    }
}

// Get dashboard statistics
async function getDashboardStats(userId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's tasks
        const tasksSnapshot = await db.collection('users').doc(userId)
            .collection('tasks')
            .where('dueDate', '==', today)
            .get();
        
        let tasksCompleted = 0;
        let totalTasks = 0;
        tasksSnapshot.forEach(doc => {
            totalTasks++;
            if (doc.data().completed) tasksCompleted++;
        });
        
        // Get today's focus sessions
        const focusSnapshot = await db.collection('users').doc(userId)
            .collection('focusSessions')
            .where('date', '==', today)
            .get();
        
        let totalFocusTime = 0;
        focusSnapshot.forEach(doc => {
            totalFocusTime += doc.data().duration || 0;
        });
        
        // Get habits
        const habitsSnapshot = await db.collection('users').doc(userId)
            .collection('habits')
            .get();
        
        let currentStreak = 0;
        let habitsCompletedToday = 0;
        let totalHabits = 0;
        habitsSnapshot.forEach(doc => {
            totalHabits++;
            const habit = doc.data();
            if (habit.completedToday) habitsCompletedToday++;
            if (habit.streak > currentStreak) currentStreak = habit.streak;
        });
        
        // Calculate scores
        const taskScore = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
        const habitScore = totalHabits > 0 ? (habitsCompletedToday / totalHabits) * 100 : 0;
        const focusScore = Math.min((totalFocusTime / 240) * 100, 100); // 4 hours = 100%
        
        const productivityScore = Math.round((taskScore + habitScore + focusScore) / 3);
        
        return {
            tasks: {
                completed: tasksCompleted,
                total: totalTasks,
                percentage: totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0
            },
            focus: {
                minutes: totalFocusTime,
                hours: Math.floor(totalFocusTime / 60),
                minutesRemainder: totalFocusTime % 60,
                percentage: Math.min(Math.round((totalFocusTime / 240) * 100), 100)
            },
            habits: {
                streak: currentStreak,
                completedToday: habitsCompletedToday,
                total: totalHabits,
                percentage: totalHabits > 0 ? Math.round((habitsCompletedToday / totalHabits) * 100) : 0
            },
            productivity: {
                score: productivityScore,
                level: productivityScore >= 80 ? 'High' : productivityScore >= 60 ? 'Medium' : 'Low'
            }
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return null;
    }
}

// Get user's tasks
async function getUserTasks(userId, options = {}) {
    try {
        let query = db.collection('users').doc(userId).collection('tasks');
        
        if (options.dueDate) {
            query = query.where('dueDate', '==', options.dueDate);
        }
        
        if (options.completed !== undefined) {
            query = query.where('completed', '==', options.completed);
        }
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        if (options.orderBy) {
            query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
        } else {
            query = query.orderBy('time', 'asc');
        }
        
        const snapshot = await query.get();
        const tasks = [];
        snapshot.forEach(doc => {
            tasks.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return tasks;
    } catch (error) {
        console.error('Error getting tasks:', error);
        return [];
    }
}

// Get user's habits
async function getUserHabits(userId) {
    try {
        const snapshot = await db.collection('users').doc(userId)
            .collection('habits')
            .orderBy('createdAt', 'desc')
            .get();
        
        const habits = [];
        snapshot.forEach(doc => {
            habits.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return habits;
    } catch (error) {
        console.error('Error getting habits:', error);
        return [];
    }
}

// Get user's recent activity
async function getUserActivity(userId, limit = 5) {
    try {
        const snapshot = await db.collection('users').doc(userId)
            .collection('activity')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        
        const activities = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            activities.push({
                id: doc.id,
                ...data,
                timeAgo: getTimeAgo(data.timestamp?.toDate())
            });
        });
        
        return activities;
    } catch (error) {
        console.error('Error getting activity:', error);
        return [];
    }
}

// Helper: Get time ago
function getTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
}

// Setup real-time listener
function setupRealtimeListener(userId, collection, callback, queryConstraints = []) {
    try {
        let query = db.collection('users').doc(userId).collection(collection);
        
        // Apply query constraints
        queryConstraints.forEach(constraint => {
            query = query.where(...constraint);
        });
        
        // Order by creation date by default
        query = query.orderBy('createdAt', 'desc');
        
        return query.onSnapshot((snapshot) => {
            const data = [];
            snapshot.forEach(doc => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(data);
        }, (error) => {
            console.error(`Error listening to ${collection}:`, error);
        });
    } catch (error) {
        console.error('Error setting up realtime listener:', error);
        return () => {}; // Return empty unsubscribe function
    }
}

// Export to window object
window.DailyWorkAI = {
    auth,
    db,
    analytics,
    initAuthStateListener,
    getCurrentUser,
    isAuthenticated,
    signOut,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    createUserDocument,
    updateUserDocument,
    logActivity,
    setUserOnlineStatus,
    getDashboardStats,
    getUserTasks,
    getUserHabits,
    getUserActivity,
    setupRealtimeListener,
    updateUserUI,
    getTimeAgo
};

// Initialize auth state listener when script loads
document.addEventListener('DOMContentLoaded', () => {
    DailyWorkAI.initAuthStateListener();
});