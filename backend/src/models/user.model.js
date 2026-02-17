import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
        maxLength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    avatar: {
        type: String,
        default: ''
    },
    profile: {
        age: {
            type: Number,
            min: [13, 'Age must be at least 13'],
            max: [120, 'Age cannot exceed 120']
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        height: {
            type: Number, // in cm
            min: [50, 'Height must be at least 50 cm'],
            max: [300, 'Height cannot exceed 300 cm']
        },
        weight: {
            type: Number, // in kg
            min: [20, 'Weight must be at least 20 kg'],
            max: [500, 'Weight cannot exceed 500 kg']
        },
        activityLevel: {
            type: String,
            enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
            default: 'moderate'
        },
        goal: {
            type: String,
            enum: ['lose', 'maintain', 'gain'],
            default: 'maintain'
        }
    },
    dailyTargets: {
        calories: {
            type: Number,
            default: 2000
        },
        protein: {
            type: Number,
            default: 50 // grams
        },
        carbs: {
            type: Number,
            default: 250 // grams
        },
        fat: {
            type: Number,
            default: 65 // grams
        }
    },
    preferences: {
        dietType: {
            type: String,
            enum: ['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean'],
            default: 'none'
        },
        allergies: [{
            type: String
        }],
        dislikedFoods: [{
            type: String
        }]
    },
    streak: {
        current: {
            type: Number,
            default: 0
        },
        longest: {
            type: Number,
            default: 0
        },
        lastLogDate: {
            type: Date
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function() {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Calculate TDEE and set daily targets
userSchema.methods.calculateTargets = function() {
    const { age, gender, height, weight, activityLevel, goal } = this.profile;
    
    if (!age || !gender || !height || !weight) return;

    // Mifflin-St Jeor Equation for BMR
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };

    let tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    // Adjust for goal
    if (goal === 'lose') {
        tdee -= 500; // 500 calorie deficit
    } else if (goal === 'gain') {
        tdee += 300; // 300 calorie surplus
    }

    // Calculate macros (using balanced approach)
    const calories = Math.round(tdee);
    const protein = Math.round(weight * 1.6); // 1.6g per kg bodyweight
    const fat = Math.round((calories * 0.25) / 9); // 25% of calories from fat
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);

    this.dailyTargets = { calories, protein, carbs, fat };
};

const User = mongoose.model('User', userSchema);

export default User;
