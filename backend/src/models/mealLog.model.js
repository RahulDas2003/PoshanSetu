import mongoose from 'mongoose';

const mealLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        index: true // Optional reference for school mid-day meals
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    foods: [{
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food'
        },
        name: {
            type: String,
            required: true
        },
        servings: {
            type: Number,
            required: true,
            default: 1,
            min: 0.1
        },
        servingSize: {
            type: Number,
            default: 100
        },
        servingUnit: {
            type: String,
            default: 'g'
        },
        nutrition: {
            calories: { type: Number, default: 0 },
            protein: { type: Number, default: 0 },
            carbs: { type: Number, default: 0 },
            fat: { type: Number, default: 0 },
            fiber: { type: Number, default: 0 },
            sugar: { type: Number, default: 0 }
        }
    }],
    notes: {
        type: String,
        maxLength: 500
    },
    imageUrl: {
        type: String
    },
    aiAnalyzed: {
        type: Boolean,
        default: false
    },
    mealQualityScore: {
        type: Number // 1-10 grading of meal based on child's need
    },
    mealSuggestions: [{
        type: String // Suggested improvements
    }],
    totalNutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 },
        sugar: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Compound index for efficient date-range queries
mealLogSchema.index({ user: 1, date: 1, mealType: 1 });

// Calculate total nutrition before saving
mealLogSchema.pre('save', function(next) {
    const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
    };

    this.foods.forEach(item => {
        const multiplier = item.servings || 1;
        totals.calories += (item.nutrition.calories || 0) * multiplier;
        totals.protein += (item.nutrition.protein || 0) * multiplier;
        totals.carbs += (item.nutrition.carbs || 0) * multiplier;
        totals.fat += (item.nutrition.fat || 0) * multiplier;
        totals.fiber += (item.nutrition.fiber || 0) * multiplier;
        totals.sugar += (item.nutrition.sugar || 0) * multiplier;
    });

    // Round to 1 decimal place
    Object.keys(totals).forEach(key => {
        totals[key] = Math.round(totals[key] * 10) / 10;
    });

    this.totalNutrition = totals;
    next();
});

// Static method to get daily summary
mealLogSchema.statics.getDailySummary = async function(userId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.find({
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ mealType: 1 });

    const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
    };

    meals.forEach(meal => {
        Object.keys(totals).forEach(key => {
            totals[key] += meal.totalNutrition[key] || 0;
        });
    });

    // Round totals
    Object.keys(totals).forEach(key => {
        totals[key] = Math.round(totals[key] * 10) / 10;
    });

    return {
        meals,
        totals,
        mealCount: meals.length
    };
};

const MealLog = mongoose.model('MealLog', mealLogSchema);

export default MealLog;
