import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Journal = ({ onJournalCreated }) => {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTags = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/tags`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAvailableTags(data);
                }
            } catch (err) {
                console.error('Error fetching tags:', err);
            }
        };
        fetchTags();
    }, [token]);

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setCategory(val);

        if (val.trim()) {
            const filtered = availableTags.filter(t =>
                t.name.toLowerCase().includes(val.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (tagName) => {
        setCategory(tagName);
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/journals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: content.trim(),
                    category: category.trim()
                })
            });

            if (res.ok) {
                setContent('');
                setCategory('');
                if (onJournalCreated) onJournalCreated();
            }
        } catch (err) {
            console.error('Error creating journal:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="journal-container">
            <h3>Write Journal Entry</h3>
            <form onSubmit={handleSubmit} className="journal-form">
                <textarea
                    placeholder="What's on your mind? Write your thoughts here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={5}
                    className="journal-textarea"
                />
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Category (e.g. Personal, Work, Ideas)"
                        value={category}
                        onChange={handleCategoryChange}
                        autoComplete="off"
                        className="journal-category-input"
                    />
                    {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map(tag => (
                                <li
                                    key={tag._id}
                                    onClick={() => selectSuggestion(tag.name)}
                                    style={{ borderLeft: `4px solid ${tag.color}` }}
                                >
                                    {tag.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button type="submit" disabled={loading || !content.trim()}>
                    {loading ? 'Saving...' : 'Save Entry'}
                </button>
            </form>
        </div>
    );
};

export default Journal;
