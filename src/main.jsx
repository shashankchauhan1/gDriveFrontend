// Entry point for React application
// Renders the App component and wraps it with AuthProvider for global authentication state

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // Provides authentication context
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider makes auth state available throughout the app */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);