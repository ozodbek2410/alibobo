import React, { useState, useCallback, memo } from 'react';
import { ShoppingCartIcon } from './Icons';

const ModernProductCard = memo(({
  product,
  onAddToCart,
  onOpenDetail,
  currentImageIndex: externalCurrentImageIndex = 0,
  onImageChange,
  lastHoverTime: externalLastHoverTime = 0,
  onHoverTimeChange,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [internalCurrentImageIndex, setInternalCurrentImageIndex] = useState(0);
  const [internalLastHoverTime, setInternalLastHoverTime] = useState(0);


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

  // Get all product images from variants
  const getAllProductImages = () => {
    const allImages = [];
    
    // If product has variants, collect all variant images
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        if (variant.options && variant.options.length > 0) {
          variant.options.forEach(option => {
            if (option.images && option.images.length > 0) {
              allImages.push(...option.images);
            } else if (option.image) {
              allImages.push(option.image);
            }
          });
        }
      });
    }
    
    // If no variant images, use product images
    if (allImages.length === 0) {
      if (product.images && product.images.length > 0) {
        allImages.push(...product.images);
      } else if (product.image) {
        allImages.push(product.image);
      }
    }
    
    // Remove duplicates and ensure at least one image
    const uniqueImages = [...new Set(allImages)];
    return uniqueImages.length > 0 ? uniqueImages : ['/assets/default-product.png'];
  };

  const productImages = getAllProductImages();

  // Use external state if provided, otherwise use internal state
  const currentImageIndex = onImageChange ? externalCurrentImageIndex : internalCurrentImageIndex;
  const lastHoverTime = onHoverTimeChange ? externalLastHoverTime : internalLastHoverTime;

  const currentImage = productImages[currentImageIndex] || productImages[0];
  const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0;
  const hasMultipleImages = productImages.length > 1;

  // Handle hover-based image navigation (from original ProductCard.jsx)
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
      if (onImageChange && onHoverTimeChange) {
        // Use external state management
        onImageChange(product._id, newIndex);
        onHoverTimeChange(product._id, currentTime);
      } else {
        // Use internal state management
        setInternalCurrentImageIndex(newIndex);
        setInternalLastHoverTime(currentTime);
      }
    }
  }, [productImages.length, lastHoverTime, currentImageIndex, onImageChange, onHoverTimeChange, product._id]);

  const handleMouseLeave = useCallback(() => {
    if (onHoverTimeChange) {
      onHoverTimeChange(product._id, 0);
    }
  }, [onHoverTimeChange, product._id]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e) => {
    if (productImages.length <= 1) return;

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
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
      if (onImageChange && onHoverTimeChange) {
        // Use external state management
        onImageChange(product._id, newIndex);
        onHoverTimeChange(product._id, Date.now());
      } else {
        // Use internal state management
        setInternalCurrentImageIndex(newIndex);
        setInternalLastHoverTime(Date.now());
      }
    }
  }, [productImages.length, currentImageIndex, onImageChange, onHoverTimeChange, product._id]);

  // Handle dot navigation
  const handleDotClick = useCallback((index, e) => {
    e.stopPropagation();
    if (onImageChange) {
      onImageChange(product._id, index);
    } else {
      setInternalCurrentImageIndex(index);
    }
  }, [onImageChange, product._id]);

  // Handle action buttons
  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();

    // If product has variants, open detail modal instead of adding directly
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      onOpenDetail(product);
    } else {
      onAddToCart(product);
    }
  }, [onAddToCart, onOpenDetail, product]);

  const handleOpenDetail = useCallback(() => {
    onOpenDetail(product);
  }, [onOpenDetail, product]);

  const handleCardClick = useCallback(() => {
    // If product has variants, open detail modal for variant selection
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      onOpenDetail(product);
    } else {
      // If no variants, add directly to cart
      onAddToCart(product);
    }
  }, [product, onOpenDetail, onAddToCart]);

  return (
    <div
      className={`group bg-white rounded-lg shadow-md p-2.5 md:p-3 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-gray-200 hover:border-orange-200 relative h-full flex flex-col cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative cursor-pointer overflow-hidden rounded-lg mb-3 border border-gray-100" onClick={handleOpenDetail}>
        <div
          className="relative w-full h-48 sm:h-56 lg:h-64 bg-white rounded-lg"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
        >
          {/* Main Image */}
          <img
            src={currentImage}
            alt={product.name}
            className={`w-full h-full object-contain transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'
              } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
            }}
          />

          {/* Loading Skeleton */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Hover Areas Indicator (only visible on hover for multiple images) */}
          {hasMultipleImages && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-black/5 to-transparent"></div>
              <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-black/5 to-transparent"></div>
            </div>
          )}

          {/* Progress Indicators - Show current image position */}
          {hasMultipleImages && (
            <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-2 pb-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(index, e)}
                  className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${index === currentImageIndex
                    ? 'bg-primary-orange shadow-sm'
                    : 'bg-gray-400/70 hover:bg-gray-500/80'
                    }`}
                  aria-label={`Rasm ${index + 1}`}
                  title={`Rasm ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Badges - Left side */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {/* New Badge - Smaller font */}
            {product.isNew && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-md font-normal">
                Yangi
              </span>
            )}
            
            {/* Popular Badge */}
            {product.isPopular && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-md font-normal">
                Top
              </span>
            )}

            {/* Custom Badge */}
            {product.badge && product.badge !== 'Yo\'q' && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-md font-normal">
                {product.badge}
              </span>
            )}

            {/* Stock Badge */}
            {product.stock !== undefined && product.stock < 5 && product.stock > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-md font-normal">
                Kam qoldi
              </span>
            )}
          </div>

          {/* Discount Badge - Right side, smaller font, no animation */}
          {discount > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md font-normal">
                -{discount}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Info - Zamonaviy va rangli dizayn */}
      <div className="flex flex-col flex-1 justify-between">
        {/* All Product Information in One Container */}
        <div className="space-y-2">
          {/* Brand - Rangli brand indicator */}
          {product.brand && (
            <div className="inline-flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-purple-600 font-medium tracking-wide uppercase bg-purple-50 px-2 py-0.5 rounded-full">
                {product.brand}
              </span>
            </div>
          )}
          
          {/* Product Name va Description - Yaqin joylashtirilgan */}
          <div className="cursor-pointer space-y-1" onClick={handleOpenDetail}>
            <h3 className="font-semibold text-sm md:text-base text-gray-900 leading-snug hover:text-primary-orange transition-colors duration-200 line-clamp-2">
              {product.name || 'Noma\'lum mahsulot'}
            </h3>
            
            {/* Description - Yaqin joylashtirilgan */}
            {product.description && (
              <div className="bg-slate-50 p-1.5 rounded border-l-2 border-slate-200 mt-0">
                <p className="text-slate-600 text-xs leading-tight line-clamp-2 font-medium m-0">
                  {product.description}
                </p>
              </div>
            )}
          </div>
          
          {/* Price Section - Enhanced layout with colors */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-bold text-primary-orange">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through bg-gray-50 px-1.5 py-0.5 rounded">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>
          
          {/* Stock Info - Compact one line */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600 font-medium">Mavjud:</span>
            </div>
            <span className={`font-semibold ${
              product.stock > 10 
                ? 'text-green-600' 
                : product.stock > 0 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
            }`}>
              {product.stock > 0 ? `${product.stock} ${product.unit || 'dona'}` : 'Tugagan'}
            </span>
          </div>
        </div>
        
        {/* Button - Always at bottom */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 mt-3 ${
            product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-orange to-orange-500 text-white hover:from-orange-600 hover:to-orange-600 hover:shadow-lg active:scale-[0.98] shadow-md'
          }`}
        >
          {product.stock === 0 ? 'Tugagan' : 'Ko\'rish'}
        </button>
      </div>
    </div>
  );
});

ModernProductCard.displayName = 'ModernProductCard';

export default ModernProductCard;