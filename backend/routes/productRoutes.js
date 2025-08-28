const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { getProducts, getProductById, getCategories, clearCache, updateProduct, createProduct, softDeleteProduct, restoreProduct, setArchiveStatus } = require('../controllers/productController');

// GET /api/products - Get all products with optimized pagination and filtering
router.get('/', getProducts);

// GET /api/products/categories/list - Get all categories with counts (cached)
router.get('/categories/list', getCategories);

// GET /api/products/cache/clear - Clear cache (admin only)
router.get('/cache/clear', clearCache);

// GET /api/products/:id - Get single product (optimized)
router.get('/:id', getProductById);

// POST /api/products - Create new product
router.post('/', createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', updateProduct);

// PATCH /api/products/:id/archive - Toggle archive status (inactive/active)
router.patch('/:id/archive', setArchiveStatus);

// PATCH /api/products/:id/restore - Restore soft-deleted product
router.patch('/:id/restore', restoreProduct);

// DELETE /api/products/:id - Soft delete (archive) product
router.delete('/:id', softDeleteProduct);

module.exports = router;
