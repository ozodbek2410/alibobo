import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ProductCard from './ProductCard';

const LazyProductGrid = ({ 
  products, 
  loading, 
  onAddToCart, 
  onOpenDetail,
  onLoadMore,
  hasMore 
}) => {
  const [visibleProducts, setVisibleProducts] = useState(20);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const observerRef = useRef();
  const loadMoreRef = useRef();

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log('🔄 Loading more products...');
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore]);

  // Handle image navigation
  const handleImageChange = useCallback((productId, newIndex) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: newIndex
    }));
  }, []);

  // Memoized visible products to prevent unnecessary re-renders
  const displayedProducts = useMemo(() => {
    return products.slice(0, visibleProducts);
  }, [products, visibleProducts]);

  // Virtual scrolling for large lists
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product, index) => (
          <div key={product._id} className="transform transition-all duration-300">
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onOpenDetail={onOpenDetail}
              currentImageIndex={currentImageIndexes[product._id] || 0}
              onImageChange={handleImageChange}
            />
          </div>
        ))}
      </div>

      {/* Loading More Indicator */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="flex justify-center items-center py-8"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Yuklanmoqda...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Ko'proq yuklash
            </button>
          )}
        </div>
      )}

      {/* No More Products */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          Barcha mahsulotlar ko'rsatildi ({products.length} ta)
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Mahsulotlar topilmadi
          </h3>
          <p className="text-gray-500">
            Qidiruv shartlaringizni o'zgartirib ko'ring
          </p>
        </div>
      )}
    </div>
  );
};

export default LazyProductGrid;
