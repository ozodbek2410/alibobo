import React, { useState, useRef, useEffect, useCallback } from 'react';

// Optimized image component with lazy loading, error handling, and performance features
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/assets/default-product.png',
  aspectRatio,
  objectFit = 'cover',
  quality = 80,
  ...props
}) => {
  const [imageState, setImageState] = useState({
    loaded: false,
    error: false,
    src: priority ? src : null // Load immediately if priority
  });
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, isInView]);

  // Load image when in view
  useEffect(() => {
    if (isInView && !imageState.src) {
      setImageState(prev => ({ ...prev, src }));
    }
  }, [isInView, src, imageState.src]);

  // Handle image load
  const handleLoad = useCallback((e) => {
    setImageState(prev => ({ ...prev, loaded: true, error: false }));
    if (onLoad) onLoad(e);
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback((e) => {
    setImageState(prev => ({ 
      ...prev, 
      error: true, 
      loaded: false,
      src: fallbackSrc 
    }));
    if (onError) onError(e);
  }, [onError, fallbackSrc]);

  // Generate responsive image URLs (if using a CDN or image service)
  const generateResponsiveUrls = useCallback((baseSrc) => {
    if (!baseSrc || baseSrc.startsWith('data:')) return baseSrc;
    
    // This would integrate with your image CDN/service
    // For now, return the original src
    return baseSrc;
  }, []);

  // Generate srcSet for responsive images
  const generateSrcSet = useCallback((baseSrc) => {
    if (!baseSrc || baseSrc.startsWith('data:')) return undefined;
    
    // Example srcSet generation (customize based on your CDN)
    const breakpoints = [320, 640, 768, 1024, 1280, 1536];
    return breakpoints
      .map(bp => `${baseSrc}?w=${bp}&q=${quality} ${bp}w`)
      .join(', ');
  }, [quality]);

  // Create blur placeholder
  const createBlurPlaceholder = useCallback(() => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    // Create a simple gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, 40, 40);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 40, 40);
    
    return canvas.toDataURL();
  }, [blurDataURL]);

  // Container styles
  const containerStyles = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio && {
      aspectRatio: aspectRatio,
      width: '100%'
    }),
    ...(width && height && {
      width: width,
      height: height
    })
  };

  // Image styles
  const imageStyles = {
    width: '100%',
    height: '100%',
    objectFit: objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: imageState.loaded ? 1 : 0
  };

  // Placeholder styles
  const placeholderStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: imageState.loaded ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out'
  };

  return (
    <div 
      ref={imgRef}
      className={`relative ${className}`}
      style={containerStyles}
      {...props}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !imageState.loaded && (
        <div style={placeholderStyles}>
          <img
            src={createBlurPlaceholder()}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(10px)',
              transform: 'scale(1.1)' // Prevent blur edges
            }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Loading skeleton */}
      {placeholder === 'skeleton' && !imageState.loaded && (
        <div style={placeholderStyles}>
          <div className="animate-pulse bg-gray-200 w-full h-full flex items-center justify-center">
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
          </div>
        </div>
      )}

      {/* Main image */}
      {imageState.src && (
        <img
          src={generateResponsiveUrls(imageState.src)}
          srcSet={generateSrcSet(imageState.src)}
          sizes={sizes}
          alt={alt}
          style={imageStyles}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          width={width}
          height={height}
        />
      )}

      {/* Error state */}
      {imageState.error && imageState.src === fallbackSrc && (
        <div style={placeholderStyles}>
          <div className="text-center text-gray-500">
            <svg 
              className="w-8 h-8 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="text-xs">Image not available</span>
          </div>
        </div>
      )}

      {/* Loading indicator for priority images */}
      {priority && !imageState.loaded && !imageState.error && (
        <div style={placeholderStyles}>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

// Higher-order component for image optimization
export const withImageOptimization = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    const optimizedProps = {
      ...props,
      loading: props.loading || 'lazy',
      decoding: props.decoding || 'async',
    };

    return <WrappedComponent ref={ref} {...optimizedProps} />;
  });
};

// Hook for image preloading
export const useImagePreloader = () => {
  const preloadedImages = useRef(new Set());

  const preloadImage = useCallback((src) => {
    if (preloadedImages.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedImages.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback((srcArray) => {
    return Promise.allSettled(srcArray.map(preloadImage));
  }, [preloadImage]);

  const isPreloaded = useCallback((src) => {
    return preloadedImages.current.has(src);
  }, []);

  return { preloadImage, preloadImages, isPreloaded };
};

// Image gallery component with optimized loading
export const OptimizedImageGallery = ({ 
  images, 
  currentIndex = 0, 
  onIndexChange,
  className = '',
  thumbnailSize = 60,
  showThumbnails = true 
}) => {
  const { preloadImage } = useImagePreloader();
  const [loadedImages, setLoadedImages] = useState(new Set([currentIndex]));

  // Preload adjacent images
  useEffect(() => {
    const preloadAdjacent = async () => {
      const toPreload = [];
      
      // Preload previous and next images
      if (currentIndex > 0) toPreload.push(images[currentIndex - 1]);
      if (currentIndex < images.length - 1) toPreload.push(images[currentIndex + 1]);
      
      // Preload current image if not loaded
      if (!loadedImages.has(currentIndex)) {
        toPreload.push(images[currentIndex]);
      }

      for (const img of toPreload) {
        try {
          await preloadImage(img);
          setLoadedImages(prev => new Set([...prev, images.indexOf(img)]));
        } catch (error) {
          console.warn('Failed to preload image:', img);
        }
      }
    };

    preloadAdjacent();
  }, [currentIndex, images, preloadImage, loadedImages]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main image */}
      <OptimizedImage
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="w-full aspect-square"
        priority={true}
        placeholder="blur"
        objectFit="contain"
      />

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onIndexChange?.(index)}
              className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex 
                  ? 'border-orange-500 ring-2 ring-orange-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ width: thumbnailSize, height: thumbnailSize }}
            >
              <OptimizedImage
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full"
                priority={Math.abs(index - currentIndex) <= 1}
                placeholder="skeleton"
                objectFit="cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;