import express from 'express';
import {
    analyzeMeal,
    getRecommendations,
    chat,
    getDailyTip,
    analyzeFood,
    analyzeImage
} from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/analyze-meal/:mealId', analyzeMeal);
router.get('/recommendations', getRecommendations);
router.post('/chat', chat);
router.get('/daily-tip', getDailyTip);
router.post('/analyze-food', analyzeFood);
router.post('/analyze-image', analyzeImage);

export default router;
