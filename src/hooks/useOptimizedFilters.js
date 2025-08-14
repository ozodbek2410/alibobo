import { useState, useMemo, useCallback, useDeferredValue, useTransition, useEffect } from 'react';

// Debounce хук
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Основной хук для оптимизированной фильтрации
export function useOptimizedFilters(products, initialFilters = {}) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    ...initialFilters
  });
  
  const [isPending, startTransition] = useTransition();
  
  // Debounce для поиска (300ms)
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedMinPrice = useDebounce(filters.minPrice, 400);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 400);
  
  // Deferred values для плавности UI
  const deferredSearch = useDeferredValue(debouncedSearch);
  const deferredMinPrice = useDeferredValue(debouncedMinPrice);
  const deferredMaxPrice = useDeferredValue(debouncedMaxPrice);
  
  // Мемоизированная фильтрация
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    let filtered = [...products];
    
    // Поиск по названию
    if (deferredSearch.trim()) {
      const searchLower = deferredSearch.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Фильтр по категории
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category === filters.category
      );
    }
    
    // Фильтр по цене
    if (deferredMinPrice || deferredMaxPrice) {
      filtered = filtered.filter(product => {
        const price = parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0');
        const min = deferredMinPrice ? parseInt(deferredMinPrice) : 0;
        const max = deferredMaxPrice ? parseInt(deferredMaxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Сортировка
    filtered.sort((a, b) => {
      const { sortBy, sortOrder } = filters;
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = parseInt(a.price?.toString().replace(/[^\d]/g, '') || '0');
          bValue = parseInt(b.price?.toString().replace(/[^\d]/g, '') || '0');
          break;
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt || 0);
          bValue = new Date(b.updatedAt || 0);
          break;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [products, deferredSearch, filters.category, deferredMinPrice, deferredMaxPrice, filters.sortBy, filters.sortOrder]);
  
  // Оптимизированные обновления фильтров
  const updateFilter = useCallback((key, value) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, [key]: value }));
    });
  }, []);
  
  const updateFilters = useCallback((newFilters) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    });
  }, []);
  
  const resetFilters = useCallback(() => {
    startTransition(() => {
      setFilters({
        search: '',
        category: '',
        priceRange: 'all',
        minPrice: '',
        maxPrice: '',
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });
    });
  }, []);
  
  return {
    filters,
    filteredProducts,
    updateFilter,
    updateFilters,
    resetFilters,
    isPending,
    // Статистика для отладки
    stats: {
      total: products?.length || 0,
      filtered: filteredProducts.length,
      isSearching: !!deferredSearch.trim(),
      hasFilters: filters.category !== '' || deferredMinPrice || deferredMaxPrice
    }
  };
}