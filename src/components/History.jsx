import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function History() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/history`, { headers: { 'x-auth-token': token } });
        setEvents(res.data);
      } catch (e) {
        console.error('Failed to load history', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading history...</p>;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
      <div className="card">
        <h2>Recent activity</h2>
        {events.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No recent activity.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Action</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e._id}>
                    <td>{e.file?.type === 'folder' ? '📁' : '📄'} {e.file?.filename}</td>
                    <td>{e.action}</td>
                    <td>{format(new Date(e.createdAt), 'PPpp')}</td>
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

export default History;

