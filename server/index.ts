import { Hono } from 'hono';
import { cors } from 'hono/cors';
import mongoose from 'mongoose';

const app = new Hono();

// Middleware
app.use('/*', cors());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/daytime';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

import authRoutes from './routes/auth';
import activityRoutes from './routes/activities';
import tagRoutes from './routes/tags';
import timerRoutes from './routes/timer';
import templateRoutes from './routes/templates';
import journalRoutes from './routes/journals';

// Routes
app.get('/', (c) => {
    return c.json({ message: 'Daytime API is running' });
});

app.route('/api/auth', authRoutes);
app.route('/api/activities', activityRoutes);
app.route('/api/tags', tagRoutes);
app.route('/api/timer', timerRoutes);
app.route('/api/templates', templateRoutes);
app.route('/api/journals', journalRoutes);

const PORT = process.env.PORT || 3000;

console.log(`Server running on port ${PORT}`);

export default {
    port: PORT,
    fetch: app.fetch,
};