import React from 'react';

const TelegramSkeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '', 
  rounded = 'rounded',
  animate = true 
}) => {
  return (
    <div 
      className={`
        ${width} ${height} ${rounded} ${className}
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
        ${animate ? 'animate-pulse' : ''}
        relative overflow-hidden
      `}
    >
      {animate && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      )}
    </div>
  );
};

export default TelegramSkeleton;