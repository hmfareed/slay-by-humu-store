require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/db');

const targetProducts = [
    { name: "Deep Wave Goddess", desc: "Beautiful curly wig with natural look. Perfect for everyday wear.", price: 660.00, category: "curly" },
    { name: "Ginger short bounce 13by3 full frontal", desc: "Elegant long straight wig for any occasion. Made with premium synthetic fibers.", price: 610.00, category: "straight" },
    { name: "13by3 full frontal burgundy Odogwu bounce", desc: "Natural looking wavy wig with shoulder length. Easy to style and maintain.", price: 660.00, category: "wavy" },
    { name: "10' bob human hair brown", desc: "Chic short pixie cut wig for a bold and modern look.", price: 620.00, category: "short" },
    { name: "Fringe unit curls", desc: "Luxurious long curly wig with voluminous curls. Perfect for special occasions.", price: 490.00, category: "short" },
    { name: "13by3 full frontal black Odogwu bounce", desc: "Stylish straight wig with a natural hairline. Great for a fresh look (30 inches).", price: 660.00, category: "straight" },
    { name: "5by5 piano orange silky straight", desc: "Super natural and silky smooth surface", price: 600.00, category: "straight" },
    { name: "13by3 full frontal light brown Odogwu bounce", desc: "Super natural and perfect for any occasion", price: 660.00, category: "long" },
    { name: "13by3 full frontal celebrity bounce", desc: "Quality human hair blend & topnotch quality", price: 650.00, category: "short" },
    { name: "Midnight Silk Straight", desc: "Premium topnotch quality straight weave perfect for all occasions.", price: 660.00, category: "straight" } 
];

const updateWigs = async () => {
  try {
    await connectDB();
    
    // Find the products we just created (Humu Wig - Style 1 through 10)
    const existingProducts = await Product.find({ name: /Humu Wig - Style/ }).sort({ createdAt: 1 });
    
    if (existingProducts.length === 0) {
        console.log('No placeholder products found! Maybe they were already renamed?');
        process.exit(0);
    }
    
    console.log(`Found ${existingProducts.length} placeholder products to update.`);
    
    for (let i = 0; i < existingProducts.length; i++) {
        if (i < targetProducts.length) {
            existingProducts[i].name = targetProducts[i].name;
            existingProducts[i].description = targetProducts[i].desc;
            existingProducts[i].price = targetProducts[i].price;
            existingProducts[i].category = targetProducts[i].category;
            await existingProducts[i].save();
            console.log(`Updated to: ${existingProducts[i].name} (GHS ${existingProducts[i].price})`);
        }
    }

    console.log('✅ All products have been successfully renamed and priced!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during update process:', error);
    process.exit(1);
  }
};

updateWigs();
