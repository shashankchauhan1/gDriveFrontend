// Dashboard component for user's drive
// Handles file/folder listing, navigation, upload, and sharing
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import FileUpload from './FileUpload';
import FileList from './FileList';
import CreateFolder from './CreateFolder'; // Create new folders
import ShareModal from './ShareModal'; // Modal for sharing files
import VersionHistoryModal from './VersionHistoryModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';
import { emitAppEvent, subscribeAppEvent } from '../utils/eventBus.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function Dashboard() {
    // State for files/folders in current directory
    const [items, setItems] = useState([]);
    // State for current folder ID (null = root)
    const [currentFolderId, setCurrentFolderId] = useState(null);
    // State for breadcrumb path
    const [folderPath, setFolderPath] = useState([]);
    // State for share modal visibility
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    // State for selected file to share
    const [selectedFile, setSelectedFile] = useState(null);
    const [versionTarget, setVersionTarget] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const { showToast } = useToast();

    // Fetch files/folders and path whenever folder changes
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
            showToast({ type: 'error', message: getErrorMessage(error, 'Failed to load folder.') });
        } finally {
            setLoading(false);
        }
    }, [currentFolderId, showToast]);

    useEffect(() => {
        fetchAllData(currentFolderId);
    }, [currentFolderId, fetchAllData]);

    // If a folder is specified in the URL (e.g. /dashboard?folder=ID) open it
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const folder = params.get('folder');
        if (folder) {
            setCurrentFolderId(folder);
        }
    }, [location.search]);

    useEffect(() => {
        const unsubscribe = subscribeAppEvent('permissions:changed', () => fetchAllData(currentFolderId));
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentFolderId, fetchAllData]);

    // Add new file/folder to list after upload/creation
    const handleUploadSuccess = (newItem) => {
        setItems(prevItems => [...prevItems, newItem]);
    };

    // Delete on server then remove locally
    const handleDeleteItem = async (item) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/files/${item._id}`, { headers: { 'x-auth-token': token } });
            setItems(prevItems => prevItems.filter(row => row._id !== item._id));
            showToast({ type: 'success', message: `${item.filename} moved to trash.` });
            emitAppEvent('permissions:changed', { reason: 'delete', fileId: item._id });
        } catch (err) {
            console.error('Delete failed:', err?.response?.data || err.message);
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                showToast({ type: 'error', message: 'You do not have permission to delete this item.' });
            } else {
                showToast({ type: 'error', message: getErrorMessage(err, 'Failed to delete item.') });
            }
        }
    };

    // Add new folder to list after creation
    const handleFolderCreated = (newFolder) => {
        setItems(prevItems => [...prevItems, newFolder]);
    };

    // Change current folder when user clicks a folder
    const handleFolderClick = (folderId) => {
        setCurrentFolderId(folderId);
    };

    const handleShareClick = (file) => {
        setSelectedFile(file);
        setIsShareModalOpen(true);
    };

    const handleRenameItem = async (item) => {
        const name = prompt('Enter new name', item.filename);
        if (!name || !name.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/files/${item._id}/rename`, { name: name.trim() }, { headers: { 'x-auth-token': token } });
            setItems(prev => prev.map(i => i._id === item._id ? { ...i, filename: res.data.filename } : i));
            showToast({ type: 'success', message: 'Name updated.' });
            emitAppEvent('permissions:changed', { reason: 'rename', fileId: item._id });
        } catch (error) {
            console.error('Rename failed', error);
            showToast({ type: 'error', message: getErrorMessage(error, 'Rename failed.') });
        }
    };

    const handleVersionClick = (file) => {
        setVersionTarget(file);
    };

    return (
        <div className="stack" style={{ paddingTop: '12px', paddingBottom: '24px' }}>
                <h2>My Drive</h2>
                {folderPath.length > 0 && (
                    <div className="card" style={{ padding: '12px 16px' }}>
                        <div className="breadcrumbs">
                            <span className="crumb" onClick={() => setCurrentFolderId(null)}>Home</span>
                            {folderPath.map((folder) => (
                                <span key={folder._id}>
                                    <span style={{ color: '#94a3b8', padding: '0 6px' }}>/</span>
                                    <span className="crumb" onClick={() => setCurrentFolderId(folder._id)}>{folder.filename}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="row wrap">
                    <div className="card" style={{ flex: '1 1 320px' }}>
                        <FileUpload currentFolderId={currentFolderId} onUploadSuccess={handleUploadSuccess} />
                    </div>
                    <div className="card" style={{ flex: '1 1 320px' }}>
                        <CreateFolder currentFolderId={currentFolderId} onFolderCreated={handleFolderCreated} />
                    </div>
                </div>
                <div className="row" style={{ gap: '8px' }}>
                    <input className="input" style={{ flex: '1 1 300px' }} placeholder="Search files and folders" onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                            const q = e.currentTarget.value.trim();
                            if (!q) return;
                            try {
                                const token = localStorage.getItem('token');
                                const res = await axios.get(`${API_URL}/api/files/search?q=${encodeURIComponent(q)}`, { headers: { 'x-auth-token': token } });
                                setItems(res.data);
                            } catch (er) {
                                console.error('Search failed', er);
                                showToast({ type: 'error', message: getErrorMessage(er, 'Search failed.') });
                            }
                        }
                    }} />
                </div>
                <div className="card">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                        <h3>Contents</h3>
                        {loading && <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Refreshing…</span>}
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

                {isShareModalOpen && (
                    <ShareModal 
                        file={selectedFile} 
                        onClose={() => setIsShareModalOpen(false)}
                        onPermissionsChanged={() => {
                            emitAppEvent('permissions:changed', { reason: 'share', fileId: selectedFile?._id });
                        }}
                    />
                )}
                {versionTarget && (
                    <VersionHistoryModal
                        file={versionTarget}
                        onClose={() => setVersionTarget(null)}
                        onUpdated={() => emitAppEvent('permissions:changed', { reason: 'versions', fileId: versionTarget._id })}
                    />
                )}
            </div>
    );
}

export default Dashboard;