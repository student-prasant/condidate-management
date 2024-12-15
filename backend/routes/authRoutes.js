import express from 'express';
import { register, login, googleLogin, googleRegister,getUserList } from '../controllers/authController.js';


const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-register', googleRegister);
router.post('/google-login', googleLogin);
router.get('/users', getUserList); // Add this line to your routes
// Logout logic
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ status: true, message: "Logout successful" });
});

export { router };
