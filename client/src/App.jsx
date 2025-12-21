import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { API_URL } from './config';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import JournalList from './pages/JournalList';
import ActivityLogger from './components/ActivityLogger';
import ActivityList from './components/ActivityList';
import CalendarView from './components/CalendarView';
import { ActivityByDayChart, CategoryDonutChart, ProductivityTrendsChart, CategoryBreakdownChart } from './components/AnalyticsCharts';
import TemplateList from './components/TemplateList';
import GoalProgress from './components/GoalProgress';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [templateRefreshTrigger, setTemplateRefreshTrigger] = useState(0);
  const [activities, setActivities] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_URL}/activities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivities();
  }, [refreshTrigger, token]);

  // Filter activities by date range
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const dateStr = new Date(a.date).toISOString().split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    });
  }, [activities, startDate, endDate]);

  const handleActivityDeleted = (id) => {
    setActivities(prev => prev.filter(a => a._id !== id));
    setTimeout(() => {
      setRefreshTrigger(c => c + 1);
    }, 500);
  };

  const updateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Daytime</h1>
        <div className="user-controls">
          <span>{user.username}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>
      <main className="dashboard-content">
        <section className="viz-controls">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => updateRange(3)} className="btn-pill btn-secondary">Last 3 Days</button>
            <button onClick={() => updateRange(7)} className="btn-pill btn-secondary">Last 7 Days</button>
            <button onClick={() => updateRange(30)} className="btn-pill btn-secondary">Last 30 Days</button>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label>Start: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
            <label>End: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => window.open(`/journals?start=${startDate}&end=${endDate}`, '_blank')}>
              View Journals
            </button>
          </div>
        </section>

        <section className="logger-section">
          <ActivityLogger
            selectedDate={endDate}
            onDateChange={(date) => setEndDate(date)}
            onActivityLogged={() => setRefreshTrigger(c => c + 1)}
          />
        </section>

        <section className="quick-actions-section">
          <TemplateList
            key={templateRefreshTrigger}
            onActivityCreated={() => setRefreshTrigger(c => c + 1)}
          />
        </section>

        <section className="goals-progress-section">
          <GoalProgress
            activities={activities}
            onGoalUpdated={() => setRefreshTrigger(c => c + 1)}
          />
        </section>

        {/* Row 1: Calendar + Donut Chart - Equal width */}
        <div className="viz-row">
          <div className="viz-col">
            <CalendarView
              activities={activities}
              onDayClick={(dateStr) => {
                setStartDate(dateStr);
                setEndDate(dateStr);
              }}
            />
          </div>
          <div className="viz-col">
            <CategoryDonutChart activities={filteredActivities} dateRange={{ start: startDate, end: endDate }} />
          </div>
        </div>

        {/* Row 2: Activity by Day + Summary Stats - Equal width */}
        <div className="viz-row">
          <div className="viz-col">
            <ActivityByDayChart activities={filteredActivities} dateRange={{ start: startDate, end: endDate }} />
          </div>
          <div className="viz-col">
            <CategoryBreakdownChart activities={filteredActivities} dateRange={{ start: startDate, end: endDate }} />
          </div>
        </div>

        {/* Row 3: Productivity Trends - Full width */}
        <div className="viz-full">
          <ProductivityTrendsChart activities={filteredActivities} dateRange={{ start: startDate, end: endDate }} />
        </div>

        <section className="list-section">
          <ActivityList
            activities={filteredActivities}
            onActivityDeleted={handleActivityDeleted}
            onTemplateCreated={() => setTemplateRefreshTrigger(c => c + 1)}
          />
        </section>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/journals" element={
            <PrivateRoute>
              <JournalList />
            </PrivateRoute>
          } />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
