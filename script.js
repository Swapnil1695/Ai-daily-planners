// ===== DAILYWORK AI - MAIN JAVASCRIPT =====

// Global Variables
let currentUser = null;
let userData = {};
let tasks = [];
let habits = [];
let notes = [];
let focusSessions = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize modals
    initModals();
    
    // Initialize form validation
    initForms();
    
    // Load user data
    loadUserData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start live updates
    startLiveUpdates();
});

// Check Authentication
function checkAuth() {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('login.html') || currentPath.includes('signup.html');
    
    // Simulate authentication check
    const loggedIn = localStorage.getItem('dailywork_user') !== null;
    
    if (!loggedIn && !isAuthPage) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    if (loggedIn) {
        currentUser = JSON.parse(localStorage.getItem('dailywork_user'));
        userData = JSON.parse(localStorage.getItem('dailywork_user_data')) || {};
    }
}

// Initialize Tooltips
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
            }
        });
    });
}

// Initialize Modals
function initModals() {
    // Close modal on background click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target);
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) closeModal(modal);
        }
    });
}

// Initialize Forms
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (this.id === 'loginForm') handleLogin(this);
            if (this.id === 'signupForm') handleSignup(this);
            if (this.id === 'taskForm') handleTaskSubmit(this);
            if (this.id === 'habitForm') handleHabitSubmit(this);
            if (this.id === 'noteForm') handleNoteSubmit(this);
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotifications);
    }
    
    // AI Assistant
    const aiBtn = document.getElementById('openAssistant');
    if (aiBtn) {
        aiBtn.addEventListener('click', toggleAIAssistant);
    }
    
    // Quick actions
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', function() {
            const action = this.dataset.action;
            if (action) handleQuickAction(action);
        });
    });
    
    // Task actions
    document.querySelectorAll('.task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            const action = this.dataset.action;
            if (taskId && action) handleTaskAction(taskId, action);
        });
    });
}

// Load User Data
function loadUserData() {
    if (!currentUser) return;
    
    // Load tasks
    tasks = JSON.parse(localStorage.getItem('dailywork_tasks')) || [];
    
    // Load habits
    habits = JSON.parse(localStorage.getItem('dailywork_habits')) || [];
    
    // Load notes
    notes = JSON.parse(localStorage.getItem('dailywork_notes')) || [];
    
    // Load focus sessions
    focusSessions = JSON.parse(localStorage.getItem('dailywork_focus_sessions')) || [];
    
    // Update UI
    updateDashboard();
}

// Start Live Updates
function startLiveUpdates() {
    // Update time every minute
    setInterval(updateTime, 60000);
    
    // Update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Check premium status every minute
    setInterval(checkPremiumStatus, 60000);
}

// ===== AUTHENTICATION FUNCTIONS =====

function handleLogin(form) {
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const remember = form.querySelector('#remember').checked;
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // For demo, accept any non-empty credentials
        if (email && password) {
            // Create user object
            const user = {
                id: Date.now(),
                email: email,
                name: email.split('@')[0],
                joined: new Date().toISOString(),
                plan: 'free',
                premiumUntil: null
            };
            
            // Save to localStorage
            localStorage.setItem('dailywork_user', JSON.stringify(user));
            
            // Show success message
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showToast('Please fill in all fields', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1500);
}

function handleSignup(form) {
    const firstName = form.querySelector('#firstName').value;
    const lastName = form.querySelector('#lastName').value;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const occupation = form.querySelector('#occupation').value;
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        if (firstName && lastName && email && password) {
            // Create user object
            const user = {
                id: Date.now(),
                email: email,
                name: `${firstName} ${lastName}`,
                occupation: occupation,
                joined: new Date().toISOString(),
                plan: 'free',
                premiumUntil: null,
                stats: {
                    tasksCompleted: 0,
                    focusTime: 0,
                    streak: 0,
                    productivityScore: 0
                }
            };
            
            // Save to localStorage
            localStorage.setItem('dailywork_user', JSON.stringify(user));
            localStorage.setItem('dailywork_user_data', JSON.stringify({
                firstName,
                lastName,
                email,
                occupation,
                goals: []
            }));
            
            // Show success message
            showToast('Account created successfully!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showToast('Please fill in all required fields', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1500);
}

// ===== TASK MANAGEMENT =====

function handleTaskSubmit(form) {
    const title = form.querySelector('#taskTitle').value;
    const description = form.querySelector('#taskDescription').value;
    const priority = form.querySelector('#taskPriority').value;
    const dueDate = form.querySelector('#taskDueDate').value;
    const estimatedTime = form.querySelector('#taskEstimatedTime').value;
    
    if (!title) {
        showToast('Please enter a task title', 'error');
        return;
    }
    
    const task = {
        id: Date.now(),
        title: title,
        description: description,
        priority: priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        estimatedTime: parseInt(estimatedTime) || 30,
        status: 'todo',
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    // Add to tasks array
    tasks.push(task);
    
    // Save to localStorage
    localStorage.setItem('dailywork_tasks', JSON.stringify(tasks));
    
    // Show success message
    showToast('Task added successfully!', 'success');
    
    // Update UI
    updateTasksList();
    
    // Close modal
    const modal = form.closest('.modal-overlay');
    if (modal) closeModal(modal);
    
    // Reset form
    form.reset();
}

function handleTaskAction(taskId, action) {
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;
    
    switch(action) {
        case 'complete':
            task.status = 'completed';
            task.completedAt = new Date().toISOString();
            showToast('Task marked as completed!', 'success');
            break;
        case 'edit':
            openTaskEditor(task);
            return;
        case 'delete':
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(t => t.id != taskId);
                showToast('Task deleted', 'info');
            }
            break;
    }
    
    // Save to localStorage
    localStorage.setItem('dailywork_tasks', JSON.stringify(tasks));
    
    // Update UI
    updateTasksList();
    updateDashboard();
}

// ===== HABIT MANAGEMENT =====

function handleHabitSubmit(form) {
    const name = form.querySelector('#habitName').value;
    const description = form.querySelector('#habitDescription').value;
    const frequency = form.querySelector('#habitFrequency').value;
    const reminderTime = form.querySelector('#habitReminderTime').value;
    
    if (!name) {
        showToast('Please enter a habit name', 'error');
        return;
    }
    
    const habit = {
        id: Date.now(),
        name: name,
        description: description,
        frequency: frequency,
        reminderTime: reminderTime,
        streak: 0,
        bestStreak: 0,
        completedDates: [],
        createdAt: new Date().toISOString()
    };
    
    // Add to habits array
    habits.push(habit);
    
    // Save to localStorage
    localStorage.setItem('dailywork_habits', JSON.stringify(habits));
    
    // Show success message
    showToast('Habit added successfully!', 'success');
    
    // Update UI
    updateHabitsList();
    
    // Close modal
    const modal = form.closest('.modal-overlay');
    if (modal) closeModal(modal);
    
    // Reset form
    form.reset();
}

function toggleHabitCompletion(habitId) {
    const habit = habits.find(h => h.id == habitId);
    if (!habit) return;
    
    const today = new Date().toDateString();
    const completedToday = habit.completedDates.some(date => 
        new Date(date).toDateString() === today
    );
    
    if (completedToday) {
        // Remove from completed dates
        habit.completedDates = habit.completedDates.filter(date => 
            new Date(date).toDateString() !== today
        );
        habit.streak = Math.max(0, habit.streak - 1);
        showToast('Habit unchecked', 'info');
    } else {
        // Add to completed dates
        habit.completedDates.push(new Date().toISOString());
        
        // Check if yesterday was completed for streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayCompleted = habit.completedDates.some(date => 
            new Date(date).toDateString() === yesterday.toDateString()
        );
        
        if (yesterdayCompleted) {
            habit.streak++;
            if (habit.streak > habit.bestStreak) {
                habit.bestStreak = habit.streak;
            }
        } else {
            habit.streak = 1;
        }
        
        showToast('Habit completed! Streak: ' + habit.streak, 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('dailywork_habits', JSON.stringify(habits));
    
    // Update UI
    updateHabitsList();
    updateDashboard();
}

// ===== NOTE MANAGEMENT =====

function handleNoteSubmit(form) {
    const title = form.querySelector('#noteTitle').value;
    const content = form.querySelector('#noteContent').value;
    const category = form.querySelector('#noteCategory').value;
    
    if (!title || !content) {
        showToast('Please enter title and content', 'error');
        return;
    }
    
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        category: category,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to notes array
    notes.push(note);
    
    // Save to localStorage
    localStorage.setItem('dailywork_notes', JSON.stringify(notes));
    
    // Show success message
    showToast('Note saved successfully!', 'success');
    
    // Update UI
    updateNotesList();
    
    // Close modal
    const modal = form.closest('.modal-overlay');
    if (modal) closeModal(modal);
    
    // Reset form
    form.reset();
}

// ===== FOCUS TIMER =====

let timerInterval = null;
let timerSeconds = 25 * 60; // 25 minutes
let timerRunning = false;
let timerMode = 'work'; // work, shortBreak, longBreak

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    timerInterval = setInterval(updateTimer, 1000);
    
    // Update UI
    document.querySelector('.timer-start-btn')?.classList.add('hidden');
    document.querySelector('.timer-pause-btn')?.classList.remove('hidden');
    
    showToast('Focus timer started!', 'success');
}

function pauseTimer() {
    if (!timerRunning) return;
    
    timerRunning = false;
    clearInterval(timerInterval);
    
    // Update UI
    document.querySelector('.timer-start-btn')?.classList.remove('hidden');
    document.querySelector('.timer-pause-btn')?.classList.add('hidden');
    
    showToast('Timer paused', 'info');
}

function resetTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerSeconds = timerMode === 'work' ? 25 * 60 :
                  timerMode === 'shortBreak' ? 5 * 60 :
                  timerMode === 'longBreak' ? 15 * 60 : 25 * 60;
    
    // Update UI
    updateTimerDisplay();
    document.querySelector('.timer-start-btn')?.classList.remove('hidden');
    document.querySelector('.timer-pause-btn')?.classList.add('hidden');
    
    showToast('Timer reset', 'info');
}

function updateTimer() {
    if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
    } else {
        // Timer completed
        clearInterval(timerInterval);
        timerRunning = false;
        
        // Record session
        recordFocusSession();
        
        // Show notification
        showToast('Timer completed!', 'success');
        
        // Play sound
        playTimerSound();
        
        // Switch mode
        switchTimerMode();
        
        // Auto-start next timer if enabled
        const autoStart = localStorage.getItem('timer_autoStart') === 'true';
        if (autoStart) {
            setTimeout(startTimer, 1000);
        }
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerDisplay = document.querySelector('.timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = display;
    }
    
    // Update progress bar
    const totalSeconds = timerMode === 'work' ? 25 * 60 :
                        timerMode === 'shortBreak' ? 5 * 60 :
                        timerMode === 'longBreak' ? 15 * 60 : 25 * 60;
    const progress = ((totalSeconds - timerSeconds) / totalSeconds) * 100;
    
    const progressBar = document.querySelector('.timer-progress');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
}

function switchTimerMode() {
    // Cycle through modes: work → shortBreak → work → longBreak
    if (timerMode === 'work') {
        // Check if we should take a long break
        const workCycles = parseInt(localStorage.getItem('work_cycles') || '0') + 1;
        localStorage.setItem('work_cycles', workCycles.toString());
        
        if (workCycles >= 4) {
            timerMode = 'longBreak';
            timerSeconds = 15 * 60;
            localStorage.setItem('work_cycles', '0');
            showToast('Great work! Time for a long break.', 'success');
        } else {
            timerMode = 'shortBreak';
            timerSeconds = 5 * 60;
            showToast('Good work! Take a short break.', 'info');
        }
    } else {
        timerMode = 'work';
        timerSeconds = 25 * 60;
        showToast('Break over! Back to work.', 'info');
    }
    
    // Update UI
    updateTimerDisplay();
    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.timer-mode-btn[data-mode="${timerMode}"]`)?.classList.add('active');
}

function recordFocusSession() {
    const session = {
        id: Date.now(),
        mode: timerMode,
        duration: timerMode === 'work' ? 25 :
                 timerMode === 'shortBreak' ? 5 : 15,
        completedAt: new Date().toISOString(),
        focusScore: calculateFocusScore()
    };
    
    focusSessions.push(session);
    localStorage.setItem('dailywork_focus_sessions', JSON.stringify(focusSessions));
    
    // Update user stats
    if (userData.stats) {
        userData.stats.focusTime = (userData.stats.focusTime || 0) + session.duration;
        localStorage.setItem('dailywork_user_data', JSON.stringify(userData));
    }
}

// ===== AI ASSISTANT FUNCTIONS =====

function sendAIMessage(message) {
    if (!message.trim()) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI thinking
    setTimeout(() => {
        // Remove typing indicator
        removeTypingIndicator();
        
        // Generate AI response
        const response = generateAIResponse(message);
        
        // Add AI response to chat
        addChatMessage(response, 'ai');
    }, 1000);
}

function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Task-related queries
    if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
        if (lowerMessage.includes('add') || lowerMessage.includes('create')) {
            return "I can help you add a task. Go to the Tasks page or use the quick action button. What would you like to name your task?";
        }
        if (lowerMessage.includes('complete') || lowerMessage.includes('done')) {
            return "Great! I can help you mark tasks as completed. You can click the checkmark next to any task to mark it as done.";
        }
        if (lowerMessage.includes('list') || lowerMessage.includes('show')) {
            const taskCount = tasks.filter(t => t.status === 'todo').length;
            return `You have ${taskCount} pending tasks. Here are your priorities:
            
            1. Complete high-priority tasks first
            2. Break large tasks into smaller steps
            3. Use the Pomodoro technique for focus`;
        }
    }
    
    // Schedule-related queries
    if (lowerMessage.includes('schedule') || lowerMessage.includes('plan')) {
        return "Based on your energy patterns, I recommend:
        
        **Morning (8:00-12:00)**: Deep work on important tasks
        **Afternoon (13:00-16:00)**: Meetings and collaboration
        **Evening (16:00-18:00)**: Planning and review
        
        Would you like me to create a detailed schedule for you?";
    }
    
    // Focus-related queries
    if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate')) {
        return "Here are 5 tips to improve focus:
        
        1. **Use Pomodoro technique**: 25 minutes work, 5 minutes break
        2. **Eliminate distractions**: Turn off notifications
        3. **Set clear goals**: Know exactly what to accomplish
        4. **Take regular breaks**: Prevents burnout
        5. **Practice mindfulness**: Improves concentration
        
        Want to start a focus session now?";
    }
    
    // Habit-related queries
    if (lowerMessage.includes('habit') || lowerMessage.includes('routine')) {
        const habitCount = habits.length;
        return `You're tracking ${habitCount} habits. To build strong habits:
        
        1. **Start small**: Focus on consistency over intensity
        2. **Track progress**: Use the habit tracker daily
        3. **Set reminders**: Don't rely on willpower alone
        4. **Celebrate wins**: Reward yourself for consistency
        
        Would you like to add a new habit?`;
    }
    
    // General productivity advice
    if (lowerMessage.includes('productive') || lowerMessage.includes('efficient')) {
        return "To boost productivity:
        
        1. **Prioritize tasks**: Use Eisenhower Matrix
        2. **Time blocking**: Schedule tasks in calendar
        3. **Batch similar tasks**: Reduces context switching
        4. **Delegate when possible**: Focus on high-value work
        5. **Review daily**: Learn and improve
        
        How can I help you be more productive today?";
    }
    
    // Default response
    return "I'm your AI productivity assistant! I can help you with:
    
    • **Task management**: Create, organize, and complete tasks
    • **Time planning**: Schedule your day optimally
    • **Focus sessions**: Use Pomodoro timer effectively
    • **Habit building**: Track and build productive habits
    • **Productivity analysis**: Get insights from your data
    
    What would you like help with today?";
}

// ===== PREMIUM FEATURES =====

function unlockPremium() {
    // Show ad simulation
    showAdModal();
    
    // After ad completes
    setTimeout(() => {
        // Update user plan
        if (currentUser) {
            currentUser.plan = 'premium';
            currentUser.premiumUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            
            // Save to localStorage
            localStorage.setItem('dailywork_user', JSON.stringify(currentUser));
            
            // Show success
            showToast('Premium unlocked for 24 hours!', 'success');
            
            // Update UI
            updatePremiumStatus();
            
            // Record ad view
            recordAdView();
        }
    }, 30000); // 30 second ad simulation
}

function recordAdView() {
    const adViews = JSON.parse(localStorage.getItem('dailywork_ad_views')) || [];
    adViews.push({
        timestamp: new Date().toISOString(),
        type: 'rewarded_video',
        revenue: 0.15 // Simulated revenue
    });
    localStorage.setItem('dailywork_ad_views', JSON.stringify(adViews));
}

// ===== UTILITY FUNCTIONS =====

function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Show with animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function updateDashboard() {
    // Update task count
    const todayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        return dueDate.toDateString() === today.toDateString();
    }).length;
    
    // Update completed tasks
    const completedToday = tasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        const today = new Date();
        return completedDate.toDateString() === today.toDateString();
    }).length;
    
    // Update focus time
    const todayFocus = focusSessions
        .filter(session => {
            const sessionDate = new Date(session.completedAt);
            const today = new Date();
            return sessionDate.toDateString() === today.toDateString();
        })
        .reduce((total, session) => total + session.duration, 0);
    
    // Update streak
    const longestStreak = habits.reduce((max, habit) => 
        Math.max(max, habit.streak), 0
    );
    
    // Update UI elements
    const taskCountEl = document.querySelector('.task-count');
    const focusTimeEl = document.querySelector('.focus-time');
    const streakEl = document.querySelector('.streak-count');
    
    if (taskCountEl) taskCountEl.textContent = todayTasks;
    if (focusTimeEl) focusTimeEl.textContent = `${todayFocus}m`;
    if (streakEl) streakEl.textContent = longestStreak;
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const timeEl = document.querySelector('.current-time');
    const dateEl = document.querySelector('.current-date');
    
    if (timeEl) timeEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
}

function updateStats() {
    // Update live stats
    const stats = {
        users: Math.floor(10284 + Math.random() * 100),
        tasks: Math.floor(534921 + Math.random() * 1000),
        focus: Math.floor(2450 + Math.random() * 100),
        revenue: (38.45 + Math.random() * 2).toFixed(2)
    };
    
    // Update dashboard stats if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        document.querySelectorAll('.live-stat').forEach(el => {
            const statType = el.dataset.stat;
            if (stats[statType]) {
                el.textContent = stats[statType].toLocaleString();
            }
        });
    }
}

// ===== INITIALIZATION =====

// Add missing CSS for toasts and modals
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        border-left: 4px solid #3b82f6;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-success {
        border-left-color: #10b981;
    }
    
    .toast-error {
        border-left-color: #ef4444;
    }
    
    .toast-warning {
        border-left-color: #f59e0b;
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9998;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .modal-overlay.active {
        opacity: 1;
        visibility: visible;
    }
    
    .modal {
        background: white;
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .modal-overlay.active .modal {
        transform: scale(1);
    }
    
    .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 10px;
    }
    
    .typing-indicator span {
        width: 8px;
        height: 8px;
        background: #9ca3af;
        border-radius: 50%;
        animation: typing 1.4s infinite;
    }
    
    .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 60%, 100% {
            transform: translateY(0);
        }
        30% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

// Export for use in HTML
window.DailyWorkAI = {
    login: handleLogin,
    signup: handleSignup,
    addTask: handleTaskSubmit,
    addHabit: handleHabitSubmit,
    addNote: handleNoteSubmit,
    startTimer: startTimer,
    pauseTimer: pauseTimer,
    resetTimer: resetTimer,
    sendAIMessage: sendAIMessage,
    unlockPremium: unlockPremium,
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal
};