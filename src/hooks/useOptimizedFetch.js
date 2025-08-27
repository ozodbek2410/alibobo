import { useState, useEffect, useRef, useCallback } from 'react';

// Improved cache with expiration management
const cache = new Map();

// Helper function to clean expired cache entries
const cleanCache = () => {
  const now = Date.now();
  for (const [key, { expiry }] of cache.entries()) {
    if (expiry < now) {
      cache.delete(key);
    }
  }
};

// Schedule cache cleaning every 5 minutes
setInterval(cleanCache, 5 * 60 * 1000);

export const useOptimizedFetch = (url, options = {}) => {
  const { 
    enabled = true, 
    cacheTime = 5 * 60 * 1000,
    staleTime = 2 * 60 * 1000,
    retries = 2,
    dedupingInterval = 200 // Prevent duplicate requests within this time window
  } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef(0);
  const retryCountRef = useRef(0);
  const requestInProgressRef = useRef(false);

  // Clean up function to clear any ongoing requests
  const cleanupRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    requestInProgressRef.current = false;
  }, []);

  useEffect(() => {
    if (!url || !enabled) return;

    const fetchData = async () => {
      // Prevent duplicate requests within the deduping interval
      const now = Date.now();
      if (now - lastFetchTimeRef.current < dedupingInterval && requestInProgressRef.current) {
        return;
      }
      
      lastFetchTimeRef.current = now;
      requestInProgressRef.current = true;

      // Cancel previous request
      cleanupRequest();

      // Always show loading on initial fetch, or if no data is available yet
      if (isInitialFetch || !data) {
        setLoading(true);
      }

      // Check cache first
      const cacheKey = url;
      const cachedData = cache.get(cacheKey);
      
      // If we have valid, non-stale cache, use it
      if (cachedData && cachedData.expiry > now) {
        if (cachedData.timestamp + staleTime > now) {
          // Fresh data from cache
          setData(cachedData.data);
          setError(null);
          setLoading(false);
          setIsInitialFetch(false);
          requestInProgressRef.current = false;
          return;
        }
        
        // Data is stale but usable - set it first, then fetch in background
        setData(cachedData.data);
        setLoading(false);
        // Continue to fetch fresh data in the background
      }

      abortControllerRef.current = new AbortController();
      setError(null);

      try {
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: { 'Content-Type': 'application/json' },
          ...options.fetchOptions
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Update cache with new data and expiry
        const expiry = now + cacheTime;
        cache.set(cacheKey, {
          data: result,
          expiry,
          timestamp: now
        });

        if (isMountedRef.current) {
          setData(result);
          setError(null);
          setLoading(false);
          setIsInitialFetch(false);
          retryCountRef.current = 0; // Reset retry counter on success
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          // Ignore abort errors as they're intentional
          return;
        }
        
        if (isMountedRef.current) {
          // Only retry if we haven't exceeded the retry limit
          if (retryCountRef.current < retries) {
            retryCountRef.current++;
            // Exponential backoff
            const delay = Math.min(1000 * (2 ** retryCountRef.current), 10000);
            setTimeout(() => fetchData(), delay);
            return;
          }
          
          setError(err);
          setLoading(false);
          setIsInitialFetch(false);
          console.error(`Fetch error for ${url}:`, err);
        }
      } finally {
        if (isMountedRef.current) {
          requestInProgressRef.current = false;
        }
      }
    };

    fetchData();
    
    // Clean up function
    return () => cleanupRequest();
  }, [url, enabled, cacheTime, staleTime, retries, dedupingInterval, cleanupRequest, options.fetchOptions, data]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupRequest();
    };
  }, [cleanupRequest]);

  // Manually trigger a refetch
  const refetch = useCallback(async () => {
    if (url && enabled) {
      setError(null);
      setIsInitialFetch(false);
      lastFetchTimeRef.current = 0; // Reset the last fetch time to force a new fetch
      cleanupRequest(); // Clear any existing request
      
      const now = Date.now();
      // Remove this URL from cache to force a fresh fetch
      if (cache.has(url)) {
        cache.delete(url);
      }
      
      // Create a new AbortController
      abortControllerRef.current = new AbortController();
      setLoading(true); // Show loading indicator for manual refetch
      
      try {
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: { 'Content-Type': 'application/json' },
          ...options.fetchOptions,
          cache: 'no-store', // Force bypass cache for refetch
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Update cache
        cache.set(url, {
          data: result,
          expiry: now + cacheTime,
          timestamp: now
        });
        
        if (isMountedRef.current) {
          setData(result);
          setLoading(false);
        }
        
        return result;
      } catch (err) {
        if (err.name !== 'AbortError' && isMountedRef.current) {
          setError(err);
          setLoading(false);
          console.error(`Refetch error for ${url}:`, err);
        }
        throw err;
      } finally {
        requestInProgressRef.current = false;
      }
    }
  }, [url, enabled, cacheTime, options.fetchOptions, cleanupRequest]);

  return { data, loading, error, refetch, isInitialFetch };
};

// Optimized parallel fetch hook with deduplication and error handling per request
export const useParallelFetch = (urls, options = {}) => {
  const {
    enabled = true,
    cacheTime = 5 * 60 * 1000,
    staleTime = 2 * 60 * 1000,
  } = options;
  
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const abortControllersRef = useRef(new Map());
  const isMountedRef = useRef(true);

  // Generate a stable dependency key from urls
  const urlsKey = urls ? urls.join(',') : '';

  useEffect(() => {
    if (!urls || urls.length === 0 || !enabled) {
      setLoading(false);
      return;
    }

    // Clean up previous controllers
    abortControllersRef.current.forEach(controller => {
      controller.abort();
    });
    abortControllersRef.current = new Map();

    setLoading(true);
    const now = Date.now();
    const newData = {};
    const newErrors = {};
    let pendingFetches = urls.length;

    const fetchUrl = async (url) => {
      // Check cache first
      const cachedData = cache.get(url);
      if (cachedData && cachedData.expiry > now) {
        if (cachedData.timestamp + staleTime > now) {
          // Fresh data from cache
          newData[url] = cachedData.data;
          pendingFetches--;
          if (pendingFetches === 0 && isMountedRef.current) {
            setData(newData);
            setErrors(newErrors);
            setLoading(false);
          }
          return; // Skip fetch for fresh cache
        }
        // Stale but usable - use it while fetching new data
        newData[url] = cachedData.data;
      }

      // Create new abort controller for this URL
      const controller = new AbortController();
      abortControllersRef.current.set(url, controller);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          ...options.fetchOptions
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Update cache
        cache.set(url, {
          data: result,
          expiry: now + cacheTime,
          timestamp: now
        });
        
        if (isMountedRef.current) {
          newData[url] = result;
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMountedRef.current) {
          newErrors[url] = error.message || 'Fetch failed';
          console.error(`Error fetching ${url}:`, error);
        }
      } finally {
        abortControllersRef.current.delete(url);
        pendingFetches--;
        
        // Update state once all fetches complete (or fail)
        if (pendingFetches === 0 && isMountedRef.current) {
          setData({...newData});
          setErrors({...newErrors});
          setLoading(false);
        }
      }
    };

    // Start all fetches in parallel
    urls.forEach(url => fetchUrl(url));

    // Cleanup function
    return () => {
      abortControllersRef.current.forEach(controller => {
        controller.abort();
      });
    };
  }, [urlsKey, enabled, cacheTime, staleTime, options.fetchOptions]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllersRef.current.forEach(controller => controller.abort());
    };
  }, []);

  return { data, loading, errors };
};