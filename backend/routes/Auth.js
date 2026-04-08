const express    = require('express');
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const validator  = require('validator');
const rateLimit  = require('express-rate-limit');
const User       = require('../models/User');
const logger     = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET || 'staffhub-secret-key-2024';

// ─────────────────────────────────────────────────────────────────
// WEEK 4 TASK 1 + 2: Login rate limiter
// Max 5 attempts per IP per 15 minutes — then blocked
// ─────────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      5,               // max 5 login attempts per IP
  skipSuccessfulRequests: true, // don't count successful logins
  message: {
    success: false,
    message: 'Too many failed login attempts. You are blocked for 15 minutes.'
  },
  handler: (req, res, next, options) => {
    const realIP = req.headers['x-forwarded-for'] || req.ip;
    logger.warn(`INTRUSION DETECTED — login rate limit hit — IP: ${realIP} — ${new Date().toISOString()}`);
    logger.warn(`ACCOUNT PROTECTION TRIGGERED — blocking IP: ${realIP} for 15 minutes`);
    res.status(429).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ─────────────────────────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const realIP = req.headers['x-forwarded-for'] || req.ip;

    if (!name || !name.trim()) {
      logger.warn(`Signup failed — missing name — IP: ${realIP}`);
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !validator.isEmail(email)) {
      logger.warn(`Signup failed — invalid email: ${email} — IP: ${realIP}`);
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    if (!password || password.length < 6) {
      logger.warn(`Signup failed — weak password — IP: ${realIP}`);
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      logger.warn(`Signup failed — email exists: ${email} — IP: ${realIP}`);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name:     validator.escape(name.trim()),
      email:    email.toLowerCase(),
      password,
      role:     'employee',
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`New user signed up: ${user.email} — Role: ${user.role} — IP: ${realIP}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    logger.error(`Signup error: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// LOGIN — with rate limiter applied
// ─────────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const realIP = req.headers['x-forwarded-for'] || req.ip;

    if (!email || !validator.isEmail(email)) {
      logger.warn(`Login failed — invalid email format: ${email} — IP: ${realIP}`);
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!password) {
      logger.warn(`Login failed — missing password — IP: ${realIP}`);
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      logger.warn(`FAILED LOGIN ATTEMPT — email not found: ${email} — IP: ${realIP}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`FAILED LOGIN ATTEMPT — wrong password for: ${email} — IP: ${realIP}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`Successful login: ${user.email} — Role: ${user.role} — IP: ${realIP}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;