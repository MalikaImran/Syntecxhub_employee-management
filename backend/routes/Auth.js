const express   = require('express');
const router    = express.Router();
const jwt       = require('jsonwebtoken');  // Week 2 Task 2: JWT auth
const validator = require('validator');     // Week 2 Task 1: input validation
const User      = require('../models/User');
const logger    = require('../logger');     // Week 3 Task 2: logging

const JWT_SECRET = process.env.JWT_SECRET || 'staffhub-secret-key-2024';

// ─── SIGNUP ──────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Week 2 Task 1: validate with validator library
    if (!name || !name.trim()) {
      logger.warn(`Signup failed — missing name — IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !validator.isEmail(email)) {
      logger.warn(`Signup failed — invalid email: ${email} — IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    if (!password || password.length < 6) {
      logger.warn(`Signup failed — weak password — IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      logger.warn(`Signup failed — email already exists: ${email} — IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Week 2 Task 1: sanitize name with validator.escape()
    // Week 2 Task 1: password auto-hashed by bcrypt in User model
    const user = await User.create({
      name:     validator.escape(name.trim()),
      email:    email.toLowerCase(),
      password,
      role:     'employee',
    });

    // Week 2 Task 2: generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Week 3 Task 2: log successful signup
    logger.info(`New user signed up: ${user.email} — Role: ${user.role}`);

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

// ─── LOGIN ────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Week 2 Task 1: validate email format
    if (!email || !validator.isEmail(email)) {
      logger.warn(`Login failed — invalid email format: ${email} — IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!password) {
      logger.warn(`Login failed — missing password — IP: ${req.ip}`);
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Week 3 Task 1: log failed login attempts (penetration testing detection)
      logger.warn(`FAILED LOGIN ATTEMPT — email not found: ${email} — IP: ${req.ip}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Week 2 Task 1: bcrypt compare hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Week 3 Task 1: log wrong password attempt
      logger.warn(`FAILED LOGIN ATTEMPT — wrong password for: ${email} — IP: ${req.ip}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Week 2 Task 2: generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Week 3 Task 2: log successful login
    logger.info(`User logged in: ${user.email} — Role: ${user.role} — IP: ${req.ip}`);

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