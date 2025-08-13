import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from './Header';
import ProductsGridOptimized from './ProductsGridOptimized';
import Craftsmen from './Craftsmen';
import Services from './Services';
import Footer from './Footer';
import useSmartFetch from '../hooks/useSmartFetch';

const MainPage = ({ onSuccessfulLogin }) => {
  // State management
  const [craftsmenData, setCraftsmenData] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Cart states - centralized here
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Catalog and search states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Smart fetch for craftsmen data with caching
  const { 
    data: craftsmenResponse, 
    loading: craftsmenLoading, 
    error: craftsmenError 
  } = useSmartFetch('http://localhost:5000/api/craftsmen?limit=100&status=active', {
    cacheTime: 10 * 60 * 1000, // 10 minutes cache for craftsmen
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    refetchOnFocus: true,
    enabled: true
  });

  // Update craftsmen data when fetch completes
  useEffect(() => {
    if (craftsmenResponse?.craftsmen) {
      console.log('👷 Craftsmen loaded via smart fetch:', craftsmenResponse.craftsmen.length);
      setCraftsmenData(craftsmenResponse.craftsmen);
      setInitialLoadComplete(true);
    }
  }, [craftsmenResponse]);

  // Optimized callback for ProductsGrid - no longer needed since we removed sequential loading
  const handleInitialProductsLoaded = useCallback(() => {
    console.log('✅ Products loaded independently');
  }, []);

  // Memoized cart functions for performance
  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id || item._id === product._id);
      
      if (existingItem) {
        return prevCart.map(item => 
          (item.id === product.id || item._id === product._id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const productToAdd = {
          ...product,
          id: product._id || product.id,
          quantity: 1
        };
        return [...prevCart, productToAdd];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId && item._id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => prev.map(item => 
        (item.id === productId || item._id === productId)
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const getTotalItems = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Memoized catalog functions
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    console.log('📂 Selected category in MainPage:', category);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    console.log('🔍 Search query in MainPage:', query);
  }, []);

  // Memoized checkout function
  const handleCheckout = useCallback(() => {
    console.log('🛒 Checkout initiated with items:', cart);
    // Implement checkout logic here
    alert(`Buyurtma berildi! ${getTotalItems()} ta mahsulot`);
    clearCart();
  }, [cart, getTotalItems, clearCart]);

  // Memoized craftsmen data for performance
  const memoizedCraftsmenData = useMemo(() => {
    return craftsmenData;
  }, [craftsmenData]);

  return (
    <>
      <Header
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
        cart={cart}
        onToggleCart={toggleCart}
        getTotalItems={getTotalItems}
        onSuccessfulLogin={onSuccessfulLogin}
      />
      
      <main>
        {/* Products Section */}
        <section id="products">
          <ProductsGridOptimized
            cart={cart}
            onAddToCart={addToCart}
            isCartOpen={isCartOpen}
            onToggleCart={toggleCart}
            onRemoveFromCart={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onCheckout={handleCheckout}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onInitialProductsLoaded={handleInitialProductsLoaded}
          />
        </section>

        {/* Craftsmen Section */}
        <section id="craftsmen" className="bg-gray-50">
          {craftsmenLoading && craftsmenData.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Ustalar yuklanmoqda...</p>
              </div>
            </div>
          ) : craftsmenError && craftsmenData.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Ustalar ma'lumotlarini yuklashda xatolik
                </h3>
                <p className="text-gray-500">{craftsmenError.message}</p>
              </div>
            </div>
          ) : (
            <Craftsmen craftsmenData={memoizedCraftsmenData} loading={craftsmenLoading} />
          )}
        </section>

        {/* Services Section */}
        <Services />
      </main>

      <Footer />
    </>
  );
};

export default MainPage;
