const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');        // SECURITY: password hashing

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  // Week 2 Task 1: Password hashed with bcrypt — never stored as plain text
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee',
  },
}, { timestamps: true });

// Hash password BEFORE saving to database
userSchema.pre('save', async function (next) {
  // Only hash if password was changed
  if (!this.isModified('password')) return next();
  // bcrypt.hash(password, saltRounds) — 10 is standard
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password on login
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);