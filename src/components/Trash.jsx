import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function Trash() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/files/trash`, { headers: { 'x-auth-token': token } });
      setItems(res.data);
    } catch (e) {
      console.error('Failed to load trash', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const restore = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/files/${id}/restore`, {}, { headers: { 'x-auth-token': token } });
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (e) {
      alert('Restore failed');
    }
  };

  const hardDelete = async (id) => {
    if (!confirm('Delete permanently?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/files/trash/${id}`, { headers: { 'x-auth-token': token } });
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (e) {
      alert('Delete permanently failed');
    }
  };

  if (loading) return <p>Loading trash...</p>;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
      <div className="card">
        <h2>Trash</h2>
        {items.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Trash is empty.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>Trashed</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id}>
                    <td>{it.filename}</td>
                    <td>{it.type}</td>
                    <td>{new Date(it.trashedAt).toLocaleString()}</td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <button className="btn" onClick={() => restore(it._id)}>Restore</button>
                        <button className="btn destructive" onClick={() => hardDelete(it._id)}>Delete permanently</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Trash;

