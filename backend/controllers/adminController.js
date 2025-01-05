// adminController.js
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();


// Login function
export const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      // Fetch admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Compare password with hashed password in the database
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({
        message: 'Admin login successful',
        token,
        admin: {
          id: admin._id,
          email: admin.email,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  export const logout = (req, res) => {
    res.json({ message: 'Logout successful' });
  };
  

  
  export const setupAdmin = async (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields (username, email, password) are required.' });
    }
  
    try {
      // Check if admin already exists
      const adminExists = await Admin.findOne({ email });
      if (adminExists) {
        return res.status(400).json({ message: 'Admin already exists.' });
      }
  
      // Create new admin
      const newAdmin = new Admin({ username, email, password });
      await newAdmin.save();
  
      res.json({ message: 'Admin created successfully.' });
    } catch (error) {
      console.error('Error during admin setup:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


// Middleware to check token blacklist (for routes that require authentication)
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized, please login again" });
    }

    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: "Token is invalidated, please login again" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized, please login again" });
        }
        req.userId = decoded.id;
        next();
    });
};





export const uploadImage = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Construct the image URL using the file name
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // Push the new image URL into the picture array
        user.picture.push(imageUrl);
        await user.save();

        res.status(200).json({ message: "Image uploaded successfully", user });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Error uploading image", error });
    }
};

  