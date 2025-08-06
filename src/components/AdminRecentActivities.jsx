import React, { useState, useEffect } from 'react';

const AdminRecentActivities = ({ craftsmen = [], products = [], orders = [], onNavigate }) => {
  const [filter, setFilter] = useState('all');
  const [activities, setActivities] = useState([]);

  // Generate recent activities based on actual data (matching index.html logic)
  const generateRecentActivities = () => {
    const now = new Date();
    const generatedActivities = [];

    // Recent craftsmen activities
    const recentCraftsmen = [...craftsmen]
      .sort((a, b) => new Date(b.createdAt || b.joinDate || '2024-01-01') - new Date(a.createdAt || a.joinDate || '2024-01-01'))
      .slice(0, 3);

    recentCraftsmen.forEach((craftsman) => {
      const joinDate = new Date(craftsman.createdAt || craftsman.joinDate || '2024-01-01');
      const daysDiff = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
      const timeText = daysDiff === 0 ? 'Bugun' : daysDiff === 1 ? 'Kecha' : `${daysDiff} kun oldin`;

      generatedActivities.push({
        category: 'ustalar',
        icon: 'fa-user-plus',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        title: 'Yangi usta qo\'shildi',
        desc: `${craftsman.name} - ${craftsman.specialty}`,
        time: timeText,
        timestamp: joinDate.getTime(),
        clickAction: () => {
          if (onNavigate) {
            onNavigate('craftsmen', craftsman.name);
          }
        }
      });
    });

    // Recent products activities
    const recentProducts = [...products]
      .sort((a, b) => new Date(b.createdAt || b.addedDate || '2024-01-01') - new Date(a.createdAt || a.addedDate || '2024-01-01'))
      .slice(0, 2);

    recentProducts.forEach((product) => {
      const addDate = new Date(product.createdAt || product.addedDate || '2024-01-01');
      const daysDiff = Math.floor((now - addDate) / (1000 * 60 * 60 * 24));
      const timeText = daysDiff === 0 ? 'Bugun' : daysDiff === 1 ? 'Kecha' : `${daysDiff} kun oldin`;

      generatedActivities.push({
        category: 'mahsulotlar',
        icon: 'fa-box',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        title: 'Yangi mahsulot qo\'shildi',
        desc: `${product.name} - ${formatCurrency(product.price)}`,
        time: timeText,
        timestamp: addDate.getTime(),
        clickAction: () => {
          if (onNavigate) {
            onNavigate('products', product.name);
          }
        }
      });
    });

    // Recent orders activities
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt || b.date || '2024-01-01') - new Date(a.createdAt || a.date || '2024-01-01'))
      .slice(0, 3);

    recentOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt || order.date || '2024-01-01');
      const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      const timeText = daysDiff === 0 ? 'Bugun' : daysDiff === 1 ? 'Kecha' : `${daysDiff} kun oldin`;

      generatedActivities.push({
        category: 'buyurtmalar',
        icon: 'fa-shopping-cart',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        title: 'Yangi buyurtma',
        desc: `Buyurtma #${order.orderNumber || order.id} - ${formatCurrency(order.totalAmount)}`,
        time: timeText,
        timestamp: orderDate.getTime(),
        clickAction: () => {
          if (onNavigate) {
            onNavigate('orders', order.orderNumber || order.id);
          }
        }
      });
    });

    // Sort by timestamp (newest first)
    return generatedActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10); // Limit to 10 most recent activities
  };

  // Format currency helper function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  // Update activities when data changes
  useEffect(() => {
    setActivities(generateRecentActivities());
  }, [craftsmen, products, orders]);

  // Filter activities
  const filteredActivities = filter === 'all' ? activities : activities.filter(a => a.category === filter);

  const filterOptions = [
    { value: 'all', label: 'Barcha amallar' },
    { value: 'ustalar', label: 'Ustalar' },
    { value: 'mahsulotlar', label: 'Mahsulotlar' },
    { value: 'buyurtmalar', label: 'Buyurtmalar' },
    { value: 'tolovlar', label: 'To\'lovlar' },
    { value: 'boshqa', label: 'Boshqalar' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
        <h3 className="text-lg font-bold text-primary-dark">Oxirgi amallar</h3>
        <div className="flex justify-end">
          <div className="relative">
            <i className="fas fa-filter absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            <select
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:border-primary-orange transition-colors"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-clock text-3xl mb-3 opacity-50"></i>
            <p className="text-sm">Hozircha hech qanday faoliyat yo'q</p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <div
              key={`${activity.category}-${index}`}
              className={`activity-item flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                index === 0 ? 'notification-new' : ''
              }`}
              onClick={activity.clickAction}
              data-category={activity.category}
            >
              <div className={`w-10 h-10 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`fas ${activity.icon} ${activity.iconColor}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm md:text-base">
                  {activity.title}
                </p>
                <p className="text-xs md:text-sm text-gray-500 truncate">
                  {activity.desc}
                </p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {activity.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminRecentActivities;