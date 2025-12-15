// client/src/components/ShareModal.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function ShareModal({ file, onClose, onPermissionsChanged }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [isSharing, setIsSharing] = useState(false);
  const [accessList, setAccessList] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!file) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/files/${file._id}/permissions`, {
          headers: { 'x-auth-token': token },
        });
        setOwner(res.data.owner || null);
        setAccessList(res.data.permissions || []);
      } catch (error) {
        console.error('Failed to load permissions', error);
        showToast({ type: 'error', message: getErrorMessage(error, 'Failed to load permissions.') });
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [file, showToast]);

  if (!file) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    setIsSharing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/files/${file._id}/share`,
        { email, role },
        { headers: { 'x-auth-token': token } }
      );
      showToast({ type: 'success', message: res.data.mode === 'updated' ? 'Permissions updated.' : 'Shared successfully.' });
      setEmail('');
      setAccessList((prev) => res.data.permissions ?? prev);
      onPermissionsChanged?.();
    } catch (error) {
      console.error('Error sharing file:', error);
      showToast({ type: 'error', message: getErrorMessage(error, 'Could not share file.') });
    } finally {
      setIsSharing(false);
    }
  };

  const updateRole = async (userId, newRole) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`${API_URL}/api/files/${file._id}/permissions`, { userId, role: newRole }, {
        headers: { 'x-auth-token': token },
      });
      setAccessList(() => res.data);
      showToast({ type: 'success', message: 'Permission updated.' });
      onPermissionsChanged?.();
    } catch (error) {
      console.error('Failed to update permission', error);
      showToast({ type: 'error', message: getErrorMessage(error, 'Failed to update permission.') });
    } finally {
      setUpdating(false);
    }
  };

  const removeUser = async (userId) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_URL}/api/files/${file._id}/permissions/${userId}`, {
        headers: { 'x-auth-token': token },
      });
      setAccessList(() => res.data);
      showToast({ type: 'success', message: 'Access removed.' });
      onPermissionsChanged?.();
    } catch (error) {
      console.error('Failed to remove access', error);
      showToast({ type: 'error', message: getErrorMessage(error, 'Failed to remove access.') });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Share "{file.filename}"</h2>
        <form onSubmit={handleShare} className="form" style={{ marginTop: '12px' }}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              placeholder="Enter user's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Permission</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn" type="submit" disabled={isSharing}>
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
            <button className="btn ghost" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
        <div style={{ marginTop: 24 }}>
          <h3>Access list</h3>
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Permission</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {owner && (
                    <tr>
                      <td>{owner.email}</td>
                      <td><span className="badge brand">Owner</span></td>
                      <td>—</td>
                    </tr>
                  )}
                  {accessList.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ color: 'var(--muted)' }}>No shared users.</td>
                    </tr>
                  )}
                  {accessList.map((entry) => (
                    <tr key={entry.user?._id || entry.user}>
                      <td>{entry.user?.email || entry.user}</td>
                      <td>
                        <select
                          className="input"
                          value={entry.role}
                          disabled={updating}
                          onChange={(e) => updateRole(entry.user?._id || entry.user, e.target.value)}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn destructive"
                          type="button"
                          disabled={updating}
                          onClick={() => removeUser(entry.user?._id || entry.user)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareModal;