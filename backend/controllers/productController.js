const Product = require('../models/Product');

// Performance constants
const MAX_LIMIT = 1000; // Maximum items per page
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
    const debug = process.env.DEBUG_PRODUCTS === '1' || process.env.DEBUG_PRODUCTS === 'true';
    if (debug) {
      console.log('[getProducts] Incoming params:', {
        query: req.query,
        timestamp: new Date().toISOString()
      });
    }
    // Validate and sanitize pagination parameters
    const requestedLimit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));

    // Build optimized query object
    // Include legacy documents that may be missing `status` or `isDeleted`
    let query = {
      $and: [
        { $or: [ { status: 'active' }, { status: { $exists: false } } ] },
        { $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] }
      ]
    }; // Active or missing status, not-deleted or missing flag by default

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

    if (debug) {
      console.log('[getProducts] Built query & sorting:', { query, sortBy, sortOrder, sort });
    }

    // Cursor-based pagination support (preferred for large collections)
    const cursor = req.query.cursor; // expects a Mongo ObjectId string of the last seen item
    if (cursor) {
      // When using cursor, we return nextCursor without totalCount for performance
      // Adjust query for _id based cursor only if sorting is stable by _id desc/asc
      // If user sorts by something else, fallback to page-based mode
      const isIdSort = Object.keys(sort).length === 1 && Object.keys(sort)[0] === 'createdAt';
      if (!isIdSort) {
        // Fallback to page mode when sort is not compatible with cursor
      } else {
        // Translate cursor to createdAt boundary or _id boundary
        // Simpler: use _id cursor with default sort by createdAt desc typically correlates with _id
        if (cursor.match(/^[0-9a-fA-F]{24}$/)) {
          // For descending order, fetch items with _id < cursor
          const idCond = sort.createdAt === -1 ? { $lt: cursor } : { $gt: cursor };
          query._id = idCond;
        }
        const docs = await Product.find(query)
          .sort({ _id: sort.createdAt === -1 ? -1 : 1 })
          .limit(limit + 1)
          .lean();

        const hasNext = docs.length > limit;
        const items = hasNext ? docs.slice(0, limit) : docs;
        const nextCursor = hasNext ? String(items[items.length - 1]._id) : null;

        const payload = {
          products: items,
          pagination: {
            mode: 'cursor',
            limit,
            nextCursor,
            hasNextPage: !!nextCursor,
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
          performance: { cached: false }
        };

        if (debug) {
          console.log('[getProducts] Cursor mode result:', {
            returned: items.length,
            hasNext,
            nextCursor
          });
        }

        return res.json(payload);
      }
    }

    // Page-based mode (default)
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * limit;
    if (debug) {
      console.log('[getProducts] Page mode:', { page, limit, skip });
    }

    // Check cache first (only for non-search queries to avoid stale search results)
    const cacheKey = getCacheKey(query, page, limit, sort);
    if (!req.query.search) {
      const cachedResult = getFromCache(cacheKey);
      if (cachedResult) {
        if (debug) {
          console.log('[getProducts] Serving from cache with totalCount:', cachedResult?.pagination?.totalCount);
        }
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

    if (debug) {
      console.log('[getProducts] Aggregation result:', {
        returned: products.length,
        totalCount,
        totalPages
      });
    }

    // Prepare response
    const response = {
      products,
      pagination: {
        mode: 'page',
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
        cached: false
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
      status: 'active',
      isDeleted: false
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
      { $match: { status: 'active', isDeleted: false } },
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

// Soft delete (archive) product
const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, status: 'inactive' } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Mahsulot topilmadi' });
    // Invalidate simple cache
    cache.clear();
    res.json({ message: 'Mahsulot arxivlandi (soft-delete)', product: updated });
  } catch (error) {
    console.error('❌ Soft delete product error:', error);
    res.status(500).json({ message: 'Mahsulotni arxivlashda xatolik', error: error.message });
  }
};

// Restore product from soft-delete
const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false, status: 'active' } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Mahsulot topilmadi' });
    cache.clear();
    res.json({ message: 'Mahsulot tiklandi', product: updated });
  } catch (error) {
    console.error('❌ Restore product error:', error);
    res.status(500).json({ message: 'Mahsulotni tiklashda xatolik', error: error.message });
  }
};

// Archive/unarchive without deletion (toggle status)
const setArchiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body; // boolean
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { status: archived ? 'inactive' : 'active' } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Mahsulot topilmadi' });
    cache.clear();
    res.json({ message: archived ? 'Mahsulot arxivlandi' : 'Mahsulot faollashtirildi', product: updated });
  } catch (error) {
    console.error('❌ Set archive status error:', error);
    res.status(500).json({ message: 'Arxiv holatini o\'zgartirishda xatolik', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  clearCache,
  softDeleteProduct,
  restoreProduct,
  setArchiveStatus
};
