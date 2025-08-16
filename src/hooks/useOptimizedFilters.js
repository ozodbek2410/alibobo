import { useState, useCallback, useMemo } from 'react';
import { useThrottle } from './useDebounce';

// Hook for managing filters with throttling to prevent excessive API calls
export const useOptimizedFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  
  // Throttle filter updates to prevent excessive API calls
  const throttledFilters = useThrottle(filters, 300);

  // Update applied filters when throttled filters change
  useMemo(() => {
    setAppliedFilters(throttledFilters);
  }, [throttledFilters]);

  // Update individual filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(appliedFilters).length > 0 && 
           Object.values(appliedFilters).some(value => 
             value !== null && value !== undefined && value !== ''
           );
  }, [appliedFilters]);

  // Get filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(appliedFilters).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
  }, [appliedFilters]);

  return {
    filters,
    appliedFilters,
    updateFilter,
    updateFilters,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    isFiltering: JSON.stringify(filters) !== JSON.stringify(throttledFilters)
  };
};

// Hook for price range filtering with validation
export const usePriceRangeFilter = (initialMin = '', initialMax = '') => {
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [appliedMinPrice, setAppliedMinPrice] = useState(initialMin);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(initialMax);

  // Validate and apply price range
  const applyPriceRange = useCallback(() => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    
    // Validate range
    if (min > max && max !== Infinity) {
      // Swap values if min > max
      setMinPrice(max.toString());
      setMaxPrice(min.toString());
      setAppliedMinPrice(max.toString());
      setAppliedMaxPrice(min.toString());
    } else {
      setAppliedMinPrice(minPrice);
      setAppliedMaxPrice(maxPrice);
    }
  }, [minPrice, maxPrice]);

  // Clear price range
  const clearPriceRange = useCallback(() => {
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
  }, []);

  // Check if price range is active
  const hasPriceRange = useMemo(() => {
    return appliedMinPrice !== '' || appliedMaxPrice !== '';
  }, [appliedMinPrice, appliedMaxPrice]);

  // Get price range object for API
  const priceRange = useMemo(() => {
    const range = {};
    if (appliedMinPrice !== '') range.min = parseFloat(appliedMinPrice);
    if (appliedMaxPrice !== '') range.max = parseFloat(appliedMaxPrice);
    return Object.keys(range).length > 0 ? range : null;
  }, [appliedMinPrice, appliedMaxPrice]);

  return {
    minPrice,
    maxPrice,
    appliedMinPrice,
    appliedMaxPrice,
    setMinPrice,
    setMaxPrice,
    applyPriceRange,
    clearPriceRange,
    hasPriceRange,
    priceRange
  };
};

// Hook for category filtering with hierarchy support
export const useCategoryFilter = (initialCategory = '') => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categoryHistory, setCategoryHistory] = useState([]);

  // Navigate to category
  const navigateToCategory = useCallback((category) => {
    if (selectedCategory && selectedCategory !== category) {
      setCategoryHistory(prev => [...prev, selectedCategory]);
    }
    setSelectedCategory(category);
  }, [selectedCategory]);

  // Go back to previous category
  const goBackCategory = useCallback(() => {
    if (categoryHistory.length > 0) {
      const previousCategory = categoryHistory[categoryHistory.length - 1];
      setCategoryHistory(prev => prev.slice(0, -1));
      setSelectedCategory(previousCategory);
    } else {
      setSelectedCategory('');
    }
  }, [categoryHistory]);

  // Clear category selection
  const clearCategory = useCallback(() => {
    setSelectedCategory('');
    setCategoryHistory([]);
  }, []);

  return {
    selectedCategory,
    categoryHistory,
    navigateToCategory,
    goBackCategory,
    clearCategory,
    hasCategory: selectedCategory !== '',
    canGoBack: categoryHistory.length > 0
  };
};

// Hook for sorting with common sort options
export const useSortFilter = (initialSort = 'newest') => {
  const [sortBy, setSortBy] = useState(initialSort);

  const sortOptions = useMemo(() => [
    { value: 'newest', label: 'Eng yangi', field: 'createdAt', order: 'desc' },
    { value: 'oldest', label: 'Eng eski', field: 'createdAt', order: 'asc' },
    { value: 'price-low', label: 'Narx: Pastdan yuqoriga', field: 'price', order: 'asc' },
    { value: 'price-high', label: 'Narx: Yuqoridan pastga', field: 'price', order: 'desc' },
    { value: 'name-az', label: 'Nom: A-Z', field: 'name', order: 'asc' },
    { value: 'name-za', label: 'Nom: Z-A', field: 'name', order: 'desc' },
    { value: 'popular', label: 'Mashhur', field: 'popularity', order: 'desc' }
  ], []);

  const currentSort = useMemo(() => {
    return sortOptions.find(option => option.value === sortBy) || sortOptions[0];
  }, [sortBy, sortOptions]);

  return {
    sortBy,
    setSortBy,
    sortOptions,
    currentSort,
    sortField: currentSort.field,
    sortOrder: currentSort.order
  };
};