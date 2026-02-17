/**
 * Login Component
 * 
 * User authentication form for signing into Cloud-Box
 * Features:
 * - Email/password authentication
 * - Error handling with user-friendly messages
 * - Responsive mobile design
 * - Auto-redirect on successful login
 */

import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';
import '../styles/AuthForm.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function Login() {
  // Form state
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Context and navigation
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  /**
   * Handle input field changes
   * Clears error message when user starts typing
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    setErrorMsg(''); // Clear error on user input
  };

  /**
   * Handle form submission
   * Validates and sends login request to API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`, 
        formData
      );
      
      // Store token and update auth context
      login(response.data.token);
      showToast({ 
        type: 'success', 
        message: 'Logged in successfully!' 
      });
      navigate('/dashboard');
    } catch (error) {
      const message = getErrorMessage(
        error, 
        'Login failed. Please check your credentials and try again.'
      );
      setErrorMsg(message);
      showToast({ 
        type: 'error', 
        message 
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { email, password } = formData;
  const isFormValid = email && password && !isLoading;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>☁️ Cloud-Box</h1>
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Sign in to your account to access your files</p>
          </div>

          {/* Error message display */}
          {errorMsg && (
            <div className="alert alert-error" role="alert">
              <span>❌ {errorMsg}</span>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                className="form-input"
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoFocus
                disabled={isLoading}
              />
            </div>

            {/* Password field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                className="form-input"
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit button */}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!isFormValid}
            >
              {isLoading ? '⏳ Signing in...' : '🔓 Sign In'}
            </button>
          </form>

          {/* Sign up link */}
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;