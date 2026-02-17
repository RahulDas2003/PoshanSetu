import mongoose from 'mongoose';

const weightLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required'],
        min: [20, 'Weight must be at least 20 kg'],
        max: [500, 'Weight cannot exceed 500 kg']
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    notes: {
        type: String,
        maxLength: 200
    }
}, {
    timestamps: true
});

// Compound index for user and date queries
weightLogSchema.index({ user: 1, date: -1 });

// Ensure one entry per day per user
weightLogSchema.index({ user: 1, date: 1 }, { unique: true });

const WeightLog = mongoose.model('WeightLog', weightLogSchema);

export default WeightLog;
