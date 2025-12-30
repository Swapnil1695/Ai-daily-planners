import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Target,
  BarChart3,
  Zap,
  Bell,
  Plus,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, collections } from '../firebase/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { adService } from '../services/ads';

const Dashboard = ({ user, userData }) => {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [stats, setStats] = useState({
    todayTasks: 0,
    completedToday: 0,
    streak: 0,
    focusTime: 0
  });
  const [premiumTimeRemaining, setPremiumTimeRemaining] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Load today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tasksQuery = query(
      collection(db, collections.tasks),
      where('userId', '==', user.uid),
      where('dueDate', '>=', today),
      orderBy('dueDate', 'asc')
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData.slice(0, 5));
      
      const todayTasks = tasksData.filter(task => {
        const taskDate = task.dueDate?.toDate();
        return taskDate && taskDate.toDateString() === today.toDateString();
      });
      
      setStats(prev => ({
        ...prev,
        todayTasks: todayTasks.length,
        completedToday: todayTasks.filter(t => t.status === 'completed').length
      }));
    });

    // Load habits
    const habitsQuery = query(
      collection(db, collections.habits),
      where('userId', '==', user.uid),
      orderBy('streak', 'desc')
    );

    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData.slice(0, 3));
      setStats(prev => ({
        ...prev,
        streak: habitsData.reduce((max, habit) => Math.max(max, habit.streak), 0)
      }));
    });

    // Load focus sessions from last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const focusQuery = query(
      collection(db, collections.focusSessions),
      where('userId', '==', user.uid),
      where('endTime', '>=', weekAgo),
      orderBy('endTime', 'desc')
    );

    const unsubscribeFocus = onSnapshot(focusQuery, (snapshot) => {
      const sessions = snapshot.docs.map(doc => doc.data());
      const totalFocusTime = sessions.reduce((total, session) => 
        total + (session.duration || 0), 0
      );
      setFocusSessions(sessions.slice(0, 3));
      setStats(prev => ({ ...prev, focusTime: totalFocusTime }));
    });

    // Update premium time remaining
    const updatePremiumTime = () => {
      if (userData) {
        const remaining = adService.getPremiumTimeRemaining(userData);
        setPremiumTimeRemaining(remaining);
      }
    };

    updatePremiumTime();
    const premiumInterval = setInterval(updatePremiumTime, 60000);

    return () => {
      unsubscribeTasks();
      unsubscribeHabits();
      unsubscribeFocus();
      clearInterval(premiumInterval);
    };
  }, [user, userData]);

  const canWatchAd = adService.canWatchAd(userData);

  const handleUnlockPremium = async () => {
    if (!canWatchAd) return;
    
    const success = await adService.showRewardedAd(user.uid);
    if (success) {
      // Premium unlocked, refresh page or show success message
      window.location.reload();
    }
  };

  const statCards = [
    {
      title: "Today's Tasks",
      value: `${stats.completedToday}/${stats.todayTasks}`,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      link: "/tasks"
    },
    {
      title: "Focus Time",
      value: `${Math.round(stats.focusTime / 60)}h`,
      icon: <Clock className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      link: "/focus"
    },
    {
      title: "Current Streak",
      value: `${stats.streak} days`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      link: "/habits"
    },
    {
      title: "Productivity",
      value: stats.todayTasks > 0 
        ? `${Math.round((stats.completedToday / stats.todayTasks) * 100)}%`
        : "0%",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-orange-500 to-red-500",
      link: "/analytics"
    }
  ];

  return (
    <div className="dashboard p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {userData?.displayName || 'User'}!
            </h1>
            <p className="text-gray-600">Here's your productivity overview</p>
          </div>
          
          {premiumTimeRemaining > 0 ? (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full">
              ⚡ Premium: {adService.formatTimeRemaining(premiumTimeRemaining)}
            </div>
          ) : canWatchAd ? (
            <button
              onClick={handleUnlockPremium}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              🎬 Unlock Premium (30s Ad)
            </button>
          ) : (
            <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full">
              Free Plan
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.title}</div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/planner">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-xl text-center hover:scale-105 transition-transform">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold">AI Daily Planner</div>
            </div>
          </Link>
          <Link to="/tasks">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl text-center hover:scale-105 transition-transform">
              <Plus className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold">Add Task</div>
            </div>
          </Link>
          <Link to="/focus">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl text-center hover:scale-105 transition-transform">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold">Start Focus</div>
            </div>
          </Link>
          <Link to="/habits">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl text-center hover:scale-105 transition-transform">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold">Track Habit</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Tasks */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Today's Tasks</h2>
            <Link to="/tasks" className="text-purple-600 hover:text-purple-700 font-medium">
              View All
            </Link>
          </div>
          
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                  <div className="flex items-center">
                    <button className={`w-6 h-6 rounded-full border-2 mr-3 ${
                      task.status === 'completed' 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {task.status === 'completed' && '✓'}
                    </button>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-500">
                        {task.dueDate?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tasks for today. Add some tasks to get started!
            </div>
          )}
        </div>

        {/* Habit Streaks */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Habit Streaks</h2>
            <Link to="/habits" className="text-purple-600 hover:text-purple-700 font-medium">
              View All
            </Link>
          </div>
          
          {habits.length > 0 ? (
            <div className="space-y-4">
              {habits.map((habit) => (
                <div key={habit.id} className="p-4 border rounded-xl hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{habit.name}</div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {habit.streak} days
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">{habit.description}</div>
                  <div className="flex space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded ${
                          i < Math.min(habit.streak, 7)
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No habits yet. Start building productive habits!
            </div>
          )}
        </div>
      </div>

      {/* Recent Focus Sessions */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">Recent Focus Sessions</h2>
        {focusSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {focusSessions.map((session, index) => (
              <div key={index} className="border rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{session.mode || 'Pomodoro'}</div>
                  <div className="text-blue-600 font-bold">
                    {Math.round(session.duration / 60)}min
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {session.endTime?.toDate().toLocaleDateString()}
                </div>
                <div className="mt-2 text-sm">
                  Focus Score: <span className="font-bold">{session.score || '85'}/100</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No focus sessions recorded. Start your first session!
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      {premiumTimeRemaining > 0 && (
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">AI Suggestions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <div className="font-bold mb-2">Schedule Deep Work</div>
              <div className="text-white/90">
                Based on your patterns, tomorrow 9-11 AM is optimal for focused work.
              </div>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <div className="font-bold mb-2">Task Priority</div>
              <div className="text-white/90">
                Your "Complete project report" task has the highest impact. Focus on it first.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;