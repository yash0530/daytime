import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { API_URL } from '../config';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Visualization = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);

    // Initial state from URL or defaults
    const [dateRange, setDateRange] = useState({
        start: query.get('start') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: query.get('end') || new Date().toISOString().split('T')[0]
    });

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    // Helper to update URL when range changes
    const updateRange = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days + 1); // +1 to include today in count if we want exactly "last X days" inclusive

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        setDateRange({ start: startStr, end: endStr });
        navigate(`/visualize?start=${startStr}&end=${endStr}`);
    };

    const setCustomRange = (start, end) => {
        setDateRange({ start, end });
        navigate(`/visualize?start=${start}&end=${end}`);
    };

    useEffect(() => {
        const fetchRange = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/activities`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();

                    // Client-side filtering using date-only comparison to avoid timezone issues
                    const filtered = data.filter(a => {
                        // Extract just the date part (YYYY-MM-DD) from the activity date
                        const activityDateStr = new Date(a.date).toISOString().split('T')[0];
                        return activityDateStr >= dateRange.start && activityDateStr <= dateRange.end;
                    });
                    setActivities(filtered);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRange();
    }, [dateRange.start, dateRange.end, token]);

    // --- Data Processing for Charts ---

    const processedData = useMemo(() => {
        const dailyMap = {};
        const tagMap = {};
        const allTags = new Set();

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
            const durationHours = Number(act.durationMinutes) / 60; // Ensure it's a number

            // For Pie Chart
            const tagName = (act.tags && act.tags[0] && act.tags[0].name) ? act.tags[0].name : 'Uncategorized';

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
        // This is crucial for stacked charts in Recharts
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


    return (
        <div className="visualization-page" style={pageStyle}>
            <header style={headerStyle}>
                <div style={headerTopRow}>
                    <h1 style={titleStyle}>Analytics Dashboard</h1>
                    <button onClick={() => navigate('/')} style={backBtnStyle}>
                        ← Back to Dashboard
                    </button>
                </div>
                <div className="controls" style={controlsStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => updateRange(3)} style={btnStyle}>Last 3 Days</button>
                        <button onClick={() => updateRange(7)} style={btnStyle}>Last 7 Days</button>
                        <button onClick={() => updateRange(30)} style={btnStyle}>Last 30 Days</button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <label style={labelStyle}>Start: <input type="date" value={dateRange.start} onChange={e => setCustomRange(e.target.value, dateRange.end)} style={inputStyle} /></label>
                        <label style={labelStyle}>End: <input type="date" value={dateRange.end} onChange={e => setCustomRange(dateRange.start, e.target.value)} style={inputStyle} /></label>
                    </div>
                </div>
            </header>

            {loading ? (
                <div style={loadingStyle}>
                    <div style={spinnerStyle}></div>
                    Loading data...
                </div>
            ) : activities.length === 0 ? (
                <div style={emptyStyle}>
                    No activities found for this period. Try selecting a different range.
                </div>
            ) : (
                <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>

                    {/* Daily Breakdown (Stacked Bar) */}
                    <div className="chart-container" style={cardStyle}>
                        <h3 style={cardHeaderStyle}>Activity by Day</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processedData.dailyData} barGap={0} barCategoryGap="15%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                {processedData.uniqueTags.map((tag, index) => (
                                    <Bar key={tag} dataKey={tag} stackId="a" fill={COLORS[index % COLORS.length]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Overall Distribution (Pie) */}
                    <div className="chart-container" style={cardStyle}>
                        <h3 style={cardHeaderStyle}>Time by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={processedData.pieData}
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
                                    {processedData.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

                    {/* Daily Trend (Area) - with tag breakdown */}
                    <div className="chart-container" style={{ ...cardStyle, gridColumn: '1 / -1' }}>
                        <h3 style={cardHeaderStyle}>Productivity Trends</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={processedData.dailyData}>
                                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'rgba(255,255,255,0.4)' } }} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                {processedData.uniqueTags.map((tag, index) => (
                                    <Area
                                        key={tag}
                                        type="monotone"
                                        dataKey={tag}
                                        name={tag}
                                        stackId="1"
                                        stroke={COLORS[index % COLORS.length]}
                                        fill={COLORS[index % COLORS.length]}
                                        fillOpacity={0.95}
                                        strokeWidth={3}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            )}
        </div>
    );
};

// Modern Dark Theme Styles
const pageStyle = {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh'
};

const headerStyle = {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
};

const titleStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0
};

const headerTopRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
};

const controlsStyle = {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between'
};

const btnStyle = {
    padding: '10px 20px',
    border: '1px solid rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500'
};

const backBtnStyle = {
    padding: '10px 20px',
    border: '1px solid rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500'
};

const labelStyle = {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};

const inputStyle = {
    padding: '8px 12px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    colorScheme: 'dark'
};

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

const tooltipStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    backgroundColor: 'rgba(26,26,46,0.95)',
    backdropFilter: 'blur(10px)'
};

const loadingStyle = {
    textAlign: 'center',
    padding: '80px',
    color: 'rgba(255,255,255,0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
};

const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
};

const emptyStyle = {
    textAlign: 'center',
    padding: '60px',
    color: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)'
};

export default Visualization;

