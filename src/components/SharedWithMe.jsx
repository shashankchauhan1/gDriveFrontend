// client/src/components/SharedWithMe.jsx

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';
import { subscribeAppEvent } from '../utils/eventBus.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function SharedWithMe() {
  const [sharedItems, setSharedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchSharedItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/files/shared-with-me`, {
        headers: { 'x-auth-token': token },
      });
      setSharedItems(response.data);
    } catch (error) {
      console.error('Error fetching shared items:', error);
      showToast({ type: 'error', message: getErrorMessage(error, 'Failed to load shared files.') });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSharedItems();
    const interval = setInterval(fetchSharedItems, 10000);
    const unsubscribe = subscribeAppEvent('permissions:changed', fetchSharedItems);
    return () => {
      clearInterval(interval);
      unsubscribe?.();
    };
  }, [fetchSharedItems]);

  if (loading) {
    return <p>Loading shared files...</p>;
  }

  return (
    <div>
      <h2>Shared with me</h2>
      {sharedItems.length === 0 ? (
        <p>No files have been shared with you yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Shared by</th>
              <th>Date Shared</th>
            </tr>
          </thead>
          <tbody>
            {sharedItems.map((item) => (
              <tr key={item._id}>
                <td>
                  {item.type === 'folder' ? (
                    <button
                      type="button"
                      className="linky"
                      style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--brand-600)' }}
                      onClick={() => navigate(`/dashboard?folder=${item._id}`)}
                    >
                      📁 {item.filename}
                    </button>
                  ) : (
                    <a
                      href={item.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📄 {item.filename}
                    </a>
                  )}
                </td>
                <td>{item.owner.email}</td>
                <td>{format(new Date(item.updatedAt), 'PPpp')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SharedWithMe;