import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db, doc, getDoc, updateUserActivity } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdBanner from './components/AdBanner';

// Pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AIDailyPlanner from './pages/AIDailyPlanner';
import SmartTaskManager from './pages/SmartTaskManager';
import FocusTimer from './pages/FocusTimer';
import HabitBuilder from './pages/HabitBuilder';
import SmartNotes from './pages/SmartNotes';
import ProductivityAnalytics from './pages/ProductivityAnalytics';
import PremiumFeatures from './pages/PremiumFeatures';
import AuthPage from './pages/AuthPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { AdProvider } from './contexts/AdContext';

// Styles
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Get user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          // Update last active timestamp
          updateUserActivity(user.uid);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading DailyWork AI...</p>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <AdProvider>
            <div className="app">
              <Toaster position="top-right" />
              
              {user ? (
                <>
                  <Navbar user={user} userData={userData} />
                  <Sidebar userData={userData} />
                  <main className="main-content">
                    <AdBanner position="top" />
                    <Routes>
                      <Route path="/" element={<Dashboard user={user} userData={userData} />} />
                      <Route path="/planner" element={<AIDailyPlanner user={user} userData={userData} />} />
                      <Route path="/tasks" element={<SmartTaskManager user={user} userData={userData} />} />
                      <Route path="/focus" element={<FocusTimer user={user} userData={userData} />} />
                      <Route path="/habits" element={<HabitBuilder user={user} userData={userData} />} />
                      <Route path="/notes" element={<SmartNotes user={user} userData={userData} />} />
                      <Route path="/analytics" element={<ProductivityAnalytics user={user} userData={userData} />} />
                      <Route path="/premium" element={<PremiumFeatures user={user} userData={userData} />} />
                      <Route path="/profile" element={<Profile user={user} userData={userData} />} />
                      <Route path="/settings" element={<Settings user={user} userData={userData} />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    <AdBanner position="bottom" />
                  </main>
                </>
              ) : (
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              )}
            </div>
          </AdProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;