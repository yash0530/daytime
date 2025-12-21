import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';

export const useGoals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const fetchGoals = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/goals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGoals(data);
                setError(null);
            } else {
                const errData = await res.json();
                setError(errData.error || 'Failed to fetch goals');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const createGoal = async (categoryName, targetMinutes, period) => {
        try {
            const res = await fetch(`${API_URL}/goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ categoryName, targetMinutes, period })
            });

            if (res.ok) {
                const newGoal = await res.json();
                setGoals(prev => [newGoal, ...prev]);
                return { success: true, goal: newGoal };
            } else {
                const errData = await res.json();
                return { success: false, error: errData.error };
            }
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    };

    const updateGoal = async (id, updates) => {
        try {
            const res = await fetch(`${API_URL}/goals/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                const updatedGoal = await res.json();
                setGoals(prev => prev.map(g => g._id === id ? updatedGoal : g));
                return { success: true, goal: updatedGoal };
            } else {
                const errData = await res.json();
                return { success: false, error: errData.error };
            }
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    };

    const deleteGoal = async (id) => {
        try {
            const res = await fetch(`${API_URL}/goals/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setGoals(prev => prev.filter(g => g._id !== id));
                return { success: true };
            } else {
                const errData = await res.json();
                return { success: false, error: errData.error };
            }
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    };

    return {
        goals,
        loading,
        error,
        createGoal,
        updateGoal,
        deleteGoal,
        refresh: fetchGoals
    };
};
