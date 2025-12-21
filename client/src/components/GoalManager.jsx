import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../config';

const GoalManager = ({ isOpen, onClose, onCreated, existingGoal = null }) => {
    const [categoryName, setCategoryName] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    const token = localStorage.getItem('token');

    // Fetch available tags for suggestions
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await fetch(`${API_URL}/tags`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAvailableTags(data);
                }
            } catch (err) {
                console.error('Failed to fetch tags:', err);
            }
        };
        if (isOpen) {
            fetchTags();
        }
    }, [isOpen, token]);

    // Pre-fill if editing existing goal
    useEffect(() => {
        if (existingGoal) {
            setCategoryName(existingGoal.categoryName);
            const totalMinutes = existingGoal.targetMinutes;
            setHours(Math.floor(totalMinutes / 60).toString());
            setMinutes((totalMinutes % 60).toString());
            setPeriod(existingGoal.period);
        } else {
            setCategoryName('');
            setHours('');
            setMinutes('');
            setPeriod('daily');
        }
        setError('');
    }, [existingGoal, isOpen]);

    // Filter suggestions based on input
    useEffect(() => {
        if (categoryName.trim()) {
            const filtered = availableTags.filter(tag =>
                tag.name.toLowerCase().includes(categoryName.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    }, [categoryName, availableTags]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        const targetMinutes = h * 60 + m;

        if (!categoryName.trim()) {
            setError('Category name is required');
            return;
        }

        if (targetMinutes <= 0) {
            setError('Target time must be greater than 0');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const url = existingGoal
                ? `${API_URL}/goals/${existingGoal._id}`
                : `${API_URL}/goals`;

            const method = existingGoal ? 'PATCH' : 'POST';
            const body = existingGoal
                ? { targetMinutes }
                : { categoryName, targetMinutes, period };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const goal = await res.json();
                onCreated(goal);
                onClose();
            } else {
                const errData = await res.json();
                setError(errData.error || 'Failed to save goal');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
            <div className="modal-content goal-manager-modal" onClick={e => e.stopPropagation()}>
                <h3>{existingGoal ? 'Edit Goal' : 'Create New Goal'}</h3>

                <form onSubmit={handleSubmit}>
                    {!existingGoal && (
                        <div className="form-group">
                            <label>Category</label>
                            <div className="category-input-wrapper">
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="e.g., Work, Exercise, Reading"
                                    disabled={loading}
                                />
                                {suggestions.length > 0 && (
                                    <div className="suggestions-dropdown">
                                        {suggestions.map(tag => (
                                            <div
                                                key={tag._id}
                                                className="suggestion-item"
                                                onClick={() => {
                                                    setCategoryName(tag.name);
                                                    setSuggestions([]);
                                                }}
                                            >
                                                <span
                                                    className="tag-color-dot"
                                                    style={{ backgroundColor: tag.color }}
                                                />
                                                {tag.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {existingGoal && (
                        <div className="form-group">
                            <label>Category</label>
                            <div className="readonly-field">{existingGoal.categoryName}</div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Target Time</label>
                        <div className="time-inputs">
                            <input
                                type="number"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                placeholder="0"
                                min="0"
                                disabled={loading}
                            />
                            <span>hours</span>
                            <input
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                                placeholder="0"
                                min="0"
                                max="59"
                                disabled={loading}
                            />
                            <span>minutes</span>
                        </div>
                    </div>

                    {!existingGoal && (
                        <div className="form-group">
                            <label>Period</label>
                            <div className="period-toggle">
                                <button
                                    type="button"
                                    className={`period-btn ${period === 'daily' ? 'active' : ''}`}
                                    onClick={() => setPeriod('daily')}
                                    disabled={loading}
                                >
                                    Daily
                                </button>
                                <button
                                    type="button"
                                    className={`period-btn ${period === 'weekly' ? 'active' : ''}`}
                                    onClick={() => setPeriod('weekly')}
                                    disabled={loading}
                                >
                                    Weekly
                                </button>
                            </div>
                        </div>
                    )}

                    {existingGoal && (
                        <div className="form-group">
                            <label>Period</label>
                            <div className="readonly-field" style={{ textTransform: 'capitalize' }}>
                                {existingGoal.period}
                            </div>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Saving...' : existingGoal ? 'Update Goal' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default GoalManager;
