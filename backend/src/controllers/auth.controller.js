import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, 'Please provide name, email, and password');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'User with this email already exists');
    }

    const user = await User.create({ name, email, password });
    const token = user.generateToken();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201)
        .cookie('token', token, cookieOptions)
        .json(new ApiResponse(201, { user: userResponse, token }, 'Registration successful! Welcome to SmartAI Nutrition 🍎'));
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = user.generateToken();
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200)
        .cookie('token', token, cookieOptions)
        .json(new ApiResponse(200, { user: userResponse, token }, 'Login successful! Welcome back 👋'));
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
    res.status(200)
        .cookie('token', '', { httpOnly: true, expires: new Date(0) })
        .json(new ApiResponse(200, null, 'Logged out successfully'));
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.status(200).json(new ApiResponse(200, { user }, 'Profile fetched successfully'));
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, avatar, profile, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (profile) {
        user.profile = { ...user.profile.toObject(), ...profile };
        user.calculateTargets();
    }
    if (preferences) {
        user.preferences = { ...user.preferences.toObject(), ...preferences };
    }

    await user.save();
    res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully'));
});

// @desc    Update daily targets
// @route   PUT /api/auth/targets
// @access  Private
export const updateTargets = asyncHandler(async (req, res) => {
    const { calories, protein, carbs, fat } = req.body;
    const user = await User.findById(req.user._id);

    if (calories) user.dailyTargets.calories = calories;
    if (protein) user.dailyTargets.protein = protein;
    if (carbs) user.dailyTargets.carbs = carbs;
    if (fat) user.dailyTargets.fat = fat;

    await user.save();
    res.status(200).json(new ApiResponse(200, { dailyTargets: user.dailyTargets }, 'Daily targets updated successfully'));
});

// @desc    Calculate and set targets based on profile
// @route   POST /api/auth/calculate-targets
// @access  Private
export const calculateTargets = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user.profile.age || !user.profile.gender || !user.profile.height || !user.profile.weight) {
        throw new ApiError(400, 'Please complete your profile first (age, gender, height, weight)');
    }

    user.calculateTargets();
    await user.save();

    res.status(200).json(new ApiResponse(200, { dailyTargets: user.dailyTargets }, 'Daily targets calculated based on your profile! 🎯'));
});
