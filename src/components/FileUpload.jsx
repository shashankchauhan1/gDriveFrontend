// client/src/components/FileUpload.jsx
import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function FileUpload({ currentFolderId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first!');
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
      alert('File uploaded successfully!');
      onUploadSuccess(response.data); // Notify parent component
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
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