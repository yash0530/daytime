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

export default templates;
