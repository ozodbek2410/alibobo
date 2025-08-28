const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cluster = require('cluster');
const os = require('os');
const http = require('http'); // For Socket.IO integration
const socketService = require('./services/SocketService'); // Real-time updates

// Use clustering to take advantage of multi-core systems
const enableClustering = process.env.ENABLE_CLUSTERING === 'true';

if (enableClustering && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  const workerCount = Math.min(numCPUs, 4); // Limit to a maximum of 4 workers
  
  console.log(`🚀 Primary ${process.pid} is running`);
  console.log(`🧠 Starting ${workerCount} workers on ${numCPUs} CPU cores`);

  // Fork workers
  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  // Worker management: keep track of active workers
  let activeWorkers = new Set();
  
  cluster.on('online', (worker) => {
    activeWorkers.add(worker.id);
    console.log(`✅ Worker ${worker.process.pid} is online (Total: ${activeWorkers.size})`);
  });

  // Handle worker crashes
  cluster.on('exit', (worker, code, signal) => {
    activeWorkers.delete(worker.id);
    console.log(`⚠️ Worker ${worker.process.pid} died (${signal || code}). Restarting... (Active: ${activeWorkers.size})`);
    
    // Only spawn a new worker if it wasn't an intentional shutdown
    if (!worker.exitedAfterDisconnect) {
      const newWorker = cluster.fork();
      console.log(`🔄 New worker ${newWorker.process.pid} spawned`);
    }
  });
  
  // Monitor worker health
  setInterval(() => {
    console.log(`🔍 Cluster status: ${activeWorkers.size} active workers`);
    
    // Check memory usage (simplified example)
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memoryUsage.rss / 1024 / 1024);
    console.log(`📊 Memory usage: ${memoryUsageMB} MB`);
    
    // Could restart workers if memory exceeds threshold
    if (memoryUsageMB > 1500) { // Example: 1.5 GB threshold
      console.log(`⚠️ High memory usage detected: ${memoryUsageMB} MB. Consider restarting workers.`);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down primary process...');
    
    // Tell workers to finish their current requests and then exit
    Object.values(cluster.workers).forEach(worker => {
      worker.send('shutdown');
    });
    
    // Force shutdown after timeout
    setTimeout(() => {
      console.log('⏱️ Graceful shutdown timed out, forcing exit.');
      process.exit(1);
    }, 5000);
  });
} else {

const app = express();

// Middleware
app.set('trust proxy', process.env.TRUST_PROXY === 'true');

// Performance middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  maxAge: 86400 // CORS pre-flight results are cached for 1 day
}));

// Security middleware
app.use(helmet());

// Compression middleware - prioritize speed
app.use(compression({
  level: 6, // Balanced between speed and compression ratio (0-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress responses with this header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Don't compress images or other binary files that are already compressed
    const contentType = res.getHeader('Content-Type');
    if (contentType && (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/pdf') ||
      contentType.includes('application/zip') ||
      contentType.includes('font/') ||
      contentType.includes('application/octet-stream')
    )) {
      return false;
    }
    // Use compression filter
    return compression.filter(req, res);
  },
  // Add a custom threshold function based on request size
  threshold: function(req, res) {
    // Don't bother compressing small responses
    const contentLength = parseInt(res.getHeader('Content-Length'), 10);
    return contentLength > 1024; // Only compress responses > 1KB
  }
}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiting for API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for some trusted IPs
  skip: (req) => {
    const trustedIps = (process.env.TRUSTED_IPS || '').split(',');
    return trustedIps.includes(req.ip);
  }
});
app.use('/api', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CRITICAL: Add cache control headers for real-time updates
app.use((req, res, next) => {
  // Prevent HTTP caching of API responses that contain real-time data
  if (req.path.startsWith('/api/products') || req.path.startsWith('/api/orders')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'ETag': `"${Date.now()}"` // Force ETag rotation
    });
  }
  next();
});

// Static file serving for uploads
app.use('/uploads', express.static('uploads', {
  maxAge: '7d', // 7 days cache for uploaded files
  etag: true, // Generate ETags for caching
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
  }
}));

// Routes
const productRoutes = require('./routes/productRoutes');
const craftsmenRoutes = require('./routes/craftsmenRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const recentActivitiesRoutes = require('./routes/recentActivitiesRoutes');

app.use('/api/products', productRoutes);
app.use('/api/craftsmen', craftsmenRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/recent-activities', recentActivitiesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Alibobo Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Alibobo Backend API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      craftsmen: '/api/craftsmen',
      notifications: '/api/notifications',
      orders: '/api/orders',
      statistics: '/api/statistics',
      upload: '/api/upload',
      recentActivities: '/api/recent-activities',
      health: '/api/health'
    }
  });
});

// Handle worker messages for graceful shutdown
if (cluster.isWorker) {
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      console.log(`🛑 Worker ${process.pid} received shutdown signal`);
      
      // Stop accepting new connections - server will be defined in startServer
      setTimeout(() => {
        console.log(`👋 Worker ${process.pid} closing server...`);
        process.exit(0);
      }, 1000);
    }
  });
}

// MongoDB Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ MongoDB URI is missing. Expected MONGODB_URI or MONGO_URI in environment.');
      return process.exit(1);
    }

    const usedVar = process.env.MONGODB_URI ? 'MONGODB_URI' : 'MONGO_URI';
    console.log(`ℹ️ Using ${usedVar} for MongoDB connection (value hidden)`);

    // Extra diagnostics
    mongoose.connection.on('connecting', () => console.log('⏳ MongoDB: connecting...'));
    mongoose.connection.on('connected', () => console.log('✅ MongoDB: connected'));
    mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB: disconnected'));
    mongoose.connection.on('reconnectFailed', () => console.log('❌ MongoDB: reconnect failed'));
    mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error event:', err?.message || err));

    // Performance optimized connection options
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // 15s to find a server
      connectTimeoutMS: 15000, // 15s network timeout
      socketTimeoutMS: 45000, // Longer socket timeout for operations
      maxPoolSize: 50, // Increased pool for concurrent requests
      minPoolSize: 5,  // Maintain minimum pool for faster response
      family: 4,       // Prefer IPv4 to avoid certain DNS/IPv6 issues on Windows
      // Add heartbeat mechanism to detect and prevent stale connections
      heartbeatFrequencyMS: 10000, // 10 seconds between heartbeats
      // Connection pool monitoring for diagnostics
      monitorCommands: process.env.NODE_ENV !== 'production',
      // Add buffer command options to improve performance during connection issues
      bufferCommands: true
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes if they don't exist (in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 Ensuring indexes...');
      const models = Object.values(mongoose.models);
      for (const model of models) {
        await model.ensureIndexes();
      }
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);
    
    // Implement exponential backoff for connection retries
    const retryDelay = parseInt(process.env.MONGO_RETRY_DELAY || 5000, 10);
    console.log(`🔄 Retrying connection in ${retryDelay/1000} seconds...`);
    setTimeout(connectDB, retryDelay);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
let server; // Global reference to server for graceful shutdown

const startServer = async () => {
  await connectDB();
  
  // Create HTTP server for Socket.IO integration
  const httpServer = http.createServer(app);
  
  // Initialize Socket.IO for real-time stock updates
  socketService.initialize(httpServer);
  
  console.log(`📡 Socket.IO initialized with standardized events:`);
  console.log(`  - stock:updated (productId, delta, newQuantity, orderId, ts)`);
  console.log(`  - order:updated (orderId, status, ts)`);
  console.log(`  - stock:bulk_updated (updates[], orderId, ts)`);
  console.log(`  - product:availability_changed (productId, isAvailable, reason, ts)`);
  console.log(`  - admin:notification (notification data + ts)`);
  
  if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    console.log(`⚠️  Redis adapter available for clustering: ${process.env.REDIS_URL}`);
    console.log(`⚠️  Uncomment Redis adapter code in server.js for production clustering`);
  }
  
  server = httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (${process.pid})`);
    console.log(`📡 API endpoints available`);
    console.log(`🔗 Socket.IO ready for real-time updates`);
    console.log(`📊 Cache-Control: API responses set to no-cache for real-time data`);
    
    if (enableClustering) {
      console.log(`📏 Worker ${process.pid} ready in cluster mode`);
    }
  });

  // Graceful shutdown handler
  const gracefulShutdown = async () => {
    console.log('🛑 Received shutdown signal, starting graceful shutdown...');
    
    // Attempt graceful shutdown of the server
    server.close((err) => {
      if (err) {
        console.error('❌ Error during server close:', err);
      } else {
        console.log('✅ HTTP server closed successfully');
      }
      
      // Close MongoDB connection
      mongoose.connection.close(false).then(() => {
        console.log('✅ MongoDB connection closed');
        console.log('👋 Goodbye!');
        process.exit(0); // Exit with success code
      }).catch(err => {
        console.error('❌ Error closing MongoDB connection:', err);
        process.exit(1); // Exit with error code
      });
    });
    
    // Force shutdown after timeout
    setTimeout(() => {
      console.error('⏱️ Graceful shutdown timed out after 10s, forcing exit');
      process.exit(1);
    }, 10000);
  };

  // Listen for termination signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  });
  
  return server;
};

startServer();

}
