// Main application component for MERN-Drive
// Handles routing and navigation for authentication and dashboard features

import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SharedWithMe from './components/SharedWithMe'; // Component for files shared with user
import './App.css';

function App() {
  // Get authentication state and logout function from context
  const { isAuthenticated, logout } = useAuth();

  return (
    <Router>
      <div>
        {/* Navigation bar changes based on authentication status */}
        <nav>
          <ul>
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
                <li><button onClick={logout}>Logout</button></li>
              </>
            )}
          </ul>
        </nav>
        
        <h1>MERN-Drive</h1>

        {/* Define application routes */}
        <Routes>
          {/* Redirect root based on authentication */}
          <Route path="/" element={!isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* Dashboard is protected */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* SharedWithMe is protected */}
          <Route 
            path="/shared-with-me" 
            element={
              <ProtectedRoute>
                <SharedWithMe />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;