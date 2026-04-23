require('dotenv').config();
const mongoose = require('mongoose');

// Temporary schemas for migration
const categorySchema = new mongoose.Schema({
  name: String
});
const Category = mongoose.model('Category', categorySchema);

const productSchema = new mongoose.Schema({
  name: String,
  category: mongoose.Schema.Types.Mixed
}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      if (product.category instanceof mongoose.Types.ObjectId) {
        const category = await Category.findById(product.category);
        if (category) {
          // If category name doesn't match predefined exactly, map it if possible
          let catName = category.name.trim();
          // Title case it just in case
          catName = catName.charAt(0).toUpperCase() + catName.slice(1).toLowerCase();
          
          await Product.updateOne(
            { _id: product._id },
            { $set: { category: catName } }
          );
          console.log(`Updated product ${product.name} with category string: ${catName}`);
          updatedCount++;
        } else {
          console.log(`Category not found for product ${product.name}, setting to 'Uncategorized'`);
          await Product.updateOne(
            { _id: product._id },
            { $set: { category: 'Uncategorized' } }
          );
          updatedCount++;
        }
      } else if (typeof product.category === 'object' && product.category !== null) {
          // It's populated? Should be raw document, but just in case
          if (product.category.name) {
             await Product.updateOne(
               { _id: product._id },
               { $set: { category: product.category.name } }
             );
             updatedCount++;
          }
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
