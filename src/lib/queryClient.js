import { QueryClient } from '@tanstack/react-query';

// Create query client with optimal performance settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered stale after 2 minutes
      staleTime: 2 * 60 * 1000,
      // Data stays in cache for 5 minutes
      cacheTime: 5 * 60 * 1000,
      // Don't refetch on window focus to avoid unnecessary requests
      refetchOnWindowFocus: false,
      // Retry failed requests 2 times
      retry: 2,
      // Retry delay increases exponentially
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Keep previous data while fetching new data for smooth UX
      keepPreviousData: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
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
};

// Prefetch helpers for performance optimization
export const prefetchQueries = {
  productDetail: (id) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => fetch(`http://localhost:5000/api/products/${id}`).then(res => res.json()),
      staleTime: 5 * 60 * 1000, // Product details are cached longer
    });
  },
  
  productsList: (category, search) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(category, search, 1),
      queryFn: () => {
        const params = new URLSearchParams({
          limit: '200',
          page: '1',
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        });
        
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        
        return fetch(`http://localhost:5000/api/products?${params.toString()}`)
          .then(res => res.json());
      },
    });
  },
};