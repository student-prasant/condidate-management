// routes/adminRoutes.js

import express from 'express';
import { uploadImage, login, setupAdmin, logout } from '../controllers/adminController.js';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', logout);

// Admin setup route
router.post('/setup-admin', setupAdmin);
// POST route for image upload (protected route)
router.post('/uploadImage',  upload.single('image'), uploadImage);



export default router;


