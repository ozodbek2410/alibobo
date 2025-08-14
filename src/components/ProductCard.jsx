import React, { useState, useCallback, memo } from 'react';

const ProductCard = memo(({
  product,
  onAddToCart,
  onOpenDetail,
  className = ""
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  // Helper function to format price safely
  const formatPrice = (price) => {
    const numeric = parseInt(price?.toString().replace(/[^\d]/g, '') || '0', 10);
    return numeric.toLocaleString() + " so'm";
  };

  // Calculate discount percentage
  const calculateDiscount = (currentPrice, oldPrice) => {
    if (!oldPrice || !currentPrice || oldPrice <= currentPrice) return 0;
    return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
  };

  // Get product images
  const productImages = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : ['/assets/default-product.png']);

  const currentImage = productImages[0];
  const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0;

  // Handle action buttons
  const handleCardClick = useCallback(() => {
    // If product has variants, open detail modal for variant selection
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      onOpenDetail(product);
    } else {
      // If no variants, add directly to cart
      onAddToCart(product);
    }
  }, [product, onOpenDetail, onAddToCart]);

  const handleButtonClick = useCallback((e) => {
    e.stopPropagation();
    
    // If product has variants, open detail modal instead of adding directly
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      onOpenDetail(product);
    } else {
      onAddToCart(product);
    }
  }, [onAddToCart, onOpenDetail, product]);

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-orange-200 relative h-full flex flex-col cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {/* New Badge */}
        {product.isNew && (
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
            Yangi
          </span>
        )}
        
        {/* Popular Badge */}
        {product.isPopular && (
          <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
            Top
          </span>
        )}
        
        {/* Custom Badge */}
        {product.badge && product.badge !== 'Yo\'q' && !product.isNew && (
          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
            {product.badge}
          </span>
        )}
      </div>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
            -{discount}%
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
        <img
          src={currentImage}
          alt={product.name}
          className={`w-full h-full object-contain hover:scale-105 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
          }}
        />

        {/* Loading Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Brand */}
        {product.brand && (
          <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
            {product.brand}
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-2 leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name || 'Noma\'lum mahsulot'}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-xs md:text-sm mb-3 line-clamp-2 leading-relaxed flex-grow">
          {product.description}
        </p>

        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg md:text-xl font-bold text-primary-orange">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                -{discount}%
              </span>
            )}
          </div>
          
          {/* Old Price */}
          {product.oldPrice && product.oldPrice > product.price && (
            <div className="text-gray-400 line-through text-xs">
              {formatPrice(product.oldPrice)}
            </div>
          )}
        </div>

        {/* Stock Info */}
        <div className="text-xs text-gray-500 mb-4">
          Mavjud: {product.stock || 0} {product.unit || 'dona'}
        </div>

        {/* Action Button */}
        <button
          onClick={handleButtonClick}
          disabled={product.stock === 0}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 mt-auto ${
            product.stock === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-primary-orange text-white hover:bg-opacity-90 hover:shadow-md'
          }`}
        >
          {product.stock === 0 ? 'Tugagan' : 'Ko\'rish'}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;