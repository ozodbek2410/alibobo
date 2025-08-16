// Component preloader utility for strategic lazy loading
class ComponentPreloader {
  constructor() {
    this.preloadedComponents = new Set();
    this.preloadPromises = new Map();
  }

  // Preload a component and cache the promise
  preload(componentImport, componentName) {
    if (this.preloadedComponents.has(componentName)) {
      return this.preloadPromises.get(componentName);
    }

    const promise = componentImport().then(module => {
      this.preloadedComponents.add(componentName);
      console.log(`✅ Preloaded component: ${componentName}`);
      return module;
    }).catch(error => {
      console.error(`❌ Failed to preload component ${componentName}:`, error);
      throw error;
    });

    this.preloadPromises.set(componentName, promise);
    return promise;
  }

  // Preload multiple components
  preloadMultiple(components) {
    return Promise.allSettled(
      components.map(({ importFn, name }) => this.preload(importFn, name))
    );
  }

  // Check if component is preloaded
  isPreloaded(componentName) {
    return this.preloadedComponents.has(componentName);
  }

  // Get preload status
  getPreloadStatus() {
    return {
      preloadedCount: this.preloadedComponents.size,
      preloadedComponents: Array.from(this.preloadedComponents)
    };
  }
}

// Create singleton instance
export const componentPreloader = new ComponentPreloader();

// Preload strategies
export const preloadStrategies = {
  // Preload on user interaction (hover, focus)
  onInteraction: (componentImport, componentName) => {
    return () => componentPreloader.preload(componentImport, componentName);
  },

  // Preload after initial page load
  afterPageLoad: (componentImport, componentName, delay = 2000) => {
    setTimeout(() => {
      componentPreloader.preload(componentImport, componentName);
    }, delay);
  },

  // Preload on route change
  onRouteChange: (componentImport, componentName) => {
    componentPreloader.preload(componentImport, componentName);
  },

  // Preload critical components immediately
  immediate: (componentImport, componentName) => {
    componentPreloader.preload(componentImport, componentName);
  }
};

// Common component imports for preloading
export const componentImports = {
  // Admin components
  AdminDashboard: () => import('../components/AdminDashboard'),
  AdminProducts: () => import('../components/AdminProducts'),
  AdminOrders: () => import('../components/AdminOrders'),
  AdminCraftsmen: () => import('../components/AdminCraftsmen'),
  AdminAnalytics: () => import('../components/AdminAnalytics'),
  
  // User components
  ProductDetailPage: () => import('../components/ProductDetailPage'),
  ProductDetail: () => import('../components/ProductDetail'),
  CartSidebar: () => import('../components/CartSidebar'),
  
  // Heavy components
  ProductsGrid: () => import('../components/ProductsGridOptimized'),
  OptimizedImageUploader: () => import('../components/OptimizedImageUploader'),
};

// Preload configurations for different scenarios
export const preloadConfigs = {
  // For regular users - preload product-related components
  userFlow: [
    { importFn: componentImports.ProductDetailPage, name: 'ProductDetailPage' },
    { importFn: componentImports.CartSidebar, name: 'CartSidebar' },
  ],

  // For admin users - preload admin components
  adminFlow: [
    { importFn: componentImports.AdminDashboard, name: 'AdminDashboard' },
    { importFn: componentImports.AdminProducts, name: 'AdminProducts' },
    { importFn: componentImports.AdminOrders, name: 'AdminOrders' },
  ],

  // Critical components that should be preloaded early
  critical: [
    { importFn: componentImports.ProductsGrid, name: 'ProductsGrid' },
  ]
};

// Hook for using component preloader in React components
export const useComponentPreloader = () => {
  const preloadComponent = (componentImport, componentName) => {
    return componentPreloader.preload(componentImport, componentName);
  };

  const preloadMultiple = (components) => {
    return componentPreloader.preloadMultiple(components);
  };

  const isPreloaded = (componentName) => {
    return componentPreloader.isPreloaded(componentName);
  };

  return {
    preloadComponent,
    preloadMultiple,
    isPreloaded,
    getStatus: () => componentPreloader.getPreloadStatus()
  };
};