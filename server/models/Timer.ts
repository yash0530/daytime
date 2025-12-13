import mongoose from 'mongoose';

const pomodoroStateSchema = new mongoose.Schema({
    workDuration: { type: Number, default: 25 * 60 * 1000 }, // 25 minutes in ms
    breakDuration: { type: Number, default: 5 * 60 * 1000 }, // 5 minutes in ms
    isBreak: { type: Boolean, default: false },
    completedSessions: { type: Number, default: 0 }
}, { _id: false });

const timerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    description: { type: String, default: '' },
    tagNames: [{ type: String }],
    startTime: { type: Date, required: true },
    pausedDuration: { type: Number, default: 0 }, // Total paused time in ms
    isPaused: { type: Boolean, default: false },
    pausedAt: { type: Date },
    mode: { type: String, enum: ['timer', 'pomodoro'], default: 'timer' },
    pomodoroState: { type: pomodoroStateSchema, default: () => ({}) }
}, { timestamps: true });

// Only one active timer per user (enforced by unique: true on user)
export const Timer = mongoose.model('Timer', timerSchema);
