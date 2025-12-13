import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import Timer from './Timer';
import Journal from './Journal';
import '../suggestions.css';

const ActivityLogger = ({ onActivityLogged, onJournalCreated }) => {
    const [mode, setMode] = useState('manual'); // 'manual', 'timer', or 'journal'
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [tags, setTags] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const fetchTags = async () => {
        if (!token) return;
        try {
            // Use standard /api/tags endpoint
            const res = await fetch(`${API_URL}/tags`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Available tags fetched:', data);
                setAvailableTags(data);
            } else {
                console.error('Failed to fetch tags:', res.status);
            }
        } catch (err) {
            console.error('Error fetching tags:', err);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [token]);

    const handleTagChange = (e) => {
        const val = e.target.value;
        setTags(val);

        const parts = val.split(',');
        const currentInput = parts[parts.length - 1].trim().toLowerCase();

        if (currentInput) {
            const filtered = availableTags.filter(t =>
                t.name.toLowerCase().includes(currentInput)
            );
            // console.log('Suggestions for', currentInput, filtered);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const addSuggestion = (tagName) => {
        const parts = tags.split(',');
        parts.pop(); // remove incomplete part
        parts.push(tagName);
        setTags(parts.join(', ') + ', ');
        setSuggestions([]);
        // refocus input logic could be added here if we had a ref
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !duration) return;

        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
            const res = await fetch(`${API_URL}/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    description,
                    durationMinutes: parseInt(duration),
                    tagNames: tagList
                })
            });

            if (res.ok) {
                setDescription('');
                setDuration('');
                setTags('');
                // Refetch tags to include any new ones
                fetchTags();
                if (onActivityLogged) onActivityLogged();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="logger-container">
            <div className="logger-mode-toggle">
                <button
                    type="button"
                    className={`mode-toggle-btn ${mode === 'manual' ? 'active' : ''}`}
                    onClick={() => setMode('manual')}
                >
                    Manual Entry
                </button>
                <button
                    type="button"
                    className={`mode-toggle-btn ${mode === 'timer' ? 'active' : ''}`}
                    onClick={() => setMode('timer')}
                >
                    Timer Mode
                </button>
                <button
                    type="button"
                    className={`mode-toggle-btn ${mode === 'journal' ? 'active' : ''}`}
                    onClick={() => setMode('journal')}
                >
                    Journal
                </button>
            </div>

            {mode === 'timer' ? (
                <Timer onActivityLogged={() => {
                    fetchTags();
                    if (onActivityLogged) onActivityLogged();
                }} />
            ) : mode === 'journal' ? (
                <Journal onJournalCreated={() => {
                    if (onJournalCreated) onJournalCreated();
                }} />
            ) : (
                <>
                    <h3>Log Activity</h3>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="What did you do?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Duration (minutes)"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            required
                        />
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Category (e.g. Work, Exercise, Learning)"
                                value={tags}
                                onChange={handleTagChange}
                                autoComplete="off"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                            {suggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {suggestions.map(tag => (
                                        <li key={tag._id} onClick={() => addSuggestion(tag.name)} style={{ borderLeft: `4px solid ${tag.color}` }}>
                                            {tag.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button type="submit">Log It</button>
                    </form>
                </>
            )}
        </div>
    );
};

export default ActivityLogger;

