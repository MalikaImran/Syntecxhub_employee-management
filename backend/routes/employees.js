const express                       = require('express');
const router                        = express.Router();
const Employee                      = require('../models/Employee');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const logger                        = require('../logger');

// ─────────────────────────────────────────────────────────────────
// WEEK 5 TASK 2: SQL Injection Prevention
// Mongoose uses parameterized queries internally — raw user input
// is NEVER concatenated into a query string. All queries go through
// Mongoose schema validation before touching MongoDB.
// Example of what we DO NOT do (vulnerable pattern):
// db.query("SELECT * FROM employees WHERE id = " + req.params.id)
// What we DO (safe pattern):
// Employee.findById(req.params.id) — Mongoose handles escaping
// ─────────────────────────────────────────────────────────────────

// GET all — any logged in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, department, status, sort = '-createdAt' } = req.query;
    let query = {};

    // Employee can only see their own record
    if (req.user.role === 'employee') {
      query.email = req.user.email;
    }

    // WEEK 5: Input sanitization on search — remove regex special chars
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name:       { $regex: safeSearch, $options: 'i' } },
        { email:      { $regex: safeSearch, $options: 'i' } },
        { role:       { $regex: safeSearch, $options: 'i' } },
        { department: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    if (department && department !== 'All') query.department = department;
    if (status     && status     !== 'All') query.status     = status;

    const employees = await Employee.find(query).sort(sort);
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single — verifyToken
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    // IDOR protection — employee can only view own record
    if (req.user.role === 'employee' && employee.email !== req.user.email) {
      logger.warn(`IDOR blocked — ${req.user.email} tried to access ${req.params.id}`);
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create — admin only
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const saved    = await employee.save();
    logger.info(`Employee created: ${saved.name} — by admin: ${req.user.id}`);
    res.status(201).json({ success: true, data: saved, message: 'Employee created successfully' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists' });
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update — admin only
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    logger.info(`Employee updated: ${employee.name} — by admin: ${req.user.id}`);
    res.json({ success: true, data: employee, message: 'Employee updated successfully' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists' });
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE — admin only
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    logger.info(`Employee deleted: ${employee.name} — by admin: ${req.user.id}`);
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET stats — admin only
router.get('/stats/overview', verifyToken, requireAdmin, async (req, res) => {
  try {
    const total        = await Employee.countDocuments();
    const active       = await Employee.countDocuments({ status: 'Active' });
    const inactive     = await Employee.countDocuments({ status: 'Inactive' });
    const onLeave      = await Employee.countDocuments({ status: 'On Leave' });
    const avgSalary    = await Employee.aggregate([{ $group: { _id: null, avg: { $avg: '$salary' } } }]);
    const byDepartment = await Employee.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    res.json({
      success: true,
      data: { total, active, inactive, onLeave,
              avgSalary: avgSalary[0]?.avg?.toFixed(0) || 0, byDepartment }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;