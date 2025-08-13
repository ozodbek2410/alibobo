import { useState, useEffect, useCallback, useRef } from 'react';

// Global cache and pending requests to prevent duplicates
const globalCache = new Map();
const pendingRequests = new Map();

const useStrictModeSafeFetch = (url, options = {}) => {
  const {
    enabled = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 2 * 60 * 1000, // 2 minutes
    refetchOnFocus = true,
    refetchInterval = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Refs to prevent stale closures and React Strict Mode issues
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const lastFocusRefetchRef = useRef(0);
  const initialFetchDoneRef = useRef(false);

  // Helper function to check if data is stale
  const isDataStale = useCallback((cachedData) => {
    if (!cachedData) return true;
    return Date.now() - cachedData.timestamp > staleTime;
  }, [staleTime]);

  // Helper function to check if cache is valid
  const isCacheValid = useCallback((cachedData) => {
    if (!cachedData) return false;
    return Date.now() - cachedData.timestamp < cacheTime;
  }, [cacheTime]);

  // Main fetch function with deduplication and caching
  const fetchData = useCallback(async (fetchUrl, silent = false) => {
    if (!fetchUrl || !isMountedRef.current) return;

    // Check cache first
    const cachedData = globalCache.get(fetchUrl);
    if (isCacheValid(cachedData)) {
      console.log('✅ Using cached data for', fetchUrl);
      setData(cachedData.data);
      setLastFetch(cachedData.timestamp);
      setError(null);
      if (!silent) setLoading(false);
      return cachedData.data;
    }

    // Check if request is already pending
    if (pendingRequests.has(fetchUrl)) {
      console.log('⏳ Request already pending for', fetchUrl);
      return pendingRequests.get(fetchUrl);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    if (!silent) setLoading(true);
    setError(null);

    const startTime = Date.now();
    
    try {
      const fetchPromise = fetch(fetchUrl, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        // Cache the result
        const cacheEntry = {
          data: result,
          timestamp: Date.now()
        };
        globalCache.set(fetchUrl, cacheEntry);
        
        // Clean up old cache entries (keep only 50 entries)
        if (globalCache.size > 50) {
          const oldestKey = globalCache.keys().next().value;
          globalCache.delete(oldestKey);
        }
        
        const duration = Date.now() - startTime;
        const payloadSize = JSON.stringify(result).length;
        console.log(`🌐 Fetched ${fetchUrl} in ${duration}ms, payload: ${(payloadSize/1024).toFixed(2)}KB`);
        
        return result;
      });

      // Store pending request
      pendingRequests.set(fetchUrl, fetchPromise);

      const result = await fetchPromise;
      
      // Remove from pending requests
      pendingRequests.delete(fetchUrl);

      if (isMountedRef.current) {
        setData(result);
        setLastFetch(Date.now());
        setError(null);
        if (!silent) setLoading(false);
      }

      return result;
    } catch (err) {
      // Remove from pending requests
      pendingRequests.delete(fetchUrl);
      
      if (err.name === 'AbortError') {
        console.log('🚫 Request aborted for', fetchUrl);
        return;
      }

      console.error('❌ Fetch error for', fetchUrl, ':', err.message);
      
      if (isMountedRef.current) {
        setError(err);
        if (!silent) setLoading(false);
      }
      
      throw err;
    }
  }, [isCacheValid, cacheTime, staleTime]);

  // Manual refetch function
  const refetch = useCallback((silent = false) => {
    globalCache.delete(url);
    return fetchData(url, silent);
  }, [url, fetchData]);

  // Initial fetch effect - STRICT MODE SAFE
  useEffect(() => {
    if (!url || !enabled) return;
    
    // Prevent double fetch in React Strict Mode
    if (initialFetchDoneRef.current) return;
    
    initialFetchDoneRef.current = true;
    fetchData(url, false);
    
    // Reset flag on URL change
    return () => {
      initialFetchDoneRef.current = false;
    };
  }, [url, enabled]); // Stable dependencies only

  // Focus refetch effect - STRICT MODE SAFE
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
        fetchData(url, true);
      } else {
        console.log('⏭️ Focus refetch skipped: Data is fresh');
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnFocus, url, lastFetch, staleTime]);

  // Interval refetch effect - STRICT MODE SAFE
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0 || !url) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastFetch = now - (lastFetch || 0);
      
      if (timeSinceLastFetch > staleTime) {
        console.log('⏰ Interval refetch: Data is stale, refreshing...');
        fetchData(url, true);
      }
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, url, lastFetch, staleTime]);

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
    lastFetch,
    isStale: lastFetch ? isDataStale({ timestamp: lastFetch }) : true
  };
};

export default useStrictModeSafeFetch;
