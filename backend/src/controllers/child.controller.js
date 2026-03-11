import Child from '../models/child.model.js';
import MealLog from '../models/mealLog.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all children for the logged-in user
// @route   GET /api/children
// @access  Private
export const getChildren = asyncHandler(async (req, res) => {
    const children = await Child.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, { children }, 'Children retrieved successfully'));
});

// @desc    Get single child profile
// @route   GET /api/children/:id
// @access  Private
export const getChildById = asyncHandler(async (req, res) => {
    const child = await Child.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!child) {
        throw new ApiError(404, 'Child not found');
    }
    
    // Fetch recent meals logged for this child
    const recentMeals = await MealLog.find({
        user: req.user._id,
        child: req.params.id
    })
    .sort({ date: -1 })
    .limit(10);
    
    const childData = child.toObject();
    childData.recentMeals = recentMeals;

    res.status(200).json(new ApiResponse(200, { child: childData }, 'Child retrieved successfully'));
});

// @desc    Add a new child
// @route   POST /api/children
// @access  Private
export const createChild = asyncHandler(async (req, res) => {
    const { name, age, gender, schoolClass, height, weight } = req.body;

    if (!name || (!height && height !== 0) || (!weight && weight !== 0)) {
        throw new ApiError(400, 'Please provide name, height, and weight');
    }

    const newChild = await Child.create({
        user: req.user._id,
        name,
        age,
        gender,
        schoolClass,
        measurements: [{ height, weight }]
    });

    res.status(201).json(new ApiResponse(201, { child: newChild }, 'Child added successfully'));
});

// @desc    Add a measurement to an existing child
// @route   POST /api/children/:id/measurements
// @access  Private
export const addMeasurement = asyncHandler(async (req, res) => {
    const { height, weight } = req.body;

    if ((!height && height !== 0) || (!weight && weight !== 0)) {
        throw new ApiError(400, 'Please provide both height and weight');
    }

    const child = await Child.findOne({ _id: req.params.id, user: req.user._id });

    if (!child) {
        throw new ApiError(404, 'Child not found');
    }

    // Add new measurement to the array
    child.measurements.unshift({ height, weight, date: new Date() });

    // The pre-save hook on the Child schema will auto-calculate BMI and riskLevel
    await child.save();

    res.status(200).json(new ApiResponse(200, { child }, 'Measurement added successfully'));
});

// @desc    Update child info
// @route   PUT /api/children/:id
// @access  Private
export const updateChild = asyncHandler(async (req, res) => {
    const { name, age, gender, schoolClass } = req.body;
    
    const child = await Child.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { name, age, gender, schoolClass },
        { new: true, runValidators: true }
    );

    if (!child) {
        throw new ApiError(404, 'Child not found');
    }

    res.status(200).json(new ApiResponse(200, { child }, 'Child updated successfully'));
});

// @desc    Delete a child profile
// @route   DELETE /api/children/:id
// @access  Private
export const deleteChild = asyncHandler(async (req, res) => {
    const child = await Child.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!child) {
        throw new ApiError(404, 'Child not found');
    }

    res.status(200).json(new ApiResponse(200, null, 'Child removed successfully'));
});
