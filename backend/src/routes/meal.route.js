import express from 'express';
import {
    createMeal,
    getMealsByDate,
    getMealsByDateRange,
    getMealById,
    updateMeal,
    deleteMeal,
    addFoodToMeal,
    removeFoodFromMeal
} from '../controllers/meal.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Main meal routes
router.post('/', createMeal);
router.get('/', getMealsByDate);
router.get('/range', getMealsByDateRange);
router.get('/:id', getMealById);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

// Food within meal routes
router.post('/:id/foods', addFoodToMeal);
router.delete('/:id/foods/:foodIndex', removeFoodFromMeal);

export default router;
