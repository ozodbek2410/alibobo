const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', sortBy = 'orderDate', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const orders = await Order.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new order
router.post('/', async (req, res) => {
  try {
    console.log('📦 Yangi buyurtma qabul qilindi:', req.body);
    
    // Basic validation
    const { customerName, customerPhone, items, totalAmount } = req.body;
    
    if (!customerName || !customerPhone || !items || !totalAmount) {
      return res.status(400).json({ 
        message: 'Majburiy maydonlar to\'ldirilmagan',
        required: ['customerName', 'customerPhone', 'items', 'totalAmount']
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'Buyurtmada kamida bitta mahsulot bo\'lishi kerak' 
      });
    }

    const order = new Order(req.body);
    const newOrder = await order.save();
    
    console.log('✅ Buyurtma muvaffaqiyatli saqlandi:', newOrder._id);
    
    res.status(201).json({
      message: 'Buyurtma muvaffaqiyatli qabul qilindi',
      order: newOrder
    });
  } catch (error) {
    console.error('❌ Buyurtma saqlashda xatolik:', error.message);
    res.status(400).json({ 
      message: 'Buyurtma saqlashda xatolik: ' + error.message 
    });
  }
});

// PUT update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' });
    }
    
    res.json({ message: 'Buyurtma muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const updateData = { status };
    if (status === 'completed') {
      updateData.completedDate = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET orders count
router.get('/count/total', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET orders by status count
router.get('/count/by-status', async (req, res) => {
  try {
    const pending = await Order.countDocuments({ status: 'pending' });
    const processing = await Order.countDocuments({ status: 'processing' });
    const completed = await Order.countDocuments({ status: 'completed' });
    const cancelled = await Order.countDocuments({ status: 'cancelled' });
    
    res.json({
      pending,
      processing,
      completed,
      cancelled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 