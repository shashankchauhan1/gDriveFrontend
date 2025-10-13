// client/src/components/FileList.jsx
import { format } from 'date-fns';

function FileList({ items, onDelete, onFolderClick, onShareClick }) {
    if (!items.length) {
        return <p>This folder is empty.</p>;
    }

    return (
        <table>
            <thead>
                <tr><th>Name</th><th>Date Added</th><th>Size (KB)</th><th>Actions</th></tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={item._id}>
                        <td>
                            {item.type === 'folder' ? (
                                // Folders are clickable spans that trigger navigation
                                <span onClick={() => onFolderClick(item._id)} style={{ cursor: 'pointer', color: 'blue' }}>
                                    📁 {item.filename}
                                </span>
                            ) : (
                                // Files are links that open in a new tab
                                <a href={item.cloudinaryUrl} target="_blank" rel="noopener noreferrer">
                                    📄 {item.filename}
                                </a>
                            )}
                        </td>
                        <td>{format(new Date(item.createdAt), 'PPpp')}</td>
                        <td>{item.type === 'file' ? (item.size / 1024).toFixed(2) : '--'}</td>
                        <td>
                            <button onClick={() => onShareClick(item)}>Share</button> {/* Pass the whole item */}
                            <button onClick={() => onDelete(item._id)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default FileList;