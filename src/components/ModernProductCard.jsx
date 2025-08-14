import React, { useState, useCallback, memo } from 'react';
import { ShoppingCartIcon } from './Icons';

const ModernProductCard = memo(({ 
  product, 
  onAddToCart, 
  onOpenDetail,
  currentImageIndex = 0,
  onImageChange,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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
  
  const currentImage = productImages[currentImageIndex] || productImages[0];
  const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0;
  const hasMultipleImages = productImages.length > 1;

  // Handle image navigation
  const handleImageNavigation = useCallback((direction, e) => {
    e.stopPropagation();
    if (!hasMultipleImages || !onImageChange) return;
    
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % productImages.length
      : currentImageIndex === 0 ? productImages.length - 1 : currentImageIndex - 1;
    
    onImageChange(product._id, newIndex);
  }, [currentImageIndex, productImages.length, hasMultipleImages, onImageChange, product._id]);

  // Handle dot navigation
  const handleDotClick = useCallback((index, e) => {
    e.stopPropagation();
    if (onImageChange) {
      onImageChange(product._id, index);
    }
  }, [onImageChange, product._id]);

  // Handle action buttons
  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    onAddToCart(product);
  }, [onAddToCart, product]);

  const handleOpenDetail = useCallback(() => {
    onOpenDetail(product);
  }, [onOpenDetail, product]);

  return (
    <div 
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-gray-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative cursor-pointer overflow-hidden" onClick={handleOpenDetail}>
        <div className="relative w-full h-48 sm:h-56 lg:h-64 bg-white">
          {/* Main Image */}
          <img
            src={currentImage}
            alt={product.name}
            className={`w-full h-full object-contain transition-all duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
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



          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Discount Badge */}
            {discount > 0 && (
              <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                -{discount}%
              </span>
            )}
            
            {/* Custom Badge */}
            {product.badge && product.badge !== 'Chegirma' && (
              <span className="bg-primary-orange text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                {product.badge}
              </span>
            )}
            
            {/* Popular Badge */}
            {(product.rating >= 4.5 && !product.badge && !discount) && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                ⭐ Mashhur
              </span>
            )}
            
            {/* New Badge */}
            {(product.isNew && !product.badge && !discount && !(product.rating >= 4.5)) && (
              <span className="bg-gradient-to-r from-green-400 to-green-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                🆕 Yangi
              </span>
            )}
          </div>


        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Product Name */}
        <div className="mb-3 cursor-pointer" onClick={handleOpenDetail}>
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base line-clamp-2 leading-tight hover:text-primary-orange transition-colors duration-200 min-h-[2.5rem]">
            {product.name || 'Noma\'lum mahsulot'}
          </h3>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
          </div>
        )}

        {/* Variants Preview */}
        {product.hasVariants && product.variants && product.variants.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {product.variants[0]?.options?.slice(0, 2).map((option, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                >
                  {option.value}
                </span>
              ))}
              {product.variants[0]?.options?.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{product.variants[0].options.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mb-3">
            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
              {product.description}
            </p>
          </div>
        )}

        {/* Price Section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-base lg:text-lg">
                  {formatPrice(product.price)}
                </span>
                {discount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    -{discount}%
                  </span>
                )}
              </div>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-gray-500 line-through text-sm">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            
            {/* Stock Info */}
            {product.stock !== undefined && product.stock > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-600">
                  <span className="text-green-600 font-medium">{product.stock}</span>
                  <span className="ml-1">{product.unit || 'dona'}</span>
                </p>
                {product.stock < 10 && (
                  <p className="text-xs text-orange-500 font-medium">Kam qoldi!</p>
                )}
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              product.stock === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary-orange text-white hover:bg-orange-600 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <ShoppingCartIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {product.stock === 0 ? 'Tugagan' : 'Savatga qo\'shish'}
            </span>
            <span className="sm:hidden">
              {product.stock === 0 ? 'Tugagan' : 'Qo\'shish'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

ModernProductCard.displayName = 'ModernProductCard';

export default ModernProductCard;