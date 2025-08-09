import React, { useState, useEffect } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Scroll event listener to close dropdowns
  useEffect(() => {
    const handleScroll = () => {
      setShowPriceDropdown(false);
      setShowCatalogDropdown(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Search functionality can be implemented here
      console.log('Searching for:', searchQuery);
    }
  };

  const handlePriceFilter = (range) => {
    setPriceFilter(range);
    setShowPriceDropdown(false);
    console.log('Price filter:', range);
  };

  const handleCatalogClick = () => {
    setShowCatalogDropdown(!showCatalogDropdown);
  };

  const handleCategoryClick = (category) => {
    setShowCatalogDropdown(false);
    console.log('Selected category:', category);
    // Here you can implement navigation to category page
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
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

  const toggleCart = () => {
    if (onToggleCart) {
      onToggleCart();
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-primary-dark shadow-lg sticky top-0 z-50 hidden md:block">
        <div className="container mx-auto px-6">
          <div className="flex items-center py-5 gap-8">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none min-w-fit"
            onClick={handleLogoInteraction}
            onTouchStart={handleLogoInteraction}
            title="Admin panel uchun 2 marta bosing"
            style={{ userSelect: 'none' }}
          >
            <i className="fas fa-hammer text-primary-orange text-2xl"></i>
            <h1 className="text-2xl font-bold text-white">Alibobo</h1>
          </div>

          {/* Catalog Button */}
          <div className="relative">
            <button 
              onClick={handleCatalogClick}
              className="flex items-center space-x-2 bg-primary-orange hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg transition-all duration-300 min-w-fit font-medium group"
            >
              <i className={`fas fa-layer-group catalog-icon ${showCatalogDropdown ? 'active' : ''}`}></i>
              <span>Katalog</span>
              <i className={`fas fa-chevron-down text-sm transition-transform duration-300 ${showCatalogDropdown ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Catalog Dropdown */}
            {showCatalogDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-slideDown">
                <div className="py-3">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Kategoriyalar</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <button
                      onClick={() => handleCategoryClick('gisht')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-cube text-red-500 w-5"></i>
                      <span>G'isht va bloklar</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('asbob')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-tools text-blue-500 w-5"></i>
                      <span>Asbob-uskunalar</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('boyoq')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-paint-brush text-purple-500 w-5"></i>
                      <span>Bo'yoq va lak</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('elektr')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-bolt text-yellow-500 w-5"></i>
                      <span>Elektr mollalari</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('metall')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-industry text-gray-600 w-5"></i>
                      <span>Metall va armatura</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('yogoch')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-tree text-green-600 w-5"></i>
                      <span>Yog'och va mebel</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('tom')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-home text-indigo-500 w-5"></i>
                      <span>Tom materiallar</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('santexnika')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-faucet text-blue-600 w-5"></i>
                      <span>Santexnika</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('issiqlik')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-thermometer-half text-orange-500 w-5"></i>
                      <span>Issiqlik va konditsioner</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('dekor')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-palette text-pink-500 w-5"></i>
                      <span>Dekor va bezatish</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('temir-beton')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-weight-hanging text-gray-700 w-5"></i>
                      <span>Temir-beton</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('gips')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-trowel text-teal-500 w-5"></i>
                      <span>Gips va shpaklovka</span>
                    </button>
                    <button
                      onClick={() => handleCategoryClick('boshqa')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition duration-200 flex items-center space-x-3"
                    >
                      <i className="fas fa-ellipsis-h text-gray-500 w-5"></i>
                      <span>Boshqalar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mahsulotlar va turkumlar izlash"
                className="w-full px-5 py-2.5 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition duration-300"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-orange transition duration-300"
              >
                <i className="fas fa-search text-lg"></i>
              </button>
            </div>
          </form>

          {/* Price Filter */}
          <div className="relative">
            <button
              onClick={() => setShowPriceDropdown(!showPriceDropdown)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg transition duration-300 min-w-fit"
            >
              <i className="fas fa-filter"></i>
              <span className="hidden lg:inline font-medium">
                {priceFilter || 'Narx'}
              </span>
              <i className="fas fa-chevron-down text-sm"></i>
            </button>

            {/* Price Dropdown */}
            {showPriceDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => handlePriceFilter('')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    Barcha narxlar
                  </button>
                  <button
                    onClick={() => handlePriceFilter('0-100000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    100 ming gacha
                  </button>
                  <button
                    onClick={() => handlePriceFilter('100000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    100 ming dan yuqori
                  </button>
                  <button
                    onClick={() => handlePriceFilter('200000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    200 ming dan yuqori
                  </button>
                  <button
                    onClick={() => handlePriceFilter('500000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    500 ming dan yuqori
                  </button>
                  <button
                    onClick={() => handlePriceFilter('1000000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    1 million dan yuqori
                  </button>
                  <button
                    onClick={() => handlePriceFilter('100000-500000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    100-500 ming
                  </button>
                  <button
                    onClick={() => handlePriceFilter('500000-1000000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    500 ming - 1 million
                  </button>
                  <button
                    onClick={() => handlePriceFilter('1000000-2000000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    1-2 million
                  </button>
                  <button
                    onClick={() => handlePriceFilter('2000000-5000000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    2-5 million
                  </button>
                  <button
                    onClick={() => handlePriceFilter('5000000')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition duration-200"
                  >
                    5 million dan yuqori
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="relative flex items-center space-x-2 bg-primary-orange hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg transition duration-300 min-w-fit font-medium"
          >
            <i className="fas fa-shopping-cart text-lg"></i>
            <span className="hidden md:inline">Savat</span>
            {getTotalItems && getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>
      </header>

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

      {/* Mobile Header - Top Search Only */}
      <header className="bg-primary-dark shadow-lg sticky top-0 z-50 md:hidden">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mahsulotlar va turkumlar izlash"
                className="w-full px-4 py-2.5 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition duration-300"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-orange transition duration-300"
              >
                <i className="fas fa-search text-lg"></i>
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          <button 
            onClick={showProducts}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-primary-orange transition duration-300"
          >
            <i className="fas fa-home text-xl mb-1"></i>
            <span className="text-xs font-medium">Bosh sahifa</span>
          </button>
          
          <button 
            onClick={handleCatalogClick}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-primary-orange transition duration-300"
          >
            <i className="fas fa-layer-group text-xl mb-1"></i>
            <span className="text-xs font-medium">Katalog</span>
          </button>
          
          <button 
            onClick={toggleCart}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-primary-orange transition duration-300 relative"
          >
            <i className="fas fa-shopping-cart text-xl mb-1"></i>
            <span className="text-xs font-medium">Savat</span>
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setShowPriceDropdown(!showPriceDropdown)}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-primary-orange transition duration-300"
          >
            <i className="fas fa-filter text-xl mb-1"></i>
            <span className="text-xs font-medium">Tezkor</span>
          </button>
          
          <button 
            onClick={handleLogoInteraction}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-primary-orange transition duration-300"
          >
            <i className="fas fa-user text-xl mb-1"></i>
            <span className="text-xs font-medium">Kabinet</span>
          </button>
        </div>
      </nav>

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
    </>
  );
};

export default Header;