import React, { useState, useEffect } from 'react';

const ProductVariantSelector = ({ product, onVariantChange, selectedVariants = {} }) => {
  const [localSelectedVariants, setLocalSelectedVariants] = useState(selectedVariants);
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentStock, setCurrentStock] = useState(product.stock);
  const [currentImage, setCurrentImage] = useState(product.image);

  // Calculate price and stock based on selected variants
  useEffect(() => {
    let additionalPrice = 0;
    let minStock = product.stock;
    let variantImage = product.image;

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        const selectedOption = localSelectedVariants[variant.name];
        if (selectedOption) {
          const option = variant.options.find(opt => opt.value === selectedOption);
          if (option) {
            additionalPrice += option.price || 0;
            minStock = Math.min(minStock, option.stock || 0);
            if (option.image) {
              variantImage = option.image;
            }
          }
        }
      });
    }

    setCurrentPrice(product.price + additionalPrice);
    setCurrentStock(minStock);
    setCurrentImage(variantImage);

    // Notify parent component
    if (onVariantChange) {
      onVariantChange({
        selectedVariants: localSelectedVariants,
        price: product.price + additionalPrice,
        stock: minStock,
        image: variantImage
      });
    }
  }, [localSelectedVariants, product]);

  const handleVariantSelect = (variantName, optionValue) => {
    const updated = {
      ...localSelectedVariants,
      [variantName]: optionValue
    };
    setLocalSelectedVariants(updated);
  };

  // Check if all variants are selected
  const allVariantsSelected = product.variants?.every(variant => 
    localSelectedVariants[variant.name]
  ) || !product.hasVariants;

  if (!product.hasVariants || !product.variants || product.variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {product.variants.map((variant, variantIndex) => (
        <div key={variantIndex} className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">{variant.name}</h4>
            {localSelectedVariants[variant.name] && (
              <span className="text-sm text-gray-600">
                Tanlangan: {localSelectedVariants[variant.name]}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option, optionIndex) => {
              const isSelected = localSelectedVariants[variant.name] === option.value;
              const isOutOfStock = option.stock === 0;
              
              return (
                <button
                  key={optionIndex}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => handleVariantSelect(variant.name, option.value)}
                  className={`
                    relative px-3 py-2 text-sm font-medium rounded-md border transition-colors
                    ${isSelected 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : isOutOfStock
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{option.value}</span>
                  {option.price > 0 && (
                    <span className="ml-1 text-xs">
                      (+{option.price.toLocaleString()} so'm)
                    </span>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-400 transform rotate-12"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {!localSelectedVariants[variant.name] && (
            <p className="text-xs text-red-600">
              Iltimos, {variant.name.toLowerCase()}ni tanlang
            </p>
          )}
        </div>
      ))}

      {/* Price and stock info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {currentPrice.toLocaleString()} so'm
            </p>
            {currentPrice !== product.price && (
              <p className="text-sm text-gray-500">
                Asosiy narx: {product.price.toLocaleString()} so'm
              </p>
            )}
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${
              currentStock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {currentStock > 0 ? `${currentStock} ta mavjud` : 'Tugagan'}
            </p>
          </div>
        </div>
      </div>

      {/* Variant image preview */}
      {currentImage !== product.image && (
        <div className="pt-2">
          <p className="text-xs text-gray-600 mb-2">Tanlangan variant:</p>
          <img 
            src={currentImage} 
            alt="Variant preview"
            className="w-16 h-16 object-cover rounded-md border border-gray-200"
            onError={(e) => {
              e.target.src = product.image;
            }}
          />
        </div>
      )}

      {!allVariantsSelected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">
              Savatga qo'shish uchun barcha variantlarni tanlang
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;