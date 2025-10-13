// client/src/components/ShareModal.jsx
import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function ShareModal({ file, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [isSharing, setIsSharing] = useState(false);

  if (!file) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    setIsSharing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/files/${file._id}/share`,
        { email, role },
        { headers: { 'x-auth-token': token } }
      );
      alert(`Successfully shared ${file.filename} with ${email}`);
      onClose(); // Close the modal on success
    } catch (error) {
      console.error('Error sharing file:', error.response?.data?.msg || error.message);
      alert(`Error: ${error.response?.data?.msg || 'Could not share file.'}`);
    } finally {
      setIsSharing(false);
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
      </div>
    </div>
  );
}

export default ShareModal;