import { useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef(Date.now());
  const mountTime = useRef(null);

  useEffect(() => {
    mountTime.current = Date.now();
    const mountDuration = mountTime.current - renderStartTime.current;
    
    console.log(`🚀 ${componentName} mounted in ${mountDuration}ms`);
    
    return () => {
      const unmountTime = Date.now();
      const totalLifetime = unmountTime - mountTime.current;
      console.log(`🔄 ${componentName} unmounted after ${totalLifetime}ms`);
    };
  }, [componentName]);

  const measureOperation = useCallback((operationName, operation) => {
    return async (...args) => {
      const startTime = performance.now();
      
      try {
        const result = await operation(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️ ${componentName}.${operationName} took ${duration.toFixed(2)}ms`);
        
        // Log slow operations
        if (duration > 100) {
          console.warn(`🐌 Slow operation detected: ${componentName}.${operationName} (${duration.toFixed(2)}ms)`);
        }
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.error(`❌ ${componentName}.${operationName} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      }
    };
  }, [componentName]);

  const logRender = useCallback((props = {}) => {
    const renderTime = Date.now();
    const timeSinceMount = mountTime.current ? renderTime - mountTime.current : 0;
    
    console.log(`🔄 ${componentName} re-rendered at +${timeSinceMount}ms`, {
      propsCount: Object.keys(props).length,
      timestamp: new Date().toISOString()
    });
  }, [componentName]);

  return {
    measureOperation,
    logRender
  };
};

// Performance profiler for API calls
export const profileApiCall = async (url, options = {}) => {
  const startTime = performance.now();
  const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
  
  console.log(`🌐 API Call started: ${url}`);
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = endTime - startTime;
    const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryDelta = endMemory - startMemory;
    
    console.log(`✅ API Call completed: ${url}`, {
      duration: `${duration.toFixed(2)}ms`,
      status: response.status,
      memoryUsed: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
      cached: response.headers.get('x-cache') === 'HIT'
    });
    
    // Log slow API calls
    if (duration > 1000) {
      console.warn(`🐌 Slow API call detected: ${url} (${duration.toFixed(2)}ms)`);
    }
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(`❌ API Call failed: ${url}`, {
      duration: `${duration.toFixed(2)}ms`,
      error: error.message
    });
    
    throw error;
  }
};

// Memory usage tracker
export const trackMemoryUsage = (componentName) => {
  if (!performance.memory) {
    console.warn('Memory tracking not available in this browser');
    return;
  }
  
  const memory = performance.memory;
  const used = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
  const total = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
  const limit = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
  
  console.log(`💾 Memory usage for ${componentName}:`, {
    used: `${used}MB`,
    total: `${total}MB`,
    limit: `${limit}MB`,
    usage: `${((used / limit) * 100).toFixed(1)}%`
  });
  
  // Warn if memory usage is high
  if (used / limit > 0.8) {
    console.warn(`⚠️ High memory usage detected in ${componentName}: ${used}MB (${((used / limit) * 100).toFixed(1)}%)`);
  }
};

// React DevTools Profiler wrapper
export const withProfiler = (Component, componentName) => {
  return React.memo((props) => {
    const { measureOperation, logRender } = usePerformanceMonitor(componentName);
    
    useEffect(() => {
      logRender(props);
      trackMemoryUsage(componentName);
    });
    
    return <Component {...props} measureOperation={measureOperation} />;
  });
};
