import geminiService from '../services/gemini.service.js';
import MealLog from '../models/mealLog.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Analyze a specific meal
// @route   POST /api/ai/analyze-meal/:mealId
// @access  Private
export const analyzeMeal = asyncHandler(async (req, res) => {
    const meal = await MealLog.findOne({
        _id: req.params.mealId,
        user: req.user._id
    });

    if (!meal) {
        throw new ApiError(404, 'Meal not found');
    }

    const analysis = await geminiService.analyzeMeal(meal);

    // Store analysis with meal
    meal.aiAnalyzed = true;
    await meal.save();

    res.status(200).json(new ApiResponse(200, { analysis }, 'Meal analyzed successfully'));
});

// @desc    Get meal recommendations
// @route   GET /api/ai/recommendations?mealType=lunch
// @access  Private
export const getRecommendations = asyncHandler(async (req, res) => {
    const { mealType = 'snack' } = req.query;

    // Get today's progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await MealLog.find({
        user: req.user._id,
        date: { $gte: today, $lte: endOfDay }
    });

    const consumed = meals.reduce((acc, meal) => {
        acc.calories += meal.totalNutrition?.calories || 0;
        acc.protein += meal.totalNutrition?.protein || 0;
        return acc;
    }, { calories: 0, protein: 0 });

    const recommendations = await geminiService.getMealRecommendations(
        req.user,
        { consumed },
        mealType
    );

    res.status(200).json(new ApiResponse(200, { recommendations, mealType }, 'Recommendations generated'));
});

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
export const chat = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
        throw new ApiError(400, 'Please provide a message');
    }

    const context = {
        dailyTargets: req.user.dailyTargets,
        goal: req.user.profile?.goal
    };

    const response = await geminiService.chat(message, context);

    res.status(200).json(new ApiResponse(200, { response }, 'AI response generated'));
});

// @desc    Get daily nutrition tip
// @route   GET /api/ai/daily-tip
// @access  Private
export const getDailyTip = asyncHandler(async (req, res) => {
    const tip = await geminiService.getDailyTip(req.user.profile?.goal);
    res.status(200).json(new ApiResponse(200, { tip }, 'Daily tip generated'));
});

// @desc    Analyze food from image
// @route   POST /api/ai/analyze-image
// @access  Private
export const analyzeImage = asyncHandler(async (req, res) => {
    const file = req.file;
    const { description } = req.body;

    if (!file) {
        throw new ApiError(400, 'Please upload an image');
    }

    // Convert buffer to base64
    const base64Image = file.buffer.toString('base64');
    const mimeType = file.mimetype;
    
    // Create data URI format for Zhipu AI
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    // Pass the image data and optional description to the service
    const analysis = await geminiService.analyzeImage(imageUrl, description);

    res.status(200).json(new ApiResponse(200, { analysis }, 'Food analyzed successfully'));
});

// @desc    Analyze food from text description
// @route   POST /api/ai/analyze-food
// @access  Private
export const analyzeFood = asyncHandler(async (req, res) => {
    const { description } = req.body;

    if (!description) {
        throw new ApiError(400, 'Please provide a food description');
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, 'AI service not configured');
    }

    // Use Groq to estimate nutrition from description
    const prompt = `Estimate the nutritional content for: "${description}"

Please respond in this exact JSON format only, no other text:
{
    "name": "food name",
    "servingSize": 100,
    "servingUnit": "g",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0
}

Provide reasonable estimates based on typical serving sizes.`;

    try {
        const axios = (await import('axios')).default;
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 200
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const text = response.data.choices?.[0]?.message?.content;
        
        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const nutritionData = JSON.parse(jsonMatch[0]);
            res.status(200).json(new ApiResponse(200, { food: nutritionData }, 'Food analyzed'));
        } else {
            throw new Error('Could not parse nutrition data');
        }
    } catch (error) {
        throw new ApiError(500, 'Failed to analyze food');
    }
});
