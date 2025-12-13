import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { API_URL } from './config';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Visualization from './pages/Visualization';
import ActivityLogger from './components/ActivityLogger';
import ActivityList from './components/ActivityList';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import TemplateList from './components/TemplateList';
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

  const handleActivityDeleted = (id) => {
    // Optimistic update
    setActivities(prev => prev.filter(a => a._id !== id));

    // Delayed refetch to allow DB consistency to settle while keeping UI responsive
    setTimeout(() => {
      setRefreshTrigger(c => c + 1);
    }, 500);
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
        <section className="viz-controls" style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <label>Start: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
          <label>End: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
          <button onClick={() => window.open(`/visualize?start=${startDate}&end=${endDate}`, '_blank')}>
            View Analytics
          </button>
        </section>
        <section className="logger-section">
          <ActivityLogger onActivityLogged={() => setRefreshTrigger(c => c + 1)} />
        </section>

        {/* Quick Actions Section */}
        <section className="quick-actions-section">
          <TemplateList
            key={templateRefreshTrigger}
            onActivityCreated={() => setRefreshTrigger(c => c + 1)}
          />
        </section>

        <div className="viz-grid">
          <section className="calendar-section">
            <CalendarView activities={activities} />
          </section>
          <section className="stats-section">
            <StatsView activities={activities} />
          </section>
        </div>
        <section className="list-section">
          <ActivityList
            activities={activities}
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
          <Route path="/visualize" element={
            <PrivateRoute>
              <Visualization />
            </PrivateRoute>
          } />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
