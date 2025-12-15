// client/src/components/CreateFolder.jsx
import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';
import { emitAppEvent } from '../utils/eventBus.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function CreateFolder({ currentFolderId, onFolderCreated }) {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      showToast({ type: 'warning', message: 'Folder name is required.' });
      return;
    }
    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/folders`,
        { name: folderName, parentId: currentFolderId },
        { headers: { 'x-auth-token': token } }
      );
      onFolderCreated(response.data);
      setFolderName(''); // Reset input
      showToast({ type: 'success', message: 'Folder created.' });
      emitAppEvent('permissions:changed', { reason: 'folder-create', parentId: currentFolderId });
    } catch (error) {
      console.error('Error creating folder:', error);
      showToast({ type: 'error', message: getErrorMessage(error, 'Error creating folder.') });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="stack">
      <div className="field">
        <label>Create a folder</label>
        <input
          className="input"
          type="text"
          placeholder="New folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
      </div>
      <button className="btn" onClick={handleCreateFolder} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Folder'}
      </button>
    </div>
  );
}

export default CreateFolder;