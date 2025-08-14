import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue, useTransition } from 'react';
import { useOptimizedFetch } from '../hooks/useOptimizedFetch';
import CartSidebar from './CartSidebar';
import ColorfulCategoryFilter from './ColorfulCategoryFilter';

import ModernProductGrid from './ModernProductGrid';
import { useOptimizedFilters } from '../hooks/useOptimizedFilters';
import { SearchIcon, TimesIcon } from './Icons';

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const sortBy = 'name';
  const priceRange = 'all';
  const [quickFilter, setQuickFilter] = useState('all');
  const [isPending, startTransition] = useTransition();
  
  // Use deferred values for non-urgent updates
  const deferredQuickFilter = useDeferredValue(quickFilter);
  const deferredSearchTerm = useDeferredValue(searchTerm);
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
  // page state not required; arrival order controls display
  const [hasMore, setHasMore] = useState(true);

  
  

  const selectRef = useRef(null);
  

  // const productsRef = useRef(products);

  // Category mapping function - frontend to backend
  const getCategoryApiValue = (frontendCategory) => {
    const categoryMapping = {
      "xoz-mag": "Xoz-mag",
      "yevro-remont": "Yevro-remont",
      "elektrika": "Elektrika",
      "dekorativ-mahsulotlar": "Dekorativ-mahsulotlar",
      "santexnika": "Santexnika",
    };
    
    return categoryMapping[frontendCategory] || frontendCategory;
  };

  // Build API URL with parameters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.append('limit', '20');
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
    refetch
  } = useOptimizedFetch(apiUrl, {
    debounceMs: 300, // 300ms debounce for search
    throttleMs: 1000, // 1s throttle for rapid changes
    cacheTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnFocus: true, // Smart focus refetch (only if data is stale)
    enabled: true
  });

  // Update products when API response changes - fixed for correct API structure
  useEffect(() => {
    if (apiResponse) {
      // API returns: { products: [...], totalPages: X, currentPage: Y, totalCount: Z }
      if (apiResponse.products && Array.isArray(apiResponse.products)) {
        setProducts(apiResponse.products);
        setDisplayedProducts(Math.min(apiResponse.products.length, 20));
        setLoading(false);
        
        // Call initial products loaded callback
        if (typeof onInitialProductsLoaded === 'function') {
          onInitialProductsLoaded();
        }
      } else {
        setProducts([]);
        setLoading(false);
      }
    }
  }, [apiResponse, onInitialProductsLoaded]);

  // Update loading state - only show loading when no products exist
  useEffect(() => {
    if (products.length > 0) {
      setLoading(false); // Never show loading when products exist
    } else {
      setLoading(apiLoading);
    }
  }, [apiLoading, products.length]);

  // Reset displayed products when filters change (optimized fetch handles the API calls)
  useEffect(() => {
    setDisplayedProducts(20);
    setHasMore(true);
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

  // Используем оптимизированные фильтры (должно быть в начале, до условного рендеринга)
  const {
    filters,
    filteredProducts,
    updateFilter,
    isPending: isFilterPending
  } = useOptimizedFilters(products, {
    search: searchQuery || '',
    category: selectedCategory || '',
    minPrice: appliedMinPrice,
    maxPrice: appliedMaxPrice,
    sortBy: quickFilter === 'all' ? 'updatedAt' : quickFilter
  });

  // Обработчики для виртуализированной сетки
  const handleToggleFavorite = useCallback((productId) => {
    // TODO: Implement favorites functionality
    console.log('Toggle favorite:', productId);
  }, []);

  const handleShare = useCallback((product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Посмотрите этот товар: ${product.name}`,
        url: window.location.href
      });
    } else {
      // Fallback для браузеров без Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  }, []);

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

  

  const getFilteredProducts = () => {
    if (products.length === 0) {
      return [];
    }
    
    let filtered = products;
    
    // Kategoriya bo'yicha filtrlash
    if (currentCategory !== 'all') {
      filtered = filtered.filter(product => product.category === getCategoryApiValue(currentCategory));
    }
    
    // Tezkor filter bo'yicha filtrlash (using deferred value)
    if (deferredQuickFilter !== 'all') {
      const matchingProducts = [];
      const otherProducts = [];
      
      filtered.forEach(product => {
        let matches = false;
        switch (quickFilter) {
          case 'mashhur':
            // Admin paneldan belgilangan mashhur mahsulotlar
            matches = product.isPopular || product.badge === 'Mashhur';
            break;
          case 'chegirma':
            // Chegirmadagi mahsulotlar: faqat eski va yangi narxga asoslanadi
            const currentPrice = parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0');
            const oldPrice = parseInt(product.oldPrice?.toString().replace(/[^\d]/g, '') || '0');
            matches = (oldPrice > 0 && currentPrice > 0 && oldPrice > currentPrice);
            break;
          case 'yangi':
            // Admin paneldan belgilangan yangi mahsulotlar
            matches = product.isNew || product.badge === 'Yangi';
            break;
          default:
            // Boshqa holatlar uchun hech qanday maxsus filtr qo'llanmaydi
            matches = false;
        }
        
        if (matches) {
          matchingProducts.push(product);
        } else {
          otherProducts.push(product);
        }
      });
      
      // Avval mos kelganlar, keyin qolganlar
      filtered = [...matchingProducts, ...otherProducts];
    } else {
      // Saralash
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return parseInt(a.price?.toString().replace(/[^\d]/g, '') || '0') - 
                   parseInt(b.price?.toString().replace(/[^\d]/g, '') || '0');
          case 'price-high':
            return parseInt(b.price?.toString().replace(/[^\d]/g, '') || '0') - 
                   parseInt(a.price?.toString().replace(/[^\d]/g, '') || '0');
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });
    }
    
    // Qidiruv bo'yicha filtrlash
    if (searchTerm.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Narx oralig'i bo'yicha filtrlash
    if (priceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0');
        switch (priceRange) {
          case '100000':
            return price >= 100000;
          case '200000':
            return price >= 200000;
          case '500000':
            return price >= 500000;
          case '1000000':
            return price >= 1000000;
          case '0-100000':
            return price < 100000;
          case '100000-500000':
            return price >= 100000 && price < 500000;
          case '500000-1000000':
            return price >= 500000 && price < 1000000;
          default:
            return true;
        }
      });
    }

    // Qo'lda kiritilgan narx oralig'i (min/max) bo'yicha filtrlash
    if (appliedMinPrice !== '' || appliedMaxPrice !== '') {
      const minVal = appliedMinPrice === '' ? 0 : parseInt(appliedMinPrice, 10);
      const maxVal = appliedMaxPrice === '' ? Number.POSITIVE_INFINITY : parseInt(appliedMaxPrice, 10);
      filtered = filtered.filter(product => {
        const price = parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0', 10);
        return price >= minVal && price <= maxVal;
      });
    }

    // Baho (rating) bo'yicha filtrlash
    // Rating filter removed for mobile simplicity
    
    return filtered;
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
  }, [onCategorySelect]);

  // Show loading skeleton only when truly loading and no products
  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
              <div className="h-56 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-1 lg:py-2">

      {/* Colorful Category Filter - Mobile and Desktop */}
      <div className="mb-6">
        <ColorfulCategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
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
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-gray-800 font-medium focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all duration-200 cursor-pointer text-sm min-w-[110px] lg:min-w-[120px]"
              >
                <option value="all">Hammasi</option>
                <option value="mashhur">Mashhur</option>
                <option value="chegirma">Chegirma</option>
                <option value="yangi">Yangi</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none z-10">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
                {(appliedMinPrice || appliedMaxPrice) && (
                  <button
                    onClick={clearPriceFilter}
                    className="absolute -right-9 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-700 rounded flex items-center justify-center"
                    title="Filtrni yopish"
                  >
                    <TimesIcon className="w-3 h-3" />
                  </button>
                )}
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
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setDisplayedProducts(prev => Math.min(prev + 20, filteredProducts.length))}
                className="px-8 py-3 bg-primary-orange hover:bg-orange-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ko'proq ko'rish ({Math.min(20, filteredProducts.length - displayedProducts)} ta)
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