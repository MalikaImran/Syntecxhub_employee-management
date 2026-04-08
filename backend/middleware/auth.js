// ─────────────────────────────────────────────────────────────────
// Week 4 Task 2: JWT Authentication Middleware
// Protects all /api/employees routes — no token = no access
// ─────────────────────────────────────────────────────────────────
const jwt    = require('jsonwebtoken');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET || 'staffhub-secret-key-2024';

// ── VERIFY TOKEN ─────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    logger.warn(`Unauthorized access — no token — ${req.method} ${req.url} — IP: ${req.headers['x-forwarded-for'] || req.ip}`);
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role } available in all route handlers
    next();
  } catch (err) {
    logger.warn(`Invalid token — ${req.method} ${req.url} — IP: ${req.headers['x-forwarded-for'] || req.ip}`);
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ── REQUIRE ADMIN ────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn(`Admin action blocked — role: ${req.user?.role} — ${req.method} ${req.url} — IP: ${req.headers['x-forwarded-for'] || req.ip}`);
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };