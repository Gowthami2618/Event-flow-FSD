const path = require('path');
// Ensure dotenv is loaded before any environment variable is accessed
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Database connection module
const connectDB = require('../config/database');
const errorHandler = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// CORS configuration to prevent CORS errors across local and deployed environments
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests or matching origins
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(cleanOrigin) ||
        !process.env.NODE_ENV ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      // If deployed without CLIENT_URL configured, allow incoming origin safely
      return callback(null, cleanOrigin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint with real MongoDB connection state
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    success: true,
    message: 'EventFlow API is running',
    database: isDbConnected ? 'connected' : 'disconnected',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/**
 * Sequential startup flow:
 * 1. Validate environment variables
 * 2. Connect to MongoDB Atlas
 * 3. Start Express server
 */
const startServer = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

  // Start Express listener so cloud host port detectors and health checks succeed
  const server = app.listen(PORT, () => {
    console.log(`[EventFlow API] Server running on port ${PORT}`);
  });

  if (!mongoUri) {
    console.warn('⚠️ [Config Warning] MONGODB_URI/MONGO_URI is not defined in environment variables.');
    console.warn('Please add MONGODB_URI to your Render Environment Variables to enable database features.');
  } else {
    try {
      await connectDB();
    } catch (error) {
      console.error('❌ [MongoDB Connection Error]:', error.message);
      console.warn('The server remains running. Please verify your Atlas connection string and Network Access (0.0.0.0/0).');
    }
  }

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
  });
};

startServer();

module.exports = app;
