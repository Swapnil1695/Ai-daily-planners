// firebase-config.js
// Firebase Configuration for Daily Work AI

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Firebase Authentication State Observer
function setupAuthStateListener() {
    auth.onAuthStateChanged((user) => {
        const publicPages = ['index.html', 'login.html', 'signup.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.email);
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified
            }));
            
            // Update UI
            updateUserUI(user);
            
            // Redirect from auth pages to dashboard
            if (publicPages.includes(currentPage)) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // User is signed out
            console.log('User is signed out');
            localStorage.removeItem('user');
            
            // Redirect protected pages to login
            if (!publicPages.includes(currentPage) && currentPage !== '') {
                window.location.href = 'login.html';
            }
        }
    });
}

// Update UI with user data
function updateUserUI(user) {
    // Update user name
    const userNameElements = document.querySelectorAll('#user-name, .user-name');
    userNameElements.forEach(element => {
        if (user.displayName) {
            element.textContent = user.displayName;
        } else if (user.email) {
            element.textContent = user.email.split('@')[0];
        }
    });
    
    // Update user email
    const userEmailElements = document.querySelectorAll('#user-email, .user-email');
    userEmailElements.forEach(element => {
        if (user.email) {
            element.textContent = user.email;
        }
    });
    
    // Update user avatar
    const userAvatarElements = document.querySelectorAll('#user-avatar, .user-avatar, .profile-avatar');
    userAvatarElements.forEach(element => {
        if (user.photoURL) {
            element.src = user.photoURL;
        } else if (user.email) {
            const name = user.displayName || user.email.split('@')[0];
            element.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=150`;
        }
    });
}

// Get current user data
function getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
        };
    }
    return null;
}

// Check if user is authenticated
function isAuthenticated() {
    return auth.currentUser !== null;
}

// Sign out function
async function signOut() {
    try {
        await auth.signOut();
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Error signing out: ' + error.message);
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
                    weeklyReports: false
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
            
            // Create initial collections
            await createInitialCollections(user.uid);
            
            console.log('User document created successfully');
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

// Create initial collections for new user
async function createInitialCollections(userId) {
    try {
        // Create default tasks
        const today = new Date().toISOString().split('T')[0];
        
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

// Log user activity
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

// Get real-time updates for a collection
function setupRealtimeListener(userId, collection, callback, queryConstraints = []) {
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
}

// Get statistics for dashboard
async function getDashboardStats(userId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's tasks
        const tasksSnapshot = await db.collection('users').doc(userId).collection('tasks')
            .where('dueDate', '==', today)
            .get();
        
        let tasksCompleted = 0;
        let totalTasks = 0;
        tasksSnapshot.forEach(doc => {
            totalTasks++;
            if (doc.data().completed) tasksCompleted++;
        });
        
        // Get today's focus sessions
        const focusSnapshot = await db.collection('users').doc(userId).collection('focusSessions')
            .where('date', '==', today)
            .get();
        
        let totalFocusTime = 0;
        focusSnapshot.forEach(doc => {
            totalFocusTime += doc.data().duration || 0;
        });
        
        // Get habits
        const habitsSnapshot = await db.collection('users').doc(userId).collection('habits').get();
        
        let currentStreak = 0;
        let habitsCompletedToday = 0;
        let totalHabits = 0;
        habitsSnapshot.forEach(doc => {
            totalHabits++;
            const habit = doc.data();
            if (habit.completedToday) habitsCompletedToday++;
            if (habit.streak > currentStreak) currentStreak = habit.streak;
        });
        
        // Calculate productivity score
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

// Add to existing firebase-config.js

// Schedule Event Functions
async function addScheduleEvent(userId, eventData) {
    try {
        const eventRef = await db.collection('users').doc(userId)
            .collection('scheduleEvents')
            .add({
                ...eventData,
                userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        return eventRef;
    } catch (error) {
        console.error('Error adding schedule event:', error);
        throw error;
    }
}

async function updateScheduleEvent(userId, eventId, updates) {
    try {
        await db.collection('users').doc(userId)
            .collection('scheduleEvents')
            .doc(eventId)
            .update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        console.error('Error updating schedule event:', error);
        throw error;
    }
}

async function deleteScheduleEvent(userId, eventId) {
    try {
        await db.collection('users').doc(userId)
            .collection('scheduleEvents')
            .doc(eventId)
            .delete();
    } catch (error) {
        console.error('Error deleting schedule event:', error);
        throw error;
    }
}

async function getScheduleEvents(userId, date) {
    try {
        const snapshot = await db.collection('users').doc(userId)
            .collection('scheduleEvents')
            .where('date', '==', date)
            .orderBy('startTime')
            .get();
        
        const events = [];
        snapshot.forEach(doc => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return events;
    } catch (error) {
        console.error('Error getting schedule events:', error);
        throw error;
    }
}

// Notification Functions
async function addNotification(userId, notificationData) {
    try {
        const notificationRef = await db.collection('users').doc(userId)
            .collection('notifications')
            .add({
                ...notificationData,
                userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                sent: false
            });
        
        return notificationRef;
    } catch (error) {
        console.error('Error adding notification:', error);
        throw error;
    }
}

async function getUpcomingNotifications(userId) {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const snapshot = await db.collection('users').doc(userId)
            .collection('notifications')
            .where('date', '==', today)
            .where('sent', '==', false)
            .orderBy('time')
            .get();
        
        const notifications = [];
        snapshot.forEach(doc => {
            notifications.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return notifications;
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
}

// Export new functions
window.firebaseAuth = {
    ...window.firebaseAuth,
    addScheduleEvent,
    updateScheduleEvent,
    deleteScheduleEvent,
    getScheduleEvents,
    addNotification,
    getUpcomingNotifications
    config: firebaseConfig,
    auth,
    db,
    storage,
    analytics,
    setupAuthStateListener,
    getCurrentUser,
    isAuthenticated,
    signOut,
    createUserDocument,
    logActivity,
    setupRealtimeListener,
    getDashboardStats
};