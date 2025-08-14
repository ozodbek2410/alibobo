import React, { memo, useMemo, useCallback, useDeferredValue, useState, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { SearchIcon, TimesIcon, PlusIcon, MinusIcon, HeartIcon, ShareIcon, ShoppingCartIcon } from './Icons';
import ProductDetail from './ProductDetail';

// Мемоизированная карточка товара
const ProductCard = memo(({ columnIndex, rowIndex, style, data }) => {
  const { products, itemsPerRow, onAddToCart, onToggleFavorite, onShare, openProductDetail, currentImageIndexes, setCurrentImageIndexes, touchStart, setTouchStart, touchEnd, setTouchEnd, lastHoverTimes, setLastHoverTimes } = data;
  const index = rowIndex * itemsPerRow + columnIndex;
  const product = products[index];

  // Local states for image loading
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!product) {
    return <div style={style} />;
  }

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
  
  // Get current image with fallback
  const getCurrentImage = useCallback(() => {
    const images = product.images || [];
    if (images.length > 0) {
      return images[currentImageIndex] || images[0];
    }
    return product.image || '/assets/mahsulotlar/default-product.jpg';
  }, [product.images, product.image, currentImageIndex]);

  const currentImage = getCurrentImage();

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  // Handle hover-based image navigation for desktop
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

  // Handle image navigation buttons (like in ProductCard.jsx)
  const handlePrevImage = useCallback((e) => {
    e.stopPropagation();
    const images = product.images || [];
    if (images.length > 1) {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
      setCurrentImageIndexes(prev => ({ ...prev, [product._id]: newIndex }));
    }
  }, [product._id, product.images, currentImageIndex, setCurrentImageIndexes]);

  const handleNextImage = useCallback((e) => {
    e.stopPropagation();
    const images = product.images || [];
    if (images.length > 1) {
      const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
      setCurrentImageIndexes(prev => ({ ...prev, [product._id]: newIndex }));
    }
  }, [product._id, product.images, currentImageIndex, setCurrentImageIndexes]);

  // Handle add to cart with event prevention
  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    onAddToCart(product);
  }, [product, onAddToCart]);

  const hasMultipleImages = (product.images || []).length > 1;

  return (
    <div style={style} className="p-1 sm:p-2">
      <div className="bg-white rounded-lg lg:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:scale-[1.02]">
        {/* Image Container - asl ProductsGrid kabi */}
        <div className="relative cursor-pointer" onClick={() => openProductDetail(product)}>
          <div 
            className="relative w-full h-28 sm:h-40 lg:h-48 overflow-hidden bg-white overscroll-contain border-b border-gray-200 group rounded-t-xl"
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
                className="w-full h-full object-contain transition-opacity duration-300"
                loading={index < 8 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={index < 4 ? 'high' : 'low'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            {/* Full-width segmented indicator (chiziqlar) */}
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

          {/* Badges - asl ProductsGrid kabi */}
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
          
          {/* Mashhur badge'i */}
          {(product.rating >= 4.5 && !product.badge && !(product.oldPrice && product.oldPrice > product.price)) && (
            <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-primary-orange text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              Mashhur
            </span>
          )}
          
          {/* Yangi badge'i */}
          {(product.isNew && !product.badge && !(product.oldPrice && product.oldPrice > product.price) && !(product.rating >= 4.5)) && (
            <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-green-500 text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              Yangi
            </span>
          )}
        </div>
        
        {/* Product Info - asl ProductsGrid kabi */}
        <div className="p-1.5 sm:p-3 lg:p-4 flex flex-col flex-grow bg-white">
          {/* Product Name Section */}
          <div className={`cursor-pointer ${product.description ? 'mb-1' : 'mb-2'}`} onClick={() => openProductDetail(product)}>
            <h3 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base line-clamp-2 min-h-[1.2rem] sm:min-h-[2rem] hover:text-primary-orange transition-colors duration-200 leading-tight">{product.name || 'Noma\'lum mahsulot'}</h3>
          </div>
          
          {/* Product Description */}
          {product.description && (
            <div className="mb-2 sm:mb-4 p-1 sm:p-2 bg-blue-50 rounded-md border-l-3 border-blue-200">
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
          
          {/* Price and Button - asl ProductsGrid kabi */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-xs sm:text-sm lg:text-base">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 line-through text-xs sm:text-sm">
                      {formatPrice(product.oldPrice)}
                    </span>
                    <span className="text-red-500 text-xs sm:text-sm font-medium">
                      -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
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
            
            {/* Action Button */}
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-primary-orange text-white py-1.5 sm:py-2 lg:py-2.5 px-2 sm:px-3 lg:px-4 rounded-lg hover:bg-opacity-90 transition duration-300 font-semibold flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base"
            >
              <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Buyurtma berish</span>
              <span className="sm:hidden">Buyurtma</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// Основной компонент виртуализированной сетки
const VirtualizedProductGrid = memo(({ 
  products, 
  onAddToCart, 
  onToggleFavorite, 
  onShare,
  containerHeight = 600,
  itemHeight = 380
}) => {
  // Product detail modal states
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Image carousel states for product cards
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [lastHoverTimes, setLastHoverTimes] = useState({});
  
  // Window size state for responsive behavior
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1024, height: 768 };
  });

  // Handle window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Product detail modal functions
  const openProductDetail = useCallback((product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  }, []);

  const closeProductDetail = useCallback(() => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  }, []);

  // Используем deferred value для плавности при фильтрации
  const deferredProducts = useDeferredValue(products);
  
  // Вычисляем количество колонок и ширину контейнера
  const { itemsPerRow, containerWidth, actualItemWidth } = useMemo(() => {
    const screenWidth = windowSize.width;
    const containerPadding = 32; // padding от ProductsGrid container
    const availableWidth = Math.max(320, screenWidth - containerPadding);
    
    let columns, actualWidth;
    
    if (screenWidth < 640) { // mobile
      columns = 2;
      actualWidth = Math.floor((availableWidth - 8) / 2); // 8px gap между колонками
    } else if (screenWidth < 1024) { // tablet
      columns = 2;
      actualWidth = Math.min(280, Math.floor((availableWidth - 16) / 2));
    } else if (screenWidth < 1280) { // desktop small
      columns = 3;
      actualWidth = Math.min(280, Math.floor((availableWidth - 32) / 3));
    } else { // desktop large
      columns = 4;
      actualWidth = Math.min(280, Math.floor((availableWidth - 48) / 4));
    }
    
    return { 
      itemsPerRow: columns,
      containerWidth: availableWidth,
      actualItemWidth: Math.max(150, actualWidth) // минимум 150px для мобильных
    };
  }, [windowSize.width]);
  
  const rowCount = Math.ceil(deferredProducts.length / itemsPerRow);
  
  // Мемоизированные данные для передачи в Grid
  const itemData = useMemo(() => ({
    products: deferredProducts,
    itemsPerRow,
    onAddToCart,
    onToggleFavorite,
    onShare,
    openProductDetail,
    currentImageIndexes,
    setCurrentImageIndexes,
    touchStart,
    setTouchStart,
    touchEnd,
    setTouchEnd,
    lastHoverTimes,
    setLastHoverTimes
  }), [deferredProducts, itemsPerRow, onAddToCart, onToggleFavorite, onShare, openProductDetail, currentImageIndexes, setCurrentImageIndexes, touchStart, setTouchStart, touchEnd, setTouchEnd, lastHoverTimes, setLastHoverTimes]);
  
  if (deferredProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l3-3 3 3" />
          </svg>
          <p className="text-gray-500 text-base">Mahsulotlar topilmadi</p>
          <p className="text-gray-400 text-sm">Boshqa kategoriya yoki kalit so'zni sinab ko'ring</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="w-full">
        <Grid
          columnCount={itemsPerRow}
          columnWidth={actualItemWidth}
          height={containerHeight}
          rowCount={rowCount}
          rowHeight={itemHeight}
          width={containerWidth}
          itemData={itemData}
          overscanRowCount={2}
          overscanColumnCount={1}
        >
          {ProductCard}
        </Grid>
      </div>
      
      {/* Product Detail Modal */}
      <ProductDetail
        product={selectedProduct}
        isOpen={isProductDetailOpen}
        onClose={closeProductDetail}
        onAddToCart={onAddToCart}
      />
    </>
  );
});

VirtualizedProductGrid.displayName = 'VirtualizedProductGrid';

export default VirtualizedProductGrid;