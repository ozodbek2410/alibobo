const express = require('express');
const router = express.Router();

// Import models
const Product = require('../models/Product');
const Craftsman = require('../models/Craftsman');
const Order = require('../models/Order');

// GET /api/statistics/dashboard - Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get current date info
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Count totals
    const [
      totalProducts,
      totalCraftsmen,
      totalOrders,
      thisMonthOrders,
      lastMonthOrders
    ] = await Promise.all([
      Product.countDocuments(),
      Craftsman.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ 
        createdAt: { 
          $gte: startOfLastMonth, 
          $lte: endOfLastMonth 
        } 
      })
    ]);

    // Calculate revenue (if orders have totalAmount field)
    const revenueAggregation = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const thisMonthRevenueAgg = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startOfMonth } }
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const lastMonthRevenueAgg = await Order.aggregate([
      {
        $match: { 
          createdAt: { 
            $gte: startOfLastMonth, 
            $lte: endOfLastMonth 
          } 
        }
      },
      {
        $group: {
          _id: null,
          lastMonthRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const thisMonthRevenue = thisMonthRevenueAgg[0]?.monthlyRevenue || 0;
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.lastMonthRevenue || 0;

    // Calculate growth percentages
    const ordersGrowth = lastMonthOrders > 0 
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Get active craftsmen
    const activeCraftsmen = await Craftsman.countDocuments({ status: 'active' });

    // Get products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id customerName totalAmount status createdAt');

    const statistics = {
      products: {
        total: totalProducts,
        byCategory: productsByCategory
      },
      craftsmen: {
        total: totalCraftsmen,
        active: activeCraftsmen,
        inactive: totalCraftsmen - activeCraftsmen
      },
      orders: {
        total: totalOrders,
        thisMonth: thisMonthOrders,
        lastMonth: lastMonthOrders,
        growth: Math.round(ordersGrowth * 100) / 100,
        recent: recentOrders
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: Math.round(revenueGrowth * 100) / 100
      },
      timestamp: new Date().toISOString()
    };

    res.json(statistics);
  } catch (error) {
    console.error('❌ Dashboard statistics error:', error);
    res.status(500).json({ 
      message: 'Statistika olishda xatolik',
      error: error.message 
    });
  }
});

// GET /api/statistics/edits - Edit statistics
router.get('/edits', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    // Calculate date ranges
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Count updates (assuming updatedAt field exists)
    const [
      totalEdits,
      todayEdits,
      weeklyEdits
    ] = await Promise.all([
      // Count products updated in the specified period
      Product.countDocuments({ 
        updatedAt: { $gte: startDate },
        createdAt: { $ne: '$updatedAt' } // Only count actual edits, not new creations
      }),
      // Today's edits
      Product.countDocuments({ 
        updatedAt: { $gte: startOfToday },
        createdAt: { $ne: '$updatedAt' }
      }),
      // This week's edits
      Product.countDocuments({ 
        updatedAt: { $gte: startOfWeek },
        createdAt: { $ne: '$updatedAt' }
      })
    ]);

    // Get edit activity by day (last 7 days)
    const editsByDay = await Product.aggregate([
      {
        $match: {
          updatedAt: { $gte: startOfWeek },
          $expr: { $ne: ['$createdAt', '$updatedAt'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$updatedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Most edited products
    const mostEditedProducts = await Product.aggregate([
      {
        $match: {
          updatedAt: { $gte: startDate },
          $expr: { $ne: ['$createdAt', '$updatedAt'] }
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          editCount: { $sum: 1 },
          lastEdit: { $max: '$updatedAt' }
        }
      },
      {
        $sort: { editCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const editStats = {
      total: totalEdits,
      today: todayEdits,
      thisWeek: weeklyEdits,
      period: days,
      byDay: editsByDay,
      mostEdited: mostEditedProducts,
      timestamp: new Date().toISOString()
    };

    res.json(editStats);
  } catch (error) {
    console.error('❌ Edit statistics error:', error);
    res.status(500).json({ 
      message: 'Tahrirlash statistikasini olishda xatolik',
      error: error.message 
    });
  }
});

// GET /api/statistics/summary - Quick summary for cards
router.get('/summary', async (req, res) => {
  try {
    const [totalProducts, totalCraftsmen, totalOrders] = await Promise.all([
      Product.countDocuments(),
      Craftsman.countDocuments(),
      Order.countDocuments()
    ]);

    res.json({
      products: totalProducts,
      craftsmen: totalCraftsmen,
      orders: totalOrders,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Summary statistics error:', error);
    res.status(500).json({ 
      message: 'Umumiy statistika olishda xatolik',
      error: error.message 
    });
  }
});

module.exports = router;