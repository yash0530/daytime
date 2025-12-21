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

// Time by Category bar chart
export const CategoryChart = ({ activities }) => {
    const dataByTag = useMemo(() => {
        const map = {};
        const displayNames = {}; // Map lowercase keys to original display names
        activities.forEach(act => {
            act.tags.forEach(t => {
                const tagKey = t.name.toLowerCase();
                // Store first occurrence as display name
                if (!displayNames[tagKey]) {
                    displayNames[tagKey] = t.name;
                }
                const displayName = displayNames[tagKey];
                if (!map[displayName]) map[displayName] = { name: displayName, minutes: 0, fill: t.color };
                map[displayName].minutes += act.durationMinutes;
            });
        });
        return Object.values(map);
    }, [activities]);

    if (activities.length === 0) return null;

    return (
        <div className="chart-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
            <h4>Time by Category</h4>
            <div style={{ width: '100%', flex: 1, minHeight: 200 }}>
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
    );
};

// Activity Over Time line chart
export const ActivityTimeline = ({ activities }) => {
    const dataByDate = useMemo(() => {
        const map = {};
        activities.forEach(act => {
            const dateKey = new Date(act.date).toISOString().split('T')[0];
            if (!map[dateKey]) map[dateKey] = { date: dateKey, minutes: 0 };
            map[dateKey].minutes += act.durationMinutes;
        });
        return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    }, [activities]);

    if (activities.length === 0) return null;

    return (
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
    );
};

// Default export for backwards compatibility
const StatsView = ({ activities }) => {
    if (activities.length === 0) return null;

    return (
        <div className="stats-container">
            <CategoryChart activities={activities} />
            <ActivityTimeline activities={activities} />
        </div>
    );
};

export default StatsView;

