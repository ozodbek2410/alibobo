const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });

// Import models to ensure schemas are registered
const Craftsman = require('../models/Craftsman');
const Product = require('../models/Product');
const Order = require('../models/Order');

const createIndexes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alibobo', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('🔧 Creating performance indexes...');

    // Craftsmen indexes
    console.log('📊 Creating Craftsman indexes...');
    await Craftsman.collection.createIndex({ status: 1 });
    await Craftsman.collection.createIndex({ createdAt: 1 });
    await Craftsman.collection.createIndex({ updatedAt: 1 });
    await Craftsman.collection.createIndex({ specialty: 1, status: 1 });
    await Craftsman.collection.createIndex({ createdAt: 1, updatedAt: 1 });
    console.log('✅ Craftsman indexes created');

    // Products indexes
    console.log('📦 Creating Product indexes...');
    await Product.collection.createIndex({ status: 1 });
    await Product.collection.createIndex({ createdAt: 1 });
    await Product.collection.createIndex({ updatedAt: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ category: 1, status: 1 });
    await Product.collection.createIndex({ createdAt: 1, updatedAt: 1 });
    console.log('✅ Product indexes created');

    // Orders indexes
    console.log('🛒 Creating Order indexes...');
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ createdAt: 1 });
    await Order.collection.createIndex({ updatedAt: 1 });
    await Order.collection.createIndex({ totalAmount: 1 });
    await Order.collection.createIndex({ status: 1, createdAt: 1 });
    await Order.collection.createIndex({ createdAt: 1, updatedAt: 1 });
    await Order.collection.createIndex({ createdAt: 1, totalAmount: 1 });
    console.log('✅ Order indexes created');

    // Compound indexes for statistics queries
    console.log('🔍 Creating compound indexes for statistics...');
    
    // For edit tracking queries
    await Craftsman.collection.createIndex({ 
      updatedAt: 1, 
      createdAt: 1 
    }, { 
      name: 'edit_tracking_craftsmen' 
    });
    
    await Product.collection.createIndex({ 
      updatedAt: 1, 
      createdAt: 1 
    }, { 
      name: 'edit_tracking_products' 
    });
    
    await Order.collection.createIndex({ 
      updatedAt: 1, 
      createdAt: 1 
    }, { 
      name: 'edit_tracking_orders' 
    });

    // For revenue calculations
    await Order.collection.createIndex({ 
      createdAt: 1, 
      totalAmount: 1, 
      status: 1 
    }, { 
      name: 'revenue_calculations' 
    });

    console.log('✅ Compound indexes created');

    // List all indexes to verify
    console.log('📋 Listing all indexes...');
    
    const craftsmenIndexes = await Craftsman.collection.listIndexes().toArray();
    console.log('Craftsman indexes:', craftsmenIndexes.map(idx => idx.name));
    
    const productIndexes = await Product.collection.listIndexes().toArray();
    console.log('Product indexes:', productIndexes.map(idx => idx.name));
    
    const orderIndexes = await Order.collection.listIndexes().toArray();
    console.log('Order indexes:', orderIndexes.map(idx => idx.name));

    console.log('🎉 All indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
if (require.main === module) {
  createIndexes();
}

module.exports = createIndexes;