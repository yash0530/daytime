import React, { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import { API_URL } from '../config';
import '../suggestions.css';

const Timer = ({ onActivityLogged, selectedDate }) => {
    const {
        active,
        description: timerDescription,
        tagNames: timerTagNames,
        isPaused,
        mode,
        pomodoroState,
        elapsedMs,
        loading,
        error,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        updateTimer,
        togglePomodoro,
        formatTime
    } = useTimer();

    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [timerMode, setTimerMode] = useState('timer'); // 'timer' or 'pomodoro'
    const [localError, setLocalError] = useState(null);
    const token = localStorage.getItem('token');

    // Fetch available tags
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

    // Sync local state with timer state when active
    useEffect(() => {
        if (active) {
            setDescription(timerDescription || '');
            setTags((timerTagNames || []).join(', '));
            setTimerMode(mode || 'timer');
        }
    }, [active, timerDescription, timerTagNames, mode]);

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

    const getTagList = () => {
        return tags.split(',').map(t => t.trim()).filter(t => t);
    };

    const handleStart = async () => {
        setLocalError(null);
        if (!description.trim()) {
            setLocalError('Please enter a description');
            return;
        }

        const result = await startTimer(
            description,
            getTagList(),
            timerMode,
            timerMode === 'pomodoro' ? { workDuration: 25 * 60 * 1000, breakDuration: 5 * 60 * 1000 } : null
        );

        if (result.error) {
            setLocalError(result.error);
        }
    };

    const handlePause = async () => {
        const result = await pauseTimer();
        if (result.error) {
            setLocalError(result.error);
        }
    };

    const handleResume = async () => {
        const result = await resumeTimer();
        if (result.error) {
            setLocalError(result.error);
        }
    };

    const handleStop = async () => {
        // Update timer description and tags before stopping
        if (description !== timerDescription || tags !== (timerTagNames || []).join(', ')) {
            await updateTimer(description, getTagList());
        }

        const result = await stopTimer(true, selectedDate);
        if (result.error) {
            setLocalError(result.error);
        } else {
            setDescription('');
            setTags('');
            if (onActivityLogged) {
                onActivityLogged();
            }
        }
    };

    const handleDiscard = async () => {
        const result = await stopTimer(false);
        if (result.error) {
            setLocalError(result.error);
        } else {
            setDescription('');
            setTags('');
        }
    };

    const handleTogglePomodoro = async () => {
        await togglePomodoro();
    };

    // Get Pomodoro progress
    const getPomodoroProgress = () => {
        if (!pomodoroState || mode !== 'pomodoro') return null;
        const targetDuration = pomodoroState.isBreak
            ? pomodoroState.breakDuration
            : pomodoroState.workDuration;
        const progress = Math.min(100, (elapsedMs / targetDuration) * 100);
        const remaining = Math.max(0, targetDuration - elapsedMs);
        return { progress, remaining, isBreak: pomodoroState.isBreak };
    };

    if (loading) {
        return (
            <div className="timer-container">
                <div className="timer-loading">Loading timer...</div>
            </div>
        );
    }

    const pomodoroProgress = getPomodoroProgress();

    return (
        <div className="timer-container">
            <div className="timer-header">
                <h3>Timer</h3>
                {!active && (
                    <div className="timer-mode-toggle">
                        <button
                            type="button"
                            className={`mode-btn ${timerMode === 'timer' ? 'active' : ''}`}
                            onClick={() => setTimerMode('timer')}
                        >
                            Timer
                        </button>
                        <button
                            type="button"
                            className={`mode-btn ${timerMode === 'pomodoro' ? 'active' : ''}`}
                            onClick={() => setTimerMode('pomodoro')}
                        >
                            Pomodoro
                        </button>
                    </div>
                )}
            </div>

            {(error || localError) && (
                <div className="timer-error">{error || localError}</div>
            )}

            <div className={`timer-display ${active ? (isPaused ? 'paused' : 'running') : ''}`}>
                {mode === 'pomodoro' && pomodoroProgress && (
                    <div className={`pomodoro-indicator ${pomodoroProgress.isBreak ? 'break' : 'work'}`}>
                        {pomodoroProgress.isBreak ? '☕ Break' : '💼 Work'}
                        <span className="pomodoro-sessions">
                            Session {pomodoroState?.completedSessions || 0}
                        </span>
                    </div>
                )}
                <div className="timer-time">
                    {mode === 'pomodoro' && pomodoroProgress
                        ? formatTime(pomodoroProgress.remaining)
                        : formatTime(elapsedMs)
                    }
                </div>
                {mode === 'pomodoro' && pomodoroProgress && (
                    <div className="pomodoro-progress-bar">
                        <div
                            className="pomodoro-progress-fill"
                            style={{ width: `${pomodoroProgress.progress}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="timer-inputs">
                <input
                    type="text"
                    placeholder="What are you working on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={active && !isPaused}
                />
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Category (e.g. Work, Exercise)"
                        value={tags}
                        onChange={handleTagChange}
                        autoComplete="off"
                        disabled={active && !isPaused}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map(tag => (
                                <li
                                    key={tag._id}
                                    onClick={() => addSuggestion(tag.name)}
                                    style={{ borderLeft: `4px solid ${tag.color}` }}
                                >
                                    {tag.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="timer-controls">
                {!active ? (
                    <button className="timer-btn start" onClick={handleStart}>
                        <span className="btn-icon">▶</span>
                        Start {timerMode === 'pomodoro' ? 'Pomodoro' : 'Timer'}
                    </button>
                ) : (
                    <>
                        {isPaused ? (
                            <button className="timer-btn resume" onClick={handleResume}>
                                <span className="btn-icon">▶</span>
                                Resume
                            </button>
                        ) : (
                            <button className="timer-btn pause" onClick={handlePause}>
                                <span className="btn-icon">⏸</span>
                                Pause
                            </button>
                        )}
                        <button className="timer-btn stop" onClick={handleStop}>
                            <span className="btn-icon">⏹</span>
                            Stop & Log
                        </button>
                        <button className="timer-btn discard" onClick={handleDiscard}>
                            <span className="btn-icon">✕</span>
                            Discard
                        </button>
                        {mode === 'pomodoro' && (
                            <button className="timer-btn skip" onClick={handleTogglePomodoro}>
                                <span className="btn-icon">⏭</span>
                                Skip
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Timer;
