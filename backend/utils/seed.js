const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindcare');
    console.log('[Seed] Connected to MongoDB Atlas...');

    // Delete existing demo accounts
    await User.deleteMany({ email: { $in: ['admin@mindcare.edu', 'student@mindcare.edu'] } });

    await User.create({
      name: 'Dr. Sarah Jenkins (Admin)',
      email: 'admin@mindcare.edu',
      password: 'Admin@123',
      role: 'admin',
      emailVerified: true
    });

    await User.create({
      name: 'Alex Morgan',
      email: 'student@mindcare.edu',
      password: 'Student@123',
      role: 'student',
      emailVerified: true
    });

    console.log('[Seed] Demo verified accounts created in MongoDB Atlas:');
    console.log('  👉 Admin Account  : admin@mindcare.edu / Admin@123 (Verified)');
    console.log('  👉 Student Account: student@mindcare.edu / Student@123 (Verified)');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
