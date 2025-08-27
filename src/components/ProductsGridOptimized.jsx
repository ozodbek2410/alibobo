import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useProducts, usePrefetchProduct } from '../hooks/useProductQueries';
import { useDebouncedSearch } from '../hooks/useDebounce';
import CartSidebar from './CartSidebar';
import { ProductsGridSkeleton } from './LoadingSkeleton';
import ProductDetail from './ProductDetail';

const ProductsGrid = memo(({
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
  onSearchQueryChange
}) => {
  // State management
  const [displayedProducts, setDisplayedProducts] = useState(20);
  const [hasMore, setHasMore] = useState(true);

  // Modal states
  const [isPriceRatingSheetOpen, setIsPriceRatingSheetOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');

  // Notification states
  const [showAddToCartNotification, setShowAddToCartNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState('');

  // Product detail modal states
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Image carousel states
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const selectRef = useRef(null);

  // Category mapping function
  const getCategoryApiValue = useCallback((frontendCategory) => {
    const categoryMapping = {
      "xoz-mag": "xoz-mag",
      "yevro-remont": "yevro-remont",
      "elektrika": "elektrika",
      "dekorativ-mahsulotlar": "dekorativ-mahsulotlar",
      "santexnika": "santexnika",
      "g'isht-va-bloklar": "gisht",
      "asbob-uskunalar": "asbob",
      "bo'yoq-va-lak": "boyoq",
      "elektr-mollalari": "elektr",
      "metall-va-armatura": "metall",
      "yog'och-va-mebel": "yog'och",
      "tom-materiallar": "tom",
      "issiqlik-va-konditsioner": "issiqlik",
      "dekor-va-bezatish": "dekor",
      "temir-beton": "temir",
      "gips-va-shpaklovka": "gips",
      "boshqalar": "boshqalar"
    };
    return categoryMapping[frontendCategory] || frontendCategory;
  }, []);

  // Use React Query for optimized data fetching with caching
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
    isStale,
    dataUpdatedAt
  } = useProducts(
    selectedCategory ? getCategoryApiValue(selectedCategory) : null,
    searchQuery,
    1, // page
    20  // limit
  );

  // Prefetch hook for product details on hover
  const prefetchProduct = usePrefetchProduct();

  // Memoized products to prevent unnecessary re-renders
  const products = useMemo(() => {
    return apiResponse?.products || [];
  }, [apiResponse]);

  // Filter products based on applied filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Price filter
    if (appliedMinPrice || appliedMaxPrice) {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        const min = parseFloat(appliedMinPrice) || 0;
        const max = parseFloat(appliedMaxPrice) || Infinity;
        return price >= min && price <= max;
      });
    }

    // Quick filter
    if (quickFilter !== 'all') {
      switch (quickFilter) {
        case 'Ommabop':
          filtered = filtered.filter(p => p.badge === 'Mashhur');
          break;
        case 'Mashhur':
          filtered = filtered.filter(p => p.badge === 'Mashhur');
          break;
        case 'Chegirma':
          filtered = filtered.filter(p => p.oldPrice && p.oldPrice > p.price);
          break;
        case 'Yangi':
          filtered = filtered.filter(p => p.badge === 'Yangi');
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [products, appliedMinPrice, appliedMaxPrice, quickFilter]);

  // Update displayed products when data changes
  useEffect(() => {
    setDisplayedProducts(Math.min(filteredProducts.length, 20));
    setHasMore(filteredProducts.length > 20);
  }, [filteredProducts]);

  // Call initial products loaded callback when data is first loaded
  useEffect(() => {
    if (products.length > 0 && typeof onInitialProductsLoaded === 'function') {
      onInitialProductsLoaded();
    }
  }, [products.length, onInitialProductsLoaded]);

  // Optimized add to cart function
  const addToCart = useCallback((product) => {
    if (onAddToCart) {
      onAddToCart(product);

      // Show notification
      setNotificationProduct(product.name);
      setShowAddToCartNotification(true);
      setTimeout(() => {
        setShowAddToCartNotification(false);
      }, 3000);
    }
  }, [onAddToCart]);

  // Product detail modal functions
  const openProductDetail = useCallback((product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  }, []);

  const closeProductDetail = useCallback(() => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  }, []);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  }, [refetch]);

  // Prefetch product details on hover for instant navigation
  const handleProductHover = useCallback((productId) => {
    prefetchProduct(productId);
  }, [prefetchProduct]);

  // Load more products function
  const loadMoreProducts = useCallback(() => {
    const newDisplayed = Math.min(displayedProducts + 20, filteredProducts.length);
    setDisplayedProducts(newDisplayed);
    setHasMore(newDisplayed < filteredProducts.length);
  }, [displayedProducts, filteredProducts.length]);

  // Image navigation functions
  const handleImageChange = useCallback((productId, newIndex) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: newIndex
    }));
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((productId, imagesLength) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = currentImageIndexes[productId] || 0;
      let newIndex;

      if (isLeftSwipe) {
        newIndex = currentIndex < imagesLength - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : imagesLength - 1;
      }

      handleImageChange(productId, newIndex);
    }
  }, [touchStart, touchEnd, currentImageIndexes, handleImageChange]);

  // Price filter handlers
  const applyPriceFilter = useCallback(() => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setIsPriceRatingSheetOpen(false);
  }, [minPrice, maxPrice]);

  const resetPriceFilter = useCallback(() => {
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
  }, []);

  // Scroll event listener to close select dropdown
  useEffect(() => {
    const handleScroll = () => {
      if (selectRef.current) {
        selectRef.current.blur();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading state - Show skeleton instead of spinner for better UX
  if (isLoading && products.length === 0) {
    return <ProductsGridSkeleton count={8} />;
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Xatolik yuz berdi
          </h3>
          <p className="text-gray-500 mb-4">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with filters and refresh */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Mahsulotlar ({filteredProducts.length})
          </h2>
          {isStale && (
            <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Ma'lumotlar eskirgan
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {dataUpdatedAt && (
            <span className="text-sm text-gray-500">
              Oxirgi yangilanish: {new Date(dataUpdatedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? '⏳' : '🔄'} Yangilash
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Avval ko'rsatiladi:</span>
          <select
            ref={selectRef}
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Ommabop</option>
            <option value="Mashhur">Mashhur</option>
            <option value="Chegirma">Chegirma</option>
            <option value="Yangi">Yangi</option>
          </select>

          <button
            onClick={() => setIsPriceRatingSheetOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Narx bo'yicha filtrlash
          </button>

          {(appliedMinPrice || appliedMaxPrice) && (
            <button
              onClick={resetPriceFilter}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Filtrni tozalash
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.slice(0, displayedProducts).map((product) => {
          const images = product.images || (product.image ? [product.image] : []);
          const currentImageIndex = currentImageIndexes[product._id] || 0;
          const currentImage = images[currentImageIndex] || '/assets/mahsulotlar/default-product.jpg';

          return (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => openProductDetail(product)}
              onMouseEnter={() => handleProductHover(product._id)}
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/assets/mahsulotlar/default-product.jpg';
                  }}
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
                        handleImageChange(product._id, newIndex);
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all duration-200"
                    >
                      ←
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
                        handleImageChange(product._id, newIndex);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all duration-200"
                    >
                      →
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {currentImageIndex + 1}/{images.length}
                    </div>

                    {/* Touch handlers for mobile */}
                    <div
                      className="absolute inset-0"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={() => handleTouchEnd(product._id, images.length)}
                    />
                  </>
                )}

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-orange-600">
                      {product.price?.toLocaleString()} so'm
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {product.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                  >
                    Savatga
                  </button>
                </div>

                {/* Stock Info */}
                {product.stock !== undefined && (
                  <div className="mt-2 text-xs text-gray-500">
                    {product.stock > 0 ? `${product.stock} ${product.unit || 'dona'} mavjud` : 'Tugagan'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreProducts}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Ko'proq yuklash ({filteredProducts.length - displayedProducts} qoldi)
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Mahsulotlar topilmadi
          </h3>
          <p className="text-gray-500">
            Qidiruv shartlaringizni o'zgartirib ko'ring
          </p>
        </div>
      )}

      {/* Price Filter Modal */}
      {isPriceRatingSheetOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Narx bo'yicha filtrlash</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimal narx (so'm)
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maksimal narx (so'm)
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="10000000"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsPriceRatingSheetOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors duration-200"
              >
                Bekor qilish
              </button>
              <button
                onClick={applyPriceFilter}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors duration-200"
              >
                Qo'llash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Notification */}
      {showAddToCartNotification && (
        <div className="fixed top-20 right-4 md:top-24 md:right-6 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-[60] transform transition-all duration-300 max-w-xs md:max-w-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm md:text-base">
              {notificationProduct} savatga qo'shildi!
            </span>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={onToggleCart}
        cart={cart}
        onRemoveFromCart={onRemoveFromCart}
        onUpdateQuantity={onUpdateQuantity}
        onCheckout={onCheckout}
      />

      {/* Product Detail Modal */}
      {isProductDetailOpen && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          isOpen={isProductDetailOpen}
          onClose={closeProductDetail}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
});

ProductsGrid.displayName = 'ProductsGrid';

export default ProductsGrid;
