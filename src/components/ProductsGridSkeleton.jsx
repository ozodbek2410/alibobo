import React from 'react';

const ProductsGridSkeleton = () => {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
      {/* Filter skeleton */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Products grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(20)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg lg:rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
            {/* Image skeleton */}
            <div className="h-40 sm:h-48 lg:h-56 bg-gray-200"></div>
            
            {/* Content skeleton */}
            <div className="p-3 lg:p-4 flex flex-col flex-grow bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
              {/* Title skeleton */}
              <div className="mb-2">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              
              {/* Description skeleton */}
              <div className="mb-4 p-2 bg-blue-50 rounded-md">
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              
              {/* Price and button skeleton */}
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
                
                {/* Button skeleton */}
                <div className="h-8 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsGridSkeleton;