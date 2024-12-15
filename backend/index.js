
import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
dotenv.config()
// import { UserRouter } from './routes/user.js'
import { router } from './routes/authRoutes.js';  // Named import


import userRoutes from './routes/userRoutes.js';
// import adminRouter from './routes/adminRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';


// server.js
import 'dotenv/config';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import {verifyToken } from './middleware/authMiddleware.js';


const app = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}))
app.use(cookieParser())


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Other middleware and routes
app.use(express.json());
//routes
app.use('/api/payment', verifyToken , paymentRoutes);
app.use('/auth', router);
app.use("/api/admin", adminRoutes);


// app.use("/admin", adminRouter);
app.use('/api/user', userRoutes);
mongoose.connect('mongodb://127.0.0.1:27017/infra')
// scheduleRecurringInvoices();

app.listen(process.env.PORT, () => {
  console.log("server is Running")
})
