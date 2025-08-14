import { useState, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

const MainPage = lazy(() => import('./components/MainPage'));
const AdminSidebar = lazy(() => import('./components/AdminSidebar'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminCraftsmen = lazy(() => import('./components/AdminCraftsmen'));
const AdminProducts = lazy(() => import('./components/AdminProducts'));
const AdminOrders = lazy(() => import('./components/AdminOrders'));
const AdminAnalytics = lazy(() => import('./components/AdminAnalytics'));

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
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Yuklanmoqda...</div></div>}>
            <MainPage onSuccessfulLogin={handleSuccessfulLogin} />
          </Suspense>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <div className="flex">
              <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
              <AdminSidebar
                active="dashboard"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              </Suspense>
              <div className="flex-1 lg:ml-64">
                <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
                <AdminDashboard
                  onMobileToggle={handleMobileToggle}
                  craftsmenCount={craftsmenCount}
                  productsCount={productsCount}
                  ordersCount={ordersCount}
                />
                </Suspense>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/craftsmen" element={
          <ProtectedRoute>
            <div className="flex ">
              <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
              <AdminSidebar
                active="craftsmen"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              </Suspense>
              <div className="flex-1 lg:ml-64">
                <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
                <AdminCraftsmen
                  onCountChange={handleCraftsmenCountChange}
                  onMobileToggle={handleMobileToggle}
                />
                </Suspense>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute>
            <div className="flex">
              <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
              <AdminSidebar
                active="products"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              </Suspense>
              <div className="flex-1 lg:ml-64">
                <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
                <AdminProducts
                  onMobileToggle={handleMobileToggle}
                  onCountChange={handleProductsCountChange}
                />
                </Suspense>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute>
            <div className="flex">
              <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
              <AdminSidebar
                active="orders"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              </Suspense>
              <div className="flex-1 lg:ml-64">
                <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
                <AdminOrders
                  onMobileToggle={handleMobileToggle}
                  onCountChange={handleOrdersCountChange}
                />
                </Suspense>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute>
            <div className="flex">
              <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
              <AdminSidebar
                active="analytics"
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount: craftsmenCount, productsCount: productsCount, ordersCount: ordersCount }}
              />
              </Suspense>
              <div className="flex-1">
                <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}>
                <AdminAnalytics
                  onMobileToggle={handleMobileToggle}
                />
                </Suspense>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
