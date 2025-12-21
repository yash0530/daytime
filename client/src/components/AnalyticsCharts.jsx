import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Dark theme tooltip styling
const tooltipStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    backgroundColor: 'rgba(26,26,46,0.95)',
    backdropFilter: 'blur(10px)'
};

// Axis styling
const axisTickStyle = {
    fontSize: 11,
    fill: 'rgba(255,255,255,0.5)'
};

// Card styling
const cardStyle = {
    backgroundColor: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    padding: '28px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.08)'
};

const cardHeaderStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '24px',
    textAlign: 'center'
};

/**
 * Processes activities into chart-ready data
 */
const useProcessedData = (activities, dateRange) => {
    return useMemo(() => {
        const dailyMap = {};
        const tagMap = {};
        const allTags = new Set();
        const tagDisplayNames = {}; // Map lowercase keys to original display names

        // Initialize daily map for the full range to ensure continuous x-axis
        let curr = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        while (curr <= end) {
            const dateStr = curr.toISOString().split('T')[0];
            dailyMap[dateStr] = { date: dateStr, total: 0 };
            curr.setDate(curr.getDate() + 1);
        }

        activities.forEach(act => {
            const dateStr = new Date(act.date).toISOString().split('T')[0];
            const durationHours = Number(act.durationMinutes) / 60;

            // For Pie Chart - use case-insensitive aggregation
            const rawTagName = (act.tags && act.tags[0] && act.tags[0].name) ? act.tags[0].name : 'Uncategorized';
            const tagKey = rawTagName.toLowerCase();

            // Store the first occurrence as the display name
            if (!tagDisplayNames[tagKey]) {
                tagDisplayNames[tagKey] = rawTagName;
            }
            const tagName = tagDisplayNames[tagKey];

            allTags.add(tagName);

            if (!tagMap[tagName]) tagMap[tagName] = 0;
            tagMap[tagName] += durationHours;

            // For Bar/Line Charts
            if (dailyMap[dateStr]) {
                dailyMap[dateStr].total += durationHours;
                if (!dailyMap[dateStr][tagName]) dailyMap[dateStr][tagName] = 0;
                dailyMap[dateStr][tagName] += durationHours;
            }
        });

        // Ensure every day object has all tags initialized to 0 if missing
        const uniqueTags = Array.from(allTags);
        Object.values(dailyMap).forEach(day => {
            uniqueTags.forEach(tag => {
                if (day[tag] === undefined) {
                    day[tag] = 0;
                }
            });
        });

        // Convert maps to arrays
        const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
        const pieData = Object.keys(tagMap).map(key => ({
            name: key,
            value: Number(tagMap[key].toFixed(2))
        }));

        return { dailyData, pieData, uniqueTags };
    }, [activities, dateRange]);
};

/**
 * Activity by Day - Stacked bar chart with category breakdown
 */
export const ActivityByDayChart = ({ activities, dateRange }) => {
    const { dailyData, uniqueTags } = useProcessedData(activities, dateRange);

    if (activities.length === 0) return null;

    return (
        <div className="chart-container" style={cardStyle}>
            <h3 style={cardHeaderStyle}>Activity by Day</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData} barGap={0} barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={axisTickStyle} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {uniqueTags.map((tag, index) => (
                        <Bar
                            key={tag}
                            dataKey={tag}
                            stackId="a"
                            fill={COLORS[index % COLORS.length]}
                            fillOpacity={0.5}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Time by Category - Donut chart showing time distribution
 */
export const CategoryDonutChart = ({ activities, dateRange }) => {
    const { pieData } = useProcessedData(activities, dateRange);

    if (activities.length === 0) return null;

    return (
        <div className="chart-container" style={cardStyle}>
            <h3 style={cardHeaderStyle}>Time by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={0}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                    >
                        {pieData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                fillOpacity={0.5}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: 'transparent' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#fff', fontWeight: 600 }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Productivity Trends - Stacked area chart showing activity patterns
 */
export const ProductivityTrendsChart = ({ activities, dateRange }) => {
    const { dailyData, uniqueTags } = useProcessedData(activities, dateRange);

    if (activities.length === 0) return null;

    return (
        <div className="chart-container" style={{ ...cardStyle, gridColumn: '1 / -1' }}>
            <h3 style={cardHeaderStyle}>Productivity Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" tick={axisTickStyle} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'rgba(255,255,255,0.4)' } }} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {uniqueTags.map((tag, index) => (
                        <Area
                            key={tag}
                            type="monotone"
                            dataKey={tag}
                            name={tag}
                            stackId="1"
                            stroke={COLORS[index % COLORS.length]}
                            fill={COLORS[index % COLORS.length]}
                            fillOpacity={0.5}
                            strokeWidth={2}
                            strokeOpacity={1}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Category Breakdown - Visual radial bar chart with stats
 */
export const CategoryBreakdownChart = ({ activities, dateRange }) => {
    const data = useMemo(() => {
        if (activities.length === 0) return null;

        const totalMinutes = activities.reduce((sum, act) => sum + act.durationMinutes, 0);
        const totalHours = (totalMinutes / 60).toFixed(1);

        // Calculate days in range
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        const daysInRange = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
        const avgPerDay = (totalMinutes / 60 / daysInRange).toFixed(1);

        // Build category data for radial chart (case-insensitive aggregation)
        const tagTotals = {};
        const tagDisplayNames = {}; // Map lowercase keys to original display names
        activities.forEach(act => {
            const rawTagName = (act.tags && act.tags[0] && act.tags[0].name) ? act.tags[0].name : 'Uncategorized';
            const tagKey = rawTagName.toLowerCase();

            // Store the first occurrence as the display name
            if (!tagDisplayNames[tagKey]) {
                tagDisplayNames[tagKey] = rawTagName;
            }
            const tagName = tagDisplayNames[tagKey];

            if (!tagTotals[tagName]) tagTotals[tagName] = 0;
            tagTotals[tagName] += act.durationMinutes;
        });

        const maxMinutes = Math.max(...Object.values(tagTotals));
        const radialData = Object.entries(tagTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Top 5 categories
            .map(([name, minutes], index) => ({
                name,
                value: (minutes / 60).toFixed(1),
                fill: COLORS[index % COLORS.length],
                percentage: Math.round((minutes / maxMinutes) * 100)
            }));

        return {
            radialData,
            totalHours,
            avgPerDay,
            activityCount: activities.length,
            topCategory: radialData[0]?.name || '-'
        };
    }, [activities, dateRange]);

    if (!data) return null;

    const statStyle = {
        textAlign: 'center',
        padding: '8px 12px'
    };

    const statValueStyle = {
        fontSize: '1.25rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    };

    const statLabelStyle = {
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '2px'
    };

    return (
        <div className="chart-container" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={cardHeaderStyle}>Category Breakdown</h3>
            <div style={{ flex: 1, minHeight: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="55%"
                        innerRadius="25%"
                        outerRadius="95%"
                        data={data.radialData}
                        startAngle={180}
                        endAngle={0}
                    >
                        <RadialBar
                            dataKey="value"
                            cornerRadius={8}
                            background={{ fill: 'rgba(255,255,255,0.03)' }}
                            label={{ position: 'insideStart', fill: '#fff', fontSize: 12, fontWeight: 600 }}
                            fillOpacity={0.5}
                            stroke={({ fill }) => fill}
                            strokeWidth={2}
                        />
                        <Tooltip
                            contentStyle={tooltipStyle}
                            formatter={(value) => [`${value}h`, 'Hours']}
                        />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{value}</span>}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: 'auto' }}>
                <div style={statStyle}>
                    <div style={statValueStyle}>{data.totalHours}h</div>
                    <div style={statLabelStyle}>Total</div>
                </div>
                <div style={statStyle}>
                    <div style={statValueStyle}>{data.avgPerDay}h</div>
                    <div style={statLabelStyle}>Daily Avg</div>
                </div>
                <div style={statStyle}>
                    <div style={statValueStyle}>{data.activityCount}</div>
                    <div style={statLabelStyle}>Activities</div>
                </div>
            </div>
        </div>
    );
};

export default { ActivityByDayChart, CategoryDonutChart, ProductivityTrendsChart, CategoryBreakdownChart };
