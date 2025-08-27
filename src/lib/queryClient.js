import { QueryClient } from '@tanstack/react-query';

// Create query client with optimized performance settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Longer staleTime to significantly reduce unnecessary fetching
      staleTime: 10 * 60 * 1000, // 10 minutes for regular data
      // Data stays in cache longer before garbage collection
      gcTime: 30 * 60 * 1000, // 30 minutes
      // Only refetch on window focus when needed (better UX)
      refetchOnWindowFocus: false,
      // Refetch on reconnect only for critical data
      refetchOnReconnect: false,
      // Smart retry strategy to avoid wasting bandwidth
      retry: (failureCount, error) => {
        // Don't retry on 404 or 400 errors (client errors)
        if (error?.response?.status === 404 || error?.response?.status === 400) {
          return false;
        }
        // Don't retry on network abort errors
        if (error?.name === 'AbortError') {
          return false;
        }
        return failureCount < 2; // Reduce max retries to 2 (was 3)
      },
      // Exponential backoff with jitter for better distributed retries
      retryDelay: attemptIndex => {
        // Base delay shorter for initial retry, capped at 20 seconds
        const delay = Math.min(800 * (2 ** attemptIndex), 20000);
        // More pronounced jitter (up to 25%)
        return delay + (Math.random() * delay * 0.25);
      },
      // Keep previous data while fetching new data for smooth UX
      keepPreviousData: true,
      // Use structural sharing for minimizing re-renders
      structuralSharing: true,
      // Prevent request duplication with this network deduping window
      networkMode: 'always',
    },
    mutations: {
      // Retry mutations only once for critical operations
      retry: 1,
      // Reduce mutation network spam with deduping window
      networkMode: 'always',
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Product-related queries
  products: {
    all: ['products'],
    lists: () => [...queryKeys.products.all, 'list'],
    list: (category, search, page = 1, limit = 200) => 
      [...queryKeys.products.lists(), { category, search, page, limit }],
    details: () => [...queryKeys.products.all, 'detail'],
    detail: (id) => [...queryKeys.products.details(), id],
  },
  
  // Craftsmen-related queries
  craftsmen: {
    all: ['craftsmen'],
    lists: () => [...queryKeys.craftsmen.all, 'list'],
    list: (specialty, search, page = 1, limit = 50, sortBy = 'joinDate', sortOrder = 'desc') =>
      [...queryKeys.craftsmen.lists(), { specialty, search, page, limit, sortBy, sortOrder }],
    details: () => [...queryKeys.craftsmen.all, 'detail'],
    detail: (id) => [...queryKeys.craftsmen.details(), id],
  },
  
  // Orders-related queries
  orders: {
    all: ['orders'],
    lists: () => [...queryKeys.orders.all, 'list'],
    list: (status, search, page = 1, limit = 50) =>
      [...queryKeys.orders.lists(), { status, search, page, limit }],
    details: () => [...queryKeys.orders.all, 'detail'],
    detail: (id) => [...queryKeys.orders.details(), id],
  },
  
  // Search-related queries
  search: {
    all: ['search'],
    products: (query, page = 1) => [...queryKeys.search.all, 'products', { query, page }],
  },
  
  // Category-related queries
  categories: {
    all: ['categories'],
    list: () => [...queryKeys.categories.all, 'list'],
  },
  
  // Statistics and admin queries
  statistics: {
    all: ['statistics'],
    dashboard: () => [...queryKeys.statistics.all, 'dashboard'],
  },
};

// Cache invalidation helpers
export const invalidateQueries = {
  products: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  productDetail: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) }),
  search: () => queryClient.invalidateQueries({ queryKey: queryKeys.search.all }),
  categories: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  craftsmen: () => queryClient.invalidateQueries({ queryKey: queryKeys.craftsmen.all }),
  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
};

// Enhanced prefetch helpers for intelligent data preloading
export const prefetchQueries = {
  productDetail: (id) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: async ({ signal }) => {
        try {
          const response = await fetch(`http://localhost:5000/api/products/${id}`, { signal });
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error('Error prefetching product:', error);
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000, // Product details are cached longer
    });
  },
  
  productsList: (category, search, limit = 20) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(category, search, 1, limit),
      queryFn: async ({ signal }) => {
        try {
          const params = new URLSearchParams({
            limit: limit.toString(),
            page: '1',
            sortBy: 'updatedAt',
            sortOrder: 'desc',
          });
          
          if (category) params.append('category', category);
          if (search) params.append('search', search);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
          
          // Combine the external signal with our timeout controller
          const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`, { 
            signal: AbortSignal.any([signal, controller.signal]), 
            headers: { 'Cache-Control': 'max-age=3600' } // Enable HTTP cache
          });
          
          clearTimeout(timeoutId); // Clear the timeout
          
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return await response.json();
        } catch (error) {
          // More specific error handling
          if (error.name === 'AbortError') {
            console.warn('Request aborted or timed out');
          } else {
            console.error('Error prefetching products list:', error);
          }
          throw error;
        }
      },
      // Increased staleTime for product lists
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache for longer
      gcTime: 15 * 60 * 1000, // 15 minutes
    });
  },
  
  // New method to prefetch craftsmen data
  craftsmenList: () => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.craftsmen.lists(),
      queryFn: async ({ signal }) => {
        try {
          const response = await fetch(`http://localhost:5000/api/craftsmen?limit=20&page=1`, { signal });
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error('Error prefetching craftsmen list:', error);
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000,
    });
  },
  
  // New method to prefetch dashboard statistics
  dashboardStats: () => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.statistics.dashboard(),
      queryFn: async ({ signal }) => {
        try {
          const response = await fetch('http://localhost:5000/api/statistics/dashboard', { signal });
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return await response.json();
        } catch (error) {
          console.error('Error prefetching dashboard stats:', error);
          throw error;
        }
      },
      staleTime: 1 * 60 * 1000, // Stats are more dynamic, 1 minute stale time
    });
  },
};