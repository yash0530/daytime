import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';



const CalendarView = ({ activities, onDayClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const monthData = useMemo(() => {
        const days = {};
        activities.forEach(act => {
            const d = new Date(act.date);
            if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                const day = d.getDate();
                if (!days[day]) days[day] = { count: 0, distinctTags: new Set(), totalMinutes: 0 };
                days[day].count += 1;
                days[day].totalMinutes += act.durationMinutes;
                act.tags.forEach(t => days[day].distinctTags.add(t.color));
            }
        });
        return days;
    }, [activities, currentDate]);

    const handleDayClick = (day) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = clickedDate.toISOString().split('T')[0];
        // Call the onDayClick callback if provided
        if (onDayClick) {
            onDayClick(dateStr);
        }
    };

    const renderCells = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const blanks = Array(startDay).fill(null);
        const days = Array.from({ length: totalDays }, (_, i) => i + 1);

        return (
            <div className="calendar-grid">
                {blanks.map((_, i) => <div key={`blank-${i}`} className="calendar-cell empty"></div>)}
                {days.map(day => {
                    const data = monthData[day];
                    const hasActivity = data && data.count > 0;
                    return (
                        <div
                            key={day}
                            className={`calendar-cell ${hasActivity ? 'clickable' : ''}`}
                            onClick={() => hasActivity && handleDayClick(day)}
                            title={hasActivity ? 'Click to view analytics for this day' : ''}
                            style={hasActivity ? { cursor: 'pointer' } : {}}
                        >
                            <span className="day-number">{day}</span>
                            {data && (
                                <div className="day-dots">
                                    {Array.from(data.distinctTags).map((color, i) => (
                                        <span key={i} className="dot" style={{ backgroundColor: color }}></span>
                                    ))}
                                    {data.totalMinutes > 0 && <span className="day-min">{data.totalMinutes}m</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const traverse = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div className="nav-buttons">
                    <button onClick={() => traverse(-1)}><ChevronLeft size={20} /></button>
                    <button onClick={() => traverse(1)}><ChevronRight size={20} /></button>
                </div>
            </div>
            <div className="calendar-weekdays">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            {renderCells()}
        </div>
    );
};

export default CalendarView;

