import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
    getChildren,
    getChildById,
    createChild,
    addMeasurement,
    updateChild,
    deleteChild
} from '../controllers/child.controller.js';

const router = express.Router();

// Apply auth middleware to all child routes
router.use(protect);

router.route('/')
    .get(getChildren)
    .post(createChild);

router.route('/:id')
    .get(getChildById)
    .put(updateChild)
    .delete(deleteChild);

router.post('/:id/measurements', addMeasurement);

export default router;
