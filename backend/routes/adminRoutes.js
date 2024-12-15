// routes/adminRoutes.js

import express from 'express';
import { uploadImage, loginAdmin, createAdmin, logoutAdmin } from '../controllers/adminController.js';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// POST route for admin login
router.post('/login', loginAdmin);

// POST route for creating a new admin
router.post('/create', createAdmin);

// POST route for image upload (protected route)
router.post('/uploadImage',  upload.single('image'), uploadImage);

// POST route for admin logout
router.post('/logout', logoutAdmin);

export default router;
