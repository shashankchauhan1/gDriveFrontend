// client/src/components/Login.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function Login() {
  // State for form data and error message
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth(); 
  const navigate = useNavigate();

  // Handle input changes
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); // Clear error on change
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      login(response.data.token);
      alert('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      // Gracefully handle error and show user-friendly message
      let message = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
      setErrorMsg(message);
      console.error('Login error:', error);
    }
  };

  // Destructure form fields for convenience
  const { email, password } = formData;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2>Welcome back</h2>
        {/* Show error message if present */}
        {errorMsg && (
          <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}
        <form onSubmit={onSubmit} className="form">
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={!email || !password}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;