import React, { useState } from 'react';

const AdminNotificationBell = ({ notifications = [], setNotifications }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    if (setNotifications) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const toggleNotifications = () => {
    setNotifOpen(!notifOpen);
  };

  // Close notifications when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifOpen && !event.target.closest('.notification-panel') && !event.target.closest('.notification-bell')) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifOpen]);

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="notification-bell relative text-gray-600 hover:text-primary-orange transition-colors duration-200"
      >
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {notifOpen && (
        <div className="notification-panel fixed top-16 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800">Bildirishnomalar</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm text-primary-orange hover:text-opacity-80 transition-colors"
              >
                Hammasini o'qish
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <i className="fas fa-bell-slash text-3xl mb-3 opacity-50"></i>
                <p className="text-sm">Bildirishnomalar yo'q</p>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const iconConfig = {
                  order: { icon: 'fas fa-shopping-cart', color: 'bg-blue-100 text-blue-600' },
                  stock: { icon: 'fas fa-exclamation-triangle', color: 'bg-yellow-100 text-yellow-600' },
                  user: { icon: 'fas fa-user-plus', color: 'bg-green-100 text-green-600' },
                  product: { icon: 'fas fa-box', color: 'bg-purple-100 text-purple-600' },
                  craftsman: { icon: 'fas fa-hammer', color: 'bg-orange-100 text-orange-600' },
                  info: { icon: 'fas fa-info-circle', color: 'bg-blue-100 text-blue-600' }
                };
                
                const config = iconConfig[notification.type] || iconConfig.info;
                
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                      !notification.read ? 'border-l-primary-orange bg-orange-50' : 'border-l-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 ${config.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <i className={`${config.icon} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary-orange rounded-full flex-shrink-0 animate-pulse"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;