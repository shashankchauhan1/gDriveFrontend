/**
 * FileList Component
 * Displays files and folders in a responsive grid/table format
 * Adapts between table view (desktop) and card view (mobile)
 */

import { format } from 'date-fns';
import axios from 'axios';
import '../styles/FileList.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

/**
 * Role Badge Component - displays permission level
 * @param {string} role - The user's role (owner, editor, viewer)
 */
const RoleBadge = ({ role }) => {
    if (!role) return null;
    const label = role === 'owner' ? 'Owner' : role === 'editor' ? 'Editor' : 'Viewer';
    const badgeClass = role === 'owner' ? 'brand' : role === 'editor' ? 'accent' : '';
    return <span className={`badge ${badgeClass}`}>{label}</span>;
};

/**
 * FileActions Component - reusable action buttons for files
 * Extracted to reduce code duplication
 */
const FileActions = ({ item, onShare, onRename, onDelete, onVersion }) => {
    return (
        <div className="file-actions">
            {item.effectiveRole === 'owner' && (
                <button className="btn ghost" onClick={() => onShare(item)} title="Share this file">
                    🔗 Share
                </button>
            )}
            {(item.effectiveRole === 'owner' || item.effectiveRole === 'editor') && (
                <button className="btn ghost" onClick={() => onRename(item)} title="Rename this file">
                    ✏️ Rename
                </button>
            )}
            {(item.effectiveRole === 'owner' || item.effectiveRole === 'editor') && (
                <button className="btn destructive" onClick={() => onDelete(item)} title="Move to trash">
                    🗑️ Delete
                </button>
            )}
            {item.type === 'file' && (
                <>
                    {(item.effectiveRole === 'owner' || item.effectiveRole === 'editor') && (
                        <button className="btn ghost" onClick={() => onVersion(item)} title="View version history">
                            ⏱️ Versions
                        </button>
                    )}
                    <a className="btn ghost" href={item.cloudinaryUrl} download title="Download file">
                        ⬇️ Download
                    </a>
                </>
            )}
        </div>
    );
};

/**
 * FileItem Component - Individual file/folder card for mobile view
 */
const FileItem = ({ item, onFolderClick, onShare, onRename, onDelete, onVersion, recordOpen }) => {
    const isFolder = item.type === 'folder';
    
    return (
        <div className="file-card">
            <div className="file-card-header">
                <div className="file-name-section">
                    {isFolder ? (
                        <span 
                            className="file-name file-folder"
                            onClick={() => onFolderClick(item._id)}
                            role="button"
                            tabIndex={0}
                            title="Open folder"
                        >
                            📁 {item.filename}
                        </span>
                    ) : (
                        <a
                            href={item.cloudinaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-name file-link"
                            onClick={() => recordOpen(item._id)}
                            title="Open file"
                        >
                            📄 {item.filename}
                        </a>
                    )}
                </div>
                <RoleBadge role={item.effectiveRole} />
            </div>
            
            <div className="file-card-meta">
                <div className="meta-item">
                    <span className="meta-label">Added:</span>
                    <span className="meta-value">{format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                {item.type === 'file' && (
                    <div className="meta-item">
                        <span className="meta-label">Size:</span>
                        <span className="meta-value">{(item.size / 1024).toFixed(2)} KB</span>
                    </div>
                )}
            </div>
            
            <FileActions 
                item={item}
                onShare={onShare}
                onRename={onRename}
                onDelete={onDelete}
                onVersion={onVersion}
            />
        </div>
    );
};

function FileList({ items, onDelete, onFolderClick, onShareClick, onRename, onVersionClick }) {
    if (!items.length) {
        return (
            <div className="empty-state">
                <p className="empty-message">📁 This folder is empty.</p>
                <p className="empty-hint">Upload files or create folders to get started</p>
            </div>
        );
    }

    /**
     * Record file open event for history tracking
     */
    const recordOpen = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/files/${itemId}/open`, {}, { headers: { 'x-auth-token': token } });
        } catch (err) {
            console.warn('Failed to record open event', err);
        }
    };

    return (
        <div className="file-list-container">
            {/* Desktop table view */}
            <div className="table-responsive">
                <table className="files-table">
                    <thead>
                        <tr>
                            <th className="col-name">Name</th>
                            <th className="col-date">Date Added</th>
                            <th className="col-size">Size (KB)</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item._id} className="file-row">
                                <td data-label="Name">
                                    {item.type === 'folder' ? (
                                        <span 
                                            onClick={() => onFolderClick(item._id)} 
                                            style={{ cursor: 'pointer', color: 'var(--brand-600)', fontWeight: 600 }}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            📁 {item.filename}
                                        </span>
                                    ) : (
                                        <a
                                            href={item.cloudinaryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => recordOpen(item._id)}
                                        >
                                            📄 {item.filename}
                                        </a>
                                    )}
                                    <div style={{ marginTop: 4 }}>
                                        <RoleBadge role={item.effectiveRole} />
                                    </div>
                                </td>
                                <td data-label="Date Added">{format(new Date(item.createdAt), 'PPpp')}</td>
                                <td data-label="Size (KB)">{item.type === 'file' ? (item.size / 1024).toFixed(2) : '--'}</td>
                                <td data-label="Actions">
                                    <FileActions
                                        item={item}
                                        onShare={onShareClick}
                                        onRename={onRename}
                                        onDelete={onDelete}
                                        onVersion={onVersionClick}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile card view */}
            <div className="files-grid">
                {items.map((item) => (
                    <FileItem
                        key={item._id}
                        item={item}
                        onFolderClick={onFolderClick}
                        onShare={onShareClick}
                        onRename={onRename}
                        onDelete={onDelete}
                        onVersion={onVersionClick}
                        recordOpen={recordOpen}
                    />
                ))}
            </div>
        </div>
    );
}

export default FileList;