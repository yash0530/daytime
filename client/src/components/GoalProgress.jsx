import React, { useState, useEffect, useMemo } from 'react';
import { useGoals } from '../hooks/useGoals';
import GoalManager from './GoalManager';
import ConfirmDialog from './ConfirmDialog';

// Format minutes to hours and minutes display
const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

const GoalCard = ({ goal, onEdit, onDelete, tagColors }) => {
    const percentage = goal.percentComplete;
    const isComplete = percentage >= 100;
    const tagColor = tagColors[goal.categoryName] || '#667eea';

    return (
        <div className={`goal-card ${isComplete ? 'complete' : ''}`}>
            <div className="goal-card-header">
                <div className="goal-category">
                    <span className="goal-color-dot" style={{ backgroundColor: tagColor }} />
                    <span className="goal-name">{goal.categoryName}</span>
                    <span className="goal-period-badge">{goal.period}</span>
                </div>
                <div className="goal-actions">
                    <button className="goal-action-btn" onClick={() => onEdit(goal)} title="Edit">
                        ✏️
                    </button>
                    <button className="goal-action-btn" onClick={() => onDelete(goal)} title="Delete">
                        🗑️
                    </button>
                </div>
            </div>

            <div className="goal-progress-container">
                <div className="goal-progress-bar">
                    <div
                        className="goal-progress-fill"
                        style={{
                            width: `${Math.min(100, percentage)}%`,
                            backgroundColor: isComplete ? 'var(--accent-green)' : tagColor
                        }}
                    />
                </div>
                <div className="goal-progress-text">
                    <span className="goal-current">{formatTime(goal.currentMinutes)}</span>
                    <span className="goal-target"> / {formatTime(goal.targetMinutes)}</span>
                    <span className="goal-percentage">{percentage}%</span>
                </div>
            </div>

            {goal.streak > 0 && (
                <div className="goal-streak">
                    <span className="streak-fire">🔥</span>
                    <span className="streak-count">{goal.streak}</span>
                    <span className="streak-label">{goal.period === 'daily' ? 'day' : 'week'} streak</span>
                </div>
            )}
        </div>
    );
};

const GoalProgress = ({ activities, onGoalUpdated }) => {
    const { goals, loading, error, createGoal, updateGoal, deleteGoal, refresh } = useGoals();
    const [showManager, setShowManager] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [deletingGoal, setDeletingGoal] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Build a map of category names to colors from activities
    const tagColors = useMemo(() => {
        const colors = {};
        activities.forEach(act => {
            act.tags?.forEach(tag => {
                if (!colors[tag.name]) {
                    colors[tag.name] = tag.color;
                }
            });
        });
        return colors;
    }, [activities]);

    // Refresh goals when activities change
    useEffect(() => {
        refresh();
    }, [activities.length]);

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setShowManager(true);
    };

    const handleDelete = (goal) => {
        setDeletingGoal(goal);
    };

    const confirmDelete = async () => {
        if (!deletingGoal) return;

        setDeleteLoading(true);
        const result = await deleteGoal(deletingGoal._id);
        setDeleteLoading(false);

        if (result.success) {
            setDeletingGoal(null);
            if (onGoalUpdated) onGoalUpdated();
        }
    };

    const handleGoalCreated = (goal) => {
        refresh();
        if (onGoalUpdated) onGoalUpdated();
        setEditingGoal(null);
    };

    const openCreateModal = () => {
        setEditingGoal(null);
        setShowManager(true);
    };

    // Filter to only show active goals
    const activeGoals = goals.filter(g => g.isActive);

    return (
        <div className="goals-section">
            <div className="goals-header">
                <h3>🎯 Goals & Targets</h3>
                <button className="btn-add-goal" onClick={openCreateModal}>
                    + Add Goal
                </button>
            </div>

            {loading && goals.length === 0 && (
                <div className="goals-loading">Loading goals...</div>
            )}

            {error && (
                <div className="goals-error">{error}</div>
            )}

            {!loading && activeGoals.length === 0 && (
                <div className="goals-empty">
                    <p>No goals set yet. Create one to start tracking!</p>
                </div>
            )}

            {activeGoals.length > 0 && (
                <div className="goals-grid">
                    {activeGoals.map(goal => (
                        <GoalCard
                            key={goal._id}
                            goal={goal}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            tagColors={tagColors}
                        />
                    ))}
                </div>
            )}

            <GoalManager
                isOpen={showManager}
                onClose={() => {
                    setShowManager(false);
                    setEditingGoal(null);
                }}
                onCreated={handleGoalCreated}
                existingGoal={editingGoal}
            />

            <ConfirmDialog
                isOpen={!!deletingGoal}
                title="Delete Goal"
                message={`Are you sure you want to delete the ${deletingGoal?.period} goal for "${deletingGoal?.categoryName}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeletingGoal(null)}
                isLoading={deleteLoading}
            />
        </div>
    );
};

export default GoalProgress;
