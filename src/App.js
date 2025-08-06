import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from './components/AdminDashboard';
import AdminCraftsmen from './components/AdminCraftsmen';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminAnalytics from './components/AdminAnalytics';
import './App.css';

function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [craftsmenCount, setCraftsmenCount] = useState(5); // Initialize with 5 craftsmen
  const [productsCount, setProductsCount] = useState(5); // Initialize with 5 products
  const [ordersCount, setOrdersCount] = useState(5); // Initialize with 5 orders (total count)
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state

  const handleLogout = () => {
    setIsAuthenticated(false);
    console.log('Logout clicked');
  };

  const handleCraftsmenCountChange = useCallback((count) => {
    setCraftsmenCount(count);
  }, []);

  const handleProductsCountChange = useCallback((count) => {
    setProductsCount(count);
  }, []);

  const handleOrdersCountChange = useCallback((count) => {
    setOrdersCount(count);
  }, []);

  const handleMobileToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Handle successful login from Header component
  const handleSuccessfulLogin = () => {
    setIsAuthenticated(true);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={
          <MainPage onSuccessfulLogin={handleSuccessfulLogin} />
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <div className="flex">
              <AdminSidebar 
                active="dashboard"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              <div className="flex-1 lg:ml-64">
                <AdminDashboard 
                  onMobileToggle={handleMobileToggle}
                  craftsmenCount={craftsmenCount}
                  productsCount={productsCount}
                  ordersCount={ordersCount}
                />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/craftsmen" element={
          <ProtectedRoute>
            <div className="flex ">
              <AdminSidebar 
                active="craftsmen"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              <div className="flex-1 lg:ml-64">
                <AdminCraftsmen 
                  onCountChange={handleCraftsmenCountChange}
                  onMobileToggle={handleMobileToggle}
                />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute>
            <div className="flex">
              <AdminSidebar 
                active="products"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              <div className="flex-1 lg:ml-64">
                <AdminProducts 
                  onMobileToggle={handleMobileToggle}
                  onCountChange={handleProductsCountChange}
                />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute>
            <div className="flex">
              <AdminSidebar 
                active="orders"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              <div className="flex-1 lg:ml-64">
                <AdminOrders 
                  onMobileToggle={handleMobileToggle}
                  onCountChange={handleOrdersCountChange}
                />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute>
            <div className="flex">
              <AdminSidebar 
                active="analytics"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              <div className="flex-1">
                <AdminAnalytics 
                  onMobileToggle={handleMobileToggle}
                />
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
