import React, { useState, useEffect } from 'react';

const FadeInTransition = ({ 
  children, 
  isLoading, 
  skeleton, 
  delay = 0,
  duration = 300,
  className = '' 
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading, delay]);

  if (isLoading) {
    return skeleton || null;
  }

  return (
    <div 
      className={`
        transition-all duration-${duration} ease-out
        ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default FadeInTransition;