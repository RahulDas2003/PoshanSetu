import Food from '../models/food.model.js';
import openFoodFactsService from '../services/openFoodFacts.service.js';
import calorieNinjasService from '../services/calorieNinjas.service.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Search foods from external APIs and local database
// @route   GET /api/foods/search?q=query
// @access  Public
export const searchFoods = asyncHandler(async (req, res) => {
    const { q: query, source = 'all', page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
        throw new ApiError(400, 'Please provide a search query (min 2 characters)');
    }

    let results = [];

    // Search local database first
    const localFoods = await Food.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { brand: { $regex: query, $options: 'i' } }
        ]
    }).limit(10);

    if (localFoods.length > 0) {
        results.push(...localFoods.map(f => ({ ...f.toObject(), source: 'local' })));
    }

    // Search external APIs based on source preference
    if (source === 'all' || source === 'openfoodfacts') {
        const offResults = await openFoodFactsService.searchFoods(query, page, limit);
        results.push(...offResults);
    }

    if (source === 'all' || source === 'calorieninjas') {
        const cnResults = await calorieNinjasService.searchFoods(query);
        results.push(...cnResults);
    }

    // Remove duplicates by name (case-insensitive)
    const seen = new Set();
    results = results.filter(item => {
        const key = item.name?.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    res.status(200).json(new ApiResponse(200, {
        foods: results.slice(0, limit),
        total: results.length,
        query
    }, `Found ${results.length} foods`));
});

// @desc    Get food by barcode
// @route   GET /api/foods/barcode/:code
// @access  Public
export const getFoodByBarcode = asyncHandler(async (req, res) => {
    const { code } = req.params;

    if (!code) {
        throw new ApiError(400, 'Barcode is required');
    }

    // Check local database first
    let food = await Food.findOne({ barcode: code });

    if (!food) {
        // Search OpenFoodFacts
        const externalFood = await openFoodFactsService.getFoodByBarcode(code);
        
        if (externalFood) {
            // Save to local database for caching
            food = await Food.create({
                ...externalFood,
                isCustom: false
            });
        }
    }

    if (!food) {
        throw new ApiError(404, 'Food not found for this barcode');
    }

    res.status(200).json(new ApiResponse(200, { food }, 'Food found'));
});

// @desc    Get food by ID
// @route   GET /api/foods/:id
// @access  Public
export const getFoodById = asyncHandler(async (req, res) => {
    const food = await Food.findById(req.params.id);

    if (!food) {
        throw new ApiError(404, 'Food not found');
    }

    res.status(200).json(new ApiResponse(200, { food }, 'Food fetched successfully'));
});

// @desc    Create custom food
// @route   POST /api/foods
// @access  Private
export const createCustomFood = asyncHandler(async (req, res) => {
    const { name, brand, servingSize, servingUnit, nutrition, category } = req.body;

    if (!name || !nutrition?.calories) {
        throw new ApiError(400, 'Food name and calories are required');
    }

    const food = await Food.create({
        name,
        brand: brand || '',
        servingSize: servingSize || 100,
        servingUnit: servingUnit || 'g',
        nutrition,
        category: category || 'other',
        isCustom: true,
        createdBy: req.user._id,
        source: 'user'
    });

    res.status(201).json(new ApiResponse(201, { food }, 'Custom food created successfully'));
});

// @desc    Update custom food
// @route   PUT /api/foods/:id
// @access  Private
export const updateCustomFood = asyncHandler(async (req, res) => {
    let food = await Food.findById(req.params.id);

    if (!food) {
        throw new ApiError(404, 'Food not found');
    }

    // Only allow updating own custom foods
    if (!food.isCustom || food.createdBy?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You can only update your own custom foods');
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json(new ApiResponse(200, { food }, 'Food updated successfully'));
});

// @desc    Delete custom food
// @route   DELETE /api/foods/:id
// @access  Private
export const deleteCustomFood = asyncHandler(async (req, res) => {
    const food = await Food.findById(req.params.id);

    if (!food) {
        throw new ApiError(404, 'Food not found');
    }

    if (!food.isCustom || food.createdBy?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You can only delete your own custom foods');
    }

    await food.deleteOne();

    res.status(200).json(new ApiResponse(200, null, 'Food deleted successfully'));
});

// @desc    Get user's custom foods
// @route   GET /api/foods/my-foods
// @access  Private
export const getMyCustomFoods = asyncHandler(async (req, res) => {
    const foods = await Food.find({ 
        createdBy: req.user._id, 
        isCustom: true 
    }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, { foods }, 'Custom foods fetched'));
});

// @desc    Get recent/popular foods
// @route   GET /api/foods/popular
// @access  Public
export const getPopularFoods = asyncHandler(async (req, res) => {
    const foods = await Food.find({ isCustom: false })
        .sort({ popularity: -1 })
        .limit(20);

    res.status(200).json(new ApiResponse(200, { foods }, 'Popular foods fetched'));
});
