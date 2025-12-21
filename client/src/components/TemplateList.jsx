import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Trash2, Play, Plus, Save } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import CreateTemplateModal from './CreateTemplateModal';

const TemplateList = ({ onActivityCreated }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [usingTemplateId, setUsingTemplateId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const token = localStorage.getItem('token');

    const fetchTemplates = async () => {
        try {
            const res = await fetch(`${API_URL}/templates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [token]);

    const handleUseTemplate = async (templateId) => {
        setUsingTemplateId(templateId);
        try {
            const res = await fetch(`${API_URL}/templates/${templateId}/use`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                if (onActivityCreated) onActivityCreated();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to use template');
            }
        } catch (err) {
            console.error('Error using template:', err);
            alert('An error occurred');
        } finally {
            setUsingTemplateId(null);
        }
    };

    const handleDeleteClick = (e, template) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteTarget(template);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${API_URL}/templates/${deleteTarget._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setTemplates(prev => prev.filter(t => t._id !== deleteTarget._id));
                setDeleteTarget(null);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete template');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        if (!isDeleting) {
            setDeleteTarget(null);
        }
    };

    const handleTemplateCreated = (newTemplate) => {
        setTemplates(prev => [newTemplate, ...prev]);
    };

    if (loading) {
        return <div className="template-list"><p>Loading templates...</p></div>;
    }

    return (
        <div className="template-list">
            <div className="template-list-header">
                <h3>
                    <Save size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Quick Templates
                </h3>
                <button
                    className="create-template-btn"
                    onClick={() => setShowCreateModal(true)}
                    title="Create new template"
                >
                    <Plus size={16} />
                    New Template
                </button>
            </div>
            {templates.length === 0 ? (
                <p className="empty-state">No templates yet. Create one or save activities as templates!</p>
            ) : (
                <ul className="template-grid">
                    {templates.map((template) => (
                        <li key={template._id} className="template-item">
                            <div className="template-card-header">
                                <div className="template-info">
                                    <span className="template-name">{template.name}</span>
                                    <span className="template-duration">{template.durationMinutes} min</span>
                                </div>
                                <div className="template-actions">
                                    <button
                                        className="use-template-btn"
                                        onClick={() => handleUseTemplate(template._id)}
                                        disabled={usingTemplateId === template._id}
                                        title="Use template"
                                    >
                                        {usingTemplateId === template._id ? (
                                            <span className="loading-spinner"></span>
                                        ) : (
                                            <Play size={14} />
                                        )}
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => handleDeleteClick(e, template)}
                                        aria-label="Delete template"
                                        title="Delete template"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="template-desc">{template.description}</div>
                            {template.tagNames && template.tagNames.length > 0 && (
                                <div className="template-tags">
                                    {template.tagNames.map((tagName, idx) => (
                                        <span key={idx} className="tag template-tag">
                                            {tagName}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title="Delete Template"
                message={`Are you sure you want to delete the template "${deleteTarget?.name}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isLoading={isDeleting}
            />

            <CreateTemplateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={handleTemplateCreated}
            />
        </div>
    );
};

export default TemplateList;

