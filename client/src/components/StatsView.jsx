import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const StatsView = ({ activities }) => {
    const dataByTag = useMemo(() => {
        const map = {};
        activities.forEach(act => {
            act.tags.forEach(t => {
                if (!map[t.name]) map[t.name] = { name: t.name, minutes: 0, fill: t.color };
                map[t.name].minutes += act.durationMinutes;
            });
        });
        return Object.values(map);
    }, [activities]);

    const dataByDate = useMemo(() => {
        const map = {};
        activities.forEach(act => {
            // Use ISO string (YYYY-MM-DD) for stable sorting and keys
            const dateKey = new Date(act.date).toISOString().split('T')[0];
            if (!map[dateKey]) map[dateKey] = { date: dateKey, minutes: 0 };
            map[dateKey].minutes += act.durationMinutes;
        });
        // Sort by date string (lexicographical sort works for YYYY-MM-DD)
        return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    }, [activities]);

    if (activities.length === 0) return null;

    return (
        <div className="stats-container">
            <div className="chart-wrapper">
                <h4>Time by Tag</h4>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={dataByTag}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="minutes" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="chart-wrapper">
                <h4>Daily Activity Trend</h4>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={dataByDate}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="minutes" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StatsView;
