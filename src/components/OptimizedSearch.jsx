import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDebouncedSearch } from '../hooks/useDebounce';
import { useSearchProducts } from '../hooks/useProductQueries';

const OptimizedSearch = ({ 
  onSearchResults, 
  onSearchStateChange,
  placeholder = "Mahsulotlarni qidirish...",
  className = ""
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Use debounced search hook
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isSearching,
    clearSearch,
    hasSearchQuery
  } = useDebouncedSearch('', 300);

  // Use React Query for search with automatic request cancellation
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    isFetching
  } = useSearchProducts(
    debouncedSearchQuery,
    1, // page
    hasSearchQuery && debouncedSearchQuery.length > 2 // enabled condition
  );

  // Handle search input change
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [setSearchQuery]);

  // Handle search focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (hasSearchQuery) {
      setShowResults(true);
    }
  }, [hasSearchQuery]);

  // Handle search blur
  const handleBlur = useCallback((e) => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      if (!resultsRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowResults(false);
      }
    }, 150);
  }, []);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    clearSearch();
    setShowResults(false);
    inputRef.current?.focus();
  }, [clearSearch]);

  // Handle result click
  const handleResultClick = useCallback((product) => {
    setSearchQuery(product.name);
    setShowResults(false);
    if (onSearchResults) {
      onSearchResults([product]);
    }
  }, [setSearchQuery, onSearchResults]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hasSearchQuery && searchResults?.products?.length > 0) {
        handleResultClick(searchResults.products[0]);
      }
    }
  }, [hasSearchQuery, searchResults, handleResultClick]);

  // Notify parent of search state changes
  useEffect(() => {
    if (onSearchStateChange) {
      onSearchStateChange({
        query: debouncedSearchQuery,
        isSearching: isSearching || isFetching,
        hasResults: searchResults?.products?.length > 0,
        results: searchResults?.products || []
      });
    }
  }, [debouncedSearchQuery, isSearching, isFetching, searchResults, onSearchStateChange]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLoading = isSearching || isSearchLoading || isFetching;
  const hasResults = searchResults?.products?.length > 0;
  const shouldShowResults = showResults && isFocused && hasSearchQuery;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={`h-5 w-5 transition-colors duration-200 ${
              isFocused ? 'text-orange-500' : 'text-gray-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
            isFocused ? 'border-orange-300 shadow-md' : 'border-gray-300'
          }`}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-y-0 right-10 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
          </div>
        )}

        {/* Clear Button */}
        {hasSearchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {shouldShowResults && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent mx-auto mb-2"></div>
              Qidirilmoqda...
            </div>
          )}

          {/* Error State */}
          {searchError && !isLoading && (
            <div className="p-4 text-center text-red-500">
              <svg className="h-6 w-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Qidirishda xatolik yuz berdi
            </div>
          )}

          {/* No Results */}
          {!isLoading && !searchError && !hasResults && debouncedSearchQuery.length > 2 && (
            <div className="p-4 text-center text-gray-500">
              <svg className="h-6 w-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              Hech narsa topilmadi
            </div>
          )}

          {/* Search Results */}
          {hasResults && !isLoading && (
            <div className="py-2">
              {searchResults.products.slice(0, 8).map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleResultClick(product)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-3"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={product.images?.[0] || product.image || '/assets/default-product.png'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {product.category}
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="flex-shrink-0 text-sm font-medium text-orange-600">
                    {parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0', 10).toLocaleString()} so'm
                  </div>
                </button>
              ))}
              
              {/* Show More Results */}
              {searchResults.totalCount > 8 && (
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                  <span className="text-sm text-gray-500">
                    {searchResults.totalCount - 8} ta ko'proq natija
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizedSearch;