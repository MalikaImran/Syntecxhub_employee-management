const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const logger   = require('./logger');
require('dotenv').config();

const { doubleCsrf } = require('csrf-csrf');

// ✅ App initialize FIRST
const app = express();

// ─────────────────────────────────────────────────────────────────
// CSRF Protection Setup
// ─────────────────────────────────────────────────────────────────
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'staffhub-csrf-secret-2024',
  cookieName: 'x-csrf-token',
  cookieOptions: { httpOnly: true, sameSite: 'strict', secure: false },
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// ✅ Endpoint to send token to frontend
app.get('/api/csrf-token', (req, res) => {
  const csrfToken = generateToken(req, res);
  res.json({ csrfToken });
});

// ─────────────────────────────────────────────────────────────────
// Intrusion Detection (Login Attempts)
// ─────────────────────────────────────────────────────────────────
const loginAttempts = {};
const MAX_ATTEMPTS  = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000;

app.locals.loginAttempts = loginAttempts;
app.locals.MAX_ATTEMPTS  = MAX_ATTEMPTS;
app.locals.BLOCK_TIME_MS = BLOCK_TIME_MS;

// ─────────────────────────────────────────────────────────────────
// Request Logging
// ─────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const realIP = req.headers['x-forwarded-for'] || req.ip;
  logger.info(`${req.method} ${req.url} — IP: ${realIP}`);
  next();
});

// ─────────────────────────────────────────────────────────────────
// Helmet Security
// ─────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc:   ["'none'"],
      objectSrc:  ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard:     { action: 'deny' },
  noSniff:        true,
  xssFilter:      true,
  referrerPolicy: { policy: 'no-referrer' },
}));

// ─────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'], // ✅ IMPORTANT
  credentials:    true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// ─────────────────────────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  handler: (req, res, next, options) => {
    const realIP = req.headers['x-forwarded-for'] || req.ip;
    logger.warn(`RATE LIMIT HIT — IP: ${realIP}`);
    res.status(429).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ─────────────────────────────────────────────────────────────────
// ROUTES (CSRF Protection apply here)
// ─────────────────────────────────────────────────────────────────
const employeeRoutes = require('./routes/employees');
const authRoutes     = require('./routes/auth');

// ✅ Apply CSRF middleware to protected routes
app.use('/api/employees', doubleCsrfProtection, employeeRoutes);
app.use('/api/auth',      doubleCsrfProtection, authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'StaffHub API is running securely 🚀' });
});

// ─────────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS: origin not allowed' });
  }
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────
const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/employeedb';

mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error(err.message);
    process.exit(1);
  });