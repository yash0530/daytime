import { Hono } from 'hono';
import { Activity } from '../models/Activity';
import { Tag } from '../models/Tag';
import { authMiddleware } from '../middleware/auth';

type Variables = {
    user: any;
};

const activities = new Hono<{ Variables: Variables }>();

activities.use('*', authMiddleware);

activities.get('/', async (c) => {
    const user = c.get('user');
    const userActivities = await Activity.find({ user: user.id })
        .populate('tags')
        .sort({ date: -1 });
    return c.json(userActivities);
});

activities.post('/', async (c) => {
    const user = c.get('user');
    const { description, durationMinutes, date, tagNames } = await c.req.json();

    if (!description || !durationMinutes) {
        return c.json({ error: 'Description and duration required' }, 400);
    }

    const tagIds = [];
    if (tagNames && Array.isArray(tagNames)) {
        for (const tagName of tagNames) {
            let tag = await Tag.findOne({ name: tagName, user: user.id });
            if (!tag) {
                // Auto-create tag with a random color or default
                const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
                tag = new Tag({ name: tagName, user: user.id, color: randomColor });
                await tag.save();
            }
            tagIds.push(tag._id);
        }
    }

    const activity = new Activity({
        description,
        durationMinutes,
        date: date || new Date(),
        tags: tagIds,
        user: user.id,
    });

    await activity.save();
    const populatedActivity = await activity.populate('tags');

    return c.json(populatedActivity, 201);
});

export default activities;
