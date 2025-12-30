import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  Clock,
  Flag,
  CheckCircle,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  Brain,
  Zap,
  ListTodo
} from 'lucide-react';
import { db, collections } from '../firebase/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

const SmartTaskManager = ({ user, userData }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    estimatedTime: 60,
    tags: []
  });
  const [editingTask, setEditingTask] = useState(null);
  const [aiBreakdown, setAiBreakdown] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;

    let tasksQuery;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        tasksQuery = query(
          collection(db, collections.tasks),
          where('userId', '==', user.uid),
          where('dueDate', '>=', today),
          where('dueDate', '<', new Date(today.getTime() + 24 * 60 * 60 * 1000)),
          orderBy('dueDate', 'asc')
        );
        break;
      case 'upcoming':
        tasksQuery = query(
          collection(db, collections.tasks),
          where('userId', '==', user.uid),
          where('dueDate', '>', new Date(today.getTime() + 24 * 60 * 60 * 1000)),
          orderBy('dueDate', 'asc')
        );
        break;
      case 'overdue':
        tasksQuery = query(
          collection(db, collections.tasks),
          where('userId', '==', user.uid),
          where('dueDate', '<', today),
          where('status', '==', 'todo'),
          orderBy('dueDate', 'asc')
        );
        break;
      case 'completed':
        tasksQuery = query(
          collection(db, collections.tasks),
          where('userId', '==', user.uid),
          where('status', '==', 'completed'),
          orderBy('completedAt', 'desc')
        );
        break;
      default:
        tasksQuery = query(
          collection(db, collections.tasks),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
    }

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [user, filter]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const taskData = {
        userId: user.uid,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: 'todo',
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
        estimatedTime: parseInt(newTask.estimatedTime) || 60,
        tags: newTask.tags,
        createdAt: serverTimestamp(),
        completedAt: null
      };

      await addDoc(collection(db, collections.tasks), taskData);

      // Update user stats
      const userRef = doc(db, collections.users, user.uid);
      await updateDoc(userRef, {
        totalTasks: increment(1)
      });

      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        estimatedTime: 60,
        tags: []
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const taskRef = doc(db, collections.tasks, taskId);
      await updateDoc(taskRef, updates);

      if (updates.status === 'completed') {
        // Update user stats
        const userRef = doc(db, collections.users, user.uid);
        await updateDoc(userRef, {
          completedTasks: increment(1)
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteDoc(doc(db, collections.tasks, taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleAiBreakdown = async (taskTitle) => {
    if (userData?.plan !== 'premium') {
      alert('Premium feature! Watch an ad to unlock AI task breakdown.');
      return;
    }

    setIsAiProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const subtasks = [
      { title: `Research ${taskTitle} requirements`, time: 45, priority: 'high' },
      { title: 'Create initial outline', time: 30, priority: 'medium' },
      { title: 'Draft first section', time: 60, priority: 'high' },
      { title: 'Review and edit', time: 45, priority: 'medium' },
      { title: 'Final polish and submission', time: 30, priority: 'low' }
    ];

    setAiBreakdown(subtasks);
    setIsAiProcessing(false);
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description?.toLowerCase().includes(search.toLowerCase()) ||
    task.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
    urgent: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <div className="smart-task-manager p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Smart Task Manager</h1>
            <p className="text-gray-600">Break down complex goals into achievable steps</p>
          </div>
          
          <button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-2xl font-bold text-purple-600">
              {tasks.filter(t => t.status === 'todo').length}
            </div>
            <div className="text-gray-600">Pending Tasks</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.priority === 'high').length}
            </div>
            <div className="text-gray-600">High Priority</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-2xl font-bold text-orange-600">
              {tasks.filter(t => {
                const dueDate = t.dueDate?.toDate();
                return dueDate && dueDate < new Date() && t.status === 'todo';
              }).length}
            </div>
            <div className="text-gray-600">Overdue</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'today', 'upcoming', 'overdue', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {(isAdding || editingTask) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setIsAdding(false);
              setEditingTask(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              
              <form onSubmit={editingTask ? (e) => {
                e.preventDefault();
                handleUpdateTask(editingTask.id, {
                  title: newTask.title,
                  description: newTask.description,
                  priority: newTask.priority,
                  dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
                  estimatedTime: parseInt(newTask.estimatedTime) || 60,
                  tags: newTask.tags
                });
                setEditingTask(null);
                setNewTask({
                  title: '',
                  description: '',
                  priority: 'medium',
                  dueDate: '',
                  estimatedTime: 60,
                  tags: []
                });
              } : handleAddTask}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Task Title</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="What needs to be done?"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Add details..."
                      rows="3"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Due Date</label>
                      <input
                        type="datetime-local"
                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Time Estimate (minutes)</label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={newTask.estimatedTime}
                        onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  {userData?.plan === 'premium' && newTask.title && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => handleAiBreakdown(newTask.title)}
                        disabled={isAiProcessing}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                      >
                        {isAiProcessing ? (
                          <>
                            <Brain className="w-4 h-4 inline mr-2 animate-pulse" />
                            AI Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 inline mr-2" />
                            AI Break Down Task
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {aiBreakdown.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <h3 className="font-bold mb-2">AI Suggested Subtasks:</h3>
                      <ul className="space-y-2">
                        {aiBreakdown.map((subtask, index) => (
                          <li key={index} className="flex items-center justify-between p-2 bg-white rounded">
                            <span>{subtask.title}</span>
                            <span className="text-sm text-gray-600">{subtask.time}min</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingTask(null);
                        setNewTask({
                          title: '',
                          description: '',
                          priority: 'medium',
                          dueDate: '',
                          estimatedTime: 60,
                          tags: []
                        });
                      }}
                      className="px-6 py-3 border rounded-xl font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      {editingTask ? 'Update Task' : 'Add Task'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredTasks.length > 0 ? (
          <div className="divide-y">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button
                      onClick={() => handleUpdateTask(task.id, {
                        status: task.status === 'completed' ? 'todo' : 'completed',
                        completedAt: task.status === 'todo' ? serverTimestamp() : null
                      })}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.status === 'completed' && '✓'}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-lg ${
                          task.status === 'completed' ? 'line-through text-gray-500' : ''
                        }`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.tags?.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {task.dueDate.toDate().toLocaleDateString()}
                          </div>
                        )}
                        {task.estimatedTime && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {task.estimatedTime}min
                          </div>
                        )}
                        <div className="flex items-center">
                          <ListTodo className="w-4 h-4 mr-1" />
                          {task.subtasks?.length || 0} subtasks
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {task.status !== 'completed' && userData?.plan === 'premium' && (
                      <button
                        onClick={() => handleAiBreakdown(task.title)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        title="AI Break Down"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setNewTask({
                          title: task.title,
                          description: task.description || '',
                          priority: task.priority,
                          dueDate: task.dueDate ? task.dueDate.toDate().toISOString().slice(0, 16) : '',
                          estimatedTime: task.estimatedTime || 60,
                          tags: task.tags || []
                        });
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ListTodo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Try a different search' : 'Add your first task to get started'}
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Your First Task
            </button>
          </div>
        )}
      </div>

      {/* AI Features Banner */}
      {userData?.plan !== 'premium' && (
        <div className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Unlock AI Task Breakdown</h3>
              <p>Watch a 30-second ad to access AI-powered task management for 24 hours</p>
            </div>
            <button className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:shadow-lg transition-all">
              🎬 Unlock AI Features
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTaskManager;