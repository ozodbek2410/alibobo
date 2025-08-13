const express = require('express');
const router = express.Router();
const { getProducts } = require('../controllers/productController');

// GET /api/products - Get all products with pagination and filtering
router.get('/', getProducts);

module.exports = router;
