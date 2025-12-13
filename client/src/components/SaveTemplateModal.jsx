import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../config';
import { X, Save } from 'lucide-react';

const SaveTemplateModal = ({ isOpen, onClose, onSaved, activityData }) => {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Template name is required');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: activityData?.description || '',
                    durationMinutes: activityData?.durationMinutes || 0,
                    tagNames: activityData?.tagNames || []
                })
            });

            if (res.ok) {
                const template = await res.json();
                setName('');
                if (onSaved) onSaved(template);
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save template');
            }
        } catch (err) {
            console.error('Error saving template:', err);
            setError('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (!isSaving) {
            setName('');
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    // Use portal to render modal at document.body level
    return createPortal(
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content save-template-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        <Save size={18} style={{ marginRight: 8 }} />
                        Save as Template
                    </h3>
                    <button className="modal-close-btn" onClick={handleClose} disabled={isSaving}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="template-name">Template Name</label>
                            <input
                                id="template-name"
                                type="text"
                                placeholder="e.g., Daily Standup"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="template-preview">
                            <p><strong>Activity:</strong> {activityData?.description}</p>
                            <p><strong>Duration:</strong> {activityData?.durationMinutes} min</p>
                            {activityData?.tagNames?.length > 0 && (
                                <p><strong>Categories:</strong> {activityData.tagNames.join(', ')}</p>
                            )}
                        </div>

                        {error && <p className="error-text">{error}</p>}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={handleClose} disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default SaveTemplateModal;
