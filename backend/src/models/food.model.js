import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Food name is required'],
        trim: true,
        index: true
    },
    brand: {
        type: String,
        trim: true,
        default: ''
    },
    servingSize: {
        type: Number,
        required: true,
        default: 100
    },
    servingUnit: {
        type: String,
        required: true,
        default: 'g'
    },
    nutrition: {
        calories: {
            type: Number,
            required: true,
            min: 0
        },
        protein: {
            type: Number,
            default: 0,
            min: 0
        },
        carbs: {
            type: Number,
            default: 0,
            min: 0
        },
        fat: {
            type: Number,
            default: 0,
            min: 0
        },
        fiber: {
            type: Number,
            default: 0,
            min: 0
        },
        sugar: {
            type: Number,
            default: 0,
            min: 0
        },
        sodium: {
            type: Number,
            default: 0,
            min: 0
        },
        saturatedFat: {
            type: Number,
            default: 0,
            min: 0
        },
        cholesterol: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    category: {
        type: String,
        enum: ['fruits', 'vegetables', 'grains', 'protein', 'dairy', 'fats', 'beverages', 'snacks', 'meals', 'other'],
        default: 'other'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    barcode: {
        type: String,
        index: true
    },
    isCustom: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    source: {
        type: String,
        enum: ['user', 'openfoodfacts', 'calorieninjas', 'usda'],
        default: 'user'
    },
    popularity: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Text index for searching
foodSchema.index({ name: 'text', brand: 'text' });

// Compound index for efficient queries
foodSchema.index({ isCustom: 1, createdBy: 1 });

const Food = mongoose.model('Food', foodSchema);

export default Food;
