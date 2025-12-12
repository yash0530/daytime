import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

auth.post('/register', async (c) => {
    const { username, password } = await c.req.json();

    if (!username || !password) {
        return c.json({ error: 'Username and password required' }, 400);
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return c.json({ error: 'Username already exists' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    const token = await sign({ id: user._id, username: user.username }, JWT_SECRET);

    return c.json({ token, user: { id: user._id, username: user.username } }, 201);
});

auth.post('/login', async (c) => {
    const { username, password } = await c.req.json();

    const user = await User.findOne({ username });
    if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await sign({ id: user._id, username: user.username }, JWT_SECRET);

    return c.json({ token, user: { id: user._id, username: user.username } });
});

export default auth;
