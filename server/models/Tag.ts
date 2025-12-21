import mongoose from 'mongoose';

// Generate a random hex color
const generateRandomColor = (): string => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

interface ITag {
    name: string;
    color: string;
    user: mongoose.Types.ObjectId;
}

const tagSchema = new mongoose.Schema<ITag>({
    name: { type: String, required: true },
    color: {
        type: String,
        required: true,
        default: generateRandomColor
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Pre-save hook to ensure name is lowercase and color exists
tagSchema.pre('save', function (next) {
    // Always store name as lowercase
    this.name = this.name.toLowerCase().trim();

    // Ensure color exists
    if (!this.color) {
        this.color = generateRandomColor();
    }

    next();
});

// Compound index to ensure unique tag names per user
tagSchema.index({ name: 1, user: 1 }, { unique: true });

export const Tag = mongoose.model<ITag>('Tag', tagSchema);
