const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const connectDB = require('../src/config/db');

const check = async () => {
  try {
    await connectDB();
    const products = await Product.find({}).lean();
    console.log(`Total products: ${products.length}`);
    products.forEach(p => {
      console.log(`ID: ${p._id} | Name: ${p.name}`);
      console.log(`  Texture: ${p.texture}`);
      console.log(`  Lace: ${p.lace}`);
      console.log(`  Longevity: ${p.longevity}`);
      console.log(`  Styling: ${p.styling}`);
      console.log('-----------------------------------');
    });
    process.exit(0);
  } catch (err) {
    console.error('Error checking products:', err);
    process.exit(1);
  }
};

check();
