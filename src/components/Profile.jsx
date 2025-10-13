import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/auth/me`, { headers: { 'x-auth-token': token } });
        setForm({ username: res.data.username || '', email: res.data.email || '' });
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/api/users/me`, form, { headers: { 'x-auth-token': token } });
      setForm({ username: res.data.username || '', email: res.data.email || '' });
      alert('Profile updated');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update');
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
    </div>
  );
}

export default Profile;

