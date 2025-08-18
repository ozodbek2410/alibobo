import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from 'react';
import { useOptimizedFetch } from '../hooks/useOptimizedFetch';
import CartSidebar from './CartSidebar';
import CategoryNavigation from './CategoryNavigation';

import ModernProductGrid from './ModernProductGrid';
// import { useOptimizedFilters } from '../hooks/useOptimizedFilters';
import { SearchIcon, TimesIcon } from './Icons';
import ProductGridSkeleton from './skeleton/ProductGridSkeleton';
import '../styles/select-styles.css';

const ProductsGrid = ({
  cart,
  onAddToCart,
  isCartOpen,
  onToggleCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onCheckout,
  selectedCategory,
  searchQuery,
  onInitialProductsLoaded,
  onCategorySelect
}) => {
  // console.log('ProductsGrid rendered with props:', { selectedCategory, searchQuery });


  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [quickFilter, setQuickFilter] = useState('all');
  // Track previous filters to detect changes
  const [previousFilters, setPreviousFilters] = useState({
    selectedCategory: '',
    searchQuery: ''
  });
  // Modal (bottom sheet) for filtering by price and rating
  const [isPriceRatingSheetOpen, setIsPriceRatingSheetOpen] = useState(false);
  const [sheetMinPrice, setSheetMinPrice] = useState('');
  const [sheetMaxPrice, setSheetMaxPrice] = useState('');

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  // const [appliedMinRating, setAppliedMinRating] = useState('');
  const [displayedProducts, setDisplayedProducts] = useState(20);

  const selectRef = useRef(null);


  // Category mapping function - frontend to backend
  const getCategoryApiValue = (frontendCategory) => {
    const categoryMapping = {
      "xoz-mag": "xoz-mag",
      "yevro-remont": "yevro-remont",
      "elektrika": "elektrika",
      "dekorativ-mahsulotlar": "dekorativ-mahsulotlar",
      "santexnika": "santexnika",
    };

    return categoryMapping[frontendCategory] || frontendCategory;
  };

  // Build API URL with parameters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.append('limit', '1000');
    params.append('page', '1');
    params.append('sortBy', 'updatedAt');
    params.append('sortOrder', 'desc');

    if (selectedCategory && selectedCategory !== '') {
      params.append('category', getCategoryApiValue(selectedCategory));
    }

    if (searchQuery && searchQuery.trim() !== '') {
      params.append('search', searchQuery.trim());
    }

    return `http://localhost:5000/api/products?${params.toString()}`;
  }, [selectedCategory, searchQuery]);

  // Use optimized fetch hook with faster settings for better UX
  const {
    data: apiResponse,
    loading: apiLoading,
    error: apiError,
    refetch,
    isInitialFetch
  } = useOptimizedFetch(apiUrl, {
    debounceMs: 100, // Reduced debounce for faster response
    throttleMs: 500, // Reduced throttle
    cacheTime: 10 * 60 * 1000, // 10 minutes cache - longer cache
    refetchOnFocus: false, // Disable focus refetch to reduce requests
    enabled: true
  });

  // Remove minimum loading time - show data immediately when available
  useEffect(() => {
    setMinLoadingTime(false);
    // If we have data, hide skeleton immediately
    if (apiResponse && apiResponse.products) {
      setIsInitialLoad(false);
      setShowSkeleton(false);
      setLoading(false);
    }
  }, [apiResponse]);

  // Update products when API response changes - fixed for correct API structure
  useEffect(() => {
    if (apiResponse) {
      // API returns: { products: [...], pagination: {...} }
      if (apiResponse.products && Array.isArray(apiResponse.products)) {
        setProducts(apiResponse.products);
        setDisplayedProducts(Math.min(apiResponse.products.length, 20));

        // Only hide skeleton after minimum loading time has passed
        if (!minLoadingTime) {
          setIsInitialLoad(false); // Mark initial load as complete
          setShowSkeleton(false); // Hide skeleton when data loads
          setLoading(false);
        }

        // Call initial products loaded callback
        if (typeof onInitialProductsLoaded === 'function') {
          onInitialProductsLoaded();
        }
      } else {
        // API javob bo'lsa ham mahsulotlar bo'sh bo'lsa
        // console.log('API javob bor, lekin mahsulotlar yo\'q:', apiResponse);
        setProducts([]);
        if (!minLoadingTime) {
          setIsInitialLoad(false);
          setShowSkeleton(false);
          setLoading(false);
        }
      }
    } else {
      // API javob yo'q
      // console.log('API javob yo\'q', { apiResponse, apiLoading, apiError });
    }
  }, [apiResponse, onInitialProductsLoaded, minLoadingTime]);

  // Update loading state - show loading when API is loading and no products exist
  useEffect(() => {
    if (products.length > 0) {
      setLoading(false); // Never show loading when products exist
    } else {
      setLoading(apiLoading);
    }
  }, [apiLoading, products.length]);

  // Handle API loading state changes
  useEffect(() => {
    if (apiLoading && products.length === 0) {
      setShowSkeleton(true);
    }
  }, [apiLoading, products.length]);

  // Handle API errors - hide skeleton and show error state
  useEffect(() => {
    if (apiError && !minLoadingTime) {
      setShowSkeleton(false);
      setIsInitialLoad(false);
      setLoading(false);
    }
  }, [apiError, minLoadingTime]);

  // Initial loading state - ensure loading is true on first render
  useEffect(() => {
    if (products.length === 0 && !apiResponse) {
      setLoading(true);
    }
  }, [products.length, apiResponse]);

  // Detect filter changes and show skeleton
  useEffect(() => {
    const currentFilters = {
      selectedCategory: selectedCategory || '',
      searchQuery: searchQuery || ''
    };

    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(previousFilters);

    if (filtersChanged && !isInitialLoad) {
      setShowSkeleton(true);
      setDisplayedProducts(20);
    }

    setPreviousFilters(currentFilters);
  }, [selectedCategory, searchQuery, isInitialLoad]);

  // Reset displayed products when filters change (optimized fetch handles the API calls)
  useEffect(() => {
    setDisplayedProducts(20);
  }, [selectedCategory, searchQuery]);

  // Scroll event listener to close select dropdown
  useEffect(() => {
    const handleScroll = () => {
      if (selectRef.current) {
        selectRef.current.blur();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Reset displayed products when filters change
  useEffect(() => {
    setDisplayedProducts(20);
  }, [quickFilter, appliedMinPrice, appliedMaxPrice, searchTerm, currentCategory]);

  // Filter products directly without using the hook for now
  const filteredProducts = useMemo(() => {
    const productsToFilter = products;

    if (!productsToFilter || productsToFilter.length === 0) return [];

    let filtered = [...productsToFilter];

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter - API dan kelgan kategoriyalar bilan to'g'ri solishtirish
    if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== '') {
      filtered = filtered.filter(product => {
        // API dan kelgan kategoriya nomini kichik harfga o'tkazib solishtirish
        const productCategory = product.category?.toLowerCase();
        const selectedCat = selectedCategory.toLowerCase();
        return productCategory === selectedCat || productCategory?.includes(selectedCat);
      });
    }

    // Price filter
    if (appliedMinPrice || appliedMaxPrice) {
      filtered = filtered.filter(product => {
        const price = parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0');
        const min = appliedMinPrice ? parseInt(appliedMinPrice) : 0;
        const max = appliedMaxPrice ? parseInt(appliedMaxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Sort based on quickFilter
    filtered.sort((a, b) => {
      switch (quickFilter) {
        case 'mashhur':
          // Sort by popularity (reviews count or rating)
          const aPopularity = (a.reviews || 0) * (a.rating || 0);
          const bPopularity = (b.reviews || 0) * (b.rating || 0);
          return bPopularity - aPopularity; // Descending order
          
        case 'chegirma':
          // Sort by discount (products with oldPrice first)
          const aDiscount = a.oldPrice && a.oldPrice > a.price ? 
            ((a.oldPrice - a.price) / a.oldPrice) * 100 : 0;
          const bDiscount = b.oldPrice && b.oldPrice > b.price ? 
            ((b.oldPrice - b.price) / b.oldPrice) * 100 : 0;
          return bDiscount - aDiscount; // Descending order
          
        case 'yangi':
          // Sort by newest (createdAt or updatedAt)
          const aDate = new Date(a.createdAt || a.updatedAt || 0);
          const bDate = new Date(b.createdAt || b.updatedAt || 0);
          return bDate - aDate; // Descending order (newest first)
          
        case 'all':
        default:
          // Default sort by updatedAt
          const aUpdated = new Date(a.updatedAt || 0);
          const bUpdated = new Date(b.updatedAt || 0);
          return bUpdated - aUpdated; // Descending order
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, appliedMinPrice, appliedMaxPrice, quickFilter]);

  // Use centralized addToCart function
  const addToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };



  // Manual refresh function


  // Price filter actions
  const applyPriceFilter = () => {
    const min = minPrice === '' ? '' : parseInt(minPrice, 10);
    const max = maxPrice === '' ? '' : parseInt(maxPrice, 10);

    if (min !== '' && max !== '' && max < min) {
      return; // invalid range, do nothing
    }

    setAppliedMinPrice(min === '' ? '' : String(min));
    setAppliedMaxPrice(max === '' ? '' : String(max));
    setDisplayedProducts(20);
  };

  const clearPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setDisplayedProducts(20);
  };

  // Open bottom sheet for Narx/Baho filtering
  const openPriceRatingSheet = () => {
    setSheetMinPrice(appliedMinPrice || minPrice || '');
    setSheetMaxPrice(appliedMaxPrice || maxPrice || '');
    setIsPriceRatingSheetOpen(true);
  };

  const closePriceRatingSheet = () => setIsPriceRatingSheetOpen(false);

  const applyPriceRatingFromSheet = () => {
    // Apply min/max price from sheet
    const min = sheetMinPrice === '' ? '' : String(parseInt(sheetMinPrice, 10));
    const max = sheetMaxPrice === '' ? '' : String(parseInt(sheetMaxPrice, 10));
    if (min !== '' && max !== '' && parseInt(max, 10) < parseInt(min, 10)) {
      // swap to keep valid range
      setAppliedMinPrice(max);
      setAppliedMaxPrice(min);
      setMinPrice(max);
      setMaxPrice(min);
    } else {
      setAppliedMinPrice(min);
      setAppliedMaxPrice(max);
      setMinPrice(min);
      setMaxPrice(max);
    }
    setDisplayedProducts(20);
    setIsPriceRatingSheetOpen(false);
  };

  const calculateDiscount = (currentPrice, oldPrice) => {
    const current = parseInt(currentPrice?.toString().replace(/[^\d]/g, '') || '0');
    const old = parseInt(oldPrice?.toString().replace(/[^\d]/g, '') || '0');
    if (!old || !current || isNaN(old) || isNaN(current)) return 0;
    return Math.round(((old - current) / old) * 100);
  };

  // Handle category selection from CategoryNavigation
  const handleCategorySelect = useCallback((categoryName) => {
    // Use the parent's onCategorySelect if available, otherwise update local state
    if (onCategorySelect) {
      onCategorySelect(categoryName);
    }
    setCurrentCategory(categoryName || 'all');
  }, [onCategorySelect, setCurrentCategory]);

  // Handle retry functionality
  const handleRetry = useCallback(() => {
    setShowSkeleton(true);
    setIsInitialLoad(true);
    if (refetch) {
      refetch();
    }
  }, [refetch, setShowSkeleton, setIsInitialLoad]);

  // Determine when to show skeleton
  const shouldShowSkeleton = (
    (isInitialLoad && products.length === 0) ||
    (apiLoading && products.length === 0) ||
    (showSkeleton && products.length === 0) ||
    (isInitialFetch && products.length === 0) ||
    minLoadingTime // Always show skeleton during minimum loading time
  );

  // Debug logging - disabled to prevent infinite loop
  // console.log('=== ProductsGrid Debug ===');
  // console.log('Products length:', products.length);
  // console.log('Filtered products length:', filteredProducts.length);

  // Show skeleton when appropriate
  if (shouldShowSkeleton) {
    return <ProductGridSkeleton count={8} />;
  }

  // Show error state if there's an API error and no products
  if (apiError && products.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              Xatolik yuz berdi
            </h3>
            <p className="text-gray-500 mb-6">
              Mahsulotlarni yuklashda muammo yuz berdi. Iltimos, qayta urinib ko'ring.
            </p>
            <button
              onClick={handleRetry}
              className="bg-primary-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Qayta urinish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-4 lg:py-6">

      {/* Category Navigation - Mobile and Desktop */}
      <div className="mb-2">
        <CategoryNavigation
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          isDesktop={true}
        />
      </div>

      {/* Badge Filter */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <span className="text-gray-700 font-medium text-sm lg:text-base">Saralash:</span>
            <div className="relative">
              <select
                ref={selectRef}
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                className="custom-select custom-select-main"
              >
                <option value="all">Hammasi</option>
                <option value="mashhur">Mashhur</option>
                <option value="chegirma">Chegirma</option>
                <option value="yangi">Yangi</option>
              </select>

            </div>


            {/* Price Filter (hidden on mobile) */}
            <span className="hidden sm:inline text-gray-700 font-medium text-sm lg:text-base">Narx:</span>
            <div className="hidden sm:flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="dan"
                value={minPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number.isInteger(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setMinPrice(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
                    e.preventDefault();
                  }
                }}
                className="w-20 lg:w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:border-primary-orange transition-colors duration-200 bg-white"
              />
              <span className="text-gray-400 text-sm">-</span>
              <input
                type="number"
                min="0"
                placeholder="oldin"
                value={maxPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number.isInteger(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setMaxPrice(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.' || e.key === ',') {
                    e.preventDefault();
                  }
                }}
                className="w-20 lg:w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:border-primary-orange transition-colors duration-200 bg-white"
              />

              <button
                onClick={applyPriceFilter}
                disabled={minPrice && maxPrice && parseInt(maxPrice) < parseInt(minPrice)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${minPrice && maxPrice && parseInt(maxPrice) < parseInt(minPrice)
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-primary-orange hover:bg-primary-orange/90 text-white'
                  }`}
              >
                Qidirish
              </button>

              {(appliedMinPrice || appliedMaxPrice) && (
                <button
                  onClick={clearPriceFilter}
                  className="w-6 h-6 bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-700 rounded transition-colors duration-200 flex items-center justify-center"
                  title="Tozalash"
                >
                  <TimesIcon className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Narx filter bottom-sheet trigger */}
            <button
              onClick={openPriceRatingSheet}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm font-medium hover:bg-gray-50 sm:hidden"
              title="Narx bo'yicha filter"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              <span>Narx filtri</span>
            </button>
          </div>

        </div>
      </div>






      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <>
          {/* Modern Product Grid with enhanced design */}
          <ModernProductGrid
            products={filteredProducts.slice(0, displayedProducts)}
            onAddToCart={addToCart}
            loading={loading}
          />

          {/* Load More Button */}
          {displayedProducts < filteredProducts.length && (
            <div className="flex justify-start mt-8">
              <button
                onClick={() => setDisplayedProducts(prev => Math.min(prev + 20, filteredProducts.length))}
                className="px-8 py-3 bg-primary-orange hover:bg-orange-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ko'proq ko'rish
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              {searchTerm ? 'Hech narsa topilmadi' :
                currentCategory === 'all' ? 'Mahsulotlar yo\'q' : `${currentCategory} kategoriyasida mahsulot yo'q`}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ?
                `"${searchTerm}" so'rovi bo'yicha hech qanday mahsulot topilmadi. Boshqa kalit so'zlar bilan qidiring.` :
                currentCategory === 'all' ?
                  'Hozircha mahsulotlar qo\'shilmagan. Keyinroq qayta urinib ko\'ring.' :
                  'Bu kategoriyada mahsulotlar mavjud emas. Boshqa kategoriyalarni ko\'rib chiqing.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <TimesIcon className="w-4 h-4" />
                  Qidiruvni tozalash
                </button>
              )}
              {currentCategory !== 'all' && (
                <button
                  onClick={() => setCurrentCategory('all')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                  Barcha mahsulotlar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => onToggleCart && onToggleCart()}
        cart={cart || []}
        onRemoveFromCart={onRemoveFromCart}
        onUpdateQuantity={onUpdateQuantity}
        onCheckout={onCheckout}
      />



      {/* Bottom Sheet: Narx Filter (mobile) */}
      {isPriceRatingSheetOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={closePriceRatingSheet}></div>
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-4 pt-3 max-h-[80vh] overflow-y-auto transition-transform duration-300">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Narx filtri</h3>
              <button onClick={closePriceRatingSheet} className="text-gray-500 hover:text-gray-700">
                <TimesIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Minimal narx (so'm)</label>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={sheetMinPrice}
                  onChange={(e) => setSheetMinPrice(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-orange"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Maksimal narx (so'm)</label>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={sheetMaxPrice}
                  onChange={(e) => setSheetMaxPrice(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-orange"
                  placeholder="5000000"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closePriceRatingSheet}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
              >
                Bekor qilish
              </button>
              <button
                onClick={applyPriceRatingFromSheet}
                className="flex-1 bg-primary-orange text-white py-2 rounded-lg font-semibold hover:bg-opacity-90"
              >
                Qo'llash
              </button>
            </div>
            <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;