import React from 'react';

const TelegramShimmer = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
};

export default TelegramShimmer;