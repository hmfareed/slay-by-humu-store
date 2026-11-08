require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

const makeAdmin = async () => {
  try {
    await connectDB();

    const targetEmail = process.argv[2] || 'mohammedfareed.dev@gmail.com'; 

    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.log(`User with email ${targetEmail} not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully made ${targetEmail} an Admin! Current role: ${user.role}`);
    process.exit(0);

  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  }
};

makeAdmin();
