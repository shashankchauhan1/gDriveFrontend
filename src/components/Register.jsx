/**
 * Register Component
 * 
 * User registration form for creating new Cloud-Box account
 * Features:
 * - Username, email, and password registration
 * - Password validation (minimum 6 characters)
 * - Error handling with user-friendly messages
 * - Responsive mobile design
 * - Auto-redirect to login on successful registration
 */

import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';
import '../styles/AuthForm.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

/**
 * Password strength indicator for user feedback
 */
const PasswordStrengthIndicator = ({ password }) => {
  if (!password) return null;
  
  let strength = 'weak';
  if (password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    strength = 'strong';
  } else if (password.length >= 6) {
    strength = 'medium';
  }
  
  const strengthStyles = {
    weak: { color: '#ef4444', label: 'Weak' },
    medium: { color: '#f59e0b', label: 'Medium' },
    strong: { color: '#10b981', label: 'Strong' }
  };
  
  return (
    <div style={{ fontSize: '0.8rem', marginTop: '4px', color: strengthStyles[strength].color }}>
      Password strength: {strengthStyles[strength].label}
    </div>
  );
};

function Register() {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Context and navigation
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
   * Validates and sends registration request to API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password.length < 6) {
      const message = 'Password must be at least 6 characters long';
      setErrorMsg(message);
      showToast({ type: 'error', message });
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/auth/register`, 
        formData
      );
      
      showToast({ 
        type: 'success', 
        message: 'Account created successfully! Redirecting to login...' 
      });
      
      // Redirect to login after brief delay
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const message = getErrorMessage(
        error, 
        'Registration failed. Please try again.'
      );
      setErrorMsg(message);
      showToast({ 
        type: 'error', 
        message 
      });
      console.error('Registration error:', message);
    } finally {
      setIsLoading(false);
    }
  };

  const { username, email, password } = formData;
  const isFormValid = username && email && password && password.length >= 6 && !isLoading;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>☁️ Cloud-Box</h1>
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join Cloud-Box to start storing and sharing your files</p>
          </div>

          {/* Error message display */}
          {errorMsg && (
            <div className="alert alert-error" role="alert">
              <span>❌ {errorMsg}</span>
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                className="form-input"
                type="text"
                name="username"
                value={username}
                onChange={handleChange}
                placeholder="Choose your username"
                required
                autoFocus
                minLength="3"
                disabled={isLoading}
              />
            </div>

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
                placeholder="At least 6 characters"
                minLength="6"
                required
                disabled={isLoading}
              />
              <PasswordStrengthIndicator password={password} />
            </div>

            {/* Submit button */}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!isFormValid}
            >
              {isLoading ? '⏳ Creating account...' : '✨ Create Account'}
            </button>
          </form>

          {/* Sign in link */}
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;