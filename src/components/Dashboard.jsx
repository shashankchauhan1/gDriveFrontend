// Dashboard component for user's drive
// Handles file/folder listing, navigation, upload, and sharing
import { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import FileList from './FileList';
import CreateFolder from './CreateFolder'; // Create new folders
import Breadcrumbs from './Breadcrumbs'; // Show folder path
import ShareModal from './ShareModal'; // Modal for sharing files

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

    // Fetch files/folders and path whenever folder changes
    useEffect(() => {
        const fetchAllData = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            try {
                // Fetch items in the current folder
                const itemsUrl = `${API_URL}/api/files${currentFolderId ? `?parentId=${currentFolderId}` : ''}`;
                const itemsRes = await axios.get(itemsUrl, config);
                setItems(itemsRes.data);

                // Fetch the breadcrumb path if not in root
                if (currentFolderId) {
                    const pathUrl = `${API_URL}/api/folders/${currentFolderId}/path`;
                    const pathRes = await axios.get(pathUrl, config);
                    setFolderPath(pathRes.data);
                } else {
                    setFolderPath([]); // Root folder
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchAllData();
    }, [currentFolderId]);

    // Add new file/folder to list after upload/creation
    const handleUploadSuccess = (newItem) => {
        setItems(prevItems => [...prevItems, newItem]);
    };

    // Delete on server then remove locally
    const handleDeleteItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/files/${itemId}`, { headers: { 'x-auth-token': token } });
            setItems(prevItems => prevItems.filter(item => item._id !== itemId));
        } catch (err) {
            console.error('Delete failed:', err?.response?.data || err.message);
            alert('Failed to delete. You might not be authorized or the server errored.');
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
                            }
                        }
                    }} />
                </div>
                <div className="card">
                    <h3>Contents</h3>
                    <FileList
                        items={items}
                        onDelete={handleDeleteItem}
                        onFolderClick={handleFolderClick}
                        onShareClick={handleShareClick}
                    />
                </div>

                {isShareModalOpen && (
                    <ShareModal 
                        file={selectedFile} 
                        onClose={() => setIsShareModalOpen(false)} 
                    />
                )}
            </div>
    );
}

export default Dashboard;