import React, { memo, useState, useCallback } from 'react';

const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onOpenDetail,
  currentImageIndex = 0,
  onImageChange 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    onAddToCart(product);
  }, [product, onAddToCart]);

  // Handle product detail
  const handleOpenDetail = useCallback(() => {
    onOpenDetail(product);
  }, [product, onOpenDetail]);

  // Get current image
  const getCurrentImage = useCallback(() => {
    const images = product.images || [];
    if (images.length > 0) {
      return images[currentImageIndex] || images[0];
    }
    return product.image || '/assets/mahsulotlar/default-product.jpg';
  }, [product.images, product.image, currentImageIndex]);

  // Handle image navigation
  const handlePrevImage = useCallback((e) => {
    e.stopPropagation();
    const images = product.images || [];
    if (images.length > 1) {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
      onImageChange(product._id, newIndex);
    }
  }, [product._id, product.images, currentImageIndex, onImageChange]);

  const handleNextImage = useCallback((e) => {
    e.stopPropagation();
    const images = product.images || [];
    if (images.length > 1) {
      const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
      onImageChange(product._id, newIndex);
    }
  }, [product._id, product.images, currentImageIndex, onImageChange]);

  const hasMultipleImages = (product.images || []).length > 1;
  const currentImage = getCurrentImage();

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleOpenDetail}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Product Image */}
        <img
          src={currentImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />

        {/* Image Navigation for Multiple Images */}
        {hasMultipleImages && !isLoading && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all duration-200"
            >
              ←
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all duration-200"
            >
              →
            </button>

            {/* Image Counter */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {currentImageIndex + 1}/{product.images.length}
            </div>
          </>
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {product.badge}
          </div>
        )}

        {/* Error Fallback */}
        {imageError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm">Rasm yuklanmadi</div>
            </div>
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
            onClick={handleAddToCart}
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
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
