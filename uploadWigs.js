require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/db');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImages = async () => {
  try {
    await connectDB();
    const folderPath = 'c:\\Users\\Fareed\\Desktop\\Humu wigs';
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
    
    console.log(`Found ${files.length} images to upload...`);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(folderPath, file);
        
        console.log(`Uploading ${file} (${i + 1}/${files.length})...`);
        const result = await cloudinary.uploader.upload(filePath, { folder: 'humu_wigs' });
        
        console.log(`Successfully uploaded: ${result.secure_url}`);
        
        const newProduct = new Product({
            name: `Humu Wig - Style ${i + 1}`,
            description: 'Premium quality wig from the Humu collection. Edit this description in the admin panel.',
            price: 150, // Default price
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
