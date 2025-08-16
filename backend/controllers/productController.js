const Product = require('../models/Product');

// Performance constants
const MAX_LIMIT = 50; // Maximum items per page
const DEFAULT_LIMIT = 20; // Default items per page
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Simple in-memory cache for frequently accessed data
const cache = new Map();

// Cache helper functions
const getCacheKey = (query, page, limit, sort) => {
  return JSON.stringify({ query, page, limit, sort });
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  // Limit cache size to prevent memory issues
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
};

// Get all products with optimized pagination, filtering, and search
const getProducts = async (req, res) => {
  try {
    // Validate and sanitize pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const requestedLimit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));
    const skip = (page - 1) * limit;
    
    // Build optimized query object
    let query = { status: 'active' }; // Only show active products by default
    
    // Category filter - use exact match for better index usage
    if (req.query.category && req.query.category.trim() !== '') {
      query.category = req.query.category.trim();
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }
    
    // Stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }
    
    // Popular/New filters
    if (req.query.isPopular === 'true') {
      query.isPopular = true;
    }
    if (req.query.isNew === 'true') {
      query.isNew = true;
    }
    
    // Badge filter
    if (req.query.badge && req.query.badge !== '') {
      query.badge = req.query.badge;
    }
    
    // Build sort object
    let sort = {};
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Validate sort field to prevent injection
    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'price', 'rating'];
    if (allowedSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder;
    } else {
      sort.createdAt = -1; // Default sort
    }
    
    // Search functionality - use text index for better performance
    if (req.query.search && req.query.search.trim() !== '') {
      const searchTerm = req.query.search.trim();
      
      // Use MongoDB text search for better performance
      query.$text = { $search: searchTerm };
      
      // Add text score for relevance sorting
      if (!req.query.sortBy) {
        sort = { score: { $meta: 'textScore' }, createdAt: -1 };
      }
    }
    
    // Check cache first (only for non-search queries to avoid stale search results)
    const cacheKey = getCacheKey(query, page, limit, sort);
    if (!req.query.search) {
      const cachedResult = getFromCache(cacheKey);
      if (cachedResult) {
        return res.json({
          ...cachedResult,
          cached: true,
          cacheTime: new Date().toISOString()
        });
      }
    }
    
    // Use aggregation pipeline for complex queries with better performance
    const pipeline = [
      { $match: query },
      { $sort: sort },
      {
        $facet: {
          products: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                name: 1,
                price: 1,
                oldPrice: 1,
                description: 1,
                category: 1,
                image: 1,
                images: 1,
                stock: 1,
                unit: 1,
                badge: 1,
                rating: 1,
                isNew: 1,
                isPopular: 1,
                hasVariants: 1,
                variants: 1,
                createdAt: 1,
                updatedAt: 1,
                // Include text score if searching
                ...(req.query.search && { score: { $meta: 'textScore' } })
              }
            }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];
    
    const [result] = await Product.aggregate(pipeline);
    const products = result.products;
    const totalCount = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Prepare response
    const response = {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      },
      filters: {
        category: req.query.category || null,
        minPrice: req.query.minPrice || null,
        maxPrice: req.query.maxPrice || null,
        inStock: req.query.inStock === 'true',
        isPopular: req.query.isPopular === 'true',
        isNew: req.query.isNew === 'true',
        badge: req.query.badge || null,
        search: req.query.search || null
      },
      sorting: {
        sortBy,
        sortOrder: req.query.sortOrder || 'desc'
      },
      performance: {
        cached: false,
        queryTime: Date.now()
      }
    };
    
    // Cache the result (only for non-search queries)
    if (!req.query.search) {
      setCache(cacheKey, response);
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get single product by ID with optimized query
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid product ID format',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check cache first
    const cacheKey = `product_${id}`;
    const cachedProduct = getFromCache(cacheKey);
    if (cachedProduct) {
      return res.json({
        ...cachedProduct,
        cached: true
      });
    }
    
    // Find product with optimized query
    const product = await Product.findOne({ 
      _id: id, 
      status: 'active' 
    }).lean();
    
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Cache the result
    setCache(cacheKey, { product });
    
    res.json({ product });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get product categories with counts (cached)
const getCategories = async (req, res) => {
  try {
    const cacheKey = 'categories_with_counts';
    const cachedCategories = getFromCache(cacheKey);
    
    if (cachedCategories) {
      return res.json({
        ...cachedCategories,
        cached: true
      });
    }
    
    // Aggregate categories with product counts
    const categories = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const response = { categories };
    setCache(cacheKey, response);
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Clear cache (for admin use)
const clearCache = (req, res) => {
  cache.clear();
  res.json({
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  clearCache
};
