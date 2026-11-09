const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

const makeAdmin = async () => {
  try {
    const targetEmail = process.argv[2];

    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail.trim())) {
      console.error('❌ Error: A valid target email address is required.');
      console.error('Usage: node scripts/makeAdmin.js <user-email>');
      process.exit(1);
    }

    const cleanEmail = targetEmail.trim().toLowerCase();

    await connectDB();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      console.error(`❌ User with email "${cleanEmail}" not found.`);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️ User "${cleanEmail}" is already an Admin.`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully updated role for "${cleanEmail}" to Admin!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role to admin:', error);
    process.exit(1);
  }
};

makeAdmin();
