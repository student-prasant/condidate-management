// middleware/authMiddleware.js

import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[2];

  if (!token) {
      return res.status(401).json({ status: false, message: "Access denied. No token provided." });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Store user info for later use
      next();
  } catch (error) {
      res.status(400).json({ status: false, message: "Invalid token." });
  }
};

// authMiddleware.js
// import jwt from 'jsonwebtoken';
// import { User } from '../models/User.js';

// export const verifyToken = async (req, res, next) => {
//   const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select('-password');
//     if (!req.user) {
//       return res.status(401).json({ error: 'User not found' });
//     }
//     next();
//   } catch (error) {
//     console.error('Authentication error:', error);
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };


