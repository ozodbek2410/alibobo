const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all orders with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      orders,
      totalPages,
      currentPage: parseInt(page),
      totalCount: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;
    
    const orderData = {
      ...req.body,
      orderNumber
    };
    
    const order = new Order(orderData);
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 