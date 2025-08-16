const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { getProducts, getProductById, getCategories, clearCache } = require('../controllers/productController');

// GET /api/products - Get all products with optimized pagination and filtering
router.get('/', getProducts);

// GET /api/products/categories/list - Get all categories with counts (cached)
router.get('/categories/list', getCategories);

// GET /api/products/cache/clear - Clear cache (admin only)
router.get('/cache/clear', clearCache);

// GET /api/products/:id - Get single product (optimized)
router.get('/:id', getProductById);

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
