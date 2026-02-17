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

/**
 * Main App Component
 * Handles routing, authentication state, theme switching, and navigation
 */
function App() {
  // Get authentication state and logout function from context
  const { isAuthenticated, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  // State for mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply theme to document and persist to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close sidebar when route changes (for better UX on mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <Router>
      <div>
        {/* Navigation bar - responsive header */}
        <nav className="navbar">
          <ul className="nav-list">
            {/* Logo/Brand section */}
            <li className="nav-brand">
              <span className="badge brand">☁️ Cloud-Box</span>
            </li>

            {!isAuthenticated ? (
              <>
                {/* Show Register and Login links if not authenticated */}
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
              </>
            ) : (
              <>
                {/* Desktop navigation links - hidden on mobile */}
                <li className="nav-desktop">
                  <Link to="/dashboard">My Drive</Link>
                </li>
                <li className="nav-desktop">
                  <Link to="/shared-with-me">Shared with me</Link>
                </li>
                <li className="nav-desktop">
                  <Link to="/history">History</Link>
                </li>
                <li className="nav-desktop">
                  <Link to="/profile">Profile</Link>
                </li>
                
                {/* Theme toggle and logout buttons */}
                <li className="nav-right-items">
                  <button 
                    className="btn secondary" 
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  >
                    {theme === 'light' ? '🌙' : '☀️'}
                  </button>
                </li>
                <li className="nav-right-items">
                  <button onClick={logout} className="btn">Logout</button>
                </li>

                {/* Mobile hamburger menu button */}
                <li className="nav-hamburger">
                  <button 
                    className="hamburger"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title="Toggle navigation menu"
                    aria-label="Toggle navigation"
                  >
                    <span />
                    <span />
                    <span />
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
            {/* Mobile overlay when sidebar is open */}
            {sidebarOpen && (
              <div 
                className="sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Responsive sidebar - slides in on mobile, always visible on desktop */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
              <div className="section">📍 Navigation</div>
              <ul>
                <li>
                  <Link className="linky" to="/dashboard" onClick={() => setSidebarOpen(false)}>
                    🏠 Home
                  </Link>
                </li>
                <li>
                  <Link className="linky" to="/shared-with-me" onClick={() => setSidebarOpen(false)}>
                    🤝 Shared with me
                  </Link>
                </li>
                <li>
                  <Link className="linky" to="/history" onClick={() => setSidebarOpen(false)}>
                    🕑 Recent
                  </Link>
                </li>
                <li>
                  <Link className="linky" to="/trash" onClick={() => setSidebarOpen(false)}>
                    🗑️ Trash
                  </Link>
                </li>
              </ul>
            </aside>

            {/* Main content area */}
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