import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';
import Catalog from './Catalog';


const Header = ({
  onSuccessfulLogin,
  cart,
  isCartOpen,
  onToggleCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onCheckout,
  getTotalItems,
  onCategorySelect,
  selectedCategory,
  onSearch
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Scroll event listener to close dropdowns
  useEffect(() => {
    const handleScroll = () => {
      // setShowCatalogDropdown(false);
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
      // Lock background scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '17px';
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin123') {
      setShowLoginModal(false);
      setUsername('');
      setPassword('');

      // Restore background scroll
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px';

      if (onSuccessfulLogin) {
        onSuccessfulLogin();
      }

      navigate('/admin');
    } else {
      setErrorMessage('Noto\'g\'ri login yoki parol!');
      setShowErrorModal(true);
      setShowLoginModal(false);
      // Keep scroll locked for error modal
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
    setUsername('');
    setPassword('');
    // Restore background scroll
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      if (onSearch) {
        onSearch(searchQuery);
      }
    }
  };

  // Removed unused showProducts function

  const toggleCart = () => {
    if (onToggleCart) {
      onToggleCart();
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-primary-dark shadow-lg z-50 hidden lg:block">
        <div className="container mx-auto px-6">
          <div className="flex items-center py-2 gap-8">
            {/* Left side - Logo */}
            <div className="flex items-center min-w-fit">
              {/* Logo */}
              <div
                className="flex items-center space-x-3 cursor-pointer select-none"
                onClick={handleLogoInteraction}
                onTouchStart={handleLogoInteraction}
                title="Admin panel uchun 2 marta bosing"
                style={{ userSelect: 'none' }}
              >
                <img
                  src="/logo.png"
                  alt="Logo"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <img
                  src="/alibobo.png"
                  alt="Alibobo"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="h-14 w-36 object-cover"
                />
              </div>
            </div>

            {/* Centered Search Bar */}
            <div className="flex-1 flex justify-center">
              <form onSubmit={handleSearch} className="w-full max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Mahsulotlar va turkumlar izlash"
                    className="w-full px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition duration-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-orange transition duration-300"
                  >
                    <i className="fas fa-search text-base"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Right side - Cart Button */}
            <div className="flex items-center min-w-fit ml-auto">
              <button
                onClick={toggleCart}
                className="relative bg-transparent hover:bg-gray-700 hover:bg-opacity-20 text-primary-orange px-3 py-2 rounded-lg transition duration-300"
              >
                <i className="fas fa-shopping-cart text-xl"></i>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>



      {/* Mobile Header - Logo and Search - Hide when cart is open */}
      <header className={`bg-primary-dark shadow-lg lg:hidden transition-transform duration-300 ${isCartOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center  justify-between gap-3">
            {/* Mobile Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer select-none min-w-fit"
              onClick={handleLogoInteraction}
              onTouchStart={handleLogoInteraction}
              title="Admin panel uchun 2 marta bosing"
              style={{ userSelect: 'none' }}
            >
              <img
                src="/logo.png"
                alt="Logo"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-8 h-8 object-cover rounded-lg"
              />
              <img
                src="/alibobo.png"
                alt="Alibobo"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-8 w-24 object-cover"
              />
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex-none w-36 ">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Qidiruv"
                  className="w-full px-3 py-1.5 pr-8 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition duration-300 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-orange transition duration-300"
                >
                  <i className="fas fa-search text-xs"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))' }}>
        <ul className="flex items-center justify-around py-3">
          {/* 1. Akademiya */}
          <li className="flex-1">
            <button
              onClick={() => {
                // Close cart if open
                if (isCartOpen) {
                  onToggleCart();
                }
                // Scroll to top and show both products and craftsmen
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
              className="flex flex-col items-center px-1 text-gray-700 hover:text-primary-orange transition duration-200 w-full"
            >
              <i className="fas fa-graduation-cap text-[18px]"></i>
              <span className="text-[11px] sm:text-xs font-medium">Akademiya</span>
            </button>
          </li>

          {/* 2. Mahsulotlar */}
          <li className="flex-1">
            <button
              onClick={() => {
                // Close cart if open
                if (isCartOpen) {
                  onToggleCart();
                }
                // Scroll to products section
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
              className="flex flex-col items-center px-1 text-gray-700 hover:text-primary-orange transition duration-200 w-full"
            >
              <i className="fas fa-box text-[18px]"></i>
              <span className="text-[11px] sm:text-xs font-medium">Mahsulotlar</span>
            </button>
          </li>

          {/* 3. Aloqa */}
          <li className="flex-1">
            <a
              href="tel:+998948494956"
              onClick={() => {
                // Close cart if open
                if (isCartOpen) {
                  onToggleCart();
                }
              }}
              className="flex flex-col items-center px-1 text-gray-700 hover:text-primary-orange transition duration-200 w-full"
            >
              <i className="fas fa-phone text-[18px]"></i>
              <span className="text-[11px] sm:text-xs font-medium">Aloqa</span>
            </a>
          </li>

          {/* 4. Savatcha */}
          <li className="flex-1">
            <button
              onClick={toggleCart}
              className="flex flex-col items-center px-1 text-gray-700 hover:text-primary-orange transition duration-200 w-full relative"
            >
              <i className="fas fa-shopping-cart text-[18px]"></i>
              <span className="text-[11px] sm:text-xs font-medium">Savatcha</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 right-3 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </li>

          {/* 5. Ustalar */}
          <li className="flex-1">
            <button
              onClick={() => {
                // Close cart if open
                if (isCartOpen) {
                  onToggleCart();
                }
                const craftsmenSection = document.getElementById('craftsmen');
                if (craftsmenSection) {
                  craftsmenSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              className="flex flex-col items-center px-1 text-gray-700 hover:text-primary-orange transition duration-200 w-full"
            >
              <i className="fas fa-users text-[18px]"></i>
              <span className="text-[11px] sm:text-xs font-medium">Ustalar</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Panel</h2>
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
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4"
          onClick={closeErrorModal}
        >
          <div
            className="bg-white rounded-xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-lg bg-red-500">
              <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mt-5">Login Xatoligi!</h2>
            <p className="text-gray-600 mt-2 text-sm px-4">
              {errorMessage}
            </p>
            <button
              onClick={closeErrorModal}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold mt-6"
            >
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

      {/* Catalog Modal */}
      {isCategoryModalOpen && (
        <Catalog
          onCategorySelect={onCategorySelect}
          onClose={() => setIsCategoryModalOpen(false)}
          selectedCategory={selectedCategory}
        />
      )}
    </>
  );
};

export default Header;
