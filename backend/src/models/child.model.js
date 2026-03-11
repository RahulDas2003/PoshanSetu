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
        enum: ['Healthy', 'At Risk', 'Malnourished'],
        default: 'Healthy'
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

            // WHO Malnutrition simplified logic for School Kids
            // Generally under 14 is high risk, 14-16 is at risk (Highly simplified)
            if (latest.bmi < 14) {
                this.riskLevel = 'Malnourished';
            } else if (latest.bmi >= 14 && latest.bmi < 15.5) {
                this.riskLevel = 'At Risk';
            } else {
                this.riskLevel = 'Healthy';
            }
        }
    }
    next();
});

const Child = mongoose.model('Child', childSchema);

export default Child;
