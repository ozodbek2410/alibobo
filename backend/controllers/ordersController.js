const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Simple in-memory cache with TTL
const cache = {
  orders: {
    data: {},
    expiry: {}
  },
  orderStats: {
    data: null,
    expiry: 0
  }
};

const CACHE_TTL = 60 * 1000; // 60 seconds cache TTL for orders
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL for stats

// Helper to generate cache key from query parameters
const generateCacheKey = (params) => {
  return Object.entries(params || {})
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
};

// Helper to get or set cache
const getCachedOrCompute = async (cacheKey, queryParams, ttl, computeFn) => {
  const queryHash = generateCacheKey(queryParams);
  const now = Date.now();
  
  // Return from cache if valid
  if (cache[cacheKey].data[queryHash] && cache[cacheKey].expiry[queryHash] > now) {
    console.log(`Cache hit for ${cacheKey} with key ${queryHash}`);
    return cache[cacheKey].data[queryHash];
  }
  
  // Compute fresh data
  console.log(`Cache miss for ${cacheKey} with key ${queryHash}`);
  const freshData = await computeFn();
  
  // Update cache
  cache[cacheKey].data[queryHash] = freshData;
  cache[cacheKey].expiry[queryHash] = now + ttl;
  
  return freshData;
};

// Invalidate specific cache entries or everything
const invalidateCache = (cacheKey = null, queryHash = null) => {
  if (!cacheKey) {
    // Invalidate all caches
    Object.keys(cache).forEach(key => {
      cache[key].data = {};
      cache[key].expiry = {};
    });
    return;
  }
  
  if (!queryHash) {
    // Invalidate entire cacheKey
    cache[cacheKey].data = {};
    cache[cacheKey].expiry = {};
    return;
  }
  
  // Invalidate specific queryHash
  if (cache[cacheKey].data[queryHash]) {
    delete cache[cacheKey].data[queryHash];
    delete cache[cacheKey].expiry[queryHash];
  }
};

// GET all orders with pagination and filtering
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Extract query params for cache key
    const queryParams = { page, limit, status, search, sortBy, sortOrder };
    
    // Use caching for common queries to reduce DB load
    const ordersData = await getCachedOrCompute('orders', queryParams, CACHE_TTL, async () => {
      // Build MongoDB query
      const query = {};
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      // Optimize search query
      if (search) {
        // Use text index if the search seems to be a text search
        if (search.length > 3) {
          // Check if text search or phone number
          const isPhoneSearch = /^\+?\d+$/.test(search);
          
          if (isPhoneSearch) {
            // Direct index match on phone number
            query.customerPhone = { $regex: search, $options: 'i' };
          } else {
            // Use text index for other searches
            query.$text = { $search: search };
          }
        } else {
          // For short searches, use regex but only on indexed fields
          query.$or = [
            { customerName: { $regex: search, $options: 'i' } },
            { customerPhone: { $regex: search, $options: 'i' } }
          ];
        }
      }
      
      // Set up sorting for optimized index use
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      // Perform both queries concurrently for better performance
      const [orders, count] = await Promise.all([
        Order.find(query)
          .sort(sortOptions)
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit))
          .lean() // Return plain JavaScript objects instead of Mongoose documents for better performance
          .exec(),
        Order.countDocuments(query)
      ]);
      
      return {
        orders,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        totalCount: count
      };
    });
    
    res.json(ordersData);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error.message 
    });
  }
};

// GET single order by ID
const getOrderById = async (req, res) => {
  try {
    // Generate cache key
    const orderId = req.params.id;
    const queryParams = { id: orderId };
    
    // Use cache for individual order lookups
    const order = await getCachedOrCompute('orders', queryParams, CACHE_TTL, async () => {
      return await Order.findById(orderId).lean();
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order',
      message: error.message 
    });
  }
};

// POST create new order with inventory synchronization
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const orderData = req.body;
      
      // Validate that all items have productId
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Buyurtmada hech bo\'lmaganda bitta mahsulot bo\'lishi kerak');
      }
      
      // Check each item has required productId
      for (const item of orderData.items) {
        if (!item.productId) {
          throw new Error(`Mahsulot ID kiritilmagan: ${item.name}`);
        }
        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
          throw new Error(`Noto\'g\'ri mahsulot ID: ${item.productId}`);
        }
      }
      
      // Step 1: Check product availability and prepare stock updates
      const stockChecks = orderData.items.map(async (item) => {
        const product = await Product.findById(item.productId).session(session);
        
        if (!product) {
          throw new Error(`Mahsulot topilmadi: ${item.name}`);
        }
        
        if (product.status !== 'active' || product.isDeleted) {
          throw new Error(`Mahsulot mavjud emas: ${product.name}`);
        }
        
        // Check if product has variants
        if (product.hasVariants && product.variants && product.variants.length > 0) {
          // For variant products, check specific variant stock
          if (!item.variantOption) {
            throw new Error(`Variant tanlanmagan: ${product.name}`);
          }
          
          let variantFound = false;
          let variantStock = 0;
          
          for (const variant of product.variants) {
            const option = variant.options.find(opt => opt.value === item.variantOption);
            if (option) {
              variantFound = true;
              variantStock = option.stock || 0;
              break;
            }
          }
          
          if (!variantFound) {
            throw new Error(`Variant topilmadi: ${item.variantOption} - ${product.name}`);
          }
          
          if (variantStock < item.quantity) {
            throw new Error(`Yetarli miqdor yo\'q: ${product.name} (${item.variantOption}). Mavjud: ${variantStock}, Talab: ${item.quantity}`);
          }
        } else {
          // For regular products, check main stock
          if (product.stock < item.quantity) {
            throw new Error(`Yetarli miqdor yo\'q: ${product.name}. Mavjud: ${product.stock}, Talab: ${item.quantity}`);
          }
        }
        
        return { product, item };
      });
      
      // Wait for all stock checks to complete
      const checkedItems = await Promise.all(stockChecks);
      
      // Step 2: Update product quantities atomically in parallel
      const stockUpdates = checkedItems.map(({ product, item }) => {
        if (product.hasVariants && product.variants && product.variants.length > 0) {
          // Update variant stock
          return Product.updateOne(
            { 
              _id: product._id,
              'variants.options.value': item.variantOption 
            },
            { 
              $inc: { 'variants.$[variant].options.$[option].stock': -item.quantity } 
            },
            {
              arrayFilters: [
                { 'variant.options.value': item.variantOption },
                { 'option.value': item.variantOption }
              ],
              session
            }
          );
        } else {
          // Update main product stock
          return Product.updateOne(
            { _id: product._id },
            { $inc: { stock: -item.quantity } },
            { session }
          );
        }
      });
      
      // Execute all stock updates in parallel
      await Promise.all(stockUpdates);
      
      // Step 3: Create the order
      const order = new Order(orderData);
      const savedOrder = await order.save({ session });
      
      // Invalidate cache after successful order creation
      invalidateCache();
      
      // Return the saved order for the transaction result
      return savedOrder;
    });
    
    // Transaction completed successfully, respond with the created order
    res.status(201).json({
      success: true,
      message: 'Buyurtma muvaffaqiyatli yaratildi',
      order: session.result || session.transaction.result
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ 
      error: 'Buyurtma yaratishda xatolik',
      message: error.message 
    });
  } finally {
    await session.endSession();
  }
};

// PUT update order
const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndUpdate(
      orderId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' });
    }
    
    // Invalidate cache for this order and any list that might contain it
    invalidateCache('orders');
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ 
      error: 'Failed to update order',
      message: error.message 
    });
  }
};

// PUT update order status
const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { status } = req.body;
      const orderId = req.params.id;
      
      // Get current order to check for status changes
      const currentOrder = await Order.findById(orderId).session(session);
      
      if (!currentOrder) {
        throw new Error('Buyurtma topilmadi');
      }
      
      const updateData = { status };
      
      if (status === 'completed') {
        updateData.completedDate = new Date();
      } else if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
        // If changing to cancelled, restore inventory
        updateData.cancelledDate = new Date();
        
        // Restore product quantities in parallel
        const stockRestorations = currentOrder.items.map(async (item) => {
          const product = await Product.findById(item.productId).session(session);
          
          if (!product) {
            console.warn(`Mahsulot topilmadi inventory qaytarish uchun: ${item.name}`);
            return; // Skip if product not found
          }
          
          // Check if product has variants
          if (product.hasVariants && product.variants && product.variants.length > 0 && item.variantOption) {
            // Restore variant stock
            return Product.updateOne(
              { 
                _id: product._id,
                'variants.options.value': item.variantOption 
              },
              { 
                $inc: { 'variants.$[variant].options.$[option].stock': item.quantity } 
              },
              {
                arrayFilters: [
                  { 'variant.options.value': item.variantOption },
                  { 'option.value': item.variantOption }
                ],
                session
              }
            );
          } else {
            // Restore main product stock
            return Product.updateOne(
              { _id: product._id },
              { $inc: { stock: item.quantity } },
              { session }
            );
          }
        });
        
        // Execute all stock restorations in parallel
        await Promise.all(stockRestorations.filter(Boolean));
      }
      
      const order = await Order.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true, session }
      );
      
      // Invalidate cache
      invalidateCache();
      
      return order;
    });
    
    res.json({
      success: true,
      message: 'Buyurtma holati muvaffaqiyatli yangilandi'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ 
      error: 'Buyurtma holatini yangilashda xatolik',
      message: error.message 
    });
  } finally {
    await session.endSession();
  }
};

// DELETE order
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndDelete(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Buyurtma topilmadi' });
    }
    
    // Invalidate all order caches
    invalidateCache('orders');
    invalidateCache('orderStats');
    
    res.json({ message: 'Buyurtma muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      error: 'Failed to delete order',
      message: error.message 
    });
  }
};

// GET order statistics
const getOrderStats = async (req, res) => {
  try {
    // Use stats cache to avoid expensive aggregations
    const stats = await getCachedOrCompute('orderStats', { key: 'stats' }, STATS_CACHE_TTL, async () => {
      // Use Promise.all for concurrent queries
      const [
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        revenueResults
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'processing' }),
        Order.countDocuments({ status: 'completed' }),
        Order.countDocuments({ status: 'cancelled' }),
        Order.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);
      
      return {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: revenueResults[0]?.total || 0
      };
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order statistics',
      message: error.message 
    });
  }
};

// PUT cancel order and restore inventory
const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const orderId = req.params.id;
      
      // Step 1: Find the order to cancel
      const order = await Order.findById(orderId).session(session);
      
      if (!order) {
        throw new Error('Buyurtma topilmadi');
      }
      
      if (order.status === 'cancelled') {
        throw new Error('Buyurtma allaqachon bekor qilingan');
      }
      
      if (order.status === 'completed') {
        throw new Error('Yakunlangan buyurtmani bekor qilish mumkin emas');
      }
      
      // Step 2: Restore product quantities in parallel
      const stockRestorations = order.items.map(async (item) => {
        const product = await Product.findById(item.productId).session(session);
        
        if (!product) {
          console.warn(`Mahsulot topilmadi inventory qaytarish uchun: ${item.name}`);
          return; // Skip if product not found, but don't fail the cancellation
        }
        
        // Check if product has variants
        if (product.hasVariants && product.variants && product.variants.length > 0 && item.variantOption) {
          // Restore variant stock
          return Product.updateOne(
            { 
              _id: product._id,
              'variants.options.value': item.variantOption 
            },
            { 
              $inc: { 'variants.$[variant].options.$[option].stock': item.quantity } 
            },
            {
              arrayFilters: [
                { 'variant.options.value': item.variantOption },
                { 'option.value': item.variantOption }
              ],
              session
            }
          );
        } else {
          // Restore main product stock
          return Product.updateOne(
            { _id: product._id },
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      });
      
      // Execute all stock restorations in parallel
      await Promise.all(stockRestorations.filter(Boolean)); // Filter out undefined promises
      
      // Step 3: Update order status to cancelled
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { 
          status: 'cancelled',
          cancelledDate: new Date()
        },
        { new: true, session }
      );
      
      // Invalidate cache after successful cancellation
      invalidateCache();
      
      return updatedOrder;
    });
    
    res.json({
      success: true,
      message: 'Buyurtma muvaffaqiyatli bekor qilindi va mahsulot miqdorlari qaytarildi'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(400).json({ 
      error: 'Buyurtmani bekor qilishda xatolik',
      message: error.message 
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getOrderStats
};
