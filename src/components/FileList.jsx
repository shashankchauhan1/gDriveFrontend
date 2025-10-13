// client/src/components/FileList.jsx
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function FileList({ items, onDelete, onFolderClick, onShareClick }) {
    if (!items.length) {
        return <p style={{ color: 'var(--muted)' }}>This folder is empty.</p>;
    }

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
                                    onClick={async (e) => {
                                        try {
                                            const token = localStorage.getItem('token');
                                            await axios.post(`${API_URL}/api/files/${item._id}/open`, {}, { headers: { 'x-auth-token': token } });
                                        } catch (err) {
                                            // non-blocking
                                        }
                                    }}
                                >
                                    📄 {item.filename}
                                </a>
                                )}
                            </td>
                            <td>{format(new Date(item.createdAt), 'PPpp')}</td>
                            <td>{item.type === 'file' ? (item.size / 1024).toFixed(2) : '--'}</td>
                            <td>
                                <div className="row" style={{ gap: '8px' }}>
                                    <button className="btn ghost" onClick={() => onShareClick(item)}>Share</button>
                                    <button className="btn ghost" onClick={async () => {
                                        const name = prompt('Enter new name', item.filename);
                                        if (!name) return;
                                        try {
                                            const token = localStorage.getItem('token');
                                            const res = await axios.put(`${API_URL}/api/files/${item._id}/rename`, { name }, { headers: { 'x-auth-token': token } });
                                            item.filename = res.data.filename;
                                        } catch (e) {
                                            alert('Rename failed');
                                        }
                                    }}>Rename</button>
                                    <button className="btn destructive" onClick={() => onDelete(item._id)}>Delete</button>
                                    {item.type === 'file' && (
                                        <a className="btn ghost" href={item.cloudinaryUrl} download>Download</a>
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