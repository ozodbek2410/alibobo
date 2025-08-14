import React, { useState, useEffect } from 'react';

const CartSidebar = ({ isOpen, onClose, cart, onRemoveFromCart, onUpdateQuantity, onCheckout }) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  // Add form validation state
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseInt(item.price?.toString().replace(/[^\d]/g, '') || '0');
      return total + (price * item.quantity);
    }, 0);
  };



  // Add validation functions
  const validateForm = () => {
    const errors = {
      name: '',
      phone: '',
      address: ''
    };
    
    let isValid = true;

    // Validate Name
    if (customerData.name.trim() === '') {
      errors.name = 'Iltimos, ismingizni kiriting';
      isValid = false;
    } else if (customerData.name.trim().length < 3) {
      errors.name = 'Ism kamida 3 belgidan iborat bo\'lishi kerak';
      isValid = false;
    }

    // Validate Phone
    if (customerData.phone.trim() === '') {
      errors.phone = 'Iltimos, telefon raqamingizni kiriting';
      isValid = false;
    } else if (customerData.phone.length < 19) { // Full length of +998 (XX) XXX-XX-XX is 19
      errors.phone = 'Iltimos, telefon raqamingizni to\'liq kiriting';
      isValid = false;
    }

    // Validate Address
    if (customerData.address.trim() === '') {
      errors.address = 'Iltimos, yetkazib berish manzilini kiriting';
      isValid = false;
    } else if (customerData.address.trim().length < 10) {
      errors.address = 'Manzil kamida 10 belgidan iborat bo\'lishi kerak';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Clear errors when user starts typing
  const handleInputChange = (field, value) => {
    setCustomerData({...customerData, [field]: value});
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors({...formErrors, [field]: ''});
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Start with +998
    if (digits.length === 0) return '';
    if (digits.length <= 3) return '+998';
    
    // Format as +998 (XX) XXX-XX-XX
    const formatted = '+998';
    if (digits.length > 3) {
      const part1 = digits.slice(3, 5);
      const part2 = digits.slice(5, 8);
      const part3 = digits.slice(8, 10);
      const part4 = digits.slice(10, 12);
      
      let result = formatted;
      if (part1) result += ` (${part1}`;
      if (part2) result += `) ${part2}`;
      if (part3) result += `-${part3}`;
      if (part4) result += `-${part4}`;
      
      return result;
    }
    
    return formatted;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleInputChange('phone', formatted);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateForm()) {
      return;
    }

    // Check if cart is not empty
    if (!cart || cart.length === 0) {
      setErrorMessage('Savatcha bo\'sh. Iltimos, mahsulot qo\'shing.');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data for backend API
      const orderData = {
        customerName: customerData.name.trim(),
        customerPhone: customerData.phone.trim(),
        customerAddress: customerData.address.trim(),
        items: cart.map(item => ({
          name: item.name,
          quantity: parseInt(item.quantity) || 1,
          price: parseInt(item.price?.toString().replace(/[^\d]/g, '') || '0')
        })),
        totalAmount: calculateTotal(),
        status: 'pending',
        orderDate: new Date().toISOString()
      };

      console.log('Buyurtma ma\'lumotlari yuborilmoqda:', orderData);

      // Send order to backend API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Server xatoligi: ${response.status} ${response.statusText}`
        );
      }

      const savedOrder = await response.json();
      
      console.log('Buyurtma muvaffaqiyatli saqlandi:', savedOrder);

      // Reset form data
      setCustomerData({
        name: '',
        phone: '',
        address: ''
      });
      setFormErrors({
        name: '',
        phone: '',
        address: ''
      });

      // Close checkout modal
      setShowCheckoutModal(false);
      
      // Clear cart if callback provided
      if (onCheckout) {
        onCheckout();
      }

      // Show success modal with order details
      const total = calculateTotal();
      setOrderTotal(total);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Buyurtma yuborishda xatolik:', error);
      
      // Handle different types of errors
      let errorMessage = 'Buyurtma yuborishda xatolik yuz berdi.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'So\'rov vaqti tugadi. Iltimos, internetni tekshiring va qayta urinib ko\'ring.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Server bilan aloqa yo\'q. Iltimos, backend serverni ishga tushiring.';
      } else if (error.message.includes('404')) {
        errorMessage = 'API endpoint topilmadi. Backend server ishlamayotgan bo\'lishi mumkin.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  return (
    <>
      {/* Cart Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
      ></div>

      {/* Shopping Cart Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 md:w-[28rem] lg:w-[32rem] bg-white shadow-2xl transform transition-transform duration-300 z-40 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between p-4 bg-primary-orange text-white">
          <div className="flex items-center space-x-3">
            <i className="fas fa-shopping-cart text-xl"></i>
            <div>
              <h3 className="text-lg font-bold">Savatcha</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <i className="fas fa-shopping-cart text-6xl mb-4 text-gray-300"></i>
              <h4 className="text-xl font-semibold mb-2">Savatcha bo'sh</h4>
              <p>Mahsulot yoki xizmat qo'shing</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cart.map((item) => {
                const price = parseInt(item.price?.toString().replace(/[^\d]/g, '') || '0');
                const totalPrice = (price * item.quantity).toLocaleString();
                
                return (
                  <div key={item.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border">
                    <img
                      src={item.image || '/api/placeholder/80/80'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-primary-dark mb-1">{item.name}</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Mahsulot
                      </span>
                      <p className="text-sm text-gray-500 mt-2">{item.price} / dona</p>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          <i className="fas fa-minus text-xs"></i>
                        </button>
                        <span className="w-10 text-center text-md font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          <i className="fas fa-plus text-xs"></i>
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-dark">{totalPrice} so'm</p>
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium mt-6"
                      >
                        <i className="fas fa-trash-alt mr-1"></i> O'chirish
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 pt-3 pb-4 space-y-3 bg-white mb-12 sm:mb-0">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary-dark">Jami:</span>
              <span className="text-2xl font-bold text-primary-orange">
                {calculateTotal().toLocaleString()} so'm
              </span>
            </div>
            <button
              onClick={() => {
                setShowCheckoutModal(true);
                onClose();
              }}
              className="w-full bg-primary-orange text-white py-3 rounded-lg hover:bg-opacity-90 transition duration-300 font-semibold"
            >
              Buyurtma berish
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="text-center mb-4">
              <i className="fas fa-hammer text-primary-orange text-2xl"></i>
              <h3 className="text-xl font-bold text-primary-dark mt-2">Buyurtma berish</h3>
              <p className="text-gray-600 text-sm">Ma'lumotlaringizni kiriting</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <i className="fas fa-user text-primary-orange mr-2 text-xs"></i>
                  Sizning ismingiz
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-transparent ${
                    formErrors.name 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="To'liq ismingizni kiriting"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <i className="fas fa-phone text-primary-orange mr-2 text-xs"></i>
                  Telefon raqami
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-transparent ${
                    formErrors.phone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="+998"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {formErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <i className="fas fa-map-marker-alt text-primary-orange mr-2 text-xs"></i>
                  Yetkazib berish manzilim
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={customerData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-transparent resize-none ${
                    formErrors.address 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="To'liq manzilni kiriting (shahar, ko'cha, uy raqami)"
                  rows="3"
                ></textarea>
                {formErrors.address && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {formErrors.address}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Jami to'lov:</span>
                  <span className="text-xl font-bold text-primary-orange">
                    {calculateTotal().toLocaleString()} so'm
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setFormErrors({ name: '', phone: '', address: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Yuborilmoqda...
                    </>
                  ) : (
                    'Buyurtma berish'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Buyurtma qabul qilindi!</h3>
              <p className="text-gray-600 mb-4">
                Buyurtmangiz muvaffaqiyatli ro'yxatga olindi. Tez orada siz bilan bog'lanamiz.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Buyurtma summasi:</p>
                <p className="text-xl font-bold text-primary-orange">
                  {orderTotal.toLocaleString()} so'm
                </p>
              </div>
            </div>
            <button
              onClick={closeSuccessModal}
              className="w-full bg-primary-orange text-white py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
            >
              Yaxshi
            </button>
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
            <h2 className="text-2xl font-bold text-red-600 mt-5">Xatolik yuz berdi!</h2>

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
    </>
  );
};

export default CartSidebar;
