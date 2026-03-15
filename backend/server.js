const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');       // Week 2 Task 3: secure HTTP headers
const logger   = require('./logger');     // Week 3 Task 2: winston logging
require('dotenv').config();

const app = express();

// ─── WEEK 3 TASK 2: Log every incoming request ───────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} — IP: ${req.ip}`);
  next();
});

// ─── WEEK 2 TASK 3: Helmet — secure HTTP headers ─────────────────
app.use(helmet());

// ─── GENERAL MIDDLEWARE ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────────────────
const employeeRoutes = require('./routes/employees');
const authRoutes     = require('./routes/Auth');

app.use('/api/employees', employeeRoutes);
app.use('/api/auth',      authRoutes);

// Health check
app.get('/', (req, res) => {
  logger.info('Health check endpoint hit');
  res.json({ message: 'Employee Management API is running 🚀' });
});

// ─── WEEK 3 TASK 2: Log all errors ───────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message} — Route: ${req.url}`);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── START SERVER ─────────────────────────────────────────────────
const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/employeedb';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected successfully');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info('Application started — StaffHub Employee Management System');
    });
  })
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  });