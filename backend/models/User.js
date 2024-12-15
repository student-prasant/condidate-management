import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  picture: [{ type: String }], // Array of image URLs
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  payment: {
    isPaid: { type: Boolean, default: false },
    paymentDetails: [
      { 
        imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, // Reference to the Image model
        amount: { type: Number }, // Individual payment amount for the image
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },  
        razorpaySignature: { type: String },
        paidAt: { type: Date, default: Date.now },               
      }
    ],
    totalAmount: { type: Number, default: 0 }, // Total amount paid by the user
  },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
}, {
  timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

// Middleware to update `updatedDate` on save
userSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedDate = Date.now();
  }
  next();
});

export const User = mongoose.model('User', userSchema);


