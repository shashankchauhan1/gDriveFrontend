// Main application component for MERN-Drive
// Handles routing and navigation for authentication and dashboard features

import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SharedWithMe from './components/SharedWithMe'; // Component for files shared with user
import Profile from './components/Profile';
import History from './components/History';
import Trash from './components/Trash';
import './App.css';

function App() {
  // Get authentication state and logout function from context
  const { isAuthenticated, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Router>
      <div>
        {/* Navigation bar changes based on authentication status */}
        <nav>
          <ul>
            <li style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge brand">Cloud-Box</span>
            </li>
            {!isAuthenticated ? (
              <>
                {/* Show Register and Login links if not authenticated */}
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
              </>
            ) : (
              <>
                {/* Show dashboard, shared files, and logout if authenticated */}
                <li><Link to="/dashboard">My Drive</Link></li>
                <li><Link to="/shared-with-me">Shared with me</Link></li>
                <li><Link to="/history">History</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><button onClick={logout}>Logout</button></li>
                <li>
                  <button className="btn secondary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                    {theme === 'light' ? 'Dark' : 'Light'} mode
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        <h1>Cloud-Box</h1>

        {/* Define application routes with persistent sidebar for authenticated views */}
        {!isAuthenticated ? (
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          <div className="layout">
            <aside className="sidebar">
              <div className="section">Navigation</div>
              <ul>
                <li><Link className="linky" to="/dashboard">🏠 Home</Link></li>
                {/* <li><Link className="linky" to="/dashboard">📁 My Drive</Link></li> */}
                <li><Link className="linky" to="/shared-with-me">🤝 Shared with me</Link></li>
                <li><Link className="linky" to="/history">🕑 Recent</Link></li>
                <li><Link className="linky" to="/trash">🗑️ Trash</Link></li>
              </ul>
            </aside>
            <div className="stack">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/history" 
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shared-with-me" 
                  element={
                    <ProtectedRoute>
                      <SharedWithMe />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/trash" 
                  element={
                    <ProtectedRoute>
                      <Trash />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;