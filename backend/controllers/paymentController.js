import Razorpay from 'razorpay';
import crypto from 'crypto';
import { User } from '../models/User.js'; // Adjust the path as necessary
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Set in environment variables
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// Controller function to create an order
export const createOrder = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  // Validate amount
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  // Ensure `receipt` is under 40 characters
  const shortUserId = userId.slice(0, 8); // Shorten user ID if needed
  const receiptId = `rcpt_${shortUserId}_${Date.now().toString().slice(-5)}`;

  const options = {
    amount: amount * 1, // Amount in paise
    currency: 'INR',
    receipt: receiptId,
  };

  try {
    const order = await razorpay.orders.create(options);

    // Save order ID and amount to the user's payment details
    await User.findByIdAndUpdate(userId, {
      $set: {
        'payment.razorpayOrderId': order.id,
        'payment.amount': amount, // Store the amount
      },
    });

    res.status(200).json({ order });
  } catch (error) {
    console.error('Error creating order:', error);

    if (error.response && error.response.statusCode === 400) {
      return res.status(400).json({ error: error.response.error.description });
    }

    res.status(500).json({ error: 'Server error' });
  }
};


// Controller function to verify payment
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, imageId, amount } = req.body;
  const userId = req.user.id;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    try {
      // Ensure the amount is correctly passed and is a valid number
      const validAmount = parseFloat(amount);
      if (isNaN(validAmount)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const user = await User.findById(userId);

      const totalAmount = user.payment.totalAmount || 0; // Default to 0 if undefined

      await User.findByIdAndUpdate(userId, {
        isPaid: true,
        $push: {
          'payment.paymentDetails': {
            imageId: imageId, 
            amount: validAmount, // Store valid amount
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paidAt: Date.now(),
          },
        },
        $set: {
          'payment.totalAmount': totalAmount + validAmount, // Add to existing total amount
        },
      });

      res.json({ status: 'success' });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
};
