import { Hono } from 'hono';
import { Template } from '../models/Template';
import { Activity } from '../models/Activity';
import { Tag } from '../models/Tag';
import { authMiddleware } from '../middleware/auth';

type Variables = {
    user: any;
};

const templates = new Hono<{ Variables: Variables }>();

templates.use('*', authMiddleware);

// List all templates for the user
templates.get('/', async (c) => {
    const user = c.get('user');
    const userTemplates = await Template.find({ user: user.id }).sort({ createdAt: -1 });
    return c.json(userTemplates);
});

// Create a new template
templates.post('/', async (c) => {
    const user = c.get('user');
    const { name, description, durationMinutes, tagNames } = await c.req.json();

    if (!name || !description || !durationMinutes) {
        return c.json({ error: 'Name, description and duration required' }, 400);
    }

    const template = new Template({
        name,
        description,
        durationMinutes,
        tagNames: tagNames || [],
        user: user.id,
    });

    await template.save();
    return c.json(template, 201);
});

// Delete a template
templates.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const template = await Template.findOneAndDelete({ _id: id, user: user.id });
    if (!template) {
        return c.json({ error: 'Template not found' }, 404);
    }
    return c.json({ message: 'Template deleted' });
});

// Use a template to create an activity
templates.post('/:id/use', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    const template = await Template.findOne({ _id: id, user: user.id });
    if (!template) {
        return c.json({ error: 'Template not found' }, 404);
    }

    // Find or create tags
    const tagIds = [];
    if (template.tagNames && template.tagNames.length > 0) {
        for (const tagName of template.tagNames) {
            let tag = await Tag.findOne({ name: tagName, user: user.id });
            if (!tag) {
                const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                tag = new Tag({ name: tagName, user: user.id, color: randomColor });
                await tag.save();
            }
            tagIds.push(tag._id);
        }
    }

    const activity = new Activity({
        description: template.description,
        durationMinutes: template.durationMinutes,
        date: new Date(),
        tags: tagIds,
        user: user.id,
    });

    await activity.save();
    const populatedActivity = await activity.populate('tags');

    return c.json(populatedActivity, 201);
});

// Repeat yesterday's activities
templates.post('/repeat-yesterday', async (c) => {
    const user = c.get('user');

    // Get yesterday's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayEnd = new Date(today);
    yesterdayEnd.setMilliseconds(-1);

    // Find yesterday's activities
    const yesterdayActivities = await Activity.find({
        user: user.id,
        date: { $gte: yesterday, $lt: today }
    }).populate('tags');

    if (yesterdayActivities.length === 0) {
        return c.json({ message: 'No activities found from yesterday', activities: [] });
    }

    // Clone each activity for today
    const createdActivities = [];
    for (const oldActivity of yesterdayActivities) {
        const newActivity = new Activity({
            description: oldActivity.description,
            durationMinutes: oldActivity.durationMinutes,
            date: new Date(),
            tags: oldActivity.tags.map((t: any) => t._id),
            user: user.id,
        });
        await newActivity.save();
        const populated = await newActivity.populate('tags');
        createdActivities.push(populated);
    }

    return c.json({
        message: `Repeated ${createdActivities.length} activities from yesterday`,
        activities: createdActivities
    }, 201);
});

export default templates;
