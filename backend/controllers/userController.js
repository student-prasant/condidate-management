// controllers/userController.js
import { User } from '../models/User.js';

export const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    res.json({ status: true, user });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error", error });
  }
};