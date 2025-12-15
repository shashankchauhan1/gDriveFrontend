// client/src/components/FileList.jsx
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function FileList({ items, onDelete, onFolderClick, onShareClick, onRename, onVersionClick }) {
    if (!items.length) {
        return <p style={{ color: 'var(--muted)' }}>This folder is empty.</p>;
    }

    const roleBadge = (role) => {
        if (!role) return null;
        const label = role === 'owner' ? 'Owner' : role === 'editor' ? 'Editor' : 'Viewer';
        return <span className={`badge ${role === 'owner' ? 'brand' : ''}`}>{label}</span>;
    };

    const recordOpen = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/files/${itemId}/open`, {}, { headers: { 'x-auth-token': token } });
        } catch (err) {
            console.warn('Failed to record open event', err);
        }
    };

    return (
        <div className="table-responsive">
            <table>
                <thead>
                    <tr><th>Name</th><th>Date Added</th><th>Size (KB)</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item._id}>
                            <td>
                                {item.type === 'folder' ? (
                                    <span onClick={() => onFolderClick(item._id)} style={{ cursor: 'pointer', color: 'var(--brand-600)', fontWeight: 600 }}>
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
                                    {roleBadge(item.effectiveRole)}
                                </div>
                            </td>
                            <td>{format(new Date(item.createdAt), 'PPpp')}</td>
                            <td>{item.type === 'file' ? (item.size / 1024).toFixed(2) : '--'}</td>
                            <td>
                                <div className="row" style={{ gap: '8px' }}>
                                    {item.effectiveRole === 'owner' && (
                                        <button className="btn ghost" onClick={() => onShareClick(item)}>Share</button>
                                    )}
                                    {(item.effectiveRole === 'owner' || item.effectiveRole === 'editor') && (
                                        <button className="btn ghost" onClick={() => onRename(item)}>Rename</button>
                                    )}
                                    {(item.effectiveRole === 'owner' || item.effectiveRole === 'editor') && (
                                        <button className="btn destructive" onClick={() => onDelete(item)}>Delete</button>
                                    )}
                                    {item.type === 'file' && (
                                        <>
                                            {(item.effectiveRole === 'owner' || item.effectiveRole === 'editor') && (
                                                <button className="btn ghost" onClick={() => onVersionClick(item)}>Versions</button>
                                            )}
                                            <a className="btn ghost" href={item.cloudinaryUrl} download>Download</a>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default FileList;