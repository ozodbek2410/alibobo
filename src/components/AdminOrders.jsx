import React, { useState, useEffect, useCallback } from 'react';
import AdminNotificationBell from './AdminNotificationBell';
import AdminNotificationModals from './AdminNotificationModals';
import LoadingSpinner from './LoadingSpinner';
import useNotifications from '../hooks/useNotifications';

const AdminOrders = ({ onMobileToggle, onCountChange, notifications, setNotifications }) => {
  // Notification system - matching index.html exactly
  const {
    notifications: notificationList,
    alertModal,
    confirmModal,
    promptModal,
    showAlert,
    showConfirm,
    closeAlert,
    handleConfirmResponse,
    handlePromptResponse,
    safeNotifySuccess,
    safeNotifyError,
    safeNotifyWarning,
    notifyOrderReceived,
    addNotification
  } = useNotifications();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states - simplified with new notification system
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = [
    { value: '', label: 'Barcha statuslar' },
    { value: 'pending', label: 'Kutilmoqda' },
    { value: 'processing', label: 'Jarayonda' },
    { value: 'completed', label: 'Bajarilgan' },
    { value: 'cancelled', label: 'Bekor qilingan' }
  ];

  const statusMap = {
    pending: { text: 'Kutilmoqda', class: 'bg-yellow-100 text-yellow-800' },
    processing: { text: 'Jarayonda', class: 'bg-orange-100 text-orange-800' },
    completed: { text: 'Bajarilgan', class: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Bekor qilingan', class: 'bg-red-100 text-red-800' }
  };

  const paymentMap = {
    cash: { text: 'Naqd pul', class: 'bg-green-100 text-green-800' },
    card: { text: 'Plastik karta', class: 'bg-blue-100 text-blue-800' },
    online: { text: 'Onlayn', class: 'bg-purple-100 text-purple-800' }
  };

  // Load orders from MongoDB
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          status: filterStatus
        });

        const response = await fetch(`http://localhost:5000/api/orders?${params}`);
        const data = await response.json();

        if (response.ok) {
          setOrders(data.orders);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
          onCountChange(data.totalCount);
        } else {
          throw new Error(data.message || 'Buyurtmalar yuklanmadi');
        }
      } catch (error) {
        console.error('Orders yuklashda xatolik:', error);
        setTimeout(() => {
          safeNotifyError('Xatolik', 'Buyurtmalar yuklanmadi');
        }, 0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, itemsPerPage, searchTerm, filterStatus, onCountChange]);

  // Debounce search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus]);

  // Prevent body scrolling when any modal is open
  useEffect(() => {
    if (isViewModalOpen || alertModal?.show || confirmModal?.show || promptModal?.show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isViewModalOpen, alertModal?.show, confirmModal?.show, promptModal?.show]);



  const openViewModal = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const openDeleteConfirm = (order) => {
    setSelectedOrder(order);
    showConfirm(
      'Buyurtmani o\'chirish',
      `"${order.orderNumber || order._id}" buyurtmasini o'chirishni xohlaysizmi?`,
      () => deleteOrder(order._id),
      null,
      'danger'
    );
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  // closeConfirmModal function removed - now using useNotifications hook

  const deleteOrder = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Get order info for notification before removing
        const deletedOrder = orders.find(o => o._id === id);
        
        // Ro'yxatdan buyurtmani olib tashlash (real-time yangilanish)
        setOrders(prevOrders => prevOrders.filter(order => order._id !== id));
        
        // Umumiy sonni kamaytirish
        setTotalCount(prevCount => {
          const newCount = prevCount - 1;
          onCountChange(newCount); // Dashboard'ni yangilash
          return newCount;
        });
        
        // Notification with order details - matching index.html
        setTimeout(() => {
          safeNotifySuccess('Buyurtma o\'chirildi', `Buyurtma #${deletedOrder?.orderNumber || id} muvaffaqiyatli o\'chirildi`);
          addNotification({
            title: 'Buyurtma o\'chirildi',
            message: `Buyurtma #${deletedOrder?.orderNumber || id} - ${formatCurrency(deletedOrder?.totalAmount || 0)}`,
            type: 'order'
          });
        }, 0);
        
        // Agar joriy sahifada buyurtma qolmasa, oldingi sahifaga o'tish
        const remainingOrders = orders.filter(order => order._id !== id).length;
        if (remainingOrders === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        const data = await response.json();
        setTimeout(() => {
          safeNotifyError('Xatolik', data.message || 'O\'chirishda xatolik');
        }, 0);
      }
    } catch (error) {
      console.error('Order o\'chirishda xatolik:', error);
      setTimeout(() => {
        safeNotifyError('Xatolik', error.message || 'Server bilan bog\'lanishda xatolik');
      }, 0);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTimeout(() => {
          safeNotifySuccess('Status yangilandi', 'Buyurtma statusi muvaffaqiyatli yangilandi');
        }, 0);
        setCurrentPage(1);
      } else {
        const data = await response.json();
        setTimeout(() => {
          safeNotifyError('Xatolik', data.message || 'Status yangilashda xatolik');
        }, 0);
      }
    } catch (error) {
      console.error('Order status yangilashda xatolik:', error);
      setTimeout(() => {
        safeNotifyError('Xatolik', error.message || 'Server bilan bog\'lanishda xatolik');
      }, 0);
    }
  };

  // Old modal functions removed - now using useNotifications hook

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "0 so'm";
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as +998 (XX) XXX-XX-XX
    if (cleaned.length === 12 && cleaned.startsWith('998')) {
      const code = cleaned.substring(3, 5);
      const number = cleaned.substring(5);
      return `+998 (${code}) ${number.substring(0, 3)}-${number.substring(3, 5)}-${number.substring(5)}`;
    }
    return phone; // Return original if not in expected format
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const changePage = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onMobileToggle}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold text-primary-dark">Buyurtmalar</h2>
          </div>
          <div className="flex items-center space-x-4">
            <AdminNotificationBell notifications={notifications} setNotifications={setNotifications} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Search and Filter Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-2xl font-bold text-primary-dark">Buyurtmalar</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buyurtma qidirish..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange w-full sm:w-64"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" text="Buyurtmalar yuklanmoqda..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Buyurtma</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Mijoz</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Mahsulotlar</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Jami summa</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Sana</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-orange rounded-full flex items-center justify-center shadow-lg">
                            <i className="fas fa-shopping-cart text-white text-sm"></i>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500 whitespace-nowrap">{order.items.length} mahsulot</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 whitespace-nowrap">
                            {order.customerName}
                            <br />
                            <span className="text-sm text-primary-orange font-medium">{formatPhoneNumber(order.customerPhone)}</span>
                          </div>
                          {order.customerEmail && (
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-sm text-gray-900 truncate">
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{order.items.length - 2} boshqa
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-primary-orange">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`px-4 py-3 rounded-full text-sm font-medium ${statusMap[order.status]?.class || statusMap.pending.class}`}
                        >
                          {statusOptions.slice(1).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-medium">
                          {formatDate(order.orderDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openViewModal(order)}
                            className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50" 
                            title="Ko'rish"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(order)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" 
                            title="O'chirish"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Ko'rsatilmoqda <span>{(currentPage - 1) * itemsPerPage + 1}</span> dan <span>{Math.min(currentPage * itemsPerPage, totalCount)}</span> gacha, jami <span>{totalCount}</span> ta
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => changePage('prev')}
              disabled={currentPage === 1}
              className="pagination-btn px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-chevron-left mr-1"></i>Oldingi
            </button>
            <button 
              onClick={() => changePage('next')}
              disabled={currentPage >= totalPages}
              className="pagination-btn px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keyingi<i className="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        </div>
      </main>

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 modal z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden"
          onClick={closeViewModal}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[96vh] sm:max-h-[92vh] overflow-y-auto m-1 sm:m-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-5 border-b flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-primary-dark">Buyurtma ma'lumotlari</h3>
              <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-3 sm:p-5 space-y-6">
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</h4>
                  <p className="text-gray-600">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-orange">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusMap[selectedOrder.status]?.class || statusMap.pending.class}`}>
                    {statusMap[selectedOrder.status]?.text || statusMap.pending.text}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Mijoz ma'lumotlari</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
                    <p className="text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <p className="text-gray-900">{formatPhoneNumber(selectedOrder.customerPhone)}</p>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{selectedOrder.customerEmail}</p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
                    <p className="text-gray-900">{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Buyurtma mahsulotlari</h5>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mahsulot</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Narx</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Miqdori</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Jami</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900">
                          Jami:
                        </td>
                        <td className="px-4 py-3 font-bold text-primary-orange">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To'lov usuli</label>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${paymentMap[selectedOrder.paymentMethod]?.class || paymentMap.cash.class}`}>
                    {paymentMap[selectedOrder.paymentMethod]?.text || paymentMap.cash.text}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buyurtma sanasi</label>
                                      <p className="text-gray-900">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Izoh</label>
                    <p className="text-gray-900">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeViewModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AdminNotificationModals - matching index.html exactly */}
      <AdminNotificationModals
        alertModal={alertModal}
        confirmModal={confirmModal}
        promptModal={promptModal}
        closeAlert={closeAlert}
        handleConfirmResponse={handleConfirmResponse}
        handlePromptResponse={handlePromptResponse}
      />

      {/* Old alert modal removed - now using AdminNotificationModals */}
    </div>
  );
};

export default AdminOrders; 