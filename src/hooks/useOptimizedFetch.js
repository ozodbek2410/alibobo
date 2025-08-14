import { useState, useEffect, useRef } from 'react';

// Simple cache to prevent duplicate requests
const cache = new Map();

export const useOptimizedFetch = (url, options = {}) => {
  const { enabled = true, cacheTime = 5 * 60 * 1000 } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!url || !enabled) return;

    const fetchData = async () => {
      // Check cache first
      const cacheKey = url;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData && (Date.now() - cachedData.timestamp < cacheTime)) {
        setData(cachedData.data);
        setError(null);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Cache the result
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        if (isMountedRef.current) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMountedRef.current) {
          setError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [url, enabled, cacheTime]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = () => {
    cache.delete(url);
    if (url && enabled) {
      // Trigger re-fetch by updating a state
      setLoading(true);
      setError(null);
    }
  };

  return { data, loading, error, refetch };
};

// Simple parallel fetch hook
export const useParallelFetch = (urls) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!urls || urls.length === 0) return;

    const fetchAll = async () => {
      setLoading(true);

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
        console.error('Parallel fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [urls.join(',')]); // Use join instead of JSON.stringify to prevent infinite re-renders

  return { data, loading, errors };
};