import React from 'react';

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    {/* Image Skeleton */}
    <div className="h-48 bg-gray-300"></div>
    
    {/* Content Skeleton */}
    <div className="p-4">
      {/* Title */}
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
      
      {/* Price */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 bg-gray-300 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      
      {/* Button */}
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
  </div>
);

// Products Grid Skeleton
export const ProductsGridSkeleton = ({ count = 8 }) => (
  <div className="container mx-auto px-4 py-8">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
      <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
    </div>
    
    {/* Filters Skeleton */}
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
        <div className="h-8 bg-gray-300 rounded w-32 animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded w-40 animate-pulse"></div>
      </div>
    </div>
    
    {/* Products Grid Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

// Craftsman Card Skeleton
export const CraftsmanCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    {/* Image Skeleton */}
    <div className="h-64 bg-gray-300"></div>
    
    {/* Content Skeleton */}
    <div className="p-4">
      {/* Name */}
      <div className="h-5 bg-gray-300 rounded mb-2"></div>
      
      {/* Specialty */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      
      {/* Rating */}
      <div className="flex items-center mb-3">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
        <div className="h-4 bg-gray-200 rounded w-12 ml-2"></div>
      </div>
      
      {/* Price */}
      <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
      
      {/* Button */}
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
  </div>
);

// Craftsmen Grid Skeleton
export const CraftsmenGridSkeleton = ({ count = 6 }) => (
  <div className="container mx-auto px-4 py-8">
    {/* Header Skeleton */}
    <div className="text-center mb-8">
      <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
    </div>
    
    {/* Filters Skeleton */}
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
      ))}
    </div>
    
    {/* Search Skeleton */}
    <div className="max-w-md mx-auto mb-8">
      <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
    </div>
    
    {/* Craftsmen Grid Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CraftsmanCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

// Generic Loading Spinner
export const LoadingSpinner = ({ size = 'medium', message = 'Yuklanmoqda...' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-center">
        <div className={`${sizeClasses[size]} border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Full Page Loading
export const FullPageLoading = ({ message = 'Sahifa yuklanmoqda...' }) => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
);

export default {
  ProductCardSkeleton,
  ProductsGridSkeleton,
  CraftsmanCardSkeleton,
  CraftsmenGridSkeleton,
  LoadingSpinner,
  FullPageLoading
};
