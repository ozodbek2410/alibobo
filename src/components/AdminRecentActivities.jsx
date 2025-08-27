import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import '../styles/select-styles.css';
import RecentActivitiesSkeleton from './skeletons/RecentActivitiesSkeleton';
import FadeInTransition from './transitions/FadeInTransition';
import useRealNotifications from '../hooks/useRealNotifications';

const AdminRecentActivities = ({ onNavigate, isLoading = false }) => {
  const [filter, setFilter] = useState('all');
  const [activities, setActivities] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState(new Set());
  
  // Use real notification system to get actual activities
  const {
    notifications: realNotifications,
    loading: notificationsLoading,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchNotifications // Add fetchNotifications for manual refresh
  } = useRealNotifications(true, 30000);

  // Force refresh notifications every 30 seconds to ensure dashboard stays updated
  useEffect(() => {
    if (fetchNotifications) {
      const interval = setInterval(() => {
        fetchNotifications(true); // Force refresh
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [fetchNotifications]);

  // Convert real notifications to activities format
  const generateActivitiesFromNotifications = useCallback(() => {
    if (!realNotifications || realNotifications.length === 0) {
      return [];
    }

    return realNotifications
      .slice(0, 10) // Limit to 10 most recent
      .map(notification => {
        // Map notification types to activity categories
        let category = 'boshqa';
        if (notification.entityType === 'craftsman') {
          category = 'ustalar';
        } else if (notification.entityType === 'product') {
          category = 'mahsulotlar';
        } else if (notification.entityType === 'order') {
          category = 'buyurtmalar';
        }

        return {
          id: notification.id, // Add notification ID for selection
          category,
          icon: notification.icon?.replace('fas ', '') || 'fa-bell',
          iconBg: notification.color?.includes('green') ? 'bg-green-100' :
                  notification.color?.includes('red') ? 'bg-red-100' :
                  notification.color?.includes('blue') ? 'bg-blue-100' :
                  notification.color?.includes('orange') ? 'bg-orange-100' :
                  'bg-gray-100',
          iconColor: notification.color?.includes('green') ? 'text-green-600' :
                     notification.color?.includes('red') ? 'text-red-600' :
                     notification.color?.includes('blue') ? 'text-blue-600' :
                     notification.color?.includes('orange') ? 'text-orange-600' :
                     'text-gray-600',
          title: notification.title,
          desc: notification.message,
          time: notification.time || 'Hozir',
          timestamp: notification.timestamp || Date.now(),
          clickAction: () => {
            if (onNavigate) {
              if (category === 'ustalar') {
                onNavigate('craftsmen', notification.entityName);
              } else if (category === 'mahsulotlar') {
                onNavigate('products', notification.entityName);
              } else if (category === 'buyurtmalar') {
                onNavigate('orders', notification.entityName);
              }
            }
          }
        };
      });
  }, [realNotifications, onNavigate]);

  // Selection functions
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedActivities(new Set());
  };

  const selectAll = () => {
    setSelectedActivities(new Set(filteredActivities.map(a => a.id)));
  };

  const handleActivityClick = (activity) => {
    if (selectionMode) {
      // In selection mode, toggle selection
      const newSelected = new Set(selectedActivities);
      if (newSelected.has(activity.id)) {
        newSelected.delete(activity.id);
      } else {
        newSelected.add(activity.id);
      }
      setSelectedActivities(newSelected);
    } else {
      // Normal mode: navigate
      if (activity.clickAction) {
        activity.clickAction();
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedActivities.size === 0) return;
    
    // Delete selected notifications
    for (const activityId of selectedActivities) {
      if (deleteNotification) {
        await deleteNotification(activityId);
      }
    }
    
    setSelectedActivities(new Set());
    setSelectionMode(false);
  };

  const handleDeleteAll = async () => {
    if (deleteAllNotifications) {
      await deleteAllNotifications();
    }
    setSelectedActivities(new Set());
    setSelectionMode(false);
  };

  // Update activities when real notifications change
  useEffect(() => {
    setActivities(generateActivitiesFromNotifications());
  }, [generateActivitiesFromNotifications]);

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

  // Show Telegram-style skeleton while loading
  if (isLoading || notificationsLoading) {
    return <RecentActivitiesSkeleton itemCount={5} />;
  }

  return (
    <FadeInTransition 
      isLoading={isLoading} 
      skeleton={<RecentActivitiesSkeleton itemCount={5} />}
      delay={100}
    >
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex-1 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-bold text-primary-dark">Oxirgi amallar</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <i className="fas fa-filter absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <select
                className="custom-select custom-select-with-icon text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selection button */}
            {filteredActivities.length > 0 && (
              <button
                onClick={toggleSelectionMode}
                className="text-sm text-primary-orange hover:text-opacity-80 transition-colors px-2 py-1 rounded font-medium"
              >
                {selectionMode ? 'Bekor qilish' : 'Tanlash'}
              </button>
            )}
          </div>
        </div>
        
        {/* Selection buttons */}
        {selectionMode && filteredActivities.length > 0 && (
          <div className="flex gap-3 md:gap-2 mb-4">
            <button
              onClick={selectAll}
              className="flex-1 px-4 py-2 md:px-2 md:py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm md:text-xs touch-manipulation"
            >
              Hammasini tanlash
            </button>
            <button
              onClick={selectedActivities.size > 0 ? handleDeleteSelected : handleDeleteAll}
              className="flex-1 px-4 py-2 md:px-2 md:py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm md:text-xs touch-manipulation"
            >
              {selectedActivities.size > 0 ? `O'chirish (${selectedActivities.size})` : "O'chirish"}
            </button>
          </div>
        )}

        <div className="space-y-2 sm:space-y-3 sm:max-h-96 sm:overflow-y-auto flex-1 lg:flex-none">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <i className="fas fa-clock text-2xl sm:text-3xl mb-2 sm:mb-3 opacity-50"></i>
              <p className="text-sm">Hozircha hech qanday faoliyat mavjud emas</p>
              <p className="text-xs mt-1 opacity-75">Yangi amallar bajarilganda bu yerda ko'rsatiladi</p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <div
                key={`${activity.category}-${index}`}
                className={`activity-item flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                  index === 0 ? 'notification-new' : ''
                } ${
                  selectionMode && selectedActivities.has(activity.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleActivityClick(activity)}
                data-category={activity.category}
              >
                {selectionMode && (
                  <div className="flex items-center justify-center flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedActivities.has(activity.id)}
                      onChange={() => handleActivityClick(activity)}
                      className="w-5 h-5 text-primary-orange bg-gray-100 border-gray-300 rounded focus:ring-primary-orange focus:ring-2 touch-manipulation"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <i className={`fas ${activity.icon} ${activity.iconColor} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm leading-tight">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
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
    </FadeInTransition>
  );
};

export default AdminRecentActivities;