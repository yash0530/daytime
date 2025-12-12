import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ActivityLogger = ({ onActivityLogged }) => {
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [tags, setTags] = useState('');
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !duration) return;

        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
            const res = await fetch('http://localhost:3000/api/activities', {
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
                if (onActivityLogged) onActivityLogged();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="logger-container">
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
                <input
                    type="text"
                    placeholder="Tags (comma separated, e.g. Work, Deep Focus)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
                <button type="submit">Log It</button>
            </form>
        </div>
    );
};

export default ActivityLogger;
