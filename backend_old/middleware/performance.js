const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Set response time header before response is sent
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Only set header if headers haven't been sent yet
    if (!res.headersSent) {
      res.set('X-Response-Time', `${responseTime}ms`);
    }
    
    // Log slow requests (>1s)
    if (responseTime > 1000) {
      console.log(`⚠️ Slow request: ${req.method} ${req.url} - ${responseTime}ms`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Compress all responses by default
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses larger than 1KB
});

// Security middleware
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
    },
  },
});

// Static cache middleware
const staticCache = (req, res, next) => {
  // Cache static assets for 1 year
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
};

// ETag and conditional GET middleware
const etagMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Generate ETag for API responses
    if (req.url.startsWith('/api/') && data) {
      const etag = `"${Buffer.from(data).toString('base64').slice(0, 16)}"`;
      res.set('ETag', etag);
      
      // Check if client has cached version
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// CORS optimization
const corsMiddleware = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your production domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'If-None-Match'],
  exposedHeaders: ['X-Response-Time', 'X-Cache', 'ETag'],
});

module.exports = {
  compression: compressionMiddleware,
  helmet: helmetMiddleware,
  staticCache,
  etag: etagMiddleware,
  cors: corsMiddleware,
  performanceMonitor,
};