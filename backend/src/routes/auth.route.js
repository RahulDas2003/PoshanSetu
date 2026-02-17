import express from 'express';
import {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    updateTargets,
    calculateTargets
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/targets', protect, updateTargets);
router.post('/calculate-targets', protect, calculateTargets);

export default router;
