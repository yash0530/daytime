import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivityLogger from './components/ActivityLogger';
import ActivityList from './components/ActivityList';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activities, setActivities] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${apiUrl}/activities`, {
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
        <section className="logger-section">
          <ActivityLogger onActivityLogged={() => setRefreshTrigger(c => c + 1)} />
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
          <ActivityList activities={activities} />
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
