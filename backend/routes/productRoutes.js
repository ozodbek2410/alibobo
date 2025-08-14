const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Get all products with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ 
      message: 'Mahsulotlarni olishda xatolik',
      error: error.message 
    });
  }
});

// GET /api/products/categories/list - Get all categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ category });
        return { name: category, count };
      })
    );

    res.json({
      categories: categoriesWithCount.sort((a, b) => b.count - a.count)
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ 
      message: 'Kategoriyalarni olishda xatolik',
      error: error.message 
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    res.json(product);
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ 
      message: 'Mahsulotni olishda xatolik',
      error: error.message 
    });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    
    // Create new product
    const product = new Product(productData);
    const savedProduct = await product.save();

    console.log('✅ Product created:', savedProduct._id);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ 
      message: 'Mahsulot yaratishda xatolik',
      error: error.message 
    });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find and update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    console.log('✅ Product updated:', updatedProduct._id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ 
      message: 'Mahsulotni yangilashda xatolik',
      error: error.message 
    });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    console.log('✅ Product deleted:', deletedProduct._id);
    res.json({ message: 'Mahsulot muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ 
      message: 'Mahsulotni o\'chirishda xatolik',
      error: error.message 
    });
  }
});

module.exports = router;
