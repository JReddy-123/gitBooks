import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import listingRoutes from './routes/listingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Development logging
if (process.env.NODE_ENV === 'development') {
  const morganModule = await import('morgan');
  const morgan = morganModule.default;
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Marketplace API ready!'
  });
});

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Endpoint not found');
  err.status = 404;
  next(err);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error.stack);
  
  if (!error.status) {
    error.status = 500;
    error.message = 'Internal Server Error';
  }
  
  res.status(error.status).json({
    success: false,
    error: error.message
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Marketplace Server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`👤 Users: http://localhost:${PORT}/api/users`);
    console.log(`📦 Listings: http://localhost:${PORT}/api/listings`);
  });
}

export default app;

