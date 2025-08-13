import React, { useState, useEffect } from 'react';

const PerformanceDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    apiCalls: [],
    memoryUsage: 0,
    renderCount: 0,
    cacheHits: 0,
    cacheMisses: 0
  });

  // Toggle dashboard visibility
  const toggleDashboard = () => {
    setIsVisible(!isVisible);
  };

  // Monitor performance metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // Memory usage
      if (performance.memory) {
        const memory = performance.memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
        }));
      }

      // Get recent console logs for API calls
      const recentLogs = window.performanceLogs || [];
      setMetrics(prev => ({
        ...prev,
        apiCalls: recentLogs.slice(-10) // Last 10 API calls
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Initialize performance logging
  useEffect(() => {
    window.performanceLogs = window.performanceLogs || [];
    
    // Override console.log to capture performance data
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Capture API performance logs
      if (message.includes('API Call') || message.includes('⏱️') || message.includes('🌐')) {
        window.performanceLogs = window.performanceLogs || [];
        window.performanceLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: message,
          type: 'api'
        });
        
        // Keep only last 50 logs
        if (window.performanceLogs.length > 50) {
          window.performanceLogs = window.performanceLogs.slice(-50);
        }
      }
      
      return originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={toggleDashboard}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-200"
        title="Performance Dashboard"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Performance Dashboard</h3>
        <button
          onClick={toggleDashboard}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      {/* Memory Usage */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Memory Usage</h4>
        <div className="bg-gray-100 p-2 rounded">
          <span className="text-sm">{metrics.memoryUsage} MB</span>
        </div>
      </div>

      {/* Recent API Calls */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Recent API Calls</h4>
        <div className="bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
          {metrics.apiCalls.length > 0 ? (
            metrics.apiCalls.map((log, index) => (
              <div key={index} className="text-xs mb-1 font-mono">
                <span className="text-gray-500">{log.timestamp}</span>
                <br />
                <span className={
                  log.message.includes('🐌') ? 'text-red-600' :
                  log.message.includes('cached') ? 'text-green-600' :
                  'text-blue-600'
                }>
                  {log.message.substring(0, 80)}...
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500">No API calls yet</div>
          )}
        </div>
      </div>

      {/* Performance Tips */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Performance Tips</h4>
        <div className="text-xs text-gray-600">
          <div className="mb-1">🟢 Green: Cached responses (fast)</div>
          <div className="mb-1">🔵 Blue: Fresh API calls (normal)</div>
          <div className="mb-1">🔴 Red: Slow requests (>1s)</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
