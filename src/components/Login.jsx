// client/src/components/Login.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth

const API_URL = import.meta.env.VITE_API_URL;

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
      let message = 'Login failed. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      setErrorMsg(message);
      console.error('Login error:', error);
    }
  };

  // Destructure form fields for convenience
  const { email, password } = formData;

  return (
    <div>
      <h2>Login</h2>
      {/* Show error message if present */}
      {errorMsg && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;