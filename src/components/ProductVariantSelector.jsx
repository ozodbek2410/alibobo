import React, { useState, useEffect } from 'react';

const ProductVariantSelector = ({ product, onVariantChange, selectedVariants = {} }) => {
  const [localSelectedVariants, setLocalSelectedVariants] = useState(selectedVariants);
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentStock, setCurrentStock] = useState(product.stock);
  const [currentImage, setCurrentImage] = useState(product.image);

  // Update local state when selectedVariants prop changes
  useEffect(() => {
    setLocalSelectedVariants(selectedVariants);
  }, [selectedVariants]);

  // Auto-select first variant if none selected
  useEffect(() => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const autoSelected = {};
      let needsUpdate = false;

      product.variants.forEach(variant => {
        if (variant.options && variant.options.length > 0) {
          if (!selectedVariants[variant.name]) {
            // Auto-select first option if none selected
            autoSelected[variant.name] = variant.options[0].value;
            needsUpdate = true;
          } else {
            autoSelected[variant.name] = selectedVariants[variant.name];
          }
        }
      });

      if (needsUpdate) {
        setLocalSelectedVariants(autoSelected);
      }
    }
  }, [product, selectedVariants]);

  // Calculate price, stock, and images based on selected variants
  useEffect(() => {
    let finalPrice = product.price; // Start with base price
    let minStock = product.stock;
    let variantImage = product.image;
    let variantImages = product.images || (product.image ? [product.image] : []);

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        const selectedOption = localSelectedVariants[variant.name];
        if (selectedOption) {
          const option = variant.options.find(opt => opt.value === selectedOption);
          if (option) {
            // Use option price if it exists, otherwise keep base price
            if (option.price && option.price > 0) {
              finalPrice = option.price; // Replace with variant price, not add
            }
            minStock = Math.min(minStock, option.stock || 0);
            
            // Use variant images if available
            if (option.images && option.images.length > 0) {
              variantImages = option.images;
              variantImage = option.images[0];
            } else if (option.image) {
              variantImage = option.image;
              variantImages = [option.image];
            }
          }
        }
      });
    }

    setCurrentPrice(finalPrice);
    setCurrentStock(minStock);
    setCurrentImage(variantImage);

    // Notify parent component with images array
    if (onVariantChange) {
      onVariantChange({
        selectedVariants: localSelectedVariants,
        price: finalPrice,
        stock: minStock,
        image: variantImage,
        images: variantImages
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
            <h4 className="text-sm font-medium text-gray-800">{variant.name}</h4>
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
                    relative px-3 py-2 text-sm font-medium rounded-lg border transition-colors
                    ${isSelected 
                      ? 'bg-primary-orange text-white border-primary-orange' 
                      : isOutOfStock
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-primary-orange'
                    }
                  `}
                >
                  <span>{option.value}</span>
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-400 transform rotate-12"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          

        </div>
      ))}






    </div>
  );
};

export default ProductVariantSelector;