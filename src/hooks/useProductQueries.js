import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { queryKeys, invalidateQueries, queryClient } from '../lib/queryClient';

// API base URL
const API_BASE = 'http://localhost:5000/api';

// Fetch functions
const fetchProducts = async ({ category, search, page = 1, limit = 20, signal }) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  
  if (category && category !== '') {
    params.append('category', category);
  }
  
  if (search && search.trim() !== '') {
    params.append('search', search.trim());
  }
  
  const response = await fetch(`${API_BASE}/products?${params.toString()}`, {
    signal,
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

const fetchProduct = async (id, signal) => {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    signal,
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Hook for fetching products list with caching and background sync
export const useProducts = (category, search, page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.products.list(category, search, page, limit),
    queryFn: ({ signal }) => fetchProducts({ category, search, page, limit, signal }),
    keepPreviousData: true, // Keep previous data while fetching new data
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    // Enable background refetch when data becomes stale
    refetchOnMount: 'always',
  });
};

// Hook for infinite scrolling products (for load more functionality)
export const useInfiniteProducts = (category, search, limit = 20) => {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(category, search, 'infinite', limit),
    queryFn: ({ pageParam = 1, signal }) => 
      fetchProducts({ category, search, page: pageParam, limit, signal }),
    getNextPageParam: (lastPage) => {
      const p = lastPage?.pagination;
      if (p?.hasNextPage) {
        return (p.currentPage || 1) + 1;
      }
      return undefined;
    },
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

// Hook for fetching individual product details
export const useProduct = (id, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: ({ signal }) => fetchProduct(id, signal),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // Product details cached longer (5 minutes)
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for prefetching product details on hover/interaction
export const usePrefetchProduct = () => {
  return (id) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: ({ signal }) => fetchProduct(id, signal),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Hook for search with debouncing built-in
export const useSearchProducts = (query, page = 1, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.search.products(query, page),
    queryFn: ({ signal }) => fetchProducts({ search: query, page, limit: 20, signal }),
    enabled: enabled && query && query.trim().length > 2,
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000, // Search results cached for 3 minutes
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Mutation hooks for product operations
export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (productData) => {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch products list
      invalidateQueries.products();
    },
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async ({ id, ...productData }) => {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the specific product in cache
      queryClient.setQueryData(
        queryKeys.products.detail(variables.id),
        data
      );
      // Invalidate products list to reflect changes
      invalidateQueries.products();
    },
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      return response.json();
    },
    onSuccess: (data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      // Invalidate products list
      invalidateQueries.products();
    },
  });
};

export const useArchiveProduct = () => {
  return useMutation({
    mutationFn: async ({ id, archived }) => {
      const response = await fetch(`${API_BASE}/products/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived }),
      });
      if (!response.ok) throw new Error('Failed to update archive status');
      return response.json();
    },
    onSuccess: () => {
      invalidateQueries.products();
    },
  });
};

export const useRestoreProduct = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE}/products/${id}/restore`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to restore product');
      return response.json();
    },
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      invalidateQueries.products();
    },
  });
};

// Helper hook for cache management
export const useProductCache = () => {
  return {
    invalidateProducts: () => invalidateQueries.products(),
    invalidateProduct: (id) => invalidateQueries.productDetail(id),
    prefetchProduct: (id) => {
      return queryClient.prefetchQuery({
        queryKey: queryKeys.products.detail(id),
        queryFn: ({ signal }) => fetchProduct(id, signal),
        staleTime: 5 * 60 * 1000,
      });
    },
    getProductFromCache: (id) => {
      return queryClient.getQueryData(queryKeys.products.detail(id));
    },
    setProductInCache: (id, data) => {
      queryClient.setQueryData(queryKeys.products.detail(id), data);
    },
  };
};