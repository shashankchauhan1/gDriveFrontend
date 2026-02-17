/**
 * CreateFolderModal Component
 * 
 * Modal dialog for creating new folders
 * Replaces the inline CreateFolder component
 */

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/errors.js';
import { emitAppEvent } from '../utils/eventBus.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

function CreateFolderModal({ currentFolderId, onClose, onFolderCreated }) {
    const [folderName, setFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { showToast } = useToast();
    const inputRef = useRef(null);

    // Auto-focus input when modal opens
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const trimmedName = folderName.trim();

        if (!trimmedName) return;

        setIsCreating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/folders`,
                {
                    name: trimmedName,
                    parentId: currentFolderId
                },
                { headers: { 'x-auth-token': token } }
            );

            showToast({
                type: 'success',
                message: `Folder "${trimmedName}" created.`
            });

            if (onFolderCreated) onFolderCreated(response.data);

            emitAppEvent('permissions:changed', {
                reason: 'folder-create',
                parentId: currentFolderId
            });

            onClose();
        } catch (error) {
            console.error('Error creating folder:', error);
            showToast({
                type: 'error',
                message: getErrorMessage(error, 'Failed to create folder.')
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>New Folder</h2>
                <form onSubmit={handleCreate}>
                    <div className="field">
                        <input
                            ref={inputRef}
                            className="input"
                            type="text"
                            placeholder="Untitled folder"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            disabled={isCreating}
                            maxLength="255"
                            autoComplete="off"
                        />
                    </div>
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn ghost"
                            onClick={onClose}
                            disabled={isCreating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!folderName.trim() || isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateFolderModal;
