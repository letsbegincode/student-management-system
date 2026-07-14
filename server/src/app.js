const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Trust Vercel's reverse proxy so rate limiter reads the real client IP
app.set('trust proxy', 1);

// 1. Security Headers (Information Leakage Protection)
app.use(helmet());

// 2. Rate Limiting (DoS Protection)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', apiLimiter);

// CORS configuration
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// 3. Payload Size Limits (Large Payload / OOM Protection)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));

// Error handler
app.use(errorHandler);

module.exports = app;
