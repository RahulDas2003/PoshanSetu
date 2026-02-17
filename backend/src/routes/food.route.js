import express from 'express';
import {
    searchFoods,
    getFoodByBarcode,
    getFoodById,
    createCustomFood,
    updateCustomFood,
    deleteCustomFood,
    getMyCustomFoods,
    getPopularFoods
} from '../controllers/food.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/search', searchFoods);
router.get('/barcode/:code', getFoodByBarcode);
router.get('/popular', getPopularFoods);

// Protected routes
router.get('/my-foods', protect, getMyCustomFoods);
router.post('/', protect, createCustomFood);
router.put('/:id', protect, updateCustomFood);
router.delete('/:id', protect, deleteCustomFood);

// This must be last (catch-all for :id)
router.get('/:id', getFoodById);

export default router;
