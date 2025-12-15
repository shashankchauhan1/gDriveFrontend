// client/src/components/FileUpload.jsx
import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';
import { emitAppEvent } from '../utils/eventBus.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function FileUpload({ currentFolderId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast({ type: 'warning', message: 'Select a file to upload.' });
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (currentFolderId) {
      formData.append('parentId', currentFolderId);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token, // Send the token for authentication
        },
      });
      onUploadSuccess(response.data); // Notify parent component
      showToast({ type: 'success', message: 'File uploaded successfully.' });
      emitAppEvent('permissions:changed', { reason: 'upload', parentId: currentFolderId });
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast({ type: 'error', message: getErrorMessage(error, 'Error uploading file.') });
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="stack">
      <div className="field">
        <label>Upload a file</label>
        <input className="input" type="file" onChange={handleFileChange} />
      </div>
      <button className="btn" onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default FileUpload;