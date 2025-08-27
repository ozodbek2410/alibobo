import { useState, useEffect, useCallback } from 'react';

const useStatistics = (autoRefresh = true, refreshInterval = 300000) => { // 5 minutes default
  const [statistics, setStatistics] = useState(null);
  const [editStats, setEditStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/statistics/dashboard');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dashboard API Error:', response.status, errorText);
        
        // Return fallback data if API fails
        const fallbackData = {
          products: { total: 0, byCategory: [] },
          craftsmen: { total: 0, active: 0, inactive: 0 },
          orders: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0, recent: [] },
          revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
          timestamp: new Date().toISOString()
        };
        
        setStatistics(fallbackData);
        setLastUpdated(new Date());
        setError(null); // Don't show error for fallback data
        return fallbackData;
      }

      const data = await response.json();

      setStatistics(data);
      setLastUpdated(new Date());
      setError(null);

      return data;
    } catch (err) {
      console.error('❌ Dashboard statistikalarini olishda xatolik:', err);
      
      // Return fallback data on network error
      const fallbackData = {
        products: { total: 0, byCategory: [] },
        craftsmen: { total: 0, active: 0, inactive: 0 },
        orders: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0, recent: [] },
        revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
        timestamp: new Date().toISOString()
      };
      
      setStatistics(fallbackData);
      setLastUpdated(new Date());
      setError(null); // Don't show error for fallback data
      return fallbackData;
    }
  }, []);

  // Fetch edit statistics
  const fetchEditStats = useCallback(async (days = 30) => {
    try {
      const response = await fetch(`http://localhost:5000/api/statistics/edits?days=${days}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Edit API Error:', response.status, errorText);
        
        // Return fallback data if API fails
        const fallbackData = {
          total: 0,
          today: 0,
          thisWeek: 0,
          period: days,
          byDay: [],
          mostEdited: [],
          timestamp: new Date().toISOString()
        };
        
        setEditStats(fallbackData);
        setError(null);
        return fallbackData;
      }

      const data = await response.json();

      setEditStats(data);
      setError(null);

      return data;
    } catch (err) {
      console.error('❌ Tahrir statistikalarini olishda xatolik:', err);
      
      // Return fallback data on network error
      const fallbackData = {
        total: 0,
        today: 0,
        thisWeek: 0,
        period: days,
        byDay: [],
        mostEdited: [],
        timestamp: new Date().toISOString()
      };
      
      setEditStats(fallbackData);
      setError(null);
      return fallbackData;
    }
  }, []);

  // Fetch all statistics
  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchEditStats()
      ]);
    } catch (err) {
      console.error('❌ Error fetching all statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats, fetchEditStats]);

  // Refresh statistics manually
  const refreshStats = useCallback(async () => {
    await fetchAllStats();
  }, [fetchAllStats]);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchAllStats();
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, fetchAllStats]);

  // Format statistics for easy consumption
  const formattedStats = statistics ? {
    // Basic counts
    craftsmenCount: statistics.craftsmen?.total || 0,
    productsCount: statistics.products?.total || 0,
    ordersCount: statistics.orders?.total || 0,

    // Revenue
    totalRevenue: statistics.revenue?.total || 0,
    monthlyRevenue: statistics.revenue?.thisMonth || 0,
    revenueGrowth: statistics.revenue?.growth || 0,

    // Edit statistics
    totalEdits: editStats?.total || 0,
    weeklyEdits: editStats?.thisWeek || 0,
    todayEdits: editStats?.today || 0,

    // Detailed data
    craftsmen: statistics.craftsmen,
    products: statistics.products,
    orders: statistics.orders,
    revenue: statistics.revenue,
    edits: editStats
  } : null;

  // Helper function to get loading state for specific stat
  const isStatLoading = (statName) => {
    if (loading) return true;

    switch (statName) {
      case 'dashboard':
        return !statistics;
      case 'edits':
        return !editStats;
      default:
        return !statistics || !editStats;
    }
  };

  // Helper function to format numbers
  const formatNumber = useCallback((num, options = {}) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';

    const {
      compact = false,
      currency = false,
      decimals = 0
    } = options;

    if (currency) {
      return new Intl.NumberFormat('uz-UZ', {
        style: 'currency',
        currency: 'UZS',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num);
    }

    if (compact && num >= 1000) {
      return new Intl.NumberFormat('uz-UZ', {
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(num);
    }

    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }, []);

  // Helper function to get growth indicator
  const getGrowthIndicator = useCallback((growth) => {
    if (typeof growth !== 'number' || isNaN(growth)) return 'neutral';
    if (growth > 0) return 'positive';
    if (growth < 0) return 'negative';
    return 'neutral';
  }, []);

  return {
    // Data
    statistics,
    editStats,
    formattedStats,

    // State
    loading,
    error,
    lastUpdated,

    // Actions
    fetchDashboardStats,
    fetchEditStats,
    fetchAllStats,
    refreshStats,
    clearError,

    // Helpers
    isStatLoading,
    formatNumber,
    getGrowthIndicator
  };
};

export default useStatistics;