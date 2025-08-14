import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ 
  isVisible = false, 
  message = 'Yuklanmoqda...', 
  children,
  backdrop = true,
  className = ''
}) => {
  if (!isVisible) return children || null;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div 
        className={`absolute inset-0 z-50 flex items-center justify-center ${
          backdrop ? 'bg-white/80 backdrop-blur-sm' : 'bg-transparent'
        } transition-all duration-300`}
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        <div className="text-center">
          <LoadingSpinner 
            size="large" 
            color="primary" 
            text={message}
            aria-label={message}
          />
        </div>
      </div>
    </div>
  );
};

// Full screen loading overlay
export const FullScreenLoadingOverlay = ({ 
  isVisible = false, 
  message = 'Sahifa yuklanmoqda...',
  backdrop = true 
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        backdrop ? 'bg-white/90 backdrop-blur-sm' : 'bg-transparent'
      } transition-all duration-300`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="text-center">
        <LoadingSpinner 
          size="xlarge" 
          color="primary" 
          text={message}
          aria-label={message}
        />
      </div>
    </div>
  );
};

export default LoadingOverlay;