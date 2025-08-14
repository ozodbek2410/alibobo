import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  className = '', 
  'aria-label': ariaLabel = 'Yuklanmoqda...',
  text,
  inline = false
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-gray-200 border-t-orange-500',
    secondary: 'border-gray-200 border-t-blue-500',
    white: 'border-gray-400 border-t-white'
  };

  const containerClasses = inline 
    ? 'inline-flex items-center justify-center'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-4`}
        role="status"
        aria-label={ariaLabel}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
      {text && !inline && (
        <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">{text}</p>
      )}
      {text && inline && (
        <span className="ml-2 text-gray-600 font-medium text-sm">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner; 