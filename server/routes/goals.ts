import { Hono } from 'hono';
import mongoose from 'mongoose';
import { Goal } from '../models/Goal';
import { Activity } from '../models/Activity';
import { Tag } from '../models/Tag';
import { authMiddleware } from '../middleware/auth';

type Variables = {
    user: any;
};

const goals = new Hono<{ Variables: Variables }>();

goals.use('*', authMiddleware);

// Helper: Get start of current period (in UTC)
function getPeriodStart(period: 'daily' | 'weekly'): Date {
    const now = new Date();
    if (period === 'daily') {
        // Use UTC to match how activities are stored
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    } else {
        // Weekly: Start from Monday (UTC)
        const day = now.getUTCDay();
        const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
    }
}

// Helper: Get start of a specific period based on a date (in UTC)
function getPeriodStartForDate(period: 'daily' | 'weekly', date: Date): Date {
    if (period === 'daily') {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    } else {
        const day = date.getUTCDay();
        const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff));
    }
}

// Helper: Get previous period start
function getPreviousPeriodStart(period: 'daily' | 'weekly', currentStart: Date): Date {
    const previous = new Date(currentStart);
    if (period === 'daily') {
        previous.setUTCDate(previous.getUTCDate() - 1);
    } else {
        previous.setUTCDate(previous.getUTCDate() - 7);
    }
    return previous;
}

// Helper: Calculate progress for a goal
async function calculateProgress(goal: any, userId: string): Promise<number> {
    const periodStart = getPeriodStart(goal.period);
    const periodEnd = new Date();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find ALL tags matching the category name (case-insensitive)
    const tags = await Tag.find({
        user: userId,
        name: { $regex: new RegExp(`^${goal.categoryName}$`, 'i') }
    });
    if (tags.length === 0) return 0;

    const tagIds = tags.map(t => t._id);

    // Sum activities with ANY of these tags in the current period
    const result = await Activity.aggregate([
        {
            $match: {
                user: userObjectId,
                tags: { $in: tagIds },
                date: { $gte: periodStart, $lte: periodEnd }
            }
        },
        {
            $group: {
                _id: null,
                totalMinutes: { $sum: '$durationMinutes' }
            }
        }
    ]);

    return result.length > 0 ? result[0].totalMinutes : 0;
}

// Helper: Calculate streak for a goal
async function calculateStreak(goal: any, userId: string): Promise<number> {
    const tags = await Tag.find({
        user: userId,
        name: { $regex: new RegExp(`^${goal.categoryName}$`, 'i') }
    });
    if (tags.length === 0) return 0;

    const tagIds = tags.map(t => t._id);

    let streak = 0;
    let currentPeriodStart = getPeriodStart(goal.period);

    // Check current period first
    const currentProgress = await getProgressForPeriod(tagIds, userId, currentPeriodStart, goal.period);
    const currentMet = currentProgress >= goal.targetMinutes;

    // Go back in time checking each period
    let checkDate = getPreviousPeriodStart(goal.period, currentPeriodStart);

    // Check up to 365 periods (max reasonable streak)
    for (let i = 0; i < 365; i++) {
        const periodProgress = await getProgressForPeriod(tagIds, userId, checkDate, goal.period);

        if (periodProgress >= goal.targetMinutes) {
            streak++;
            checkDate = getPreviousPeriodStart(goal.period, checkDate);
        } else {
            break;
        }
    }

    // If current period is also met, include it
    if (currentMet) {
        streak++;
    }

    return streak;
}

// Helper: Get progress for a specific period
async function getProgressForPeriod(tagIds: any[], userId: string, periodStart: Date, period: 'daily' | 'weekly'): Promise<number> {
    const periodEnd = new Date(periodStart);
    if (period === 'daily') {
        periodEnd.setDate(periodEnd.getDate() + 1);
    } else {
        periodEnd.setDate(periodEnd.getDate() + 7);
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await Activity.aggregate([
        {
            $match: {
                user: userObjectId,
                tags: { $in: tagIds },
                date: { $gte: periodStart, $lt: periodEnd }
            }
        },
        {
            $group: {
                _id: null,
                totalMinutes: { $sum: '$durationMinutes' }
            }
        }
    ]);

    return result.length > 0 ? result[0].totalMinutes : 0;
}

// List all goals with progress
goals.get('/', async (c) => {
    const user = c.get('user');
    const userGoals = await Goal.find({ user: user.id }).sort({ createdAt: -1 });

    const goalsWithProgress = await Promise.all(
        userGoals.map(async (goal) => {
            const currentMinutes = await calculateProgress(goal, user.id);
            const streak = await calculateStreak(goal, user.id);
            return {
                ...goal.toObject(),
                currentMinutes,
                streak,
                percentComplete: Math.min(100, Math.round((currentMinutes / goal.targetMinutes) * 100))
            };
        })
    );

    return c.json(goalsWithProgress);
});

// Create a new goal
goals.post('/', async (c) => {
    const user = c.get('user');
    const { categoryName, targetMinutes, period } = await c.req.json();

    if (!categoryName || !targetMinutes || !period) {
        return c.json({ error: 'Category name, target minutes, and period are required' }, 400);
    }

    if (!['daily', 'weekly'].includes(period)) {
        return c.json({ error: 'Period must be "daily" or "weekly"' }, 400);
    }

    // Check for existing goal with same category and period
    const existing = await Goal.findOne({
        user: user.id,
        categoryName,
        period
    });

    if (existing) {
        return c.json({ error: `A ${period} goal for "${categoryName}" already exists` }, 400);
    }

    const goal = new Goal({
        user: user.id,
        categoryName,
        targetMinutes,
        period,
        isActive: true
    });

    await goal.save();

    const currentMinutes = await calculateProgress(goal, user.id);
    const streak = await calculateStreak(goal, user.id);

    return c.json({
        ...goal.toObject(),
        currentMinutes,
        streak,
        percentComplete: Math.min(100, Math.round((currentMinutes / goal.targetMinutes) * 100))
    }, 201);
});

// Update a goal
goals.patch('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const updates = await c.req.json();

    // Only allow updating specific fields
    const allowedUpdates = ['targetMinutes', 'isActive'];
    const filteredUpdates: any = {};

    for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
            filteredUpdates[key] = updates[key];
        }
    }

    const goal = await Goal.findOneAndUpdate(
        { _id: id, user: user.id },
        filteredUpdates,
        { new: true }
    );

    if (!goal) {
        return c.json({ error: 'Goal not found' }, 404);
    }

    const currentMinutes = await calculateProgress(goal, user.id);
    const streak = await calculateStreak(goal, user.id);

    return c.json({
        ...goal.toObject(),
        currentMinutes,
        streak,
        percentComplete: Math.min(100, Math.round((currentMinutes / goal.targetMinutes) * 100))
    });
});

// Delete a goal
goals.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    const goal = await Goal.findOneAndDelete({ _id: id, user: user.id });

    if (!goal) {
        return c.json({ error: 'Goal not found' }, 404);
    }

    return c.json({ message: 'Goal deleted' });
});

// Get streaks for all active goals
goals.get('/streaks', async (c) => {
    const user = c.get('user');
    const activeGoals = await Goal.find({ user: user.id, isActive: true });

    const streaks = await Promise.all(
        activeGoals.map(async (goal) => ({
            goalId: goal._id,
            categoryName: goal.categoryName,
            period: goal.period,
            streak: await calculateStreak(goal, user.id)
        }))
    );

    return c.json(streaks);
});

export default goals;
