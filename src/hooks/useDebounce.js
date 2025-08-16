import { useState, useEffect } from 'react';

// Custom hook for debouncing values to prevent excessive API calls
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for debounced search with additional search state management
export const useDebouncedSearch = (initialValue = '', delay = 300) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, delay);

  // Track when user is actively typing
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isSearching,
    clearSearch,
    hasSearchQuery: debouncedSearchQuery.trim().length > 0,
  };
};

// Hook for throttling function calls (useful for scroll events, resize, etc.)
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const [lastRan, setLastRan] = useState(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan >= limit) {
        setThrottledValue(value);
        setLastRan(Date.now());
      }
    }, limit - (Date.now() - lastRan));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit, lastRan]);

  return throttledValue;
};