const express = require('express');
const mongoose = require('mongoose');
const { productCacheMiddleware, searchCacheMiddleware, categoryCacheMiddleware } = require('../utils/cache');
const performanceMiddleware = require('../middleware/performance');

const router = express.Router();

// Применяем middleware производительности
router.use(performanceMiddleware.performanceMonitor);
router.use(performanceMiddleware.compression);
router.use(performanceMiddleware.etag);

// Модель товара (предполагаем, что она уже существует)
const Product = require('../models/Product');

// Оптимизированный эндпоинт для получения товаров с пагинацией
router.get('/', 
  productCacheMiddleware, // Кэш на 5 минут
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        search,
        minPrice,
        maxPrice,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        fields = 'name,price,image,category,description'
      } = req.query;

      // Валидация параметров
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Максимум 50 товаров за раз
      const skip = (pageNum - 1) * limitNum;

      // Построение фильтра
      const filter = {};
      
      if (category && category !== 'all') {
        filter.category = category;
      }
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseInt(minPrice);
        if (maxPrice) filter.price.$lte = parseInt(maxPrice);
      }

      // Построение сортировки
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Выбор полей для оптимизации трафика
      const selectedFields = fields.split(',').join(' ');

      // Используем aggregation pipeline для более эффективных запросов
      const pipeline = [
        { $match: filter },
        {
          $facet: {
            products: [
              { $sort: sort },
              { $skip: skip },
              { $limit: limitNum },
              { $project: selectedFields.split(' ').reduce((acc, field) => {
                acc[field] = 1;
                return acc;
              }, {}) }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ];

      const [result] = await Product.aggregate(pipeline);
      const products = result.products;
      const totalCount = result.totalCount[0]?.count || 0;

      // Метаданные для пагинации
      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      // Добавляем заголовки для клиента
      res.set({
        'X-Total-Count': totalCount.toString(),
        'X-Page': pageNum.toString(),
        'X-Per-Page': limitNum.toString(),
        'X-Total-Pages': totalPages.toString()
      });

      res.json({
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        },
        performance: {
          cached: res.getHeader('X-Cache') === 'HIT',
          responseTime: res.getHeader('X-Response-Time')
        }
      });

    } catch (error) {
      console.error('Ошибка при получении товаров:', error);
      res.status(500).json({
        error: 'Ошибка сервера при получении товаров',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Оптимизированный поиск с автодополнением
router.get('/search/suggestions',
  searchCacheMiddleware, // Кэш на 3 минуты
  async (req, res) => {
    try {
      const { q, limit = 5 } = req.query;
      
      if (!q || q.length < 2) {
        return res.json({ suggestions: [] });
      }

      const suggestions = await Product.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: q, $options: 'i' } },
              { category: { $regex: q, $options: 'i' } }
            ]
          }
        },
        {
          $group: {
            _id: '$name',
            category: { $first: '$category' },
            price: { $first: '$price' }
          }
        },
        { $limit: parseInt(limit) },
        {
          $project: {
            name: '$_id',
            category: 1,
            price: 1,
            _id: 0
          }
        }
      ]);

      res.json({ suggestions });

    } catch (error) {
      console.error('Ошибка поиска:', error);
      res.status(500).json({ error: 'Ошибка поиска' });
    }
  }
);

// Получение категорий с количеством товаров
router.get('/categories',
  categoryCacheMiddleware, // Кэш на 10 минут
  async (req, res) => {
    try {
      const categories = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        },
        {
          $project: {
            name: '$_id',
            count: 1,
            avgPrice: { $round: ['$avgPrice', 0] },
            minPrice: 1,
            maxPrice: 1,
            _id: 0
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({ categories });

    } catch (error) {
      console.error('Ошибка получения категорий:', error);
      res.status(500).json({ error: 'Ошибка получения категорий' });
    }
  }
);

// Получение одного товара с оптимизацией
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Неверный ID товара' });
    }

    const product = await Product.findById(id).lean();
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Получаем похожие товары той же категории
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: id }
    })
    .select('name price image')
    .limit(4)
    .lean();

    res.json({
      product,
      relatedProducts
    });

  } catch (error) {
    console.error('Ошибка получения товара:', error);
    res.status(500).json({ error: 'Ошибка получения товара' });
  }
});

// Статистика производительности API
router.get('/admin/performance', async (req, res) => {
  try {
    const { productCache, categoryCache, searchCache } = require('../utils/cache');
    
    const stats = {
      cache: {
        products: productCache?.getStats() || {},
        categories: categoryCache?.getStats() || {},
        search: searchCache?.getStats() || {}
      },
      database: {
        totalProducts: await Product.countDocuments(),
        categories: await Product.distinct('category').then(cats => cats.length)
      },
      timestamp: new Date().toISOString()
    };

    res.json(stats);

  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

module.exports = router;