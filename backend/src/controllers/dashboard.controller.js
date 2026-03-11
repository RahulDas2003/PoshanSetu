import MealLog from '../models/mealLog.model.js';
import WeightLog from '../models/weightLog.model.js';
import User from '../models/user.model.js';
import Child from '../models/child.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get daily dashboard summary
// @route   GET /api/dashboard/daily?date=2024-01-27
// @access  Private
export const getDailySummary = asyncHandler(async (req, res) => {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get meals for the day
    const meals = await MealLog.find({
        user: req.user._id,
        child: { $exists: false },
        date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: 1 });

    // Calculate totals
    const consumed = meals.reduce((acc, meal) => {
        acc.calories += meal.totalNutrition.calories || 0;
        acc.protein += meal.totalNutrition.protein || 0;
        acc.carbs += meal.totalNutrition.carbs || 0;
        acc.fat += meal.totalNutrition.fat || 0;
        acc.fiber += meal.totalNutrition.fiber || 0;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    // Get user targets
    const targets = req.user.dailyTargets;

    // Calculate remaining
    const remaining = {
        calories: Math.max(0, targets.calories - consumed.calories),
        protein: Math.max(0, targets.protein - consumed.protein),
        carbs: Math.max(0, targets.carbs - consumed.carbs),
        fat: Math.max(0, targets.fat - consumed.fat)
    };

    // Calculate percentages
    const progress = {
        calories: Math.min(100, Math.round((consumed.calories / targets.calories) * 100)),
        protein: Math.min(100, Math.round((consumed.protein / targets.protein) * 100)),
        carbs: Math.min(100, Math.round((consumed.carbs / targets.carbs) * 100)),
        fat: Math.min(100, Math.round((consumed.fat / targets.fat) * 100))
    };

    res.status(200).json(new ApiResponse(200, {
        date: startOfDay.toISOString().split('T')[0],
        meals,
        consumed,
        targets,
        remaining,
        progress,
        mealCount: meals.length,
        streak: req.user.streak
    }, 'Daily summary fetched'));
});

// @desc    Get weekly analytics
// @route   GET /api/dashboard/weekly
// @access  Private
export const getWeeklySummary = asyncHandler(async (req, res) => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    // Aggregate daily totals for the week
    const dailyData = await MealLog.aggregate([
        {
            $match: {
                user: req.user._id,
                child: { $exists: false },
                date: { $gte: weekAgo, $lte: today }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                calories: { $sum: '$totalNutrition.calories' },
                protein: { $sum: '$totalNutrition.protein' },
                carbs: { $sum: '$totalNutrition.carbs' },
                fat: { $sum: '$totalNutrition.fat' },
                mealCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Calculate averages
    const totalDays = dailyData.length || 1;
    const averages = {
        calories: Math.round(dailyData.reduce((a, d) => a + d.calories, 0) / totalDays),
        protein: Math.round(dailyData.reduce((a, d) => a + d.protein, 0) / totalDays),
        carbs: Math.round(dailyData.reduce((a, d) => a + d.carbs, 0) / totalDays),
        fat: Math.round(dailyData.reduce((a, d) => a + d.fat, 0) / totalDays)
    };

    // Calculate goal adherence (days where calories were within 10% of target)
    const target = req.user.dailyTargets.calories;
    const adherentDays = dailyData.filter(d => {
        const diff = Math.abs(d.calories - target) / target;
        return diff <= 0.1;
    }).length;

    res.status(200).json(new ApiResponse(200, {
        dailyData,
        averages,
        goalAdherence: Math.round((adherentDays / 7) * 100),
        totalMeals: dailyData.reduce((a, d) => a + d.mealCount, 0),
        daysLogged: totalDays
    }, 'Weekly summary fetched'));
});

// @desc    Get monthly analytics
// @route   GET /api/dashboard/monthly
// @access  Private
export const getMonthlySummary = asyncHandler(async (req, res) => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    monthAgo.setHours(0, 0, 0, 0);

    // Get weight logs
    const weightLogs = await WeightLog.find({
        user: req.user._id,
        date: { $gte: monthAgo }
    }).sort({ date: 1 });

    // Get weekly aggregated data
    const weeklyData = await MealLog.aggregate([
        {
            $match: {
                user: req.user._id,
                child: { $exists: false },
                date: { $gte: monthAgo, $lte: today }
            }
        },
        {
            $group: {
                _id: { $week: '$date' },
                avgCalories: { $avg: '$totalNutrition.calories' },
                totalMeals: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Calculate weight change
    let weightChange = null;
    if (weightLogs.length >= 2) {
        weightChange = weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight;
    }

    res.status(200).json(new ApiResponse(200, {
        weightLogs,
        weightChange,
        weeklyData,
        currentWeight: weightLogs[weightLogs.length - 1]?.weight || req.user.profile.weight
    }, 'Monthly summary fetched'));
});

// @desc    Log weight
// @route   POST /api/dashboard/weight
// @access  Private
export const logWeight = asyncHandler(async (req, res) => {
    const { weight, date, notes } = req.body;

    if (!weight) {
        throw new ApiError(400, 'Weight is required');
    }

    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    // Upsert - update if exists for the day, create if not
    const weightLog = await WeightLog.findOneAndUpdate(
        { user: req.user._id, date: logDate },
        { weight, notes },
        { new: true, upsert: true, runValidators: true }
    );

    // Update user's current weight
    await User.findByIdAndUpdate(req.user._id, { 'profile.weight': weight });

    res.status(200).json(new ApiResponse(200, { weightLog }, 'Weight logged successfully'));
});

// @desc    Get insights and tips
// @route   GET /api/dashboard/insights
// @access  Private
export const getInsights = asyncHandler(async (req, res) => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get weekly data
    const meals = await MealLog.find({
        user: req.user._id,
        child: { $exists: false },
        date: { $gte: weekAgo }
    });

    const insights = [];
    const targets = req.user.dailyTargets;

    // Calculate averages
    const totalDays = 7;
    const avgCalories = meals.reduce((a, m) => a + (m.totalNutrition.calories || 0), 0) / totalDays;
    const avgProtein = meals.reduce((a, m) => a + (m.totalNutrition.protein || 0), 0) / totalDays;

    // Generate insights
    if (avgCalories < targets.calories * 0.8) {
        insights.push({
            type: 'warning',
            title: 'Low Calorie Intake',
            message: `You're averaging ${Math.round(avgCalories)} calories, which is below your ${targets.calories} target. Consider adding more nutrient-dense foods.`
        });
    } else if (avgCalories > targets.calories * 1.1) {
        insights.push({
            type: 'info',
            title: 'Calorie Surplus',
            message: `You're averaging ${Math.round(avgCalories)} calories, above your ${targets.calories} target.`
        });
    } else {
        insights.push({
            type: 'success',
            title: 'Great Progress! 🎉',
            message: `You're staying close to your calorie target. Keep it up!`
        });
    }

    if (avgProtein < targets.protein * 0.8) {
        insights.push({
            type: 'tip',
            title: 'Protein Tip',
            message: 'Try adding more protein-rich foods like eggs, chicken, fish, or legumes.'
        });
    }

    if (req.user.streak.current >= 7) {
        insights.push({
            type: 'achievement',
            title: `${req.user.streak.current} Day Streak! 🔥`,
            message: 'Amazing consistency! You\'re building great habits.'
        });
    }

    res.status(200).json(new ApiResponse(200, { insights }, 'Insights generated'));
});

// @desc    Get school analytics summary
// @route   GET /api/dashboard/school-stats
// @access  Private
export const getSchoolStats = asyncHandler(async (req, res) => {
    // 1. Get all children assigned to this user (teacher/admin)
    const children = await Child.find({ user: req.user._id });
    
    const riskStats = {
        Healthy: 0,
        AtRisk: 0,
        Malnourished: 0
    };

    children.forEach(c => {
        if (c.riskLevel === 'Healthy') riskStats.Healthy++;
        if (c.riskLevel === 'At Risk') riskStats.AtRisk++;
        if (c.riskLevel === 'Malnourished') riskStats.Malnourished++;
    });

    // 2. Fetch recent meals assigned to these children (past 7 days)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const childMeals = await MealLog.find({
        user: req.user._id,
        child: { $exists: true },
        date: { $gte: weekAgo }
    }).populate('child', 'name');

    // 3. Calculate school-wide averages and deficiency alerts
    let totalCals = 0;
    let totalProtein = 0;
    
    // Track repeated low intakes
    const lowProteinCount = {};
    const lowCarbsCount = {};

    childMeals.forEach(meal => {
        totalCals += meal.totalNutrition.calories || 0;
        totalProtein += meal.totalNutrition.protein || 0;

        const childId = meal.child?._id?.toString() || 'unknown';
        // Sub-par protein
        if ((meal.totalNutrition.protein || 0) < 10) {
            lowProteinCount[childId] = (lowProteinCount[childId] || 0) + 1;
        }
        // Sub-par carbs/energy
        if ((meal.totalNutrition.carbs || 0) < 40) {
            lowCarbsCount[childId] = (lowCarbsCount[childId] || 0) + 1;
        }
    });

    const mealCount = childMeals.length || 1;
    const averages = {
        calories: Math.round(totalCals / mealCount),
        protein: Math.round(totalProtein / mealCount)
    };

    // Generate alerts for consistently deficient children
    const alerts = [];
    Object.keys(lowProteinCount).forEach(childId => {
        if (lowProteinCount[childId] >= 3) {
            const childName = childMeals.find(m => m.child?._id?.toString() === childId)?.child?.name || 'A student';
            alerts.push({
                type: 'warning',
                title: 'Possible Protein Deficiency',
                message: `${childName} has had low protein intake multiple times this week.`
            });
        }
    });
    
    Object.keys(lowCarbsCount).forEach(childId => {
        if (lowCarbsCount[childId] >= 3) {
            const childName = childMeals.find(m => m.child?._id?.toString() === childId)?.child?.name || 'A student';
            alerts.push({
                type: 'warning',
                title: 'Low Energy Setup',
                message: `${childName} is consistently receiving meals low in complex carbs.`
            });
        }
    });
    
    // Add a generic alert if none exists to demonstrate UI
    if (alerts.length === 0 && children.length > 0) {
        alerts.push({
            type: 'info',
            title: 'School Nutrition is Stable',
            message: 'No repeated severe deficiencies detected this week.'
        });
    }

    res.status(200).json(new ApiResponse(200, {
        totalStudents: children.length,
        riskStats,
        averages,
        alerts
    }, 'School Stats generated'));
});

