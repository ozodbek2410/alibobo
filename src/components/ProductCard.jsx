import React, { memo, useCallback } from 'react';

const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onProductClick,
  currentImageIndex = 0,
  onImageIndexChange,
  lastHoverTime = 0,
  onHoverTimeChange
}) => {
  const formatPrice = useCallback((price) => {
    const numeric = parseInt(price?.toString().replace(/[^\d]/g, '') || '0', 10);
    return numeric.toLocaleString() + " so'm";
  }, []);

  const calculateDiscount = useCallback((currentPrice, oldPrice) => {
    const current = parseInt(currentPrice?.toString().replace(/[^\d]/g, '') || '0');
    const old = parseInt(oldPrice?.toString().replace(/[^\d]/g, '') || '0');
    if (!old || !current || isNaN(old) || isNaN(current)) return 0;
    return Math.round(((old - current) / old) * 100);
  }, []);

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    onAddToCart(product);
  }, [onAddToCart, product]);

  const handleProductClick = useCallback(() => {
    onProductClick(product);
  }, [onProductClick, product]);

  // Get product images
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : []);
  
  const currentImage = productImages.length > 0 ? productImages[currentImageIndex] : null;
  const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0;

  // Handle hover-based image navigation
  const handleMouseMove = useCallback((e) => {
    if (productImages.length <= 1) return;
    
    const currentTime = Date.now();
    const hoverDelay = 800; // 800ms delay between changes
    
    if (currentTime - lastHoverTime < hoverDelay) {
      return; // Too soon, ignore this hover
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    let newIndex;
    
    if (x < width / 2) {
      // Left side - previous image
      newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : currentImageIndex;
    } else {
      // Right side - next image
      newIndex = currentImageIndex < productImages.length - 1 ? currentImageIndex + 1 : currentImageIndex;
    }
    
    if (newIndex !== currentImageIndex) {
      onImageIndexChange(product._id, newIndex);
      onHoverTimeChange(product._id, currentTime);
    }
  }, [productImages.length, lastHoverTime, currentImageIndex, onImageIndexChange, onHoverTimeChange, product._id]);

  const handleMouseLeave = useCallback(() => {
    onHoverTimeChange(product._id, 0);
  }, [onHoverTimeChange, product._id]);

  return (
    <div className="bg-white rounded-lg lg:rounded-xl overflow-hidden shadow-lg hover:shadow-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 flex flex-col h-full transform hover:scale-[1.02]">
      <div className="relative cursor-pointer" onClick={handleProductClick}>
        {/* Image Container */}
        <div 
          className="relative w-full h-40 sm:h-48 lg:h-56 overflow-hidden bg-white border-b border-gray-200 group rounded-t-xl"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {currentImage ? (
            <img 
              src={currentImage} 
              alt={product.name} 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain transition-opacity duration-300" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white">
              <i className="fas fa-image text-gray-400 text-3xl"></i>
            </div>
          )}
          
          {/* Image indicators */}
          {productImages.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-4 pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageIndexChange(product._id, index);
                  }}
                  className={`flex-1 h-[0.5px] sm:h-[3px] rounded-full transition-colors duration-200 ${
                    index === currentImageIndex ? 'bg-primary-orange' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        {product.badge && product.badge !== 'Chegirma' && (
          <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-primary-orange text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
            {product.badge}
          </span>
        )}
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-red-500 text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
            -{discount}%
          </span>
        )}
      </div>
      
      <div className="p-3 lg:p-4 flex flex-col flex-grow bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border-t border-gray-200/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-grow">
            <div className="cursor-pointer mb-2" onClick={handleProductClick}>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] hover:text-primary-orange transition-colors duration-200 leading-snug">
                {product.name || 'Noma\'lum mahsulot'}
              </h3>
            </div>
            
            {product.description && (
              <div className="mb-2 p-2 bg-blue-50 rounded-md border-l-3 border-blue-200">
                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>

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
            
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary-orange text-white py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg hover:bg-opacity-90 transition duration-300 font-semibold flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              <i className="fas fa-shopping-cart text-xs lg:text-sm"></i>
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

export default ProductCard;