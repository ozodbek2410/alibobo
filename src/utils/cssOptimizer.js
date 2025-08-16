// CSS optimization utilities for analyzing and optimizing Tailwind usage

// Analyze CSS usage in components
export const analyzeCSSUsage = () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Get all stylesheets
  const stylesheets = Array.from(document.styleSheets);
  const usedClasses = new Set();
  const unusedClasses = new Set();

  // Scan DOM for used classes
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    if (element.className && typeof element.className === 'string') {
      element.className.split(' ').forEach(className => {
        if (className.trim()) {
          usedClasses.add(className.trim());
        }
      });
    }
  });

  // Analyze stylesheets for unused rules
  stylesheets.forEach(stylesheet => {
    try {
      if (stylesheet.cssRules) {
        Array.from(stylesheet.cssRules).forEach(rule => {
          if (rule.selectorText) {
            // Extract class names from selectors
            const classMatches = rule.selectorText.match(/\.[a-zA-Z0-9_-]+/g);
            if (classMatches) {
              classMatches.forEach(match => {
                const className = match.substring(1); // Remove the dot
                if (!usedClasses.has(className)) {
                  unusedClasses.add(className);
                }
              });
            }
          }
        });
      }
    } catch (e) {
      // Cross-origin stylesheets might throw errors
      console.warn('Could not analyze stylesheet:', e);
    }
  });

  console.log('🎨 CSS Usage Analysis:');
  console.log(`✅ Used classes: ${usedClasses.size}`);
  console.log(`❌ Potentially unused classes: ${unusedClasses.size}`);
  
  if (unusedClasses.size > 0) {
    console.log('Unused classes sample:', Array.from(unusedClasses).slice(0, 10));
  }

  return {
    usedClasses: Array.from(usedClasses),
    unusedClasses: Array.from(unusedClasses),
    usageRatio: usedClasses.size / (usedClasses.size + unusedClasses.size)
  };
};

// Critical CSS extractor for above-the-fold content
export const extractCriticalCSS = () => {
  if (typeof window === 'undefined') return '';

  const criticalElements = [];
  const viewportHeight = window.innerHeight;

  // Find elements in viewport
  document.querySelectorAll('*').forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.top < viewportHeight && rect.bottom > 0) {
      criticalElements.push(element);
    }
  });

  // Extract classes from critical elements
  const criticalClasses = new Set();
  criticalElements.forEach(element => {
    if (element.className && typeof element.className === 'string') {
      element.className.split(' ').forEach(className => {
        if (className.trim()) {
          criticalClasses.add(className.trim());
        }
      });
    }
  });

  return Array.from(criticalClasses);
};

// Performance monitoring for CSS
export const monitorCSSPerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource' && entry.name.includes('.css')) {
        console.log(`📊 CSS Load Performance: ${entry.name}`);
        console.log(`  Duration: ${entry.duration.toFixed(2)}ms`);
        console.log(`  Size: ${entry.transferSize} bytes`);
        console.log(`  Cached: ${entry.transferSize === 0 ? 'Yes' : 'No'}`);
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });

  // Monitor CSS parsing time
  const startTime = performance.now();
  
  // Wait for stylesheets to load
  Promise.all(
    Array.from(document.styleSheets).map(sheet => {
      return new Promise((resolve) => {
        if (sheet.cssRules) {
          resolve();
        } else {
          sheet.addEventListener('load', resolve);
        }
      });
    })
  ).then(() => {
    const endTime = performance.now();
    console.log(`🎨 CSS Parse Time: ${(endTime - startTime).toFixed(2)}ms`);
  });
};

// Optimize images with CSS
export const optimizeImageCSS = () => {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Add loading optimization classes
    if (!img.loading) {
      img.loading = 'lazy';
    }
    
    // Add decode hint for better performance
    if (!img.decoding) {
      img.decoding = 'async';
    }
    
    // Add CSS classes for better rendering
    if (!img.classList.contains('object-cover') && 
        !img.classList.contains('object-contain') &&
        !img.classList.contains('object-fill')) {
      img.classList.add('object-cover');
    }
  });
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  // Estimate CSS bundle size
  let totalCSSSize = 0;
  const stylesheets = Array.from(document.styleSheets);
  
  stylesheets.forEach(stylesheet => {
    try {
      if (stylesheet.cssRules) {
        const cssText = Array.from(stylesheet.cssRules)
          .map(rule => rule.cssText)
          .join('');
        totalCSSSize += new Blob([cssText]).size;
      }
    } catch (e) {
      // Handle cross-origin stylesheets
    }
  });

  console.log(`📦 Estimated CSS Bundle Size: ${(totalCSSSize / 1024).toFixed(2)} KB`);
  
  // Analyze by category
  const categories = {
    layout: 0,
    colors: 0,
    typography: 0,
    spacing: 0,
    effects: 0
  };

  // This is a simplified analysis - in a real app you'd want more sophisticated parsing
  stylesheets.forEach(stylesheet => {
    try {
      if (stylesheet.cssRules) {
        Array.from(stylesheet.cssRules).forEach(rule => {
          if (rule.cssText) {
            const text = rule.cssText;
            if (text.includes('display:') || text.includes('position:') || text.includes('flex')) {
              categories.layout += text.length;
            } else if (text.includes('color:') || text.includes('background')) {
              categories.colors += text.length;
            } else if (text.includes('font') || text.includes('text')) {
              categories.typography += text.length;
            } else if (text.includes('margin') || text.includes('padding')) {
              categories.spacing += text.length;
            } else {
              categories.effects += text.length;
            }
          }
        });
      }
    } catch (e) {
      // Handle errors
    }
  });

  console.log('📊 CSS Usage by Category:');
  Object.entries(categories).forEach(([category, size]) => {
    console.log(`  ${category}: ${(size / 1024).toFixed(2)} KB`);
  });

  return {
    totalSize: totalCSSSize,
    categories
  };
};

// Hook for CSS optimization in React components
export const useCSSOptimization = () => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Run analysis after component mount
      setTimeout(() => {
        analyzeCSSUsage();
        analyzeBundleSize();
        monitorCSSPerformance();
      }, 1000);
    }
    
    // Optimize images on mount
    optimizeImageCSS();
  }, []);

  return {
    analyzeCSSUsage,
    extractCriticalCSS,
    monitorCSSPerformance,
    optimizeImageCSS,
    analyzeBundleSize
  };
};