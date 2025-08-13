import React, { useState, useCallback, useEffect } from 'react';
import Header from './Header';
import ProductsGrid from './ProductsGrid';
import Craftsmen from './Craftsmen';
import Services from './Services';
import Footer from './Footer';
import { useParallelFetch } from '../hooks/useOptimizedFetch';

const MainPage = ({ onSuccessfulLogin }) => {
  const [craftsmenData, setCraftsmenData] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Cart states - centralized here
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Catalog and search states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Parallel data loading for initial page load
  const { data: parallelData, loading: parallelLoading } = useParallelFetch([
    'http://localhost:5000/api/craftsmen?limit=100&status=active',
    'http://localhost:5000/api/products?limit=20&page=1'
  ]);

  // Update craftsmen data when parallel fetch completes
  useEffect(() => {
    const craftsmenUrl = 'http://localhost:5000/api/craftsmen?limit=100&status=active';
    if (parallelData[craftsmenUrl]) {
      const craftsmenResponse = parallelData[craftsmenUrl];
      setCraftsmenData(craftsmenResponse.craftsmen || []);
      setInitialLoadComplete(true);
    }
  }, [parallelData]);

  // Optimized callback for ProductsGrid
  const handleInitialProductsLoaded = useCallback(() => {
    // Products are already loaded via parallel fetch, no need for additional call
  }, []);

  // Memoized cart functions for performance
  const addToCart = useCallback((product) => {
    const existingItem = cart.find(item => item.id === product.id || item._id === product._id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        (item.id === product.id || item._id === product._id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const productToAdd = {
        ...product,
        id: product._id || product.id,
        quantity: 1
      };
      setCart([...cart, productToAdd]);
    }
  }, [cart]);

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

  return (
    <>
      <Header 
        onSuccessfulLogin={onSuccessfulLogin}
        cart={cart}
        isCartOpen={isCartOpen}
        onToggleCart={toggleCart}
        onRemoveFromCart={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onCheckout={clearCart}
        getTotalItems={getTotalItems}
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        onSearch={handleSearch}
      />
      <div id="products">
        <ProductsGrid 
          cart={cart}
          onAddToCart={addToCart}
          onToggleCart={toggleCart}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          onCheckout={clearCart}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onInitialProductsLoaded={handleInitialProductsLoaded}
        />
      </div>
      <div id="craftsmen">
        <Craftsmen craftsmenData={craftsmenData} />
      </div>
      <Services />
      <Footer />
    </>
  );
};

export default MainPage;