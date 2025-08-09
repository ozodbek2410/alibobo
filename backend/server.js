const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Load environment variables
require('dotenv').config({ path: './config.env' });

// Fallback environment variables
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://opscoder:PRv5ASUw6d5Qunz7@cluster0.s5obnul.mongodb.net/alibobo1?retryWrites=true&w=majority';
}
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

// Debug: environment variables
console.log('🔍 Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increase limit for base64 images

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('🔄 MongoDB ga ulanishga urinish...');
    console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Mavjud' : 'Yo\'q');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 soniya timeout
      socketTimeoutMS: 45000, // 45 soniya socket timeout
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

// Routes
app.use('/api/craftsmen', require('./routes/craftsmen'));
app.use('/api/products', require('./routes/products'));
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