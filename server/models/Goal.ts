import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categoryName: { type: String, required: true },
    targetMinutes: { type: Number, required: true },
    period: { type: String, enum: ['daily', 'weekly'], required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index to prevent duplicate goals for same category + period
goalSchema.index({ user: 1, categoryName: 1, period: 1 }, { unique: true });

export const Goal = mongoose.model('Goal', goalSchema);
