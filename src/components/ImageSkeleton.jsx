import React from 'react';

// Image skeleton component for loading states
const ImageSkeleton = ({ 
  className = '',
  width,
  height,
  aspectRatio,
  variant = 'default',
  showIcon = true,
  animate = true
}) => {
  // Container styles
  const containerStyles = {
    ...(aspectRatio && {
      aspectRatio: aspectRatio,
      width: '100%'
    }),
    ...(width && height && {
      width: width,
      height: height
    })
  };

  // Base skeleton classes
  const baseClasses = `
    bg-gray-200 
    flex 
    items-center 
    justify-center 
    ${animate ? 'animate-pulse' : ''}
    ${className}
  `;

  // Variant-specific classes
  const variantClasses = {
    default: 'rounded-lg',
    card: 'rounded-lg shadow-sm',
    avatar: 'rounded-full',
    thumbnail: 'rounded-md',
    hero: 'rounded-xl'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default}`}
      style={containerStyles}
      role="img"
      aria-label="Loading image"
    >
      {showIcon && (
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
    </div>
  );
};

// Shimmer effect skeleton
export const ShimmerSkeleton = ({ 
  className = '',
  width,
  height,
  aspectRatio 
}) => {
  const containerStyles = {
    ...(aspectRatio && {
      aspectRatio: aspectRatio,
      width: '100%'
    }),
    ...(width && height && {
      width: width,
      height: height
    })
  };

  return (
    <div 
      className={`relative overflow-hidden bg-gray-200 rounded-lg ${className}`}
      style={containerStyles}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  );
};

// Product card image skeleton
export const ProductImageSkeleton = ({ className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <ShimmerSkeleton aspectRatio="1" className="w-full" />
      <div className="space-y-2">
        <ShimmerSkeleton className="h-4 w-3/4" />
        <ShimmerSkeleton className="h-4 w-1/2" />
        <ShimmerSkeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
};

// Gallery skeleton
export const GallerySkeleton = ({ 
  imageCount = 4, 
  showThumbnails = true,
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main image skeleton */}
      <ShimmerSkeleton aspectRatio="1" className="w-full" />
      
      {/* Thumbnail skeletons */}
      {showThumbnails && (
        <div className="flex space-x-2">
          {Array.from({ length: imageCount }).map((_, index) => (
            <ShimmerSkeleton 
              key={index}
              className="w-16 h-16 flex-shrink-0" 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Avatar skeleton
export const AvatarSkeleton = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <ImageSkeleton
      className={`${sizeClasses[size]} ${className}`}
      variant="avatar"
      showIcon={false}
    />
  );
};

// Grid of image skeletons
export const ImageGridSkeleton = ({ 
  count = 8, 
  columns = 4,
  aspectRatio = '1',
  className = '' 
}) => {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <div className={`grid gap-4 ${gridClasses[columns] || 'grid-cols-4'} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductImageSkeleton key={index} />
      ))}
    </div>
  );
};

export default ImageSkeleton;