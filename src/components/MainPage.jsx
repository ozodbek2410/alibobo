import React, { useState, useEffect } from 'react';
import Header from './Header';
import Hero from './Hero';
import ProductsGrid from './ProductsGrid';
import Craftsmen from './Craftsmen';
import Services from './Services';
import Footer from './Footer';

const MainPage = ({ onSuccessfulLogin }) => {
  const [craftsmenData, setCraftsmenData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cart states - centralized here
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    loadCraftsmen();
  }, []);

  const loadCraftsmen = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/craftsmen?limit=100');
      const data = await response.json();
      
      if (response.ok) {
        setCraftsmenData(data.craftsmen || []);
      } else {
        console.error('Ustalar yuklanmadi:', data.message);
      }
    } catch (error) {
      console.error('Ustalar yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cart functions - centralized here
  const addToCart = (product) => {
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
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId && item._id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        (item.id === productId || item._id === productId)
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

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
      />
      <Hero />
      <ProductsGrid 
        cart={cart}
        onAddToCart={addToCart}
        isCartOpen={isCartOpen}
        onToggleCart={toggleCart}
        onRemoveFromCart={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onCheckout={clearCart}
      />
      <Craftsmen craftsmenData={craftsmenData} />
      <Services />
      <Footer />
    </>
  );
};

export default MainPage;