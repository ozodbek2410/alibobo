const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });

const Product = require('../models/Product');
const Craftsman = require('../models/Craftsman');

async function createOptimizedIndexes() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🔧 Creating optimized indexes...');

        // Helper function to safely create index
        const safeCreateIndex = async (collection, indexSpec, options = {}) => {
            try {
                await collection.createIndex(indexSpec, options);
                console.log(`  ✅ Created index: ${JSON.stringify(indexSpec)}`);
            } catch (error) {
                if (error.code === 85) { // IndexOptionsConflict
                    console.log(`  ⚠️ Index already exists: ${JSON.stringify(indexSpec)}`);
                } else {
                    console.log(`  ❌ Failed to create index ${JSON.stringify(indexSpec)}: ${error.message}`);
                }
            }
        };

        // Product indexes for common query patterns
        await safeCreateIndex(Product.collection, { category: 1, price: 1 }); // Category + price filtering
        await safeCreateIndex(Product.collection, { updatedAt: -1 }); // Default sorting
        await safeCreateIndex(Product.collection, { createdAt: -1 }); // Creation date sorting
        await safeCreateIndex(Product.collection, { price: 1 }); // Price range queries

        // Compound index for common filter combinations
        await safeCreateIndex(Product.collection, {
            category: 1,
            price: 1,
            updatedAt: -1
        });

        console.log('✅ Product indexes processed');

        // Craftsman indexes
        await safeCreateIndex(Craftsman.collection, { status: 1 }); // Active/inactive filtering
        await safeCreateIndex(Craftsman.collection, { specialty: 1 }); // Specialty filtering
        await safeCreateIndex(Craftsman.collection, { status: 1, specialty: 1 }); // Combined filtering

        console.log('✅ Craftsman indexes processed');

        // List all indexes to verify
        console.log('\n📋 Product indexes:');
        const productIndexes = await Product.collection.listIndexes().toArray();
        productIndexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });

        console.log('\n📋 Craftsman indexes:');
        const craftsmanIndexes = await Craftsman.collection.listIndexes().toArray();
        craftsmanIndexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });

        console.log('\n🎉 All indexes created successfully!');

    } catch (error) {
        console.error('❌ Error creating indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

createOptimizedIndexes();