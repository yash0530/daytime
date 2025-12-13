import React, { useState } from 'react';
import { API_URL } from '../config';
import { Trash2, Bookmark } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import SaveTemplateModal from './SaveTemplateModal';

const ActivityList = ({ activities, onActivityDeleted, onTemplateCreated }) => {
    const token = localStorage.getItem('token');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saveTemplateTarget, setSaveTemplateTarget] = useState(null);

    const handleDeleteClick = (e, activity) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteTarget(activity);
    };

    const handleSaveAsTemplate = (e, activity) => {
        e.preventDefault();
        e.stopPropagation();
        setSaveTemplateTarget({
            description: activity.description,
            durationMinutes: activity.durationMinutes,
            tagNames: activity.tags.map(t => t.name)
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${API_URL}/activities/${deleteTarget._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                if (onActivityDeleted) onActivityDeleted(deleteTarget._id);
                setDeleteTarget(null);
            } else {
                console.error('Failed to delete activity');
                const data = await res.json();
                alert(data.error || 'Failed to delete activity');
            }
        } catch (e) {
            console.error('Delete error:', e);
            alert(`An error occurred while deleting: ${e.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        if (!isDeleting) {
            setDeleteTarget(null);
        }
    };

    return (
        <div className="activity-list">
            <h3>Recent Activities</h3>
            {activities.length === 0 ? (
                <p>No activities yet.</p>
            ) : (
                <ul>
                    {activities.map((activity) => (
                        <li key={activity._id} className="activity-item">
                            <div className="activity-content">
                                <div className="activity-header">
                                    <span className="activity-desc">{activity.description}</span>
                                    <span className="activity-duration">{activity.durationMinutes} min</span>
                                </div>
                                <div className="activity-tags">
                                    {activity.tags.map(tag => (
                                        <span key={tag._id} className="tag" style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}>
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                                <div className="activity-date">
                                    {new Date(activity.date).toLocaleString()}
                                </div>
                            </div>
                            <div className="activity-actions">
                                <button
                                    className="save-template-btn"
                                    onClick={(e) => handleSaveAsTemplate(e, activity)}
                                    aria-label="Save as template"
                                    title="Save as template"
                                >
                                    <Bookmark size={16} />
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={(e) => handleDeleteClick(e, activity)}
                                    aria-label="Delete activity"
                                    title="Delete activity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title="Delete Activity"
                message={`Are you sure you want to delete "${deleteTarget?.description}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isLoading={isDeleting}
            />

            <SaveTemplateModal
                isOpen={saveTemplateTarget !== null}
                onClose={() => setSaveTemplateTarget(null)}
                onSaved={() => {
                    if (onTemplateCreated) onTemplateCreated();
                }}
                activityData={saveTemplateTarget}
            />
        </div>
    );
};

export default ActivityList;
