// Dashboard component for user's drive
// Handles file/folder listing, navigation, upload, and sharing
import { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import FileList from './FileList';
import CreateFolder from './CreateFolder'; // Create new folders
import Breadcrumbs from './Breadcrumbs'; // Show folder path
import ShareModal from './ShareModal'; // Modal for sharing files

const API_URL = import.meta.env.VITE_API_URL;

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
                const itemsUrl = `${API_URL}/api/files?parentId=${currentFolderId || ''}`;
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

    // Remove item from list after deletion
    const handleDeleteItem = (itemId) => {
        setItems(prevItems => prevItems.filter(item => item._id !== itemId));
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
        <div>
            <h2>Dashboard</h2>
            {/* We'll add breadcrumbs here later */}
            <FileUpload currentFolderId={currentFolderId} onUploadSuccess={handleUploadSuccess} />
            <CreateFolder currentFolderId={currentFolderId} onFolderCreated={handleFolderCreated} />
            <hr />
            <h3>Contents</h3>
            <FileList
                items={items}
                onDelete={handleDeleteItem}
                onFolderClick={handleFolderClick} // <-- Pass handler
                onShareClick={handleShareClick} // <-- Pass the new handler
            />


             {/* Render the modal conditionally */}
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