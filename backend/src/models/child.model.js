import mongoose from 'mongoose';

const childSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Please enter the child\'s name'],
        trim: true,
        maxLength: [100, 'Name cannot exceed 100 characters']
    },
    age: {
        type: Number,
        required: [true, 'Please enter the child\'s age']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Please select a gender']
    },
    schoolClass: {
        type: String,
        trim: true
    },
    measurements: [{
        date: {
            type: Date,
            default: Date.now
        },
        height: {
            type: Number, // in cm
            required: true
        },
        weight: {
            type: Number, // in kg
            required: true
        },
        bmi: {
            type: Number
        }
    }],
    riskLevel: {
        type: String,
        enum: ['Underweight', 'Healthy Weight', 'Overweight', 'Obesity'],
        default: 'Healthy Weight'
    }
}, {
    timestamps: true
});

// Calculate BMI and Risk before saving measurement
childSchema.pre('save', function(next) {
    if (this.measurements && this.measurements.length > 0) {
        // Sort measurements by date descending (latest first)
        this.measurements.sort((a, b) => b.date - a.date);
        
        // Latest measurement
        const latest = this.measurements[0];
        
        if (latest.height && latest.weight) {
            // BMI = weight(kg) / (height(m))^2
            const heightInMeters = latest.height / 100;
            const bmi = latest.weight / (heightInMeters * heightInMeters);
            latest.bmi = Math.round(bmi * 100) / 100;

            // Standard BMI Classification
            // Underweight (<18.5), Healthy Weight (18.5–24.9), Overweight (25.0–29.9), Obesity (≥30.0)
            if (latest.bmi < 18.5) {
                this.riskLevel = 'Underweight';
            } else if (latest.bmi >= 18.5 && latest.bmi <= 24.9) {
                this.riskLevel = 'Healthy Weight';
            } else if (latest.bmi >= 25.0 && latest.bmi <= 29.9) {
                this.riskLevel = 'Overweight';
            } else {
                this.riskLevel = 'Obesity';
            }
        }
    }
    next();
});

const Child = mongoose.model('Child', childSchema);

export default Child;
