const Craftsman = require('../models/Craftsman');
const Product = require('../models/Product');
const Order = require('../models/Order');

class StatisticsService {
  
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    try {
      console.log('📊 StatisticsService: Fetching dashboard statistics...');

      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Parallel execution of all statistics queries
      const [
        craftsmenStats,
        productsStats,
        ordersStats,
        revenueStats
      ] = await Promise.all([
        this._getCraftsmenStats(last7Days),
        this._getProductsStats(last7Days),
        this._getOrdersStats(last7Days),
        this._getRevenueStats(now)
      ]);

      const statistics = {
        craftsmen: craftsmenStats,
        products: productsStats,
        orders: ordersStats,
        revenue: revenueStats,
        lastUpdated: now.toISOString()
      };

      console.log('✅ StatisticsService: Dashboard statistics fetched successfully');
      return statistics;

    } catch (error) {
      console.error('❌ StatisticsService: Error fetching dashboard statistics:', error);
      throw new Error(`Ошибка при получении статистики: ${error.message}`);
    }
  }

  /**
   * Get edit/modification statistics
   */
  async getEditStats(days = 30) {
    try {
      console.log(`📝 StatisticsService: Fetching edit statistics for last ${days} days...`);

      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastNDays = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count edits (documents where updatedAt != createdAt)
      const [
        craftsmenEditsMonth,
        productsEditsMonth,
        ordersEditsMonth,
        craftsmenEditsWeek,
        productsEditsWeek,
        ordersEditsWeek,
        craftsmenEditsToday,
        productsEditsToday,
        ordersEditsToday
      ] = await Promise.all([
        // Month edits
        this._countEdits(Craftsman, lastNDays),
        this._countEdits(Product, lastNDays),
        this._countEdits(Order, lastNDays),
        
        // Week edits
        this._countEdits(Craftsman, last7Days),
        this._countEdits(Product, last7Days),
        this._countEdits(Order, last7Days),
        
        // Today edits
        this._countEdits(Craftsman, today),
        this._countEdits(Product, today),
        this._countEdits(Order, today)
      ]);

      const editStats = {
        total: craftsmenEditsMonth + productsEditsMonth + ordersEditsMonth,
        thisWeek: craftsmenEditsWeek + productsEditsWeek + ordersEditsWeek,
        thisMonth: craftsmenEditsMonth + productsEditsMonth + ordersEditsMonth,
        today: craftsmenEditsToday + productsEditsToday + ordersEditsToday,
        byType: {
          craftsmen: {
            month: craftsmenEditsMonth,
            week: craftsmenEditsWeek,
            today: craftsmenEditsToday
          },
          products: {
            month: productsEditsMonth,
            week: productsEditsWeek,
            today: productsEditsToday
          },
          orders: {
            month: ordersEditsMonth,
            week: ordersEditsWeek,
            today: ordersEditsToday
          }
        },
        lastUpdated: now.toISOString()
      };

      console.log('✅ StatisticsService: Edit statistics fetched successfully');
      return editStats;

    } catch (error) {
      console.error('❌ StatisticsService: Error fetching edit statistics:', error);
      throw new Error(`Ошибка при получении статистики редактирования: ${error.message}`);
    }
  }

  /**
   * Get revenue statistics with growth calculations
   */
  async getRevenueStats() {
    try {
      console.log('💰 StatisticsService: Fetching revenue statistics...');

      const now = new Date();
      const revenueStats = await this._getRevenueStats(now);

      console.log('✅ StatisticsService: Revenue statistics fetched successfully');
      return revenueStats;

    } catch (error) {
      console.error('❌ StatisticsService: Error fetching revenue statistics:', error);
      throw new Error(`Ошибка при получении статистики доходов: ${error.message}`);
    }
  }

  // Private helper methods

  async _getCraftsmenStats(last7Days) {
    const [total, active, inactive, busy, recentlyAdded] = await Promise.all([
      Craftsman.countDocuments(),
      Craftsman.countDocuments({ status: 'active' }),
      Craftsman.countDocuments({ status: 'inactive' }),
      Craftsman.countDocuments({ status: 'busy' }),
      Craftsman.countDocuments({ createdAt: { $gte: last7Days } })
    ]);

    return {
      total,
      active,
      inactive,
      busy,
      recentlyAdded
    };
  }

  async _getProductsStats(last7Days) {
    const [total, active, inactive, recentlyAdded, categories] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'inactive' }),
      Product.countDocuments({ createdAt: { $gte: last7Days } }),
      Product.distinct('category').then(categories => categories.length)
    ]);

    return {
      total,
      active,
      inactive,
      recentlyAdded,
      categories
    };
  }

  async _getOrdersStats(last7Days) {
    const [total, pending, processing, shipped, delivered, cancelled, recentlyCreated] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ createdAt: { $gte: last7Days } })
    ]);

    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      recentlyCreated
    };
  }

  async _getRevenueStats(now) {
    const [totalRevenueData, thisMonthData, lastMonthData] = await Promise.all([
      // Total revenue from all orders
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),
      
      // This month revenue
      Order.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: new Date(now.getFullYear(), now.getMonth(), 1) 
            }
          }
        },
        {
          $group: {
            _id: null,
            monthlyRevenue: { $sum: '$totalAmount' },
            monthlyOrders: { $sum: 1 }
          }
        }
      ]),
      
      // Last month revenue for growth calculation
      Order.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
              $lt: new Date(now.getFullYear(), now.getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            lastMonthRevenue: { $sum: '$totalAmount' },
            lastMonthOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalRevenue = totalRevenueData[0] || { totalRevenue: 0, averageOrderValue: 0, totalOrders: 0 };
    const thisMonth = thisMonthData[0] || { monthlyRevenue: 0, monthlyOrders: 0 };
    const lastMonth = lastMonthData[0] || { lastMonthRevenue: 0, lastMonthOrders: 0 };
    
    // Calculate growth percentage
    const growth = lastMonth.lastMonthRevenue > 0 
      ? Math.round(((thisMonth.monthlyRevenue - lastMonth.lastMonthRevenue) / lastMonth.lastMonthRevenue) * 100)
      : 0;

    return {
      total: Math.round(totalRevenue.totalRevenue || 0),
      thisMonth: Math.round(thisMonth.monthlyRevenue || 0),
      lastMonth: Math.round(lastMonth.lastMonthRevenue || 0),
      growth: growth,
      averageOrderValue: Math.round(totalRevenue.averageOrderValue || 0),
      totalOrders: totalRevenue.totalOrders || 0,
      thisMonthOrders: thisMonth.monthlyOrders || 0
    };
  }

  async _countEdits(Model, fromDate) {
    return await Model.countDocuments({
      updatedAt: { $gte: fromDate },
      $expr: { $ne: ['$createdAt', '$updatedAt'] }
    });
  }

  /**
   * Validate statistics data and provide fallbacks
   */
  _validateAndSanitize(data) {
    // Ensure all numeric values are valid
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        } else if (typeof obj[key] === 'number' && (isNaN(obj[key]) || !isFinite(obj[key]))) {
          obj[key] = 0;
        }
      }
    };

    sanitize(data);
    return data;
  }
}

module.exports = new StatisticsService();