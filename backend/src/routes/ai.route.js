import express from 'express';
import multer from 'multer';
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

// Configure multer for memory storage (buffer)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// All routes are protected
router.use(protect);

router.post('/analyze-meal/:mealId', analyzeMeal);
router.get('/recommendations', getRecommendations);
router.post('/chat', chat);
router.get('/daily-tip', getDailyTip);
router.post('/analyze-food', analyzeFood);
router.post('/analyze-image', upload.single('image'), analyzeImage);

export default router;
