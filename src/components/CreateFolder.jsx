// client/src/components/CreateFolder.jsx
import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function CreateFolder({ currentFolderId, onFolderCreated }) {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      alert('Please enter a folder name.');
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
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Error creating folder.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="New folder name"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
      />
      <button onClick={handleCreateFolder} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Folder'}
      </button>
    </div>
  );
}

export default CreateFolder;