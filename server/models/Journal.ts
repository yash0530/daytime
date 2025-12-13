import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
    content: { type: String, required: true },
    category: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Journal', journalSchema);
