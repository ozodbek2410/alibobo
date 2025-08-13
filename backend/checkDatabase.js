const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Get all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Available collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');
    
    // Check each collection for data
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`📊 ${collection.name}: ${count} documents`);
      
      if (count > 0) {
        // Show first document as sample
        const sample = await mongoose.connection.db.collection(collection.name).findOne();
        console.log(`   Sample document:`, JSON.stringify(sample, null, 2).substring(0, 200) + '...');
      }
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
};

console.log('🚀 Connecting to MongoDB...');
mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB');
  checkDatabase();
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
