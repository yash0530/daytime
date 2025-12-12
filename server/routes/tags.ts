import { Hono } from 'hono';
import { Tag } from '../models/Tag';
import { authMiddleware } from '../middleware/auth';

type Variables = {
    user: any;
};

const tags = new Hono<{ Variables: Variables }>();

tags.use('*', authMiddleware);

tags.get('/', async (c) => {
    const user = c.get('user');
    const userTags = await Tag.find({ user: user.id });
    return c.json(userTags);
});

export default tags;
