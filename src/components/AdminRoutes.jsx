import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLoadingLayout from './skeletons/AdminLoadingLayout';
import AdminSidebar from './AdminSidebar';

// Lazy load all admin components to keep them out of main bundle
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AdminCraftsmen = lazy(() => import('./AdminCraftsmen'));
const AdminProducts = lazy(() => import('./AdminProducts'));
const AdminOrders = lazy(() => import('./AdminOrders'));
const AdminAnalytics = lazy(() => import('./AdminAnalytics'));

// Preload admin components on user interaction
const preloadAdminComponents = () => {
  // Preload most commonly used admin components
  import('./AdminDashboard');
  import('./AdminProducts');
  import('./AdminOrders');
};

const AdminRoutes = ({ 
  onLogout, 
  isMobileOpen, 
  onMobileToggle, 
  counts,
  craftsmenCount,
  productsCount,
  ordersCount,
  onCraftsmenCountChange,
  onProductsCountChange,
  onOrdersCountChange
}) => {
  // Preload components on first render
  React.useEffect(() => {
    // Preload after a short delay to not block initial render
    const timer = setTimeout(preloadAdminComponents, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex">
      <AdminSidebar
        onLogout={onLogout}
        isMobileOpen={isMobileOpen}
        onMobileToggle={onMobileToggle}
        counts={counts}
      />
      <div className="flex-1 lg:ml-64">
        <Suspense fallback={<AdminLoadingLayout />}>
          <Routes>
            <Route 
              path="/" 
              element={
                <AdminDashboard
                  onMobileToggle={onMobileToggle}
                  craftsmenCount={craftsmenCount}
                  productsCount={productsCount}
                  ordersCount={ordersCount}
                />
              } 
            />
            <Route 
              path="/craftsmen" 
              element={
                <AdminCraftsmen
                  onCountChange={onCraftsmenCountChange}
                  onMobileToggle={onMobileToggle}
                />
              } 
            />
            <Route 
              path="/products" 
              element={
                <AdminProducts
                  onMobileToggle={onMobileToggle}
                  onCountChange={onProductsCountChange}
                />
              } 
            />
            <Route 
              path="/orders" 
              element={
                <AdminOrders
                  onMobileToggle={onMobileToggle}
                  onCountChange={onOrdersCountChange}
                />
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <AdminAnalytics
                  onMobileToggle={onMobileToggle}
                />
              } 
            />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default AdminRoutes;