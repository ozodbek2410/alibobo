import { useState, useEffect, useRef, useCallback } from 'react';

// Global cache to prevent duplicate requests across components
const globalCache = new Map();
const pendingRequests = new Map();

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle utility
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const useOptimizedFetch = (url, options = {}) => {
  const {
    debounceMs = 300,
    throttleMs = 1000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    refetchOnFocus = false,
    refetchInterval = null,
    enabled = true,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastUrlRef = useRef(url);

  // Performance tracking (disabled for production)
  const trackPerformance = useCallback((operation, startTime, endTime, cached = false) => {
    // Disabled to prevent console spam
    // const duration = endTime - startTime;
    // if (duration > 2000 && !cached) {
    //   console.warn(`🐌 Slow API call: ${operation} (${duration.toFixed(2)}ms)`);
    // }
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback((cacheEntry) => {
    return cacheEntry && (Date.now() - cacheEntry.timestamp < cacheTime);
  }, [cacheTime]);

  // Fetch function with caching and deduplication
  const fetchData = useCallback(async (fetchUrl, silent = false) => {
    if (!fetchUrl || !enabled) return;

    const startTime = performance.now();
    const cacheKey = fetchUrl;

    // Check cache first
    const cachedData = globalCache.get(cacheKey);
    if (isCacheValid(cachedData)) {
      const endTime = performance.now();
      trackPerformance(`Cache hit for ${fetchUrl}`, startTime, endTime, true);
      
      if (isMountedRef.current) {
        setData(cachedData.data);
        setError(null);
        setLastFetch(Date.now());
      }
      return cachedData.data;
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      try {
        const result = await pendingRequests.get(cacheKey);
        return result;
      } catch (err) {
        console.error(`❌ Pending request failed for ${fetchUrl}:`, err);
        throw err;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (!silent && isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    // Create promise for deduplication
    const fetchPromise = (async () => {
      try {
        const response = await fetch(fetchUrl, {
          signal: abortControllerRef.current.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const endTime = performance.now();
        
        trackPerformance(`API call to ${fetchUrl}`, startTime, endTime, false);

        // Cache the result
        globalCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        // Clean old cache entries
        if (globalCache.size > 50) {
          const oldestKey = globalCache.keys().next().value;
          globalCache.delete(oldestKey);
        }

        if (isMountedRef.current) {
          setData(result);
          setError(null);
          setLastFetch(Date.now());
        }

        return result;
      } catch (err) {
        const endTime = performance.now();
        
        if (err.name === 'AbortError') {
          console.log(`🚫 Request aborted for ${fetchUrl}`);
          return null;
        }

        console.error(`❌ Fetch error for ${fetchUrl}:`, err);
        trackPerformance(`Failed API call to ${fetchUrl}`, startTime, endTime, false);

        if (isMountedRef.current) {
          setError(err);
        }
        throw err;
      } finally {
        pendingRequests.delete(cacheKey);
        if (isMountedRef.current && !silent) {
          setLoading(false);
        }
      }
    })();

    // Store pending request
    pendingRequests.set(cacheKey, fetchPromise);

    return fetchPromise;
  }, [enabled, cacheTime, isCacheValid, trackPerformance]);

  // Debounced fetch
  const debouncedFetch = useCallback(
    debounce((fetchUrl, silent) => fetchData(fetchUrl, silent), debounceMs),
    [fetchData, debounceMs]
  );

  // Throttled fetch
  const throttledFetch = useCallback(
    throttle((fetchUrl, silent) => fetchData(fetchUrl, silent), throttleMs),
    [fetchData, throttleMs]
  );

  // Manual refetch function
  const refetch = useCallback((silent = false) => {
    return fetchData(url, silent);
  }, [fetchData, url]);

  // Effect for initial fetch and dependency changes
  useEffect(() => {
    if (url && enabled) {
      // Use throttled fetch for dependency changes to prevent spam
      if (lastUrlRef.current !== url || dependencies.some((dep, index) => 
        dep !== dependencies[index]
      )) {
        throttledFetch(url, false);
        lastUrlRef.current = url;
      }
    }
  }, [url, enabled, throttledFetch, ...dependencies]);

  // Focus refetch effect
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      const timeSinceLastFetch = Date.now() - (lastFetch || 0);
      
      // Only refetch if it's been more than 30 seconds since last fetch
      if (timeSinceLastFetch > 30000) {
        debouncedFetch(url, true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnFocus, debouncedFetch, url, lastFetch]);

  // Interval refetch effect
  useEffect(() => {
    if (!refetchInterval) return;

    const interval = setInterval(() => {
      debouncedFetch(url, true);
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, debouncedFetch, url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    lastFetch: new Date(lastFetch || 0).toLocaleTimeString()
  };
};

// Hook for multiple API calls with parallel execution
export const useParallelFetch = (urls, options = {}) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchAll = useCallback(async () => {
    if (!urls || urls.length === 0) return;

    setLoading(true);
    const startTime = performance.now();

    try {
      const promises = urls.map(async (url) => {
        try {
          const response = await fetch(url);
          const result = await response.json();
          return { url, data: result, error: null };
        } catch (error) {
          return { url, data: null, error };
        }
      });

      const results = await Promise.all(promises);
      const endTime = performance.now();

      const newData = {};
      const newErrors = {};

      results.forEach(({ url, data, error }) => {
        if (error) {
          newErrors[url] = error;
        } else {
          newData[url] = data;
        }
      });

      setData(newData);
      setErrors(newErrors);
    } catch (error) {
      console.error('❌ Parallel fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [urls]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, errors, refetch: fetchAll };
};
