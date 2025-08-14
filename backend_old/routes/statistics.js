const express = require('express');
const router = express.Router();
const StatisticsService = require('../services/StatisticsService');

// GET dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const statistics = await StatisticsService.getDashboardStats();
    res.json(statistics);
  } catch (error) {
    console.error('❌ Error in dashboard statistics route:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении статистики',
      error: error.message 
    });
  }
});

// GET edit statistics
router.get('/edits', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const editStats = await StatisticsService.getEditStats(days);
    res.json(editStats);
  } catch (error) {
    console.error('❌ Error in edit statistics route:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении статистики редактирования',
      error: error.message 
    });
  }
});

// GET revenue statistics
router.get('/revenue', async (req, res) => {
  try {
    const revenueStats = await StatisticsService.getRevenueStats();
    res.json(revenueStats);
  } catch (error) {
    console.error('❌ Error in revenue statistics route:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении статистики доходов',
      error: error.message 
    });
  }
});

module.exports = router;