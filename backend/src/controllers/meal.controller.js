import MealLog from '../models/mealLog.model.js';
import Food from '../models/food.model.js';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Create a meal log
// @route   POST /api/meals
// @access  Private
export const createMeal = asyncHandler(async (req, res) => {
    const { date, mealType, foods, notes, imageUrl } = req.body;

    if (!mealType || !foods || foods.length === 0) {
        throw new ApiError(400, 'Meal type and at least one food item are required');
    }

    const mealLog = await MealLog.create({
        user: req.user._id,
        date: date ? new Date(date) : new Date(),
        mealType,
        foods,
        notes,
        imageUrl
    });

    // Update user streak
    await updateStreak(req.user._id);

    res.status(201).json(new ApiResponse(201, { meal: mealLog }, 'Meal logged successfully! 🍽️'));
});

// @desc    Get meals for a specific date
// @route   GET /api/meals?date=2024-01-27
// @access  Private
export const getMealsByDate = asyncHandler(async (req, res) => {
    const { date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const meals = await MealLog.find({
        user: req.user._id,
        date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ mealType: 1 });

    // Calculate daily totals
    const totals = meals.reduce((acc, meal) => {
        acc.calories += meal.totalNutrition.calories || 0;
        acc.protein += meal.totalNutrition.protein || 0;
        acc.carbs += meal.totalNutrition.carbs || 0;
        acc.fat += meal.totalNutrition.fat || 0;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.status(200).json(new ApiResponse(200, { 
        meals, 
        totals,
        date: startOfDay.toISOString().split('T')[0]
    }, 'Meals fetched'));
});

// @desc    Get meals for date range
// @route   GET /api/meals/range?start=2024-01-20&end=2024-01-27
// @access  Private
export const getMealsByDateRange = asyncHandler(async (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        throw new ApiError(400, 'Start and end dates are required');
    }

    const meals = await MealLog.find({
        user: req.user._id,
        date: { 
            $gte: new Date(start), 
            $lte: new Date(new Date(end).setHours(23, 59, 59, 999))
        }
    }).sort({ date: -1, mealType: 1 });

    res.status(200).json(new ApiResponse(200, { meals }, 'Meals fetched'));
});

// @desc    Get single meal by ID
// @route   GET /api/meals/:id
// @access  Private
export const getMealById = asyncHandler(async (req, res) => {
    const meal = await MealLog.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!meal) {
        throw new ApiError(404, 'Meal not found');
    }

    res.status(200).json(new ApiResponse(200, { meal }, 'Meal fetched'));
});

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
export const updateMeal = asyncHandler(async (req, res) => {
    let meal = await MealLog.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!meal) {
        throw new ApiError(404, 'Meal not found');
    }

    const { foods, notes, mealType } = req.body;

    if (foods) meal.foods = foods;
    if (notes !== undefined) meal.notes = notes;
    if (mealType) meal.mealType = mealType;

    await meal.save(); // This triggers the pre-save hook to recalculate totals

    res.status(200).json(new ApiResponse(200, { meal }, 'Meal updated'));
});

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
export const deleteMeal = asyncHandler(async (req, res) => {
    const meal = await MealLog.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!meal) {
        throw new ApiError(404, 'Meal not found');
    }

    await meal.deleteOne();

    res.status(200).json(new ApiResponse(200, null, 'Meal deleted'));
});

// @desc    Add food to existing meal
// @route   POST /api/meals/:id/foods
// @access  Private
export const addFoodToMeal = asyncHandler(async (req, res) => {
    const meal = await MealLog.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!meal) {
        throw new ApiError(404, 'Meal not found');
    }

    const { food, servings } = req.body;

    if (!food || !food.name || !food.nutrition) {
        throw new ApiError(400, 'Food details are required');
    }

    meal.foods.push({
        name: food.name,
        servings: servings || 1,
        servingSize: food.servingSize || 100,
        servingUnit: food.servingUnit || 'g',
        nutrition: food.nutrition,
        food: food._id // Optional reference
    });

    await meal.save();

    res.status(200).json(new ApiResponse(200, { meal }, 'Food added to meal'));
});

// @desc    Remove food from meal
// @route   DELETE /api/meals/:id/foods/:foodIndex
// @access  Private
export const removeFoodFromMeal = asyncHandler(async (req, res) => {
    const meal = await MealLog.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!meal) {
        throw new ApiError(404, 'Meal not found');
    }

    const foodIndex = parseInt(req.params.foodIndex);
    
    if (isNaN(foodIndex) || foodIndex < 0 || foodIndex >= meal.foods.length) {
        throw new ApiError(400, 'Invalid food index');
    }

    meal.foods.splice(foodIndex, 1);
    await meal.save();

    res.status(200).json(new ApiResponse(200, { meal }, 'Food removed from meal'));
});

// Helper: Update user streak
const updateStreak = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastLog = user.streak.lastLogDate ? new Date(user.streak.lastLogDate) : null;
        
        if (lastLog) {
            lastLog.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today - lastLog) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
                // Consecutive day
                user.streak.current += 1;
                if (user.streak.current > user.streak.longest) {
                    user.streak.longest = user.streak.current;
                }
            } else if (daysDiff > 1) {
                // Streak broken
                user.streak.current = 1;
            }
            // Same day - no change
        } else {
            // First log ever
            user.streak.current = 1;
            user.streak.longest = 1;
        }

        user.streak.lastLogDate = new Date();
        await user.save();
    } catch (error) {
        console.error('Error updating streak:', error);
    }
};
