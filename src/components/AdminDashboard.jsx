import React, { useState, useEffect } from 'react';
import AdminStatsCards from './AdminStatsCards';
import AdminRecentActivities from './AdminRecentActivities';
import AdminNotificationBell from './AdminNotificationBell';
import AdminNotificationModals from './AdminNotificationModals';
import useNotifications from '../hooks/useNotifications';
import useStatistics from '../hooks/useStatistics';

const AdminDashboard = ({ onMobileToggle, onNavigate }) => {
  const [craftsmenData, setCraftsmenData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  
  // Use notification system
  const {
    notifications,
    setNotifications,
    alertModal,
    confirmModal,
    promptModal,
    closeAlert,
    handleConfirmResponse,
    handlePromptResponse,
    notifySuccess,
    notifyError,
    notifyInfo
  } = useNotifications();

  // Use statistics hook for real-time data
  const {
    statistics,
    editStats,
    loading: statsLoading,
    error: statsError,
    refreshStats,
    formatNumber
  } = useStatistics(true, 300000); // Auto-refresh every 5 minutes

  // Fetch data for activities (separate from statistics)
  useEffect(() => {
    const fetchActivitiesData = async () => {
      setActivitiesLoading(true);
      try {
        // Fetch craftsmen for activities
        const craftsmenResponse = await fetch('/api/craftsmen');
        if (craftsmenResponse.ok) {
          const craftsmenResult = await craftsmenResponse.json();
          setCraftsmenData(craftsmenResult.craftsmen || []);
        }

        // Fetch products for activities
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsResult = await productsResponse.json();
          setProductsData(productsResult.products || []);
        }

        // Fetch orders for activities
        const ordersResponse = await fetch('/api/orders');
        if (ordersResponse.ok) {
          const ordersResult = await ordersResponse.json();
          setOrdersData(ordersResult.orders || []);
        }
      } catch (error) {
        console.error('Ma\'lumotlarni yuklashda xatolik:', error);
        notifyError('Xatolik', 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivitiesData();
  }, [notifyError]);

  // Handle statistics errors
  useEffect(() => {
    if (statsError) {
      notifyError('Statistika xatoligi', statsError);
    }
  }, [statsError, notifyError]);

  // Handle navigation from activities
  const handleNavigateFromActivity = (section, searchTerm) => {
    if (onNavigate) {
      onNavigate(section, searchTerm);
    }
    // No notification needed for navigation
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onMobileToggle}
              className="lg:hidden text-gray-600 hover:text-primary-orange transition-colors"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold text-primary-dark">Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <AdminNotificationBell 
              notifications={notifications} 
              setNotifications={setNotifications} 
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6 max-w-7xl mx-auto">
        {activitiesLoading && statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-primary-orange mb-4"></i>
              <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <AdminStatsCards 
              statistics={statistics}
              editStats={editStats}
              loading={statsLoading}
              error={statsError}
              formatNumber={formatNumber}
            />
            
            {/* Recent Activities */}
            <AdminRecentActivities 
              craftsmen={craftsmenData}
              products={productsData}
              orders={ordersData}
              onNavigate={handleNavigateFromActivity}
            />
          </>
        )}
      </main>

      {/* Notification Modals */}
      <AdminNotificationModals
        alertModal={alertModal}
        confirmModal={confirmModal}
        promptModal={promptModal}
        onAlertClose={closeAlert}
        onConfirmResponse={handleConfirmResponse}
        onPromptResponse={handlePromptResponse}
      />

      {/* Custom CSS for animations matching index.html */}
      <style jsx="true">{`
        /* Fade in animation */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Slide in from top animation for new notifications */
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .notification-new {
          animation: slideInFromTop 0.4s ease-out;
        }
        
        /* Pulse animation for notification badge */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Bounce animation for notification badge */
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        /* Activity item hover effect */
        .activity-item {
          transition: all 0.3s ease;
        }
        
        .activity-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* Custom scrollbar for activities */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;