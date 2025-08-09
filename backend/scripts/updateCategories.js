const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });

// Import Product model
const Product = require('../models/Product');

const categoryMapping = {
  'asbob': 'Asbob-uskunalar',
  'asbob-uskunalar': 'Asbob-uskunalar',
  'bo\'yoq-va-lak': 'Bo\'yoq va lak',
  'boyoq': 'Bo\'yoq va lak',
  'dekor': 'Dekor va bezatish',
  'dekor-va-bezatish': 'Dekor va bezatish',
  'elektr': 'Elektr mollalari',
  'gisht': 'G\'isht va bloklar'
};

const updateCategories = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://opscoder:PRv5ASUw6d5Qunz7@cluster0.s5obnul.mongodb.net/alibobo1?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('🔧 Updating product categories...');

    // Get all unique categories from database
    const existingCategories = await Product.distinct('category');
    console.log('📋 Existing categories:', existingCategories);

    // Update each category
    for (const oldCategory of existingCategories) {
      const newCategory = categoryMapping[oldCategory] || oldCategory;
      
      if (oldCategory !== newCategory) {
        console.log(`🔄 Updating "${oldCategory}" → "${newCategory}"`);
        
        const result = await Product.updateMany(
          { category: oldCategory },
          { category: newCategory }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} products from "${oldCategory}" to "${newCategory}"`);
      } else {
        console.log(`⏭️ Skipping "${oldCategory}" (already correct)`);
      }
    }

    // Get updated categories
    const updatedCategories = await Product.distinct('category');
    console.log('📋 Updated categories:', updatedCategories);

    console.log('🎉 All categories updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
if (require.main === module) {
  updateCategories();
}

module.exports = updateCategories;