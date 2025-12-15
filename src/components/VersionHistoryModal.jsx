import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function VersionHistoryModal({ file, onClose, onUpdated }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const fetchVersions = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/files/${file._id}/versions`, {
        headers: { 'x-auth-token': token },
      });
      setVersions(res.data.versions || []);
    } catch (error) {
      console.error('Failed to load versions', error);
      showToast({ type: 'error', message: getErrorMessage(error, 'Failed to load versions.') });
    } finally {
      setLoading(false);
    }
  }, [file, showToast]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const deleteVersion = async (versionId) => {
    if (!file || busy) return;
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/files/${file._id}/versions/${versionId}`, {
        headers: { 'x-auth-token': token },
      });
      await fetchVersions();
      showToast({ type: 'success', message: 'Version deleted.' });
      onUpdated?.();
    } catch (error) {
      console.error('Failed to delete version', error);
      showToast({ type: 'error', message: getErrorMessage(error, 'Failed to delete version.') });
    } finally {
      setBusy(false);
    }
  };

  const clearVersions = async () => {
    if (!file || busy) return;
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/files/${file._id}/versions`, {
        headers: { 'x-auth-token': token },
      });
      await fetchVersions();
      showToast({ type: 'success', message: 'Version history cleared.' });
      onUpdated?.();
    } catch (error) {
      console.error('Failed to clear versions', error);
      showToast({ type: 'error', message: getErrorMessage(error, 'Failed to clear history.') });
    } finally {
      setBusy(false);
    }
  };

  if (!file) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Versions · {file.filename}</h2>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading versions...</p>
        ) : versions.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No versions found.</p>
        ) : (
          <div className="table-responsive" style={{ marginTop: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Uploaded</th>
                  <th>By</th>
                  <th>Size (KB)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version._id}>
                    <td>{version.versionNumber}</td>
                    <td>{format(new Date(version.createdAt), 'PPpp')}</td>
                    <td>{version.uploadedBy?.email || '—'}</td>
                    <td>{version.size ? (version.size / 1024).toFixed(2) : '--'}</td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <a className="btn ghost" href={version.cloudinaryUrl} target="_blank" rel="noreferrer">
                          Download
                        </a>
                        {versions.length > 1 && (
                          <button
                            className="btn destructive"
                            disabled={busy}
                            onClick={() => deleteVersion(version._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {versions.length > 1 && (
          <div className="modal-actions">
            <button className="btn ghost" type="button" onClick={clearVersions} disabled={busy}>
              Clear history
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VersionHistoryModal;


