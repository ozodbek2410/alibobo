import React, { useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';

const VirtualizedProductsGrid = ({ 
  products, 
  onAddToCart, 
  onProductClick,
  containerWidth = 1200,
  containerHeight = 600 
}) => {
  // Calculate grid dimensions
  const { columnCount, columnWidth, rowHeight } = useMemo(() => {
    const minColumnWidth = 280;
    const cols = Math.floor(containerWidth / minColumnWidth);
    const colWidth = Math.floor(containerWidth / cols);
    const rowH = 400;
    
    return {
      columnCount: Math.max(cols, 1),
      columnWidth: colWidth,
      rowHeight: rowH
    };
  }, [containerWidth]);

  const rowCount = Math.ceil(products.length / columnCount);

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    const product = products[index];

    if (!product) {
      return <div style={style} />;
    }

    const formatPrice = (price) => {
      const numeric = parseInt(price?.toString().replace(/[^\d]/g, '') || '0', 10);
      return numeric.toLocaleString() + " so'm";
    };

    const currentImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : product.image;

    return (
      <div style={{ ...style, padding: '8px' }}>
        <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 flex flex-col h-full transform hover:scale-[1.02]">
          <div className="relative cursor-pointer" onClick={() => onProductClick(product)}>
            <div className="relative w-full h-48 overflow-hidden bg-white">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={product.name} 
                  loading="lazy"
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-contain transition-opacity duration-300" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <i className="fas fa-image text-gray-400 text-3xl"></i>
                </div>
              )}
            </div>

            {/* Badges */}
            {product.badge && (
              <span className="absolute top-2 left-2 bg-primary-orange text-white px-2 py-1 rounded-full text-xs font-semibold z-20">
                {product.badge}
              </span>
            )}
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-20">
                -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
              </span>
            )}
          </div>
          
          <div className="p-3 flex flex-col flex-grow bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border-t border-gray-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex-grow">
                <div className="cursor-pointer mb-2" onClick={() => onProductClick(product)}>
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 min-h-[2rem] hover:text-primary-orange transition-colors duration-200 leading-snug">
                    {product.name || 'Noma\'lum mahsulot'}
                  </h3>
                </div>
                
                {product.description && (
                  <div className="mb-2 p-2 bg-blue-50 rounded-md border-l-3 border-blue-200">
                    <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 line-through text-xs">
                          {formatPrice(product.oldPrice)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {product.stock !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-blue-600 font-medium">
                        {product.stock > 0 ? `${product.stock} ${product.unit || 'dona'}` : 'Tugagan'}
                      </p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="w-full bg-primary-orange text-white py-2 px-3 rounded-lg hover:bg-opacity-90 transition duration-300 font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <i className="fas fa-shopping-cart text-xs"></i>
                  <span>Buyurtma</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [products, columnCount, onAddToCart, onProductClick]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-search text-4xl text-gray-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3">Hech narsa topilmadi</h3>
          <p className="text-gray-500 mb-6">Qidiruv so'rovi bo'yicha hech qanday mahsulot topilmadi.</p>
        </div>
      </div>
    );
  }

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={containerHeight}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={containerWidth}
      overscanRowCount={2}
      overscanColumnCount={1}
    >
      {Cell}
    </Grid>
  );
};

export default VirtualizedProductsGrid;