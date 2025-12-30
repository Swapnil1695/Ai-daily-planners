import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RefreshCw,
  Settings,
  Volume2,
  VolumeX,
  Target,
  BarChart3,
  Zap,
  Bell,
  Clock,
  Coffee,
  Brain
} from 'lucide-react';
import { db, collections } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { adService } from '../services/ads';

const FocusTimer = ({ user, userData }) => {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [cycles, setCycles] = useState(0);
  const [settings, setSettings] = useState({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    cyclesBeforeLongBreak: 4,
    autoStartBreaks: true,
    autoStartWork: false,
    soundEnabled: true,
    notifications: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [distractionBlocked, setDistractionBlocked] = useState(false);
  const [ambientSound, setAmbientSound] = useState(null);
  const [focusScore, setFocusScore] = useState(85);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalTime: 0,
    avgFocusScore: 0
  });

  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const modes = {
    work: { label: 'Focus Time', color: 'from-red-500 to-orange-500', time: settings.workTime * 60 },
    shortBreak: { label: 'Short Break', color: 'from-green-500 to-emerald-500', time: settings.shortBreak * 60 },
    longBreak: { label: 'Long Break', color: 'from-blue-500 to-cyan-500', time: settings.longBreak * 60 }
  };

  useEffect(() => {
    setTime(modes[mode].time);
  }, [mode, settings]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const handleTimerComplete = async () => {
    if (mode === 'work') {
      setCycles(prev => prev + 1);
      
      // Record session
      if (user) {
        await addDoc(collection(db, collections.focusSessions), {
          userId: user.uid,
          mode: 'pomodoro',
          duration: settings.workTime * 60,
          score: focusScore,
          endTime: serverTimestamp()
        });
      }
      
      if (cycles + 1 >= settings.cyclesBeforeLongBreak) {
        setMode('longBreak');
        setCycles(0);
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('work');
    }
    
    setIsActive(false);
    
    // Play sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play();
    }
    
    // Show notification
    if (settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Focus Timer Complete`, {
        body: mode === 'work' ? 'Time for a break!' : 'Back to work!',
        icon: '/icon.png'
      });
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(modes[mode].time);
  };

  const skipToNext = () => {
    setIsActive(false);
    if (mode === 'work') {
      if (cycles + 1 >= settings.cyclesBeforeLongBreak) {
        setMode('longBreak');
        setCycles(0);
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('work');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnableDistractionBlock = () => {
    if (userData?.plan !== 'premium') {
      alert('Premium feature! Watch an ad to unlock distraction blocking.');
      return;
    }
    
    setDistractionBlocked(true);
    // In production, this would trigger browser extension or site blocking
  };

  const ambientSounds = [
    { id: 'rain', name: 'Rain', emoji: '🌧️' },
    { id: 'forest', name: 'Forest', emoji: '🌲' },
    { id: 'coffee', name: 'Coffee Shop', emoji: '☕' },
    { id: 'white', name: 'White Noise', emoji: '📻' },
    { id: 'waves', name: 'Ocean Waves', emoji: '🌊' }
  ];

  const progress = ((modes[mode].time - time) / modes[mode].time) * 100;

  return (
    <div className="focus-timer p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Focus Timer</h1>
            <p className="text-gray-600">Adaptive Pomodoro timer with distraction blocking</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {sessionStats.totalSessions}
              </div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 bg-white rounded-xl shadow hover:shadow-md"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white">
            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="text-sm uppercase tracking-wider text-gray-400 mb-2">
                {modes[mode].label}
              </div>
              <div className="text-8xl font-bold mb-4 font-mono">
                {formatTime(time)}
              </div>
              <div className="text-gray-400 mb-6">
                Cycle {cycles + 1} of {settings.cyclesBeforeLongBreak}
              </div>
              
              {/* Progress Circle */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#333"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={`url(#gradient-${mode})`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="gradient-work" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#fb923c" />
                    </linearGradient>
                    <linearGradient id="gradient-shortBreak" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id="gradient-longBreak" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleTimer}
                  className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                    isActive
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-5 h-5 inline mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 inline mr-2" />
                      Start
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetTimer}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold"
                >
                  <RefreshCw className="w-5 h-5 inline mr-2" />
                  Reset
                </button>
                
                <button
                  onClick={skipToNext}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold"
                >
                  Skip
                </button>
              </div>
            </div>
            
            {/* Mode Selector */}
            <div className="flex justify-center gap-4 mb-8">
              {Object.entries(modes).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isActive && window.confirm('Switch mode? Timer will reset.')) {
                      setIsActive(false);
                      setMode(key);
                    } else if (!isActive) {
                      setMode(key);
                    }
                  }}
                  className={`px-6 py-2 rounded-xl transition-all ${
                    mode === key
                      ? `bg-gradient-to-r ${color}`
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Focus Score */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  <div className="text-lg font-bold">Focus Score</div>
                </div>
                <div className="text-3xl font-bold text-purple-400">{focusScore}/100</div>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${focusScore}%` }}
                />
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Based on consistency, session length, and breaks
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ambient Sounds */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-bold">Ambient Sounds</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ambientSounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => setAmbientSound(sound.id === ambientSound ? null : sound.id)}
                  className={`p-3 rounded-xl border transition-all ${
                    ambientSound === sound.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{sound.emoji}</div>
                  <div className="text-sm">{sound.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Distraction Blocker */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 mr-2 text-red-600" />
              <h2 className="text-xl font-bold">Distraction Blocker</h2>
            </div>
            
            {distractionBlocked ? (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-3xl mb-2">🚫</div>
                <div className="font-bold text-green-700 mb-1">Blocking Enabled</div>
                <div className="text-sm text-green-600">
                  Social media and distractions are blocked
                </div>
                <button
                  onClick={() => setDistractionBlocked(false)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700"
                >
                  Disable Blocking
                </button>
              </div>
            ) : userData?.plan === 'premium' ? (
              <button
                onClick={handleEnableDistractionBlock}
                className="w-full p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Target className="w-5 h-5 inline mr-2" />
                Enable Distraction Blocking
              </button>
            ) : (
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="font-bold text-yellow-700 mb-2">Premium Feature</div>
                <p className="text-sm text-yellow-600 mb-3">
                  Block distracting websites during focus sessions
                </p>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium">
                  🎬 Unlock with Ad
                </button>
              </div>
            )}
          </div>

          {/* Session Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              <h2 className="text-xl font-bold">Session Stats</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Today</span>
                <span className="font-bold">2h 45m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Week</span>
                <span className="font-bold">14h 20m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Session</span>
                <span className="font-bold">48m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Best Streak</span>
                <span className="font-bold">7 days</span>
              </div>
            </div>
            <button className="w-full mt-4 p-3 border rounded-xl text-center hover:bg-gray-50">
              View Full Analytics
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 backdrop-blur-sm">
                <Bell className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">Set Reminder</div>
              </button>
              <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 backdrop-blur-sm">
                <Zap className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">Energy Boost</div>
              </button>
              <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 backdrop-blur-sm">
                <Coffee className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">Break Time</div>
              </button>
              <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 backdrop-blur-sm">
                <Clock className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">Time Audit</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Timer Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Focus Time (minutes)</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-xl"
                  value={settings.workTime}
                  onChange={(e) => setSettings({...settings, workTime: parseInt(e.target.value)})}
                  min="1"
                  max="60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Short Break (minutes)</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-xl"
                  value={settings.shortBreak}
                  onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value)})}
                  min="1"
                  max="30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Long Break (minutes)</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-xl"
                  value={settings.longBreak}
                  onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value)})}
                  min="1"
                  max="60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cycles before long break: {settings.cyclesBeforeLongBreak}
                </label>
                <input
                  type="range"
                  className="w-full"
                  min="1"
                  max="8"
                  value={settings.cyclesBeforeLongBreak}
                  onChange={(e) => setSettings({...settings, cyclesBeforeLongBreak: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings({...settings, autoStartBreaks: e.target.checked})}
                  />
                  Auto-start breaks
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={settings.autoStartWork}
                    onChange={(e) => setSettings({...settings, autoStartWork: e.target.checked})}
                  />
                  Auto-start work sessions
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                  />
                  Enable sounds
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  />
                  Enable notifications
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 border rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </div>
  );
};

export default FocusTimer;