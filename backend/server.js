const express = require('express');
const mongoose = require('mongoose');
const path = require('path');


// Load environment variables
require('dotenv').config({ path: './config.env' });

// Fallback environment variables
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://ozodbek:NQNAa4JQIbG0vcV5@cluster0.dlopces.mongodb.net/alibobo?retryWrites=true&w=majority&appName=Cluster0';
}
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

// Debug: environment variables
console.log(' Environment variables:');
console.log('🔍 Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for better performance
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable ETag for caching
app.set('etag', 'strong');

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('🔄 MongoDB ga ulanishga urinish...');
    console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Mavjud' : 'Yo\'q');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Connection pooling for better performance
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      // Remove unsupported option: bufferMaxEntries
      // Enable compression
      compressors: ['zlib']
    });
    
    console.log('✅ MongoDB ga muvaffaqiyatli ulandi');
    console.log('🏠 Database host:', conn.connection.host);
    console.log('📊 Database name:', conn.connection.name);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB ulanishda xatolik:', error.message);
    console.error('📋 Xatolik tafsilotlari:', error);
    
    // Agar Atlas ulanishi muvaffaqiyatsiz bo'lsa, local MongoDB'ga urinish
    console.log('🔄 Local MongoDB ga ulanishga urinish...');
    try {
      const localConn = await mongoose.connect('mongodb://localhost:27017/alibobo', {
        serverSelectionTimeoutMS: 3000,
      });
      console.log('✅ Local MongoDB ga muvaffaqiyatli ulandi');
      return localConn;
    } catch (localError) {
      console.error('❌ Local MongoDB ham ishlamayapti:', localError.message);
      console.log('⚠️ MongoDB ulanmadi, lekin server ishga tushadi (xotiradan foydalanish)');
      // MongoDB ulanmasa ham server'ni ishga tushiramiz
      return null;
    }
  }
};

// Performance middleware
const performanceMiddleware = require('./middleware/performance');
app.use(performanceMiddleware.compression);
app.use(performanceMiddleware.helmet);
app.use(performanceMiddleware.staticCache);
app.use(performanceMiddleware.etag);
app.use(performanceMiddleware.cors);
app.use(performanceMiddleware.performanceMonitor);

// Routes
app.use('/api/craftsmen', require('./routes/craftsmen'));
app.use('/api/products', require('./routes/products')); // Use full products route with all CRUD operations
app.use('/api/orders', require('./routes/orders'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/statistics', require('./routes/statistics'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Alibobo Backend API ishlayapti',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Server xatoligi yuz berdi',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint topilmadi' });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portda ishlayapti`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Server ishga tushirishda xatolik:', error.message);
    process.exit(1);
  }
};

startServer(); 