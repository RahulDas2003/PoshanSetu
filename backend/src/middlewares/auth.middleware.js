import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.cookies?.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, 'Not authorized. Please log in.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            throw new ApiError(401, 'User not found. Please log in again.');
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, 'Not authorized. Invalid token.');
    }
});

// Optional auth - attach user if token exists, but don't require it
export const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.cookies?.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            req.user = null;
        }
    }

    next();
});
