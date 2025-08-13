import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useOptimizedFetch } from '../hooks/useOptimizedFetch';
import CartSidebar from './CartSidebar';
import ProductDetail from './ProductDetail';

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
  onInitialProductsLoaded
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const sortBy = 'name';
  const priceRange = 'all';
  const [quickFilter, setQuickFilter] = useState('all');
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
  const [isPrefetching, setIsPrefetching] = useState(false);

  
  
  // Notification states
  const [showAddToCartNotification, setShowAddToCartNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState('');
  const selectRef = useRef(null);
  
  // Product detail modal states
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Image carousel states for product cards
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [lastHoverTimes, setLastHoverTimes] = useState({});
  // const productsRef = useRef(products);

  // Category mapping function - frontend to backend
  const getCategoryApiValue = (frontendCategory) => {
    const categoryMapping = {
      "g'isht-va-bloklar": "gisht",
      "asbob-uskunalar": "asbob", 
      "bo'yoq-va-lak": "boyoq",
      "elektr-mollalari": "elektr",
      "metall-va-armatura": "metall",
      "yog'och-va-mebel": "yog'och",
      "tom-materiallar": "tom",
      "santexnika": "santexnika",
      "issiqlik-va-konditsioner": "issiqlik",
      "dekor-va-bezatish": "dekor",
      "temir-beton": "temir",
      "gips-va-shpaklovka": "gips",
      "boshqalar": "boshqalar"
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

  // Use optimized fetch hook with smart caching and debouncing
  const { 
    data: apiResponse, 
    loading: apiLoading, 
    error: apiError, 
    refetch,
    lastFetch 
  } = useOptimizedFetch(apiUrl, {
    debounceMs: 500, // 500ms debounce for search
    throttleMs: 2000, // 2s throttle for rapid changes
    cacheTime: 3 * 60 * 1000, // 3 minutes cache
    refetchOnFocus: true, // Smart focus refetch (only if data is stale)
    enabled: true
  });

  // Update products when API response changes
  useEffect(() => {
    if (apiResponse?.products) {
      console.log('📦 Products updated from optimized fetch:', apiResponse.products.length);
      setProducts(apiResponse.products);
      setDisplayedProducts(Math.min(apiResponse.products.length, 20));
      
      // Call initial products loaded callback
      if (typeof onInitialProductsLoaded === 'function') {
        onInitialProductsLoaded();
      }
    }
  }, [apiResponse, onInitialProductsLoaded]);

  // Update loading state
  useEffect(() => {
    setLoading(apiLoading);
  }, [apiLoading]);

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

  // Use centralized addToCart function
  const addToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
      
      // Show notification
      setNotificationProduct(product.name);
      setShowAddToCartNotification(true);
      setTimeout(() => {
        setShowAddToCartNotification(false);
      }, 3000);
    }
  };

  

  // Product detail modal functions
  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };

  const closeProductDetail = () => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  };

  // Legacy loadProducts function - now uses optimized fetch for manual calls
  const loadProducts = useCallback(async (silent = false, nextPage = 1, append = false) => {
    console.log('⚠️ Legacy loadProducts called - using refetch instead');
    return refetch(silent);
  }, [refetch]);

 

  // Show error notification
  const showErrorNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 md:top-24 md:right-6 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
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
    let filtered = products;
    
    // Kategoriya bo'yicha filtrlash
    if (currentCategory !== 'all') {
      filtered = filtered.filter(product => product.category === getCategoryApiValue(currentCategory));
    }
    
    // Tezkor filter bo'yicha filtrlash
    if (quickFilter !== 'all') {
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
            console.log(`Chegirma check for ${product.name}: oldPrice=${oldPrice}, currentPrice=${currentPrice}, matches=${matches}`);
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



  

  const createProductCard = (product) => {
    const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0;
    
    // Helper function to format price safely
    const formatPrice = (price) => {
      const numeric = parseInt(price?.toString().replace(/[^\d]/g, '') || '0', 10);
      return numeric.toLocaleString() + " so'm";
    };
    
    // Get product images (support both new images array and old image field)
    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : (product.image ? [product.image] : []);
    
    // Get current image index for this product
    const currentImageIndex = currentImageIndexes[product._id] || 0;
    const currentImage = productImages.length > 0 ? productImages[currentImageIndex] : null;
    
    // Wheel-based navigation: only react to horizontal wheel (touchpad) so vertical page scroll remains natural
    const handleWheel = (e) => {
      if (productImages.length <= 1) return;
      const absX = Math.abs(e.deltaX || 0);
      const absY = Math.abs(e.deltaY || 0);
      if (absX <= absY || absX < 10) return; // ignore vertical or tiny deltas

      const direction = e.deltaX > 0 ? 'next' : 'prev';
      setCurrentImageIndexes(prev => {
        const currentIndex = prev[product._id] || 0;
        let newIndex;
        if (direction === 'next') {
          newIndex = currentIndex >= productImages.length - 1 ? 0 : currentIndex + 1;
        } else {
          newIndex = currentIndex <= 0 ? productImages.length - 1 : currentIndex - 1;
        }
        return { ...prev, [product._id]: newIndex };
      });
    };

    // Handle hover-based image navigation for desktop (like craftsmen cards)
    const handleMouseMove = (e) => {
      if (productImages.length <= 1) return;
      
      const currentTime = Date.now();
      const lastHoverTime = lastHoverTimes[product._id] || 0;
      const hoverDelay = 800; // 800ms delay between changes
      
      if (currentTime - lastHoverTime < hoverDelay) {
        return; // Too soon, ignore this hover
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      
      const currentIndex = currentImageIndexes[product._id] || 0;
      let newIndex;
      
      if (x < width / 2) {
        // Left side - previous image (don't loop to last image)
        newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      } else {
        // Right side - next image (don't loop to first image)
        newIndex = currentIndex < productImages.length - 1 ? currentIndex + 1 : currentIndex;
      }
      
      if (newIndex !== currentIndex) {
        setCurrentImageIndexes(prev => ({ ...prev, [product._id]: newIndex }));
        setLastHoverTimes(prev => ({ ...prev, [product._id]: currentTime }));
      }
    };

    // Handle mouse leave (keep current image, don't reset)
    const handleMouseLeave = () => {
      // Keep the current image active when mouse leaves
      // Do not reset to first image
      setLastHoverTimes(prev => ({ ...prev, [product._id]: 0 }));
    };

    // Handle touch events for mobile swipe navigation
    const handleTouchStart = (e) => {
      if (productImages.length <= 1) return;
      setTouchEnd(null); // Reset touch end
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
      if (productImages.length <= 1) return;
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e) => {
      if (!touchStart || !touchEnd || productImages.length <= 1) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;
      
      if (isLeftSwipe || isRightSwipe) {
        e.preventDefault();
        e.stopPropagation();
        
        setCurrentImageIndexes(prev => {
          const currentIndex = prev[product._id] || 0;
          let newIndex;
          
          if (isLeftSwipe) {
            // Swipe left - next image
            newIndex = currentIndex >= productImages.length - 1 ? 0 : currentIndex + 1;
          } else {
            // Swipe right - previous image
            newIndex = currentIndex <= 0 ? productImages.length - 1 : currentIndex - 1;
          }
          
          return { ...prev, [product._id]: newIndex };
        });
      }
      
      // Reset touch states
      setTouchStart(null);
      setTouchEnd(null);
    };
    
    // Handle dot navigation
    const handleDotClick = (productId, imageIndex, e) => {
      e.stopPropagation(); // Prevent opening product detail
      setCurrentImageIndexes(prev => ({ ...prev, [productId]: imageIndex }));
    };
    
    return (
      <div key={product._id} className="bg-white rounded-lg lg:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:scale-[1.02]">
        <div className="relative cursor-pointer" onClick={() => openProductDetail(product)}>
          {/* Image Container with Multiple Navigation Methods */}
          <div 
            className="relative w-full h-40 sm:h-48 lg:h-56 overflow-hidden bg-white overscroll-contain border-b border-gray-200 group rounded-t-xl"
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentImage ? (
              <img 
                src={currentImage} 
                alt={product.name} 
                loading="lazy"
                className="w-full h-full object-contain transition-opacity duration-300" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white">
                <i className="fas fa-image text-gray-400 text-3xl"></i>
              </div>
            )}
            
            {/* Full-width segmented indicator (replaces dots) */}
            {productImages.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-4 pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleDotClick(product._id, index, e)}
                    className={`flex-1 h-[0.5px] sm:h-[3px] rounded-full transition-colors duration-200 ${
                      index === currentImageIndex ? 'bg-primary-orange' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Badges (Chegirma badge UI emas, faqat matnli badge'lar) */}
          {product.badge && product.badge !== 'Chegirma' && (
            <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-primary-orange text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              {product.badge}
            </span>
          )}
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-red-500 text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </span>
          )}
          
          {/* Mashhur badge'i (faqat chegirma yo'q bo'lsa) */}
          {(product.rating >= 4.5 && !product.badge && !(product.oldPrice && product.oldPrice > product.price)) && (
            <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-primary-orange text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              Mashhur
            </span>
          )}
          
          {/* Yangi badge'i (faqat boshqa badge'lar yo'q bo'lsa) */}
          {(product.isNew && !product.badge && !(product.oldPrice && product.oldPrice > product.price) && !(product.rating >= 4.5)) && (
            <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-green-500 text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              Yangi
            </span>
          )}
        </div>
        
        <div className="p-3 lg:p-4 flex flex-col flex-grow bg-white">
          {/* Product Name Section */}
          <div className={`cursor-pointer ${product.description ? 'mb-2' : 'mb-4'}`} onClick={() => openProductDetail(product)}>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] hover:text-primary-orange transition-colors duration-200 leading-snug">{product.name || 'Noma\'lum mahsulot'}</h3>
          </div>
          
          {/* Product Description - Only show if exists */}
          {product.description && (
            <div className="mb-4 p-2 bg-blue-50 rounded-md border-l-3 border-blue-200">
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 line-through text-xs sm:text-sm">
                      {formatPrice(product.oldPrice)}
                    </span>
                    <span className="text-red-500 text-xs sm:text-sm font-medium">
                      -{discount}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Stock info */}
              {product.stock !== undefined && (
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    {product.stock > 0 ? `${product.stock} ${product.unit || 'dona'}` : 'Tugagan'}
                  </p>
                  {product.stock > 0 && product.stock < 10 && (
                    <p className="text-xs text-red-500 font-medium">Kam qoldi!</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Action Button - Always at bottom */}
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-primary-orange text-white py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg hover:bg-opacity-90 transition duration-300 font-semibold flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              <i className="fas fa-shopping-cart text-xs lg:text-sm"></i>
              <span className="hidden sm:inline">Buyurtma berish</span>
              <span className="sm:hidden">Buyurtma</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

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

  const filteredProducts = getFilteredProducts();

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">


      {/* Add to Cart Notification */}
      {showAddToCartNotification && (
        <div className="fixed top-20 right-4 md:top-24 md:right-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 max-w-xs md:max-w-sm">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle"></i>
            <span className="font-medium text-sm md:text-base">{notificationProduct} savatga qo'shildi!</span>
          </div>
        </div>
      )}
      
      {/* Badge Filter */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <span className="text-gray-700 font-medium text-sm lg:text-base">Saralash:</span>
              <div className="relative">
              <select
                ref={selectRef}
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-gray-800 font-medium focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all duration-200 cursor-pointer text-sm min-w-[110px] lg:min-w-[120px]"
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
                    <i className="fas fa-times text-xs"></i>
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
                  <i className="fas fa-times text-xs"></i>
                </button>
              )}
            </div>

            {/* Narx filter bottom-sheet trigger */}
            <button
              onClick={openPriceRatingSheet}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm font-medium hover:bg-gray-50 sm:hidden"
              title="Narx bo'yicha filter"
            >
              <i className="fas fa-sliders-h"></i>
              <span>Narx filtri</span>
            </button>
          </div>

        </div>
      </div>
      

   



      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.slice(0, displayedProducts).map(product => createProductCard(product))}
          </div>

          {/* Load More Button */}
          {(hasMore || displayedProducts < products.length) && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setDisplayedProducts(prev => Math.min(prev + 20, products.length))}
                disabled={displayedProducts >= products.length && isPrefetching}
                className="px-6 py-3 bg-primary-orange hover:bg-primary-orange/90 text-white rounded-lg font-medium transition-colors duration-200"
              >
                {displayedProducts < products.length ? "Ko'proq" : (isPrefetching ? 'Yuklanmoqda...' : "Ko'proq")}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-4xl text-gray-400"></i>
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
                  <i className="fas fa-times"></i>
                  Qidiruvni tozalash
                </button>
              )}
              {currentCategory !== 'all' && (
                <button
                  onClick={() => setCurrentCategory('all')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-globe"></i>
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
      
      {/* Product Detail Modal */}
      <ProductDetail
        product={selectedProduct}
        isOpen={isProductDetailOpen}
        onClose={closeProductDetail}
        onAddToCart={addToCart}
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
                <i className="fas fa-times"></i>
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