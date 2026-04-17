require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/db');

// Renames: old name → new name
const renames = [
  { oldName: "13by3 full frontal rugged back black", newName: "Deep Wave Goddess" },
  { oldName: "Ginger short bounce 13by3 full frontal", newName: "Full Frontal Light Brown Bounce" },
  { oldName: "13by3 full frontal burgundy Odogwu bounce", newName: "Orange Silky Straight" },
  { oldName: "10' bob human hair brown", newName: "Honey Blonde Bob" },
  { oldName: "Fringe unit curls", newName: "Full Frontal Rugged Back Black" },
  { oldName: "13by3 full frontal black Odogwu bounce", newName: "Ginger Short Bounce Full Frontal" },
  { oldName: "5by5 piano orange silky straight", newName: "Full Frontal Burgundy Bounce" },
  { oldName: "13by3 full frontal light brown Odogwu bounce", newName: "Full Frontal Celebrity Bounce" },
];

// Non-wig product names/categories to delete
const deleteFilters = [
  { name: "Samsung 26 ultra" },
  { name: "iPhone 15" },
  { category: "Phones" },
  // Old seed products with no real images
  { name: "Ethereal Blonde Curls" },
  { name: "Crimson Royale" },
  { name: "Midnight Diva Curls" },
  { name: "Sunset Orange Curls" },
  { name: "Auburn Chic Bob" },
  { name: "Ginger Spice Straight" },
  { name: "Obsidian Deep Wave" },
  { name: "Raven Sleek Wave" },
  { name: "Onyx Kinky Afro" },
  { name: "Caramel Honey Wave" },
];

const run = async () => {
  try {
    await connectDB();

    // 1. Rename wigs
    console.log('\n🔄 Renaming wigs...');
    for (const { oldName, newName } of renames) {
      const result = await Product.findOneAndUpdate(
        { name: oldName },
        { name: newName },
        { new: true }
      );
      if (result) {
        console.log(`  ✅ "${oldName}" → "${newName}"`);
      } else {
        console.log(`  ⚠️  "${oldName}" not found (may already be renamed)`);
      }
    }

    // 2. Delete non-wig products
    console.log('\n🗑️  Deleting non-wig products...');
    for (const filter of deleteFilters) {
      const result = await Product.deleteMany(filter);
      if (result.deletedCount > 0) {
        console.log(`  ✅ Deleted ${result.deletedCount} product(s) matching: ${JSON.stringify(filter)}`);
      }
    }

    // 3. Show remaining products
    const remaining = await Product.find({}, 'name category price').sort({ createdAt: 1 });
    console.log(`\n📦 ${remaining.length} products remaining:`);
    remaining.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.category}) — ₵${p.price}`);
    });

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();
