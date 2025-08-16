import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { componentPreloader, preloadConfigs, componentImports } from '../utils/componentPreloader';

// Hook for intelligent component preloading based on user behavior
export const useIntelligentPreloading = (userType = 'user') => {
  const location = useLocation();

  // Preload components based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    // Preload based on route
    if (currentPath.startsWith('/admin')) {
      // User is in admin area - preload admin components
      componentPreloader.preloadMultiple(preloadConfigs.adminFlow);
    } else {
      // User is in main area - preload user components
      componentPreloader.preloadMultiple(preloadConfigs.userFlow);
    }

    // Route-specific preloading
    if (currentPath === '/') {
      // On homepage - preload product detail page for quick navigation
      componentPreloader.preload(componentImports.ProductDetailPage, 'ProductDetailPage');
    }
  }, [location.pathname]);

  // Preload component on hover (for buttons, links, etc.)
  const preloadOnHover = useCallback((componentName) => {
    const componentImport = componentImports[componentName];
    if (componentImport) {
      return () => componentPreloader.preload(componentImport, componentName);
    }
    return () => {};
  }, []);

  // Preload component on focus
  const preloadOnFocus = useCallback((componentName) => {
    const componentImport = componentImports[componentName];
    if (componentImport) {
      return () => componentPreloader.preload(componentImport, componentName);
    }
    return () => {};
  }, []);

  // Preload component immediately
  const preloadNow = useCallback((componentName) => {
    const componentImport = componentImports[componentName];
    if (componentImport) {
      return componentPreloader.preload(componentImport, componentName);
    }
    return Promise.resolve();
  }, []);

  // Check if component is preloaded
  const isPreloaded = useCallback((componentName) => {
    return componentPreloader.isPreloaded(componentName);
  }, []);

  return {
    preloadOnHover,
    preloadOnFocus,
    preloadNow,
    isPreloaded,
    getPreloadStatus: () => componentPreloader.getPreloadStatus()
  };
};

// Hook for preloading based on user interaction patterns
export const useUserBehaviorPreloading = () => {
  useEffect(() => {
    let idleTimer;
    let interactionCount = 0;

    const handleUserInteraction = () => {
      interactionCount++;
      
      // Clear existing timer
      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      // After user becomes idle for 2 seconds, start preloading
      idleTimer = setTimeout(() => {
        // If user has interacted multiple times, they're likely engaged
        if (interactionCount > 3) {
          // Preload more components for engaged users
          componentPreloader.preloadMultiple([
            { importFn: componentImports.ProductDetailPage, name: 'ProductDetailPage' },
            { importFn: componentImports.CartSidebar, name: 'CartSidebar' },
          ]);
        }
      }, 2000);
    };

    // Listen for user interactions
    const events = ['click', 'scroll', 'keydown', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);
};

// Hook for network-aware preloading
export const useNetworkAwarePreloading = () => {
  useEffect(() => {
    // Check network connection quality
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const { effectiveType, downlink } = connection;
      
      // Only preload on good connections
      if (effectiveType === '4g' || downlink > 1.5) {
        // Good connection - preload more aggressively
        setTimeout(() => {
          componentPreloader.preloadMultiple(preloadConfigs.userFlow);
        }, 1000);
      } else if (effectiveType === '3g' || downlink > 0.5) {
        // Moderate connection - preload selectively
        setTimeout(() => {
          componentPreloader.preload(componentImports.ProductDetailPage, 'ProductDetailPage');
        }, 3000);
      }
      // On slow connections (2g, slow-2g), don't preload
    } else {
      // No connection info - assume good connection and preload conservatively
      setTimeout(() => {
        componentPreloader.preload(componentImports.ProductDetailPage, 'ProductDetailPage');
      }, 2000);
    }
  }, []);
};

// Hook for viewport-based preloading
export const useViewportPreloading = () => {
  useEffect(() => {
    // Preload based on viewport size
    const isLargeScreen = window.innerWidth > 1024;
    const isMobile = window.innerWidth < 768;

    if (isLargeScreen) {
      // Large screens can handle more preloading
      componentPreloader.preloadMultiple(preloadConfigs.userFlow);
    } else if (!isMobile) {
      // Tablet - moderate preloading
      componentPreloader.preload(componentImports.ProductDetailPage, 'ProductDetailPage');
    }
    // Mobile - minimal preloading to save bandwidth
  }, []);
};