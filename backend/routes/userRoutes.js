// routes/userRoutes.js
import express from 'express';
import { getUserDashboard } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', verifyToken, getUserDashboard);

export default router;
