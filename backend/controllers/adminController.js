// adminController.js
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();


// Login function
export const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });
        if (!admin || !(await admin.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            token,
            adminId: admin._id,
            username: admin.username,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Function to generate random username and password
const generateUsername = () => {
    const prefix = 'admin_';
    const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
    return `${prefix}${randomString}`;
};

const generatePassword = (length = 12) => {
    const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specialCharacters = '@#$%&*!';

    const allCharacters = upperCaseLetters + lowerCaseLetters + digits + specialCharacters;

    let password = '';
    password += upperCaseLetters[Math.floor(Math.random() * upperCaseLetters.length)];
    password += lowerCaseLetters[Math.floor(Math.random() * lowerCaseLetters.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

    for (let i = 4; i < length; i++) {
        password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }

    // Shuffle the password to make it more random
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
};

// Create new admin function
export const createAdmin = async (req, res) => {
    const username = generateUsername();
    const password = generatePassword();

    try {
        const admin = new Admin({ username, password });
        await admin.save();
        res.status(201).json({
            message: 'Admin user created successfully',
            username,
            password, // You may not want to return the password in production!
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ message: 'Error creating admin user' });
    }
};


// Logout function (using a token blacklist in memory for simplicity)
let tokenBlacklist = new Set();

export const logoutAdmin = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(400).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(400).json({ message: "Token missing in Authorization header" });
    }

    tokenBlacklist.add(token);
    res.status(200).json({ message: "Logged out successfully" });
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

  