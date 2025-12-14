import { Hono } from 'hono';
import { Timer } from '../models/Timer';
import { Activity } from '../models/Activity';
import { Tag } from '../models/Tag';
import { authMiddleware } from '../middleware/auth';

type Variables = {
    user: any;
};

const timer = new Hono<{ Variables: Variables }>();

timer.use('*', authMiddleware);

// Get active timer state
timer.get('/', async (c) => {
    const user = c.get('user');
    const activeTimer = await Timer.findOne({ user: user.id });

    if (!activeTimer) {
        return c.json({ active: false });
    }

    // Calculate current elapsed time
    let elapsed = activeTimer.pausedDuration;
    if (!activeTimer.isPaused) {
        elapsed += Date.now() - activeTimer.startTime.getTime();
    } else if (activeTimer.pausedAt) {
        elapsed += activeTimer.pausedAt.getTime() - activeTimer.startTime.getTime();
    }

    return c.json({
        active: true,
        description: activeTimer.description,
        tagNames: activeTimer.tagNames,
        startTime: activeTimer.startTime,
        pausedDuration: activeTimer.pausedDuration,
        isPaused: activeTimer.isPaused,
        pausedAt: activeTimer.pausedAt,
        mode: activeTimer.mode,
        pomodoroState: activeTimer.pomodoroState,
        elapsedMs: elapsed
    });
});

// Start a new timer
timer.post('/start', async (c) => {
    const user = c.get('user');
    const { description, tagNames, mode, pomodoroSettings } = await c.req.json();

    // Check if timer already exists for this user
    const existing = await Timer.findOne({ user: user.id });
    if (existing) {
        return c.json({ error: 'Timer already running. Stop it before starting a new one.' }, 400);
    }

    const timerData: any = {
        user: user.id,
        description: description || '',
        tagNames: tagNames || [],
        startTime: new Date(),
        pausedDuration: 0,
        isPaused: false,
        mode: mode || 'timer'
    };

    if (mode === 'pomodoro' && pomodoroSettings) {
        timerData.pomodoroState = {
            workDuration: pomodoroSettings.workDuration || 25 * 60 * 1000,
            breakDuration: pomodoroSettings.breakDuration || 5 * 60 * 1000,
            isBreak: false,
            completedSessions: 0
        };
    }

    const newTimer = new Timer(timerData);
    await newTimer.save();

    return c.json({
        active: true,
        startTime: newTimer.startTime,
        mode: newTimer.mode,
        pomodoroState: newTimer.pomodoroState
    }, 201);
});

// Pause the timer
timer.post('/pause', async (c) => {
    const user = c.get('user');
    const activeTimer = await Timer.findOne({ user: user.id });

    if (!activeTimer) {
        return c.json({ error: 'No active timer to pause' }, 404);
    }

    if (activeTimer.isPaused) {
        return c.json({ error: 'Timer is already paused' }, 400);
    }

    activeTimer.isPaused = true;
    activeTimer.pausedAt = new Date();
    await activeTimer.save();

    return c.json({
        active: true,
        isPaused: true,
        pausedAt: activeTimer.pausedAt
    });
});

// Resume the timer
timer.post('/resume', async (c) => {
    const user = c.get('user');
    const activeTimer = await Timer.findOne({ user: user.id });

    if (!activeTimer) {
        return c.json({ error: 'No active timer to resume' }, 404);
    }

    if (!activeTimer.isPaused) {
        return c.json({ error: 'Timer is not paused' }, 400);
    }

    // Add the time spent paused to pausedDuration
    if (activeTimer.pausedAt) {
        const pausedTime = Date.now() - activeTimer.pausedAt.getTime();
        activeTimer.pausedDuration += pausedTime;
    }

    activeTimer.isPaused = false;
    activeTimer.pausedAt = undefined;
    await activeTimer.save();

    return c.json({
        active: true,
        isPaused: false,
        pausedDuration: activeTimer.pausedDuration
    });
});

// Stop the timer and create an activity
timer.post('/stop', async (c) => {
    const user = c.get('user');
    const { createActivity, date } = await c.req.json().catch(() => ({ createActivity: true, date: null }));

    const activeTimer = await Timer.findOne({ user: user.id });

    if (!activeTimer) {
        return c.json({ error: 'No active timer to stop' }, 404);
    }

    // Calculate total elapsed time
    let elapsed = activeTimer.pausedDuration;
    if (!activeTimer.isPaused) {
        elapsed += Date.now() - activeTimer.startTime.getTime();
    } else if (activeTimer.pausedAt) {
        elapsed += activeTimer.pausedAt.getTime() - activeTimer.startTime.getTime();
    }

    const durationMinutes = Math.max(1, Math.round(elapsed / 60000)); // At least 1 minute

    let activity = null;

    // Create activity if requested and there's a description
    if (createActivity && activeTimer.description) {
        // Handle tags similar to activities route
        const tagIds = [];
        if (activeTimer.tagNames && activeTimer.tagNames.length > 0) {
            for (const tagName of activeTimer.tagNames) {
                let tag = await Tag.findOne({ name: tagName, user: user.id });
                if (!tag) {
                    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                    tag = new Tag({ name: tagName, user: user.id, color: randomColor });
                    await tag.save();
                }
                tagIds.push(tag._id);
            }
        }

        // Use provided date or fall back to timer startTime
        const activityDate = date ? new Date(date) : activeTimer.startTime;

        const newActivity = new Activity({
            description: activeTimer.description,
            durationMinutes,
            date: activityDate,
            tags: tagIds,
            user: user.id
        });

        await newActivity.save();
        activity = await newActivity.populate('tags');
    }

    // Delete the timer
    await Timer.deleteOne({ user: user.id });

    return c.json({
        stopped: true,
        durationMinutes,
        activity
    });
});

// Update timer details (description, tags) while running
timer.patch('/', async (c) => {
    const user = c.get('user');
    const { description, tagNames } = await c.req.json();

    const activeTimer = await Timer.findOne({ user: user.id });

    if (!activeTimer) {
        return c.json({ error: 'No active timer to update' }, 404);
    }

    if (description !== undefined) {
        activeTimer.description = description;
    }
    if (tagNames !== undefined) {
        activeTimer.tagNames = tagNames;
    }

    await activeTimer.save();

    return c.json({
        active: true,
        description: activeTimer.description,
        tagNames: activeTimer.tagNames
    });
});

// Toggle Pomodoro break/work (for Pomodoro mode)
timer.post('/pomodoro/toggle', async (c) => {
    const user = c.get('user');
    const activeTimer = await Timer.findOne({ user: user.id });

    if (!activeTimer) {
        return c.json({ error: 'No active timer' }, 404);
    }

    if (activeTimer.mode !== 'pomodoro') {
        return c.json({ error: 'Timer is not in Pomodoro mode' }, 400);
    }

    if (!activeTimer.pomodoroState) {
        return c.json({ error: 'Pomodoro state not initialized' }, 400);
    }

    // Toggle between work and break
    if (!activeTimer.pomodoroState.isBreak) {
        // Finishing a work session
        activeTimer.pomodoroState.completedSessions += 1;
    }
    activeTimer.pomodoroState.isBreak = !activeTimer.pomodoroState.isBreak;

    // Reset the timer for the new interval
    activeTimer.startTime = new Date();
    activeTimer.pausedDuration = 0;
    activeTimer.isPaused = false;
    activeTimer.pausedAt = undefined;

    await activeTimer.save();

    return c.json({
        active: true,
        pomodoroState: activeTimer.pomodoroState,
        startTime: activeTimer.startTime
    });
});

export default timer;
