import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

// Dark theme tooltip styling
const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    backgroundColor: 'rgba(26,26,46,0.95)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    padding: '12px 16px'
};

// Axis tick styling
const axisTickStyle = {
    fontSize: 12,
    fill: 'rgba(255,255,255,0.6)'
};

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
                <h4>Time by Category</h4>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <BarChart data={dataByTag} barGap={0} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                tick={axisTickStyle}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={axisTickStyle}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                                itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
                            />
                            <Bar dataKey="minutes" fill="#667eea" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="chart-wrapper">
                <h4>Activity Over Time</h4>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <LineChart data={dataByDate}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="date"
                                tick={axisTickStyle}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={axisTickStyle}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                                labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                                itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
                            />
                            <Line type="monotone" dataKey="minutes" stroke="#38ef7d" strokeWidth={2} dot={{ fill: '#38ef7d', strokeWidth: 0, r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StatsView;
