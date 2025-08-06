import React from 'react';

const LoadingCard = ({ count = 1, type = 'product' }) => {
  const cards = Array.from({ length: count }, (_, index) => index);

  if (type === 'craftsman') {
    return (
      <>
        {cards.map((index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            {/* Craftsman card skeleton */}
            <div className="p-6">
              {/* Avatar and name skeleton */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              
              {/* Specialty skeleton */}
              <div className="mb-3">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
              
              {/* Phone skeleton */}
              <div className="mb-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              
              {/* Price skeleton */}
              <div className="mb-4">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              </div>
              
              {/* Status skeleton */}
              <div className="mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/5"></div>
              </div>
              
              {/* Actions skeleton */}
              <div className="flex space-x-2">
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // Default product card skeleton
  return (
    <>
      {cards.map((index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="w-full h-52 bg-gray-200 relative overflow-hidden rounded-t-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="p-4">
            {/* Title skeleton */}
            <div className="flex items-start justify-between mb-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            
            {/* Price and sold skeleton */}
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            
            {/* Buttons skeleton */}
            <div className="flex justify-between space-x-2">
              <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingCard; 