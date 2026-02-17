import express from 'express';
import {
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary,
    logWeight,
    getInsights
} from '../controllers/dashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/daily', getDailySummary);
router.get('/weekly', getWeeklySummary);
router.get('/monthly', getMonthlySummary);
router.get('/insights', getInsights);
router.post('/weight', logWeight);

export default router;
