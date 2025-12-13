import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../config';
import { X, Plus } from 'lucide-react';

const CreateTemplateModal = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [tags, setTags] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (isOpen && token) {
            // Fetch available tags for autocomplete
            fetch(`${API_URL}/tags`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => setAvailableTags(data))
                .catch(() => setAvailableTags([]));
        }
    }, [isOpen, token]);

    const handleTagChange = (e) => {
        const val = e.target.value;
        setTags(val);

        const parts = val.split(',');
        const currentInput = parts[parts.length - 1].trim().toLowerCase();

        if (currentInput) {
            const filtered = availableTags.filter(t =>
                t.name.toLowerCase().includes(currentInput)
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const addSuggestion = (tagName) => {
        const parts = tags.split(',');
        parts.pop();
        parts.push(tagName);
        setTags(parts.join(', ') + ', ');
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Template name is required');
            return;
        }
        if (!description.trim()) {
            setError('Activity description is required');
            return;
        }
        if (!duration || parseInt(duration) <= 0) {
            setError('Valid duration is required');
            return;
        }

        setIsSaving(true);
        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
            const res = await fetch(`${API_URL}/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    durationMinutes: parseInt(duration),
                    tagNames: tagList
                })
            });

            if (res.ok) {
                const template = await res.json();
                resetForm();
                if (onCreated) onCreated(template);
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create template');
            }
        } catch (err) {
            console.error('Error creating template:', err);
            setError('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setDuration('');
        setTags('');
        setError('');
        setSuggestions([]);
    };

    const handleClose = () => {
        if (!isSaving) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    // Use portal to render modal at document.body level
    return createPortal(
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content create-template-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        <Plus size={18} style={{ marginRight: 8 }} />
                        Create New Template
                    </h3>
                    <button className="modal-close-btn" onClick={handleClose} disabled={isSaving}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="template-name">Template Name *</label>
                            <input
                                id="template-name"
                                type="text"
                                placeholder="e.g., Morning Workout"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="template-description">Activity Description *</label>
                            <input
                                id="template-description"
                                type="text"
                                placeholder="What activity will this log?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="template-duration">Duration (minutes) *</label>
                            <input
                                id="template-duration"
                                type="number"
                                placeholder="30"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ position: 'relative' }}>
                            <label htmlFor="template-tags">Categories (optional)</label>
                            <input
                                id="template-tags"
                                type="text"
                                placeholder="e.g., Work, Exercise"
                                value={tags}
                                onChange={handleTagChange}
                                autoComplete="off"
                            />
                            {suggestions.length > 0 && (
                                <ul className="suggestions-list modal-suggestions">
                                    {suggestions.map(tag => (
                                        <li key={tag._id} onClick={() => addSuggestion(tag.name)} style={{ borderLeft: `4px solid ${tag.color}` }}>
                                            {tag.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {error && <p className="error-text">{error}</p>}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={handleClose} disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Creating...' : 'Create Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default CreateTemplateModal;

