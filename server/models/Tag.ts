import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Compound index to ensure unique tag names per user
tagSchema.index({ name: 1, user: 1 }, { unique: true });

export const Tag = mongoose.model('Tag', tagSchema);
