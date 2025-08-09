const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// GET all products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    console.log('🔍 Backend search request:', { page, limit, search, category, sortBy, sortOrder });
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
      console.log('🔍 Search query:', query);
    }
    
    if (category) {
      query.category = category;
      console.log('🔍 Category filter:', category);
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Product.countDocuments(query);
    
    console.log('✅ Backend response:', { productsCount: products.length, totalCount: count });
    
    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    console.error('❌ Backend error:', error);
    res.status(500).json({ message: error.message });
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
    
    const { name, category, price, oldPrice, stock, image, description, brand, unit, status, badge } = req.body;
    
    console.log('🔍 Ajratilgan ma\'lumotlar:', { name, category, price, oldPrice, stock, image, description, brand, unit, status, badge });
    
    const product = new Product({
      name,
      category,
      price,
      oldPrice: oldPrice || null,
      stock: stock || 0,
      image,
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
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 