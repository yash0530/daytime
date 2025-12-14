import { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '../config';

const TIMER_STORAGE_KEY = 'daytime_timer_state';

export const useTimer = () => {
    const [timerState, setTimerState] = useState({
        active: false,
        description: '',
        tagNames: [],
        startTime: null,
        pausedDuration: 0,
        isPaused: false,
        pausedAt: null,
        mode: 'timer', // 'timer' or 'pomodoro'
        pomodoroState: null,
        elapsedMs: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const token = localStorage.getItem('token');

    // Calculate elapsed time
    const calculateElapsed = useCallback((state) => {
        if (!state.active || !state.startTime) return 0;

        const startTime = new Date(state.startTime).getTime();
        let elapsed = state.pausedDuration || 0;

        if (!state.isPaused) {
            elapsed += Date.now() - startTime;
        } else if (state.pausedAt) {
            elapsed += new Date(state.pausedAt).getTime() - startTime;
        }

        return elapsed;
    }, []);

    // Save state to localStorage
    const saveToStorage = useCallback((state) => {
        if (state.active) {
            localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
        } else {
            localStorage.removeItem(TIMER_STORAGE_KEY);
        }
    }, []);

    // Load from localStorage on mount
    const loadFromStorage = useCallback(() => {
        try {
            const stored = localStorage.getItem(TIMER_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading timer from storage:', e);
        }
        return null;
    }, []);

    // Fetch timer state from server
    const fetchTimerState = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/timer`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const newState = {
                    active: data.active,
                    description: data.description || '',
                    tagNames: data.tagNames || [],
                    startTime: data.startTime,
                    pausedDuration: data.pausedDuration || 0,
                    isPaused: data.isPaused || false,
                    pausedAt: data.pausedAt,
                    mode: data.mode || 'timer',
                    pomodoroState: data.pomodoroState,
                    elapsedMs: data.elapsedMs || 0
                };
                setTimerState(newState);
                saveToStorage(newState);
            }
        } catch (err) {
            console.error('Error fetching timer:', err);
            // Try to restore from localStorage
            const stored = loadFromStorage();
            if (stored) {
                setTimerState(stored);
            }
        } finally {
            setLoading(false);
        }
    }, [token, saveToStorage, loadFromStorage]);

    // Start timer
    const startTimer = useCallback(async (description, tagNames, mode = 'timer', pomodoroSettings = null) => {
        if (!token) return { error: 'Not authenticated' };

        setError(null);
        try {
            const res = await fetch(`${API_URL}/timer/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description, tagNames, mode, pomodoroSettings })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                return { error: data.error };
            }

            const newState = {
                active: true,
                description,
                tagNames,
                startTime: data.startTime,
                pausedDuration: 0,
                isPaused: false,
                pausedAt: null,
                mode,
                pomodoroState: data.pomodoroState,
                elapsedMs: 0
            };
            setTimerState(newState);
            saveToStorage(newState);
            return { success: true };
        } catch (err) {
            setError('Failed to start timer');
            return { error: 'Failed to start timer' };
        }
    }, [token, saveToStorage]);

    // Pause timer
    const pauseTimer = useCallback(async () => {
        if (!token) return { error: 'Not authenticated' };

        try {
            const res = await fetch(`${API_URL}/timer/pause`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                return { error: data.error };
            }

            setTimerState(prev => {
                const newState = {
                    ...prev,
                    isPaused: true,
                    pausedAt: data.pausedAt
                };
                saveToStorage(newState);
                return newState;
            });
            return { success: true };
        } catch (err) {
            setError('Failed to pause timer');
            return { error: 'Failed to pause timer' };
        }
    }, [token, saveToStorage]);

    // Resume timer
    const resumeTimer = useCallback(async () => {
        if (!token) return { error: 'Not authenticated' };

        try {
            const res = await fetch(`${API_URL}/timer/resume`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                return { error: data.error };
            }

            setTimerState(prev => {
                const newState = {
                    ...prev,
                    isPaused: false,
                    pausedAt: null,
                    pausedDuration: data.pausedDuration
                };
                saveToStorage(newState);
                return newState;
            });
            return { success: true };
        } catch (err) {
            setError('Failed to resume timer');
            return { error: 'Failed to resume timer' };
        }
    }, [token, saveToStorage]);

    // Stop timer
    const stopTimer = useCallback(async (createActivity = true, date = null) => {
        if (!token) return { error: 'Not authenticated' };

        try {
            const res = await fetch(`${API_URL}/timer/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ createActivity, date })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                return { error: data.error };
            }

            setTimerState({
                active: false,
                description: '',
                tagNames: [],
                startTime: null,
                pausedDuration: 0,
                isPaused: false,
                pausedAt: null,
                mode: 'timer',
                pomodoroState: null,
                elapsedMs: 0
            });
            localStorage.removeItem(TIMER_STORAGE_KEY);

            return {
                success: true,
                durationMinutes: data.durationMinutes,
                activity: data.activity
            };
        } catch (err) {
            setError('Failed to stop timer');
            return { error: 'Failed to stop timer' };
        }
    }, [token]);

    // Update timer details
    const updateTimer = useCallback(async (description, tagNames) => {
        if (!token) return { error: 'Not authenticated' };

        try {
            const res = await fetch(`${API_URL}/timer`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description, tagNames })
            });

            const data = await res.json();
            if (!res.ok) {
                return { error: data.error };
            }

            setTimerState(prev => {
                const newState = {
                    ...prev,
                    description: data.description,
                    tagNames: data.tagNames
                };
                saveToStorage(newState);
                return newState;
            });
            return { success: true };
        } catch (err) {
            return { error: 'Failed to update timer' };
        }
    }, [token, saveToStorage]);

    // Toggle Pomodoro work/break
    const togglePomodoro = useCallback(async () => {
        if (!token) return { error: 'Not authenticated' };

        try {
            const res = await fetch(`${API_URL}/timer/pomodoro/toggle`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) {
                return { error: data.error };
            }

            setTimerState(prev => {
                const newState = {
                    ...prev,
                    startTime: data.startTime,
                    pausedDuration: 0,
                    isPaused: false,
                    pausedAt: null,
                    pomodoroState: data.pomodoroState
                };
                saveToStorage(newState);
                return newState;
            });
            return { success: true };
        } catch (err) {
            return { error: 'Failed to toggle Pomodoro' };
        }
    }, [token, saveToStorage]);

    // Update elapsed time every second
    useEffect(() => {
        if (timerState.active && !timerState.isPaused) {
            intervalRef.current = setInterval(() => {
                setTimerState(prev => ({
                    ...prev,
                    elapsedMs: calculateElapsed(prev)
                }));
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timerState.active, timerState.isPaused, calculateElapsed]);

    // Initial fetch
    useEffect(() => {
        fetchTimerState();
    }, [fetchTimerState]);

    // Format time as HH:MM:SS
    const formatTime = useCallback((ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    return {
        ...timerState,
        loading,
        error,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        updateTimer,
        togglePomodoro,
        formatTime,
        refresh: fetchTimerState
    };
};
