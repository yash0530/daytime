import { Hono } from 'hono';
import Journal from '../models/Journal';
import { authMiddleware } from '../middleware/auth';

type Variables = {
    user: any;
};

const journals = new Hono<{ Variables: Variables }>();

// Apply auth middleware to all routes
journals.use('*', authMiddleware);

// GET all journals for user (sorted by createdAt desc)
journals.get('/', async (c) => {
    try {
        const user = c.get('user');
        const journalList = await Journal.find({ user: user.id })
            .sort({ createdAt: -1 });
        return c.json(journalList);
    } catch (error) {
        console.error('Error fetching journals:', error);
        return c.json({ error: 'Failed to fetch journals' }, 500);
    }
});

// POST create new journal entry
journals.post('/', async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        const { content, category, createdAt } = body;

        if (!content) {
            return c.json({ error: 'Content is required' }, 400);
        }

        const journalData: any = {
            content,
            category: category || '',
            user: user.id
        };

        // If custom date is provided, set it
        if (createdAt) {
            journalData.createdAt = new Date(createdAt);
        }

        const journal = new Journal(journalData);

        await journal.save();
        return c.json(journal, 201);
    } catch (error) {
        console.error('Error creating journal:', error);
        return c.json({ error: 'Failed to create journal' }, 500);
    }
});

// DELETE journal entry
journals.delete('/:id', async (c) => {
    try {
        const user = c.get('user');
        const journalId = c.req.param('id');

        const journal = await Journal.findOneAndDelete({
            _id: journalId,
            user: user.id
        });

        if (!journal) {
            return c.json({ error: 'Journal not found' }, 404);
        }

        return c.json({ message: 'Journal deleted' });
    } catch (error) {
        console.error('Error deleting journal:', error);
        return c.json({ error: 'Failed to delete journal' }, 500);
    }
});

export default journals;

