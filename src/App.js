import { useState, useCallback, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import socketService from './services/SocketService'; // Real-time updates
import DiagnosticPanel from './components/DiagnosticPanel'; // Diagnostic panel for monitoring
import './App.css';

import AdminLoadingLayout from './components/skeletons/AdminLoadingLayout';
 // Real-time status

const MainPage = lazy(() => import('./components/MainPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));
// Lazy load the entire admin section to keep it out of main bundle
const AdminRoutes = lazy(() => import('./components/AdminRoutes'));

function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [craftsmenCount, setCraftsmenCount] = useState(5); // Initialize with 5 craftsmen
  const [productsCount, setProductsCount] = useState(5); // Initialize with 5 products
  const [ordersCount, setOrdersCount] = useState(5); // Initialize with 5 orders (total count)
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const [showDiagnostics, setShowDiagnostics] = useState(false); // Diagnostic panel state

  // CRITICAL: Initialize Socket.IO for real-time stock updates
  useEffect(() => {
    console.log('🔗 Initializing Socket.IO for real-time stock synchronization');
    socketService.initialize();
    
    // Diagnostic panel toggle with keyboard shortcut (Dev only)
    if (process.env.NODE_ENV === 'development') {
      const handleKeyDown = (e) => {
        // Ctrl+Shift+D to toggle diagnostics
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          e.preventDefault();
          setShowDiagnostics(prev => !prev);
          console.log('🔧 Diagnostic panel toggled:', !showDiagnostics);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      console.log('🔧 Diagnostic panel available (Ctrl+Shift+D)');
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        socketService.disconnect();
      };
    }
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

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
    <QueryClientProvider client={queryClient}>
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
        <Route path="/product/:id" element={
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Mahsulot yuklanmoqda...</div></div>}>
            <ProductDetailPage />
          </Suspense>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <Suspense fallback={<AdminLoadingLayout />}>
              <AdminRoutes
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileToggle={handleMobileToggle}
                counts={{ craftsmenCount, productsCount, ordersCount }}
                craftsmenCount={craftsmenCount}
                productsCount={productsCount}
                ordersCount={ordersCount}
                onCraftsmenCountChange={handleCraftsmenCountChange}
                onProductsCountChange={handleProductsCountChange}
                onOrdersCountChange={handleOrdersCountChange}
              />
            </Suspense>
          </ProtectedRoute>
        } />
      </Routes>
      </Router>
      
      {/* CRITICAL: Real-time Diagnostic Panel (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <DiagnosticPanel 
          isVisible={showDiagnostics} 
          onToggle={() => setShowDiagnostics(!showDiagnostics)} 
        />
      )}

    
    </QueryClientProvider>
  );
}

export default App;