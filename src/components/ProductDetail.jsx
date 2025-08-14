import React, { useState, useEffect } from 'react';
import { getCategoryDisplayName } from '../utils/categoryMapping';
import ProductVariantSelector from './ProductVariantSelector';

const ProductDetail = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  
  // Variant system states
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantPrice, setVariantPrice] = useState(product?.price || 0);
  const [variantStock, setVariantStock] = useState(product?.stock || 0);
  const [variantImage, setVariantImage] = useState(product?.image || '');

  // Get product images - support both old and new format
  const baseImages = product?.images && product.images.length > 0 
    ? product.images 
    : (product?.image ? [product.image] : ['/assets/default-product.png']);
  
  // Add variant image to images if it's not already included
  const productImages = React.useMemo(() => {
    if (variantImage && variantImage !== product?.image && !baseImages.includes(variantImage)) {
      return [variantImage, ...baseImages];
    }
    return baseImages;
  }, [baseImages, variantImage, product?.image]);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedColor(product.colors?.[0] || '');
      setSelectedSize(product.sizes?.[0] || '');
      setVariantPrice(product.price);
      setVariantStock(product.stock);
      setVariantImage(product.image);
      
      // Auto-select first variant options
      if (product.hasVariants && product.variants && product.variants.length > 0) {
        const autoSelectedVariants = {};
        let autoPrice = product.price;
        let autoStock = product.stock;
        let autoImage = product.image;
        
        product.variants.forEach(variant => {
          if (variant.options && variant.options.length > 0) {
            // Select first available option (not out of stock)
            const firstAvailableOption = variant.options.find(option => option.stock > 0) || variant.options[0];
            autoSelectedVariants[variant.name] = firstAvailableOption.value;
            
            // Update price, stock, and image based on first variant
            if (firstAvailableOption.price && firstAvailableOption.price > 0) {
              autoPrice = firstAvailableOption.price;
            }
            if (firstAvailableOption.stock !== undefined) {
              autoStock = Math.min(autoStock, firstAvailableOption.stock);
            }
            if (firstAvailableOption.image) {
              autoImage = firstAvailableOption.image;
            }
          }
        });
        
        setSelectedVariants(autoSelectedVariants);
        setVariantPrice(autoPrice);
        setVariantStock(autoStock);
        setVariantImage(autoImage);
      } else {
        setSelectedVariants({});
      }
    }
  }, [product]);

  // Update main image when variant image changes
  useEffect(() => {
    if (variantImage && variantImage !== product?.image && productImages.includes(variantImage)) {
      const imageIndex = productImages.findIndex(img => img === variantImage);
      if (imageIndex !== -1) {
        setSelectedImageIndex(imageIndex);
      }
    }
  }, [variantImage, productImages, product?.image]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0 so'm";
    return price.toLocaleString() + " so'm";
  };

  const calculateDiscount = (currentPrice, oldPrice) => {
    if (!oldPrice || !currentPrice || oldPrice <= currentPrice) return 0;
    return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
  };

  const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0;

  // Check if all variants are selected
  const allVariantsSelected = !product.hasVariants || 
    !product.variants || 
    product.variants.length === 0 || 
    product.variants.every(variant => selectedVariants[variant.name]);

  const handleAddToCart = () => {
    // Don't add to cart if variants are required but not all selected
    if (product.hasVariants && !allVariantsSelected) {
      return;
    }

    const productToAdd = {
      ...product,
      selectedColor,
      selectedSize,
      quantity,
      // Add variant information
      selectedVariants: product.hasVariants ? selectedVariants : {},
      finalPrice: product.hasVariants ? variantPrice : product.price,
      finalStock: product.hasVariants ? variantStock : (product.stock || product.quantity),
      finalImage: product.hasVariants ? variantImage : product.image,
      // Create a unique identifier for cart items with variants
      cartId: product.hasVariants 
        ? `${product.id || product._id}-${Object.values(selectedVariants).join('-')}`
        : (product.id || product._id)
    };
    onAddToCart(productToAdd);
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const navigateImage = (direction) => {
    if (direction === 'prev' && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    } else if (direction === 'next' && selectedImageIndex < productImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start md:items-center justify-center p-1 sm:p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg md:rounded-xl max-w-6xl w-full max-h-[99vh] sm:max-h-[98vh] md:max-h-[90vh] overflow-y-auto mt-1 sm:mt-2 md:mt-0 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 md:p-4 flex items-center justify-between z-10 shadow-sm">
          <h2 className="text-sm md:text-base lg:text-lg font-medium text-gray-800 line-clamp-2 md:line-clamp-1 pr-2">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
          >
            <i className="fas fa-times text-gray-500 text-lg"></i>
          </button>
        </div>

        <div className="p-2 sm:p-3 md:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageClick(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index
                          ? 'border-primary-orange'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain bg-white"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Main Image */}
              <div className="relative bg-white rounded-lg overflow-hidden aspect-square border border-gray-100">
                <img
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                
                {/* Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 sm:p-2 shadow-md transition-all duration-200"
                      disabled={selectedImageIndex === 0}
                    >
                      <i className="fas fa-chevron-left text-gray-600 text-xs sm:text-sm"></i>
                    </button>
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 sm:p-2 shadow-md transition-all duration-200"
                      disabled={selectedImageIndex === productImages.length - 1}
                    >
                      <i className="fas fa-chevron-right text-gray-600 text-xs sm:text-sm"></i>
                    </button>
                  </>
                )}

                {/* Badges */}
                {product.badge && (
                  <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-primary-orange text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-5">
              {/* Price */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg shadow-sm border border-orange-200">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {discount > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      -{discount}% Chegirma
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium text-sm">Narxi:</span>
                    <span className="text-xl font-bold text-primary-orange">
                      {formatPrice(product.hasVariants ? variantPrice : product.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium text-sm">Holati:</span>
                    <span className="text-green-600 font-medium flex items-center gap-1 text-sm">
                      <i className="fas fa-check-circle text-sm"></i>
                      Mavjud
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 text-sm">Tavsif</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Variants - New Uzum Market Style */}
              {product.hasVariants && product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  <ProductVariantSelector
                    product={product}
                    selectedVariants={selectedVariants}
                    onVariantChange={(variantData) => {
                      setSelectedVariants(variantData.selectedVariants);
                      setVariantPrice(variantData.price);
                      setVariantStock(variantData.stock);
                      setVariantImage(variantData.image);
                    }}
                  />
                </div>
              )}

              {/* Legacy Colors - Show only if no variants */}
              {!product.hasVariants && product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Rang: {selectedColor}</h4>
                  <div className="flex gap-1 sm:gap-2 flex-wrap">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm ${
                          selectedColor === color
                            ? 'border-primary-orange bg-orange-50 text-primary-orange'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Sizes - Show only if no variants */}
              {!product.hasVariants && product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">O'lcham:</h4>
                  <div className="flex gap-1 sm:gap-2 flex-wrap">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm ${
                          selectedSize === size
                            ? 'border-primary-orange bg-orange-50 text-primary-orange'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 text-sm">Miqdor:</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    <i className="fas fa-minus text-gray-600 text-sm"></i>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, value));
                    }}
                    inputMode="numeric"
                    step="1"
                    aria-label="Miqdor"
                    placeholder="1"
                    className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange text-sm font-medium"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    <i className="fas fa-plus text-gray-600 text-sm"></i>
                  </button>
                </div>
              </div>
              

              {/* Product Information */}
              <div className="space-y-3 border-t border-gray-200 pt-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 shadow-sm">
                <h4 className="font-medium text-gray-800 text-sm flex items-center gap-2">
                  <i className="fas fa-info-circle text-primary-orange text-sm"></i>
                  Mahsulot ma'lumotlari
                </h4>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  {/* Single row layout for mobile */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2 border-l-4 border-primary-orange bg-orange-50 rounded-r">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium text-sm">Kategoriya:</span>
                        <span className="text-gray-900 font-medium text-sm">{getCategoryDisplayName(product.category)}</span>
                      </div>
                    </div>
                    
                    {/* Show selected variant stock information */}
                    {product.hasVariants && product.variants && product.variants.length > 0 ? (
                      <div className="flex items-center justify-between p-2 border-l-4 border-primary-orange bg-orange-50 rounded-r">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium text-sm">Miqdor:</span>
                          <span className="text-gray-900 font-medium text-sm">
                            {variantStock > 0 ? `${variantStock} ta mavjud` : 'Tugagan'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 border-l-4 border-primary-orange bg-orange-50 rounded-r">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium text-sm">Miqdor:</span>
                          <span className="text-gray-900 font-medium text-sm">{product.quantity || product.stock || '100'} ta mavjud</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Features - Hidden on mobile */}
              <div className="hidden md:block space-y-3 border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 text-sm">Xususiyatlari</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-truck text-primary-orange text-xs"></i>
                    <span>Yetkazib berish</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-star text-primary-orange text-xs"></i>
                    <span>Yuqori sifat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-tools text-primary-orange text-xs"></i>
                    <span>Qurilish uchun mos</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!allVariantsSelected}
                className={`w-full py-3 px-6 rounded-lg transition-all duration-200 font-medium text-base flex items-center justify-center gap-2 shadow-md ${
                  allVariantsSelected
                    ? 'bg-primary-orange text-white hover:bg-opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <i className="fas fa-shopping-cart text-sm"></i>
                {allVariantsSelected ? 'Savatga qo\'shish' : 'Variantlarni tanlang'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
