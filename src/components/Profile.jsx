import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/auth/me`, { headers: { 'x-auth-token': token } });
        setForm({ username: res.data.username || '', email: res.data.email || '' });
      } catch (e) {
        const message = getErrorMessage(e, 'Failed to load profile');
        setError(message);
        showToast({ type: 'error', message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/api/users/me`, form, { headers: { 'x-auth-token': token } });
      setForm({ username: res.data.username || '', email: res.data.email || '' });
      showToast({ type: 'success', message: 'Profile updated.' });
    } catch (e) {
      const message = getErrorMessage(e, 'Failed to update profile.');
      setError(message);
      showToast({ type: 'error', message });
    }
  };

  const onPasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/me/password`, passwordForm, { headers: { 'x-auth-token': token } });
      showToast({ type: 'success', message: 'Password updated.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      const message = getErrorMessage(e, 'Failed to change password.');
      setPasswordError(message);
      showToast({ type: 'error', message });
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
      <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2>Your profile</h2>
        {error && <div style={{ color: 'var(--danger)', marginTop: 8, marginBottom: 8 }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label>Username</label>
            <input className="input" name="username" value={form.username} onChange={onChange} />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} />
          </div>
          <button className="btn" type="submit">Save changes</button>
        </form>
      </div>
      <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <h3>Change password</h3>
        {passwordError && <div style={{ color: 'var(--danger)', marginTop: 8, marginBottom: 8 }}>{passwordError}</div>}
        <form className="form" onSubmit={onPasswordSubmit}>
          <div className="field">
            <label>Current password</label>
            <input className="input" type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={onPasswordChange} required />
          </div>
          <div className="field">
            <label>New password</label>
            <input className="input" type="password" name="newPassword" value={passwordForm.newPassword} onChange={onPasswordChange} required minLength={8} />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input className="input" type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={onPasswordChange} required />
          </div>
          <button className="btn" type="submit">Update password</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;

