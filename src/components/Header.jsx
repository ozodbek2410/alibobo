import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';

const Header = ({ 
  onSuccessfulLogin, 
  cart, 
  isCartOpen, 
  onToggleCart, 
  onRemoveFromCart, 
  onUpdateQuantity, 
  onCheckout, 
  getTotalItems 
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogoInteraction = (e) => {
    e.preventDefault();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength > 500) {
      setTapCount(1);
    } else {
      setTapCount(prev => prev + 1);
    }

    setLastTap(currentTime);

    if (tapCount === 1 && tapLength < 500) {
      console.log('Logo double clicked/tapped!');
      setShowLoginModal(true);
      setTapCount(0);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin123') {
      setShowLoginModal(false);
      if (onSuccessfulLogin) {
        onSuccessfulLogin();
      }
      navigate('/admin');
    } else {
      setErrorMessage('Noto\'g\'ri login yoki parol!');
      setShowErrorModal(true);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setShowMobileMenu(false);
  };

  const showHomePage = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  const showProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const showContact = () => {
    const footerSection = document.getElementById('footer');
    if (footerSection) {
      footerSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const toggleCart = () => {
    if (onToggleCart) {
      onToggleCart();
    }
  };

  return (
    <header className="bg-primary-dark shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Left side: Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer select-none"
            onClick={handleLogoInteraction}
            onTouchStart={handleLogoInteraction}
            title="Admin panel uchun 2 marta bosing"
            style={{ userSelect: 'none' }}
          >
            <i className="fas fa-hammer text-primary-orange text-2xl"></i>
            <h1 className="text-2xl font-bold text-white">Alibobo</h1>
          </div>

          {/* Center: Navigation - Show on laptop and larger screens */}
          <nav className="hidden lg:flex space-x-8">
            <a
              href="#"
              onClick={showHomePage}
              className="text-white hover:text-primary-orange transition duration-300 font-medium"
            >
              Bosh sahifa
            </a>
            <a
              href="#products"
              onClick={showProducts}
              className="text-white hover:text-primary-orange transition duration-300 font-medium"
            >
              Mahsulotlar
            </a>
            <a
              href="#craftsmen"
              onClick={() => scrollToSection('craftsmen')}
              className="text-white hover:text-primary-orange transition duration-300 font-medium"
            >
              Ustalar
            </a>
            <a
              href="#services"
              onClick={() => scrollToSection('services')}
              className="text-white hover:text-primary-orange transition duration-300 font-medium"
            >
              Xizmatlar
            </a>
            <a
              href="#footer"
              onClick={showContact}
              className="text-white hover:text-primary-orange transition duration-300 font-medium"
            >
              Aloqa
            </a>
          </nav>

          {/* Right side: Cart and Mobile menu button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleCart}
              className="relative flex items-center bg-primary-orange hover:bg-opacity-90 text-white px-3 py-2 rounded-lg transition duration-300 lg:space-x-2"
            >
              <i className="fas fa-shopping-cart text-lg"></i>
              <span className="hidden lg:inline text-sm font-medium">Savat</span>
              {getTotalItems && getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </button>

            <button className="lg:hidden text-white" onClick={toggleMobileMenu}>
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobileMenu"
        className={`fixed inset-y-0 left-0 w-80 bg-primary-dark shadow-2xl transform transition-transform duration-300 z-50 lg:hidden ${
          showMobileMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <i className="fas fa-hammer text-primary-orange text-2xl"></i>
              <h3 className="text-lg font-bold text-white">Alibobo</h3>
            </div>
            <button onClick={toggleMobileMenu} className="text-gray-400 hover:text-gray-300">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <div className="flex-1 p-6">
            <nav className="flex flex-col space-y-4">
              <a
                href="#"
                onClick={() => { showHomePage(); toggleMobileMenu(); }}
                className="text-white hover:text-primary-orange transition duration-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-800"
              >
                <i className="fas fa-home mr-3"></i>Bosh sahifa
              </a>
              <a
                href="#products"
                onClick={() => { showProducts(); toggleMobileMenu(); }}
                className="text-white hover:text-primary-orange transition duration-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-800"
              >
                <i className="fas fa-tools mr-3"></i>Mahsulotlar
              </a>
              <a
                href="#craftsmen"
                onClick={() => { scrollToSection('craftsmen'); toggleMobileMenu(); }}
                className="text-white hover:text-primary-orange transition duration-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-800"
              >
                <i className="fas fa-users mr-3"></i>Ustalar
              </a>
              <a
                href="#services"
                onClick={() => { scrollToSection('services'); toggleMobileMenu(); }}
                className="text-white hover:text-primary-orange transition duration-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-800"
              >
                <i className="fas fa-cogs mr-3"></i>Xizmatlar
              </a>
              <a
                href="#footer"
                onClick={() => { showContact(); toggleMobileMenu(); }}
                className="text-white hover:text-primary-orange transition duration-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-800"
              >
                <i className="fas fa-phone mr-3"></i>Aloqa
              </a>
            </nav>
          </div>
          <div className="border-t border-gray-700 p-6">
            <button
              onClick={() => { toggleCart(); toggleMobileMenu(); }}
              className="w-full flex items-center justify-center space-x-2 bg-primary-orange hover:bg-opacity-90 text-white px-4 py-3 rounded-lg transition duration-300"
            >
              <i className="fas fa-shopping-cart text-lg"></i>
              <span className="text-sm font-medium">Savat</span>
              {getTotalItems && getTotalItems() > 0 && (
                <span className="bg-white text-primary-orange px-2 py-1 rounded-full text-xs font-bold">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div
          id="mobileMenuOverlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <i className="fas fa-user-shield text-4xl text-primary-orange mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-900">Admin panel</h2>
              <p className="text-gray-600 mt-2">Tizimga kirish uchun ma'lumotlarni kiriting</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Login
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                  placeholder="Login kiriting"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Parol
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                  placeholder="Parol kiriting"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-orange text-white py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
                >
                  Kirish
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                <strong>Login:</strong> admin<br/>
                <strong>Parol:</strong> admin123
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
          <div 
            className="bg-white rounded-xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center transform transition-all duration-300"
            style={{
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            {/* Icon */}
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-lg bg-red-500">
              <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-red-600 mt-5">Login Xatoligi!</h2>

            {/* Description */}
            <p className="text-gray-600 mt-2 text-sm px-4">
              {errorMessage}
            </p>

            {/* Action Button */}
            <button
              onClick={closeErrorModal}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold mt-6 flex items-center justify-center text-sm"
            >
              <i className="fas fa-times mr-2"></i>
              Yaxshi
            </button>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => onToggleCart && onToggleCart()}
        cart={cart || []}
        onRemoveFromCart={onRemoveFromCart}
        onUpdateQuantity={onUpdateQuantity}
        onCheckout={onCheckout}
      />

      {/* Add CSS animation styles */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;