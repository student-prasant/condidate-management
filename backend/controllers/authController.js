import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
// import "../middleware/authMiddleware.js"

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user or email exists
    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUsername = await User.findOne({ username });

    if (existingUserByEmail) {
      return res.status(400).json({ status: false, message: "Email is already registered" });
    }

    if (existingUserByUsername) {
      return res.status(400).json({ status: false, message: "Username is already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save user
    await newUser.save();

    // Sign token
    const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      status: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      }
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error", error });
  }
};



// Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: "User is not registered" });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ status: false, message: "Password is incorrect" });
    }

    // Sign JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token as HTTP-only cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiration

    // Count total users
    const userCount = await User.countDocuments();

    // Retrieve all users (you might want to limit this for performance)
    const userList = await User.find().select('-password'); // Exclude passwords for security

    return res.json({
      status: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      userCount, // Send user count
      userList, // Send user list
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error", error });
  }
};


// Google Registration Controller
export const googleRegister = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user if not found
      user = new User({
        username: name,
        email,
        password: "", // No password required for Google login
        picture,
      });
      await user.save();
    }

    // Sign JWT token
    const jwtToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      status: true,
      message: 'Google Registration successful',
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Google Registration failed', error });
  }
};

// Google Login Controller
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    // Check if user exists in database
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user if not found
      user = new User({
        username: name,
        email,
        password: "", // No password required for Google login
        picture,
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      status: true,
      message: "Google Login successful",
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ status: false, message: "Google login failed", error });
  }
};

// Get User List Controller
export const getUserList = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const userList = await User.find().select('-password'); // Exclude passwords for security

    res.status(200).json({
      status: true,
      userCount,
      userList,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error", error });
  }
};




