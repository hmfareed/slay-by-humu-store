require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User'); // Adjust path if needed
const connectDB = require('./src/config/db');

const makeAdmin = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Replace this with the email you registered with
    const targetEmail = 'admin@slaybyhumu.com'; 

    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.log(`User with email ${targetEmail} not found. Please register an account first.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully made ${targetEmail} an Admin!`);
    process.exit(0);

  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  }
};

makeAdmin();
