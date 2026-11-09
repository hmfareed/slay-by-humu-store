const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const connectDB = require('../src/config/db');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImages = async () => {
  try {
    const targetFolder = process.argv[2] || process.env.IMAGE_SOURCE_DIR;

    if (!targetFolder) {
      console.error('❌ Error: Image directory path is required.');
      console.error('Usage: node scripts/uploadWigs.js <path-to-image-folder>');
      console.error('   or: set IMAGE_SOURCE_DIR in .env');
      process.exit(1);
    }

    const resolvedFolder = path.resolve(targetFolder);
    if (!fs.existsSync(resolvedFolder)) {
      console.error(`❌ Error: Directory does not exist: ${resolvedFolder}`);
      process.exit(1);
    }

    await connectDB();
    const files = fs.readdirSync(resolvedFolder).filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.png') ||
      file.toLowerCase().endsWith('.webp')
    );
    
    if (files.length === 0) {
      console.log(`No images found in ${resolvedFolder}`);
      process.exit(0);
    }

    console.log(`Found ${files.length} images to upload from ${resolvedFolder}...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(resolvedFolder, file);
      
      console.log(`Uploading ${file} (${i + 1}/${files.length})...`);
      const result = await cloudinary.uploader.upload(filePath, { folder: 'humu_wigs' });
      
      console.log(`Successfully uploaded: ${result.secure_url}`);
      
      const newProduct = new Product({
        name: `Humu Wig - Style ${i + 1}`,
        description: 'Premium quality wig from the Humu collection. Edit this description in the admin panel.',
        price: 150,
        category: 'Wigs',
        stock: 10,
        images: [result.secure_url],
        brand: 'Humu'
      });

      await newProduct.save();
      console.log(`Created product: ${newProduct.name} in Database.\n`);
    }

    console.log('✅ All images uploaded and products created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during upload/sync process:', error);
    process.exit(1);
  }
};

uploadImages();
