import { Hono } from 'hono';
import { Tag } from '../models/Tag';
import { authMiddleware } from '../middleware/auth';

type Variables = {
    user: any;
};

const tags = new Hono<{ Variables: Variables }>();

tags.use('*', authMiddleware);

// Get all tags for the user
tags.get('/', async (c) => {
    const user = c.get('user');
    const userTags = await Tag.find({ user: user.id }).sort({ name: 1 });
    return c.json(userTags);
});

tags.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const tag = await Tag.findOneAndDelete({ _id: id, user: user.id });
    if (!tag) {
        return c.json({ error: 'Tag not found' }, 404);
    }
    return c.json({ message: 'Tag deleted' });
});

export default tags;
