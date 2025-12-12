import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    description: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Activity = mongoose.model('Activity', activitySchema);
