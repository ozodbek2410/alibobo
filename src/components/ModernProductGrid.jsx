import React, { useState, useCallback, memo } from 'react';
import ModernProductCard from './ModernProductCard';
import ProductDetail from './ProductDetail';

const ModernProductGrid = memo(({ 
  products, 
  onAddToCart, 
  loading = false,
  className = ""
}) => {
  // Product detail modal states
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Image carousel states for product cards
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  
  // Notification states
  const [showAddToCartNotification, setShowAddToCartNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState('');

  // Product detail modal functions
  const openProductDetail = useCallback((product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  }, []);

  const closeProductDetail = useCallback(() => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  }, []);

  // Handle image change for product cards
  const handleImageChange = useCallback((productId, newIndex) => {
    setCurrentImageIndexes(prev => ({ ...prev, [productId]: newIndex }));
  }, []);

  // Handle add to cart with notification
  const handleAddToCart = useCallback((product) => {
    onAddToCart(product);
    
    // Show notification
    setNotificationProduct(product.name);
    setShowAddToCartNotification(true);
    setTimeout(() => {
      setShowAddToCartNotification(false);
    }, 3000);
  }, [onAddToCart]);



  // Loading skeleton
  if (loading && products.length === 0) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 ${className}`}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
            <div className="h-48 sm:h-56 lg:h-64 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l3-3 3 3" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Mahsulotlar topilmadi</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Boshqa kategoriya yoki kalit so'zni sinab ko'ring
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add to Cart Notification */}
      {showAddToCartNotification && (
        <div className="fixed top-20 right-4 md:top-24 md:right-6 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 transform transition-all duration-300 max-w-xs md:max-w-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm md:text-base">
              {notificationProduct} savatga qo'shildi!
            </span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 ${className}`}>
        {products.map((product) => (
          <ModernProductCard
            key={product._id}
            product={product}
            onAddToCart={handleAddToCart}
            onOpenDetail={openProductDetail}
            currentImageIndex={currentImageIndexes[product._id] || 0}
            onImageChange={handleImageChange}
          />
        ))}
      </div>

      {/* Product Detail Modal */}
      <ProductDetail
        product={selectedProduct}
        isOpen={isProductDetailOpen}
        onClose={closeProductDetail}
        onAddToCart={handleAddToCart}
      />
    </>
  );
});

ModernProductGrid.displayName = 'ModernProductGrid';

export default ModernProductGrid;