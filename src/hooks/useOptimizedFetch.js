import { useState, useEffect, useRef } from 'react';

// Simple cache to prevent duplicate requests - temporarily disabled for skeleton testing
const cache = new Map();

export const useOptimizedFetch = (url, options = {}) => {
  const { enabled = true, cacheTime = 5 * 60 * 1000 } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!url || !enabled) return;

    const fetchData = async () => {
      // Always show loading on initial fetch
      setLoading(true);

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

        // Cache disabled for skeleton testing

        if (isMountedRef.current) {
          setData(result);
          setError(null);
          setIsInitialFetch(false);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMountedRef.current) {
          setError(err);
          setIsInitialFetch(false);
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
    if (url && enabled) {
      // Trigger re-fetch by updating a state
      setLoading(true);
      setError(null);
      setIsInitialFetch(false); // This is a manual refetch, not initial
    }
  };

  return { data, loading, error, refetch, isInitialFetch };
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