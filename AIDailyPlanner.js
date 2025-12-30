import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Target, 
  Zap, 
  Brain, 
  TrendingUp,
  Cloud,
  Users,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Edit,
  Trash2
} from 'lucide-react';
import { db, collections } from '../firebase/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const AIDailyPlanner = ({ user, userData }) => {
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [weather, setWeather] = useState(null);
  const [energyLevels, setEnergyLevels] = useState([
    { time: '06:00', level: 30 },
    { time: '09:00', level: 90 },
    { time: '12:00', level: 70 },
    { time: '15:00', level: 50 },
    { time: '18:00', level: 60 },
    { time: '21:00', level: 40 }
  ]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Load today's tasks for scheduling
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tasksQuery = query(
      collection(db, collections.tasks),
      where('userId', '==', user.uid),
      where('dueDate', '>=', today),
      where('status', '==', 'todo'),
      orderBy('dueDate', 'asc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    });

    // Simulate weather data
    fetchWeatherData();

    return () => unsubscribe();
  }, [user]);

  const fetchWeatherData = async () => {
    // In production, use actual weather API
    setWeather({
      temp: 22,
      condition: 'Sunny',
      icon: '☀️',
      suggestion: 'Great weather for productivity!'
    });
  };

  const generateAISchedule = async () => {
    if (userData?.plan !== 'premium') {
      alert('Premium feature! Watch an ad to unlock AI scheduling.');
      return;
    }

    setIsGenerating(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const generatedSchedule = [
      { time: '09:00', task: 'Morning Planning', type: 'planning', duration: 30, priority: 'high' },
      { time: '09:30', task: 'Deep Work: Project Report', type: 'deep-work', duration: 90, priority: 'high' },
      { time: '11:00', task: 'Team Meeting', type: 'meeting', duration: 60, priority: 'medium' },
      { time: '13:00', task: 'Lunch Break', type: 'break', duration: 60, priority: 'low' },
      { time: '14:00', task: 'Creative Tasks', type: 'creative', duration: 120, priority: 'medium' },
      { time: '16:00', task: 'Email & Communication', type: 'communication', duration: 60, priority: 'low' },
      { time: '17:00', task: 'Review & Planning', type: 'review', duration: 45, priority: 'medium' }
    ];

    setSchedule(generatedSchedule);
    setIsGenerating(false);
  };

  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const handleTimeSlotClick = (time) => {
    setSelectedTimeSlot(time);
  };

  const addToSchedule = async (taskId, time) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newScheduleItem = {
      time,
      task: task.title,
      type: 'task',
      duration: task.estimatedTime || 60,
      priority: task.priority,
      taskId
    };

    setSchedule([...schedule, newScheduleItem].sort((a, b) => 
      a.time.localeCompare(b.time)
    ));

    // Update task with scheduled time
    const taskRef = doc(db, collections.tasks, taskId);
    await updateDoc(taskRef, {
      scheduledTime: time
    });

    setSelectedTimeSlot(null);
  };

  const completeScheduleItem = async (index) => {
    const item = schedule[index];
    setSchedule(schedule.filter((_, i) => i !== index));

    if (item.taskId) {
      const taskRef = doc(db, collections.tasks, item.taskId);
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: new Date()
      });
    }
  };

  const getEnergyLevel = (time) => {
    const slot = energyLevels.find(e => e.time === time);
    return slot ? slot.level : 50;
  };

  return (
    <div className="ai-daily-planner p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">AI Daily Planner</h1>
            <p className="text-gray-600">Intelligent scheduling based on your energy and priorities</p>
          </div>
          
          <div className="flex gap-4">
            {weather && (
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl">
                <div className="flex items-center">
                  <Cloud className="w-5 h-5 mr-2" />
                  <div>
                    <div className="font-bold">{weather.temp}°C</div>
                    <div className="text-sm">{weather.condition}</div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={generateAISchedule}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Brain className="w-5 h-5 inline mr-2 animate-pulse" />
                  AI Generating...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 inline mr-2" />
                  Generate AI Schedule
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-2xl font-bold text-purple-600">{tasks.length}</div>
            <div className="text-gray-600">Tasks Today</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-2xl font-bold text-green-600">
              {schedule.filter(s => s.completed).length}/{schedule.length}
            </div>
            <div className="text-gray-600">Schedule Complete</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-2xl font-bold text-blue-600">
              {energyLevels.reduce((sum, e) => sum + e.level, 0) / energyLevels.length}%
            </div>
            <div className="text-gray-600">Avg Energy</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-2xl font-bold text-orange-600">
              {schedule.reduce((sum, s) => sum + (s.duration || 0), 0)}m
            </div>
            <div className="text-gray-600">Total Planned</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Tasks & Energy */}
        <div className="space-y-6">
          {/* Energy Levels */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              <h2 className="text-xl font-bold">Energy Levels</h2>
            </div>
            <div className="space-y-4">
              {energyLevels.map((energy, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">{energy.time}</span>
                    <span className="font-bold">{energy.level}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        energy.level >= 80 ? 'bg-green-500' :
                        energy.level >= 60 ? 'bg-blue-500' :
                        energy.level >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${energy.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Schedule important tasks during peak energy times (9 AM - 12 PM)
            </div>
          </div>

          {/* Available Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-bold">Available Tasks</h2>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id}
                  className="p-3 border rounded-xl hover:bg-gray-50 cursor-pointer"
                  onClick={() => selectedTimeSlot && addToSchedule(task.id, selectedTimeSlot)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{task.title}</div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                  {task.description && (
                    <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-500">
                      Est: {task.estimatedTime || 30}min
                    </div>
                    {selectedTimeSlot && (
                      <button className="text-sm text-purple-600 hover:text-purple-700">
                        Add to {selectedTimeSlot}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column - Schedule Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Today's Schedule</h2>
                <p className="text-gray-600">{new Date().toDateString()}</p>
              </div>
              <div className="text-sm text-gray-500">
                {selectedTimeSlot ? (
                  <span className="text-purple-600 font-medium">
                    Selected: {selectedTimeSlot}
                  </span>
                ) : (
                  'Click a time slot to schedule'
                )}
              </div>
            </div>

            <div className="relative">
              {/* Timeline */}
              <div className="border-l-2 border-gray-200 ml-6">
                {timeSlots.map((time, index) => {
                  const scheduleItem = schedule.find(s => s.time === time);
                  const energyLevel = getEnergyLevel(time);
                  
                  return (
                    <div key={time} className="relative mb-1">
                      <div className="absolute -left-8 w-16 text-right text-sm text-gray-500">
                        {time}
                      </div>
                      
                      <div 
                        className={`ml-8 p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedTimeSlot === time 
                            ? 'ring-2 ring-purple-500 bg-purple-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleTimeSlotClick(time)}
                      >
                        {scheduleItem ? (
                          <div className={`p-3 rounded-lg ${
                            scheduleItem.type === 'deep-work' ? 'bg-blue-50 border-blue-200' :
                            scheduleItem.type === 'meeting' ? 'bg-green-50 border-green-200' :
                            scheduleItem.type === 'break' ? 'bg-yellow-50 border-yellow-200' :
                            scheduleItem.type === 'creative' ? 'bg-purple-50 border-purple-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold">{scheduleItem.task}</div>
                                <div className="text-sm text-gray-600">
                                  {scheduleItem.type} • {scheduleItem.duration}min
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    completeScheduleItem(index);
                                  }}
                                  className="p-1 hover:bg-green-100 rounded"
                                >
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSchedule(schedule.filter((_, i) => i !== index));
                                  }}
                                  className="p-1 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center mt-2">
                              <div className={`px-2 py-1 rounded text-xs ${
                                scheduleItem.priority === 'high' ? 'bg-red-100 text-red-800' :
                                scheduleItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {scheduleItem.priority}
                              </div>
                              <div className="ml-auto text-xs text-gray-500">
                                Energy: {energyLevel}%
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 p-2">
                            {selectedTimeSlot === time ? (
                              <div className="text-purple-600 font-medium">
                                Click a task to schedule here
                              </div>
                            ) : (
                              'Empty slot'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Schedule Summary */}
            {schedule.length > 0 && (
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-bold mb-3">Schedule Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {schedule.filter(s => s.type === 'deep-work').length}
                    </div>
                    <div className="text-sm text-gray-600">Deep Work</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {schedule.filter(s => s.type === 'meeting').length}
                    </div>
                    <div className="text-sm text-gray-600">Meetings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {schedule.filter(s => s.type === 'break').length}
                    </div>
                    <div className="text-sm text-gray-600">Breaks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {schedule.reduce((sum, s) => sum + (s.duration || 0), 0)}m
                    </div>
                    <div className="text-sm text-gray-600">Total Time</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          {userData?.plan === 'premium' && (
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 mr-2 text-purple-600" />
                <h3 className="text-lg font-bold">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium mb-1">Optimize Your Schedule</div>
                  <div className="text-sm text-gray-600">
                    Move creative tasks to 2 PM when your energy rebounds
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium mb-1">Conflict Detected</div>
                  <div className="text-sm text-gray-600">
                    You have back-to-back meetings at 11 AM and 12 PM. Consider moving one.
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium mb-1">Break Suggestion</div>
                  <div className="text-sm text-gray-600">
                    Add a 15-minute break after 90 minutes of focused work
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-left">
          <div className="flex items-center mb-3">
            <Clock className="w-6 h-6 mr-3 text-blue-600" />
            <div>
              <div className="font-bold">Time Blocking</div>
              <div className="text-sm text-gray-600">Auto-schedule tasks in time blocks</div>
            </div>
          </div>
        </button>
        
        <button className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-left">
          <div className="flex items-center mb-3">
            <Users className="w-6 h-6 mr-3 text-green-600" />
            <div>
              <div className="font-bold">Team Sync</div>
              <div className="text-sm text-gray-600">Sync with team calendar</div>
            </div>
          </div>
        </button>
        
        <button className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-left">
          <div className="flex items-center mb-3">
            <AlertCircle className="w-6 h-6 mr-3 text-orange-600" />
            <div>
              <div className="font-bold">Conflict Check</div>
              <div className="text-sm text-gray-600">Check for scheduling conflicts</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AIDailyPlanner;