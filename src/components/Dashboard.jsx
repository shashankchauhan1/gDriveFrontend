/**
 * Dashboard Component
 * 
 * Main file management interface for the Cloud-Box drive.
 * Provides:
 * - File and folder browsing with navigation
 * - File upload and folder creation
 * - File search functionality
 * - Access to sharing, renaming, and versioning features
 * 
 * Responsive design that works seamlessly on mobile and desktop
 */


import { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import FileList from './FileList';
import CreateFolderModal from './CreateFolderModal';
import ShareModal from './ShareModal';
import VersionHistoryModal from './VersionHistoryModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';
import { emitAppEvent, subscribeAppEvent } from '../utils/eventBus.js';
import '../styles/Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

/**
 * Breadcrumb Component - shows current folder path
 */
const BreadcrumbNav = ({ currentPath, onNavigate }) => {
  if (currentPath.length === 0) return null;

  return (
    <div className="breadcrumb-container">
      <div className="breadcrumbs">
        <button className="crumb-btn" onClick={() => onNavigate(null)} title="Go to root folder">
          📂 Home
        </button>
        {currentPath.map((folder) => (
          <div key={folder._id} className="breadcrumb-item">
            <span className="breadcrumb-separator">/</span>
            <button
              className="crumb-btn"
              onClick={() => onNavigate(folder._id)}
              title={`Go to ${folder.filename}`}
            >
              {folder.filename}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

function Dashboard() {
  // State management
  const [items, setItems] = useState([]); // Files/folders in current directory
  const [currentFolderId, setCurrentFolderId] = useState(null); // Current folder ID (null = root)
  const [folderPath, setFolderPath] = useState([]); // Breadcrumb path

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // File selected for sharing
  const [versionTarget, setVersionTarget] = useState(null); // File for version history

  // Load/Search state
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const location = useLocation();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  /**
   * Fetch files/folders and breadcrumb path
   */
  const fetchAllData = useCallback(async (folderId = currentFolderId) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };
    setLoading(true);
    try {
      const itemsUrl = `${API_URL}/api/files${folderId ? `?parentId=${folderId}` : ''}`;
      const itemsRes = await axios.get(itemsUrl, config);
      setItems(itemsRes.data);

      if (folderId) {
        const pathUrl = `${API_URL}/api/folders/${folderId}/path`;
        const pathRes = await axios.get(pathUrl, config);
        setFolderPath(pathRes.data);
      } else {
        setFolderPath([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to load folder.')
      });
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, showToast]);

  // Fetch data when current folder changes
  useEffect(() => {
    fetchAllData(currentFolderId);
  }, [currentFolderId, fetchAllData]);

  // Handle folder navigation from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const folder = params.get('folder');
    if (folder) {
      setCurrentFolderId(folder);
    }
  }, [location.search]);

  // Subscribe to permission changes and refresh data
  useEffect(() => {
    const unsubscribe = subscribeAppEvent('permissions:changed', () =>
      fetchAllData(currentFolderId)
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentFolderId, fetchAllData]);

  /**
   * Handle File Upload Trigger
   */
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handle Selected File Upload
   */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (currentFolderId) {
      formData.append('parentId', currentFolderId);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/files/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token,
          }
        }
      );

      setItems(prev => [...prev, response.data]);
      showToast({
        type: 'success',
        message: `"${file.name}" uploaded successfully!`
      });
      emitAppEvent('permissions:changed', {
        reason: 'upload',
        parentId: currentFolderId
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to upload file.')
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Delete file/folder
   */
  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.filename}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/files/${item._id}`, {
        headers: { 'x-auth-token': token }
      });
      setItems(prevItems => prevItems.filter(row => row._id !== item._id));
      showToast({
        type: 'success',
        message: `${item.filename} moved to trash.`
      });
      emitAppEvent('permissions:changed', { reason: 'delete', fileId: item._id });
    } catch (err) {
      console.error('Delete failed:', err?.response?.data || err.message);
      showToast({
        type: 'error',
        message: getErrorMessage(err, 'Failed to delete item.')
      });
    }
  };

  const handleFolderCreated = (newFolder) => {
    setItems(prevItems => [...prevItems, newFolder]);
  };

  const handleFolderClick = (folderId) => {
    setCurrentFolderId(folderId);
  };

  const handleShareClick = (file) => {
    setSelectedFile(file);
    setIsShareModalOpen(true);
  };

  const handleRenameItem = async (item) => {
    const newName = prompt('Enter new name', item.filename);
    if (!newName || !newName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_URL}/api/files/${item._id}/rename`,
        { name: newName.trim() },
        { headers: { 'x-auth-token': token } }
      );
      setItems(prev => prev.map(i =>
        i._id === item._id ? { ...i, filename: res.data.filename } : i
      ));
      showToast({ type: 'success', message: 'Name updated.' });
      emitAppEvent('permissions:changed', { reason: 'rename', fileId: item._id });
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Rename failed.')
      });
    }
  };

  const handleVersionClick = (file) => {
    setVersionTarget(file);
  };

  const handleSearch = async (query) => {
    setSearchTerm(query);
    const q = query.trim();
    if (!q) {
      fetchAllData(currentFolderId);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_URL}/api/files/search?q=${encodeURIComponent(q)}`,
        { headers: { 'x-auth-token': token } }
      );
      setItems(res.data);
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Search failed.')
      });
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>My Drive</h2>

        {/* Toolbar: Search + Actions */}
        <div className="dashboard-toolbar">
          <div className="toolbar-search">
            <input
              className="input search-input"
              type="text"
              placeholder="🔍 Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)}
            />
            {searchTerm && (
              <button
                className="btn ghost icon-btn"
                onClick={() => { setSearchTerm(''); fetchAllData(currentFolderId); }}
                title="Clear"
              >✕</button>
            )}
          </div>

          <div className="toolbar-actions">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              className="btn"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? '⏳ Uploading...' : '☁️ Upload'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateFolderOpen(true)}
            >
              + New Folder
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb navigation */}
      {folderPath.length > 0 && (
        <BreadcrumbNav
          currentPath={folderPath}
          onNavigate={setCurrentFolderId}
        />
      )}

      {/* File contents section */}
      <div className="card file-view-card">
        <div className="contents-header">
          <h3>📋 Contents {loading && <span className="loading-indicator">Refreshing...</span>}</h3>
        </div>
        <FileList
          items={items}
          onDelete={handleDeleteItem}
          onFolderClick={handleFolderClick}
          onShareClick={handleShareClick}
          onRename={handleRenameItem}
          onVersionClick={handleVersionClick}
        />
      </div>

      {/* Modals */}
      {isShareModalOpen && (
        <ShareModal
          file={selectedFile}
          onClose={() => setIsShareModalOpen(false)}
          onPermissionsChanged={() => {
            emitAppEvent('permissions:changed', {
              reason: 'share',
              fileId: selectedFile?._id
            });
          }}
        />
      )}

      {versionTarget && (
        <VersionHistoryModal
          file={versionTarget}
          onClose={() => setVersionTarget(null)}
          onUpdated={() => emitAppEvent('permissions:changed', {
            reason: 'versions',
            fileId: versionTarget._id
          })}
        />
      )}

      {isCreateFolderOpen && (
        <CreateFolderModal
          currentFolderId={currentFolderId}
          onClose={() => setIsCreateFolderOpen(false)}
          onFolderCreated={handleFolderCreated}
        />
      )}
    </div>
  );
}

export default Dashboard;