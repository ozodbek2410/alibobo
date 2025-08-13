import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import AdminNotificationBell from './AdminNotificationBell';

const AdminAnalytics = ({ onMobileToggle, notifications, setNotifications }) => {
  const [selectedMonth, setSelectedMonth] = useState(11); // December 2024
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});
  const salesChartRef = useRef(null);
  const salesChartInstance = useRef(null);

  // Sample data for analytics
  const analyticsData = {
    craftsmen: [
      { id: 1, name: "Ahmad Karimov", completedWorks: 45, rating: 4.9 },
      { id: 2, name: "Odil Saidov", completedWorks: 38, rating: 4.8 },
      { id: 3, name: "Bobur Toshmatov", completedWorks: 52, rating: 4.7 },
      { id: 4, name: "Sardor Abdullayev", completedWorks: 29, rating: 4.6 },
      { id: 5, name: "Jasur Komilov", completedWorks: 33, rating: 4.8 }
    ],
    products: [
      { id: 1, name: "Qizil g'isht M100", sold: 850, price: 450 },
      { id: 2, name: "Oq sement M400", sold: 320, price: 35000 },
      { id: 3, name: "Elektr kabeli", sold: 423, price: 8000 },
      { id: 4, name: "Metalloprokat", sold: 234, price: 12000 },
      { id: 5, name: "LED lampa 15W", sold: 156, price: 25000 }
    ],
    categories: [
      { name: "G'isht va bloklar", percentage: 35, amount: 15700000 },
      { name: "Asbob-uskunalar", percentage: 25, amount: 11200000 },
      { name: "Bo'yoq va lak", percentage: 20, amount: 8950000 },
      { name: "Elektr mollalari", percentage: 12, amount: 5380000 },
      { name: "Boshqalar", percentage: 8, amount: 3580000 }
    ]
  };

  // Monthly data for different months
  const monthlyData = {
    revenue: [3200000, 3800000, 4100000, 3900000, 4500000, 4200000, 4800000, 5100000, 4900000, 5300000, 5000000, 5500000],
    orders: [850, 920, 1050, 980, 1150, 1080, 1200, 1300, 1250, 1350, 1280, 1400],
    orderStatus: [
      {pending: 15, processing: 20, completed: 40, cancelled: 8}, // Yanvar
      {pending: 18, processing: 22, completed: 42, cancelled: 9}, // Fevral
      {pending: 22, processing: 25, completed: 45, cancelled: 10}, // Mart
      {pending: 20, processing: 24, completed: 43, cancelled: 9}, // Aprel
      {pending: 25, processing: 28, completed: 48, cancelled: 12}, // May
      {pending: 23, processing: 26, completed: 46, cancelled: 11}, // Iyun
      {pending: 28, processing: 30, completed: 50, cancelled: 13}, // Iyul
      {pending: 30, processing: 32, completed: 52, cancelled: 14}, // Avgust
      {pending: 28, processing: 31, completed: 51, cancelled: 13}, // Sentyabr
      {pending: 32, processing: 34, completed: 54, cancelled: 15}, // Oktyabr
      {pending: 30, processing: 33, completed: 53, cancelled: 14}, // Noyabr
      {pending: 35, processing: 36, completed: 56, cancelled: 16}  // Dekabr
    ]
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  // removed unused formatDate

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const icon = type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info';
    
    notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 translate-y-full transition-transform duration-300 max-w-sm w-full mx-4 sm:w-auto sm:mx-0`;
    notification.innerHTML = `
      <div class="flex items-center justify-center space-x-3">
        <i class="fas ${icon}-circle text-lg"></i>
        <span class="text-sm font-medium text-center flex-1">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200 transition-colors">
          <i class="fas fa-times text-sm"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.remove('translate-y-full');
    }, 100);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.add('translate-y-full');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  };

  const showConfirm = (title, message, onConfirm, onCancel = null, type = 'warning') => {
    setConfirmConfig({
      title,
      message,
      type,
      onConfirm,
      onCancel
    });
    setShowConfirmModal(true);
  };

  const hideConfirm = () => {
    setShowConfirmModal(false);
    setConfirmConfig({});
  };

  const handleConfirm = () => {
    if (confirmConfig.onConfirm) {
      confirmConfig.onConfirm();
    }
    hideConfirm();
  };

  const handleCancel = () => {
    if (confirmConfig.onCancel) {
      confirmConfig.onCancel();
    }
    hideConfirm();
  };

  // Load analytics data
  const loadAnalytics = () => {
    loadTopProducts();
    loadCategoryStats();
    loadRecentActivities();
    createCharts();
    updateSummaryCards();
  };

  const loadTopProducts = () => {
    const topProducts = [...analyticsData.products]
      .sort((a, b) => (b.sold * b.price) - (a.sold * a.price))
      .slice(0, 5);
    
    return topProducts.map((product, index) => (
      <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
        <div className="flex items-center space-x-3">
          <span className="w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
            {index + 1}
          </span>
          <div>
            <div className="font-medium text-sm">{product.name}</div>
            <div className="text-xs text-gray-500">{formatCurrency(product.price)}</div>
          </div>
        </div>
        <div className="text-sm font-medium text-green-600">{product.sold} sotilgan</div>
      </div>
    ));
  };

  const loadCategoryStats = () => {
    return analyticsData.categories.map((category, index) => (
      <div key={index} className="p-2 hover:bg-gray-50 rounded">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-sm">{category.name}</span>
          <span className="text-sm font-bold text-gray-800">{category.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div 
            className="bg-purple-500 h-2 rounded-full" 
            style={{ width: `${category.percentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500">{formatCurrency(category.amount)}</div>
      </div>
    ));
  };

  const loadRecentActivities = () => {
    const activities = [
      { icon: 'fa-user-plus', color: 'text-green-600', bg: 'bg-green-100', title: 'Yangi usta qo\'shildi', desc: 'Ahmad Karimov - Santexnik', time: '2 soat oldin' },
      { icon: 'fa-box', color: 'text-blue-600', bg: 'bg-blue-100', title: 'Mahsulot yangilandi', desc: "G'isht M100 - narx yangilandi", time: '4 soat oldin' },
      { icon: 'fa-shopping-cart', color: 'text-orange-600', bg: 'bg-orange-100', title: 'Yangi buyurtma', desc: "Buyurtma #12045 - 450,000 so'm", time: '6 soat oldin' },
      { icon: 'fa-edit', color: 'text-purple-600', bg: 'bg-purple-100', title: 'Usta ma\'lumotlari yangilandi', desc: 'Odil Saidov - narx o\'zgartirildi', time: '8 soat oldin' },
      { icon: 'fa-check-circle', color: 'text-green-600', bg: 'bg-green-100', title: 'Buyurtma yakunlandi', desc: "Buyurtma #12040 - 1,200,000 so'm", time: '1 kun oldin' }
    ];
    
    return activities.map((activity, index) => (
      <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors fade-in">
        <div className={`w-10 h-10 ${activity.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <i className={`fas ${activity.icon} ${activity.color}`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-sm">{activity.title}</p>
          <p className="text-xs text-gray-500 truncate">{activity.desc}</p>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
      </div>
    ));
  };

  const updateSummaryCards = () => {
    const totalRevenue = analyticsData.products.reduce((sum, product) => sum + (product.sold * product.price), 0);
    const totalOrders = analyticsData.products.reduce((sum, product) => sum + product.sold, 0);

    return {
      totalRevenue: (totalRevenue / 1000000).toFixed(1) + 'M',
      totalOrders: totalOrders.toLocaleString()
    };
  };

  const createCharts = () => {
    createSalesChart();
  };

  const createSalesChart = () => {
    if (salesChartInstance.current) {
      salesChartInstance.current.destroy();
    }

    const ctx = salesChartRef.current.getContext('2d');
    
    salesChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
        datasets: [{
          label: "Sotuvlar (mln so'm)",
          data: [3.2, 3.8, 4.1, 3.9, 4.5, 4.2, 4.8, 5.1, 4.9, 5.3, 5.0, 5.5],
          borderColor: '#F68622',
          backgroundColor: 'rgba(246, 134, 34, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#F68622',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          }
        }
      }
    });
  };

  const updateOrdersStatusReport = () => {
    const statusData = monthlyData.orderStatus[selectedMonth];
    return {
      pending: statusData.pending,
      processing: statusData.processing,
      completed: statusData.completed,
      cancelled: statusData.cancelled
    };
  };

  const updateMonthlyStats = () => {
    const monthNames = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
    ];
    
    showNotification(`${monthNames[selectedMonth]} oyi uchun statistika yangilanmoqda...`, 'info');
    
    // Simulate monthly stats update
    setTimeout(() => {
      showNotification(`${monthNames[selectedMonth]} oyi statistikasi yangilandi`, 'success');
      updateMonthlyData(selectedMonth);
    }, 1500);
  };

  const updateMonthlyData = (month) => {
    // Update summary cards
    const revenue = (monthlyData.revenue[month] / 1000000).toFixed(1) + 'M';
    const orders = monthlyData.orders[month].toLocaleString();
    
    // Update charts with new data
    if (salesChartInstance.current) {
      salesChartInstance.current.data.datasets[0].data[month] = monthlyData.revenue[month] / 1000000;
      salesChartInstance.current.update();
    }

    return { revenue, orders };
  };

  const toggleSidebar = () => {
    if (onMobileToggle) {
      onMobileToggle();
    }
  };

  const toggleNotifications = () => {
    console.log('Notifications clicked');
  };

  const logout = () => {
    showConfirm(
      'Tizimdan chiqish',
      'Haqiqatan ham tizimdan chiqmoqchimisiz?',
      () => {
        showNotification('Tizimdan muvaffaqiyatli chiqdingiz', 'info');
      },
      null,
      'warning'
    );
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showConfirmModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showConfirmModal]);

  // Initialize analytics
  useEffect(() => {
    loadAnalytics();
  }, []);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (salesChartInstance.current) {
        salesChartInstance.current.destroy();
      }
    };
  }, []);

  // removed unused summaryData
  const ordersStatus = updateOrdersStatusReport();
  const monthlyStats = updateMonthlyData(selectedMonth);

  return (
    <>
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button onClick={toggleSidebar} className="lg:hidden text-gray-600">
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h2 className="text-2xl font-bold text-primary-dark">Tahlillar va hisobotlar</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <AdminNotificationBell notifications={notifications} setNotifications={setNotifications} />
            </div>
          </div>
        </header>

        {/* Analytics Section */}
        <div className="p-6">
          {/* Monthly Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-800">Oylik statistika</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                >
                  <option value="0">Yanvar 2024</option>
                  <option value="1">Fevral 2024</option>
                  <option value="2">Mart 2024</option>
                  <option value="3">Aprel 2024</option>
                  <option value="4">May 2024</option>
                  <option value="5">Iyun 2024</option>
                  <option value="6">Iyul 2024</option>
                  <option value="7">Avgust 2024</option>
                  <option value="8">Sentyabr 2024</option>
                  <option value="9">Oktyabr 2024</option>
                  <option value="10">Noyabr 2024</option>
                  <option value="11">Dekabr 2024</option>
                </select>
                <button onClick={updateMonthlyStats} className="bg-primary-orange text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300">
                  <i className="fas fa-chart-bar mr-2"></i>Statistikani yangilash
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="stats-card rounded-xl p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Jami daromad</p>
                  <p className="text-3xl font-bold text-green-600">{monthlyStats.revenue}</p>
                  <p className="text-sm text-green-500">
                    <i className="fas fa-arrow-up mr-1"></i>+12% o'tgan oyga nisbatan
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-money-bill-wave text-green-600 text-xl"></i>
                </div>
              </div>
            </div>
            
            <div className="stats-card rounded-xl p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Buyurtmalar soni</p>
                  <p className="text-3xl font-bold text-blue-600">{monthlyStats.orders}</p>
                  <p className="text-sm text-blue-500">
                    <i className="fas fa-arrow-up mr-1"></i>+8% o'tgan oyga nisbatan
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shopping-cart text-blue-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-chart-line text-blue-500 mr-2"></i>
                Oylik sotuvlar dinamikasi
              </h3>
              <div className="chart-container">
                <canvas ref={salesChartRef}></canvas>
              </div>
            </div>
            
            {/* Orders Status Report */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-list-alt text-green-500 mr-2"></i>
                Buyurtmalar holati
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-clock text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Kutilmoqda</h4>
                      <p className="text-sm text-gray-600">Yangi buyurtmalar</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{ordersStatus.pending}</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-spinner text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Jarayonda</h4>
                      <p className="text-sm text-gray-600">Ishlanayotgan buyurtmalar</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{ordersStatus.processing}</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Yakunlangan</h4>
                      <p className="text-sm text-gray-600">Tugallangan buyurtmalar</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{ordersStatus.completed}</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-times text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Bekor qilindi</h4>
                      <p className="text-sm text-gray-600">Bekor qilingan buyurtmalar</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{ordersStatus.cancelled}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Eng ko'p sotiladigan mahsulotlar</h3>
                <i className="fas fa-chart-bar text-green-500 text-xl"></i>
              </div>
              <div className="space-y-3">
                {loadTopProducts()}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Kategoriyalar bo'yicha sotuvlar</h3>
                <i className="fas fa-tags text-purple-500 text-xl"></i>
              </div>
              <div className="space-y-3">
                {loadCategoryStats()}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-clock text-orange-500 mr-2"></i>
              So'nggi faoliyatlar
            </h3>
            <div className="space-y-3">
              {loadRecentActivities()}
            </div>
          </div>
        </div>
      </div>

      {/* Universal Confirm Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 confirm-modal z-50 flex items-center justify-center p-4 overflow-hidden"
          onClick={hideConfirm}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full modal-content shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="mb-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center modal-icon ${
                  confirmConfig.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  confirmConfig.type === 'danger' ? 'bg-red-100 text-red-600' :
                  confirmConfig.type === 'info' ? 'bg-blue-100 text-blue-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <i className={`text-2xl ${
                    confirmConfig.type === 'warning' ? 'fas fa-exclamation-triangle' :
                    confirmConfig.type === 'danger' ? 'fas fa-trash' :
                    confirmConfig.type === 'info' ? 'fas fa-info-circle' :
                    'fas fa-check-circle'
                  }`}></i>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmConfig.title}</h3>
              <p className="text-gray-600 mb-6">{confirmConfig.message}</p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                >
                  Yo'q
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                >
                  Ha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAnalytics; 