import { useState, useEffect, useRef, useCallback } from 'react';

// Global cache to prevent duplicate requests
const cache = new Map();
const pendingRequests = new Map();

const useSmartFetch = (url, options = {}) => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    refetchOnFocus = false,
    refetchInterval = null,
    enabled = true,
    staleTime = 2 * 60 * 1000, // 2 minutes - data considered stale after this
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastFocusRefetchRef = useRef(0);

  // Check if cached data is still valid
  const isCacheValid = useCallback((cacheEntry) => {
    return cacheEntry && (Date.now() - cacheEntry.timestamp < cacheTime);
  }, [cacheTime]);

  // Check if data is stale (needs background refresh)
  const isDataStale = useCallback((cacheEntry) => {
    return cacheEntry && (Date.now() - cacheEntry.timestamp > staleTime);
  }, [staleTime]);

  // Main fetch function with caching and deduplication
  const fetchData = useCallback(async (fetchUrl, silent = false) => {
    if (!fetchUrl || !enabled) return null;

    const cacheKey = fetchUrl;
    const cachedData = cache.get(cacheKey);

    // Return cached data if valid
    if (isCacheValid(cachedData)) {
      if (!silent) {
        console.log(`✅ Using cached data for ${fetchUrl}`);
      }
      
      if (isMountedRef.current) {
        setData(cachedData.data);
        setError(null);
        setLastFetch(cachedData.timestamp);
      }
      return cachedData.data;
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      if (!silent) {
        console.log(`⏳ Request already pending for ${fetchUrl}`);
      }
      try {
        return await pendingRequests.get(cacheKey);
      } catch (err) {
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

    // Create fetch promise
    const fetchPromise = (async () => {
      try {
        const startTime = Date.now();
        
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
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (!silent) {
          console.log(`🌐 Fetched ${fetchUrl} in ${duration}ms`);
        }

        // Cache the result
        const cacheEntry = {
          data: result,
          timestamp: Date.now()
        };
        cache.set(cacheKey, cacheEntry);

        // Clean old cache entries (keep max 20)
        if (cache.size > 20) {
          const oldestKey = cache.keys().next().value;
          cache.delete(oldestKey);
        }

        if (isMountedRef.current) {
          setData(result);
          setError(null);
          setLastFetch(Date.now());
        }

        return result;
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log(`🚫 Request aborted for ${fetchUrl}`);
          return null;
        }

        console.error(`❌ Fetch error for ${fetchUrl}:`, err.message);

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
  }, [enabled, isCacheValid, cacheTime]);

  // Manual refetch function
  const refetch = useCallback((silent = false) => {
    // Clear cache for this URL to force fresh fetch
    cache.delete(url);
    return fetchData(url, silent);
  }, [fetchData, url]);

  // Initial fetch effect - FIXED: Remove fetchData from dependencies to prevent infinite loop
  useEffect(() => {
    if (url && enabled) {
      fetchData(url, false);
    }
  }, [url, enabled]); // Removed fetchData dependency that was causing infinite loop

  // Focus refetch effect with intelligent timing - FIXED: Stable dependencies
  useEffect(() => {
    if (!refetchOnFocus || !url) return;

    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastFocusRefetch = now - lastFocusRefetchRef.current;
      const timeSinceLastFetch = now - (lastFetch || 0);

      // Only refetch on focus if:
      // 1. It's been more than 5 minutes since last focus refetch
      // 2. AND data is stale (older than staleTime)
      if (timeSinceLastFocusRefetch > 5 * 60 * 1000 && timeSinceLastFetch > staleTime) {
        console.log('🔄 Focus refetch: Data is stale, refreshing...');
        lastFocusRefetchRef.current = now;
        fetchData(url, true); // Silent refetch
      } else {
        console.log('⏭️ Focus refetch skipped: Data is fresh');
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnFocus, url, lastFetch, staleTime]); // Removed fetchData dependency

  // Interval refetch effect - FIXED: Stable dependencies
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0 || !url) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastFetch = now - (lastFetch || 0);
      
      // Only refetch if data is stale
      if (timeSinceLastFetch > staleTime) {
        console.log('⏰ Interval refetch: Data is stale, refreshing...');
        fetchData(url, true); // Silent refetch
      }
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, url, lastFetch, staleTime]); // Removed fetchData dependency

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
    isStale: lastFetch ? (Date.now() - lastFetch > staleTime) : false,
    lastFetch: lastFetch ? new Date(lastFetch).toLocaleTimeString() : null
  };
};

export default useSmartFetch;
