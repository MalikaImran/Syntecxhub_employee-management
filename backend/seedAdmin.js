// Run this ONCE to create admin account:
// node seedAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employeedb');
  
  const exists = await User.findOne({ email: 'ahmedj@gmail.com' });
  if (exists) {
    console.log('✅ Admin already exists!');
  } else {
    await User.create({
      name:     'Ahmed',
      email:    'ahmedj@gmail.com',
      password: 'ahmed@123',   // bcrypt will auto-hash this
      role:     'admin',
    });
    console.log('✅ Admin created! Email: ahmedj@gmail.com | Password: ahmed@123');
  }
  
  mongoose.disconnect();
}

seedAdmin().catch(console.error);