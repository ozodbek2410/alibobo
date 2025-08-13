const Product = require('../models/Product');

// Get all products with pagination, filtering, and search
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query object
    let query = {};
    
    // Category filter
    if (req.query.category && req.query.category !== '') {
      query.category = { $regex: req.query.category, $options: 'i' };
    }
    
    // Search functionality
    if (req.query.search && req.query.search.trim() !== '') {
      const searchRegex = { $regex: req.query.search.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }
    
    // Get total count for pagination
    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    
    // Fetch products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance
    
    // Return response
    res.json({
      products,
      totalPages,
      currentPage: page,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
};

module.exports = {
  getProducts
};
