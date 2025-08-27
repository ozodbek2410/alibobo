import { useState, useCallback } from 'react';

/**
 * Custom hook for standardized cart notifications
 * Provides consistent notification behavior across all cart-related components
 */
export const useCartNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState('');

  const showCartNotification = useCallback((productName) => {
    setNotificationProduct(productName);
    setShowNotification(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  }, []);

  const hideCartNotification = useCallback(() => {
    setShowNotification(false);
  }, []);

  // Standardized notification component
  const CartNotification = useCallback(() => {
    if (!showNotification) return null;

    return (
      <div className="fixed top-20 right-4 md:top-24 md:right-6 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-[60] transform transition-all duration-300 max-w-xs md:max-w-sm">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium text-sm md:text-base">
            {notificationProduct} savatga qo'shildi!
          </span>
        </div>
      </div>
    );
  }, [showNotification, notificationProduct]);

  return {
    showCartNotification,
    hideCartNotification,
    CartNotification,
    isNotificationVisible: showNotification,
    notificationProductName: notificationProduct
  };
};

export default useCartNotification;