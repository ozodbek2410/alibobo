const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// In-memory cache for products
let productsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to check if cache is valid
const isCacheValid = (cacheEntry) => {
  return cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL);
};

// GET all products - OPTIMIZED
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Parse and validate parameters
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 50);
    const { search = '', category = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Create cache key
    const cacheKey = `${page}-${limit}-${search}-${category}-${sortBy}-${sortOrder}`;
    const cachedData = productsCache.get(cacheKey);
    
    // Return cached data if valid
    if (isCacheValid(cachedData)) {
      console.log('✅ Returning cached products data');
      // Set cache headers to help frontend caching
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'X-Cache': 'HIT',
        'Content-Type': 'application/json'
      });
      return res.json({
        ...cachedData.data,
        cached: true,
        queryTime: 0
      });
    }
    
    console.log('🔍 Backend search request:', { page, limit, search, category, sortBy, sortOrder });
    
    // Build optimized query
    const query = {};
    
    if (search && search.trim()) {
      // Use indexed fields for better performance
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    if (category && category.trim()) {
      query.category = category.trim();
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute queries in parallel for better performance
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .select('name price oldPrice category stock unit badge image images description createdAt updatedAt')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Product.countDocuments(query)
    ]);
    
    // Optimize products for list view - DRASTICALLY reduce payload
    const optimizedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      category: product.category,
      stock: product.stock,
      unit: product.unit,
      badge: product.badge,
      // Only send first image as string (not array) to reduce payload
      image: product.images?.[0] || product.image || '',
      // Remove images array for list view - only send on detail view
      // images: [], // Commented out to reduce payload
      // Truncate description significantly
      description: product.description?.substring(0, 50) || '',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
    
    const responseData = {
      products: optimizedProducts,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount,
      queryTime: Date.now() - startTime,
      cached: false
    };
    
    // Cache the response
    productsCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    // Clean old cache entries (simple cleanup)
    if (productsCache.size > 100) {
      const oldestKey = productsCache.keys().next().value;
      productsCache.delete(oldestKey);
    }
    
    // Set cache headers for fresh data
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'X-Cache': 'MISS',
      'Content-Type': 'application/json'
    });

    const payloadSize = JSON.stringify(responseData).length;
    console.log(`✅ Backend response: ${products.length} products in ${Date.now() - startTime}ms, payload: ${(payloadSize/1024).toFixed(2)}KB`);
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ Backend error:', error);
    res.status(500).json({ 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
    });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new product
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/products - Kelgan ma\'lumotlar:', req.body);
    
    const { name, category, price, oldPrice, stock, image, images, description, brand, unit, status, badge } = req.body;
    
    console.log('🔍 Ajratilgan ma\'lumotlar:', { name, category, price, oldPrice, stock, image, images, description, brand, unit, status, badge });
    
    const product = new Product({
      name,
      category,
      price,
      oldPrice: oldPrice || null,
      stock: stock || 0,
      image: image || '', // Keep for backward compatibility
      images: images || [], // New multiple images array
      description: description || '',
      brand: brand || '',
      unit: unit || 'dona',
      status: status || 'active',
      badge: badge || ''
    });
    
    console.log('💾 Saqlanayotgan mahsulot:', product);
    
    const newProduct = await product.save();
    console.log('✅ Mahsulot muvaffaqiyatli saqlandi:', newProduct._id);
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('❌ POST /api/products xatolik:', error.message);
    console.error('📋 Xatolik tafsilotlari:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    // Create notification for craftsman product edit
    if (product.craftsman && product.craftsman.name) {
      try {
        const changedFields = [];
        
        // Check what fields were changed
        if (oldProduct.name !== product.name) changedFields.push(`Nomi: "${product.name}"`);
        if (oldProduct.price !== product.price) changedFields.push(`Narxi: ${product.price} so'm`);
        if (oldProduct.stock !== product.stock) changedFields.push(`Zaxira: ${product.stock} ${product.unit}`);
        if (oldProduct.category !== product.category) changedFields.push(`Kategoriya: ${product.category}`);
        
        const changedFieldsText = changedFields.length > 0 
          ? changedFields.join(', ') 
          : 'Ma\'lumotlar yangilandi';

        const notification = new Notification({
          type: 'info',
          title: 'Usta mahsuloti tahrirlandi',
          message: `${product.craftsman.name} ustaning "${product.name}" mahsuloti tahrirlandi. ${changedFieldsText}`,
          icon: 'fas fa-edit',
          color: 'blue',
          entityType: 'product',
          entityId: product._id,
          entityName: product.name,
          action: 'updated'
        });

        await notification.save();
        console.log('✅ Usta mahsuloti tahrirlash notification yaratildi:', product.craftsman.name);
      } catch (notificationError) {
        console.error('❌ Notification yaratishda xatolik:', notificationError);
        // Don't fail the main request if notification fails
      }
    }
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }
    
    res.json({ message: 'Mahsulot muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET products count
router.get('/count/total', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET categories
router.get('/categories/list', async (req, res) => {
  try {
    // Predefined main categories (asosiy kategoriyalar) - matching main page
    const mainCategories = [
      'santexnika',
      'yevro-remont', 
      'elektrika',
      'xoz-mag',
      'dekorativ-mahsulotlar',
      'g\'isht-va-bloklar',
      'asbob-uskunalar',
      'bo\'yoq-va-lak',
      'elektr-mollalari',
      'issiqlik-va-konditsioner',
      'metall-va-armatura',
      'yog\'och-va-mebel',
      'tom-materiallar',
      'temir-beton',
      'gips-va-shpaklovka',
      'boshqalar'
    ];
    
    // Get additional categories from database products
    const dbCategories = await Product.distinct('category');
    
    // Combine main categories with any additional categories from database
    const allCategories = [...mainCategories];
    dbCategories.forEach(category => {
      if (category && !allCategories.includes(category)) {
        allCategories.push(category);
      }
    });
    
    console.log('📋 Returning categories:', allCategories);
    res.json(allCategories);
  } catch (error) {
    console.error('❌ Categories API error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 