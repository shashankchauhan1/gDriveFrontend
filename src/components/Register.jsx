// client/src/components/Register.jsx

import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const { username, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, formData);
      console.log('Registration successful:', response.data);
      alert('Registration successful! Please log in.');
      // Here you would typically redirect the user or clear the form
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Registration failed';
      console.error('Registration error:', message);
      alert(`Registration failed: ${message}`);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2>Create your account</h2>
        <form onSubmit={onSubmit} className="form">
          <div className="field">
            <label>Username</label>
            <input
              className="input"
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              required
            />
          </div>
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
              minLength="6"
              required
            />
          </div>
          <button type="submit" className="btn">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;