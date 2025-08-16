import React, { useState, useRef, useCallback } from 'react';

// Image optimization utilities
const ImageOptimizer = {
  // Convert image to WebP format
  async convertToWebP(file, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('WebP conversion failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Convert image to AVIF format (if supported)
  async convertToAVIF(file, quality = 0.8) {
    // Check if AVIF is supported
    if (!this.isAVIFSupported()) {
      throw new Error('AVIF not supported');
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('AVIF conversion failed'));
            }
          },
          'image/avif',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Resize image while maintaining aspect ratio
  async resizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Use better image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image resize failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Generate multiple sizes for responsive images
  async generateResponsiveSizes(file, sizes = [320, 640, 768, 1024, 1280]) {
    const responsiveImages = {};
    
    for (const size of sizes) {
      try {
        const resizedBlob = await this.resizeImage(file, size, size, 0.8);
        responsiveImages[`${size}w`] = resizedBlob;
      } catch (error) {
        console.warn(`Failed to generate ${size}w size:`, error);
      }
    }
    
    return responsiveImages;
  },

  // Check browser support for formats
  isWebPSupported() {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  },

  isAVIFSupported() {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  },

  // Get optimal format based on browser support
  getOptimalFormat() {
    if (this.isAVIFSupported()) return 'avif';
    if (this.isWebPSupported()) return 'webp';
    return 'jpeg';
  },

  // Convert blob to base64
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
};

const OptimizedImageUploader = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5,
  title = "Rasmlar",
  allowReorder = true,
  allowDelete = true,
  className = "",
  onError = null,
  enableOptimization = true,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8,
  generateResponsive = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [optimizationStats, setOptimizationStats] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection with optimization
  const handleFileSelect = useCallback(async (files) => {
    setError(null);
    setOptimizationStats(null);
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;

    const invalidFiles = [];
    const validFiles = [];

    // Validate files
    fileArray.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} - noto'g'ri fayl turi`);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for processing
        invalidFiles.push(`${file.name} - fayl hajmi katta (10MB dan oshmasligi kerak)`);
        return;
      }
      
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      const errorMsg = `Quyidagi fayllar yuklana olmadi:\n${invalidFiles.join('\n')}`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const processedImages = [];
      const stats = {
        originalSize: 0,
        optimizedSize: 0,
        compressionRatio: 0,
        format: ImageOptimizer.getOptimalFormat()
      };

      for (const file of validFiles) {
        stats.originalSize += file.size;

        let processedBlob = file;
        
        if (enableOptimization) {
          try {
            // Try AVIF first, then WebP, then resize
            if (ImageOptimizer.isAVIFSupported()) {
              processedBlob = await ImageOptimizer.convertToAVIF(file, quality);
            } else if (ImageOptimizer.isWebPSupported()) {
              processedBlob = await ImageOptimizer.convertToWebP(file, quality);
            } else {
              // Fallback to resize with JPEG
              processedBlob = await ImageOptimizer.resizeImage(file, maxWidth, maxHeight, quality);
            }
          } catch (optimizationError) {
            console.warn('Optimization failed, using original:', optimizationError);
            // Fallback to original file
            processedBlob = file;
          }
        }

        stats.optimizedSize += processedBlob.size;

        // Convert to base64 for storage
        const base64 = await ImageOptimizer.blobToBase64(processedBlob);
        
        const imageData = {
          src: base64,
          originalName: file.name,
          originalSize: file.size,
          optimizedSize: processedBlob.size,
          format: processedBlob.type,
          timestamp: Date.now()
        };

        // Generate responsive sizes if enabled
        if (generateResponsive && enableOptimization) {
          try {
            const responsiveSizes = await ImageOptimizer.generateResponsiveSizes(file);
            const responsiveBase64 = {};
            
            for (const [size, blob] of Object.entries(responsiveSizes)) {
              responsiveBase64[size] = await ImageOptimizer.blobToBase64(blob);
            }
            
            imageData.responsive = responsiveBase64;
          } catch (responsiveError) {
            console.warn('Responsive generation failed:', responsiveError);
          }
        }

        processedImages.push(imageData);
      }

      // Calculate compression stats
      stats.compressionRatio = stats.originalSize > 0 
        ? ((stats.originalSize - stats.optimizedSize) / stats.originalSize * 100).toFixed(1)
        : 0;

      setOptimizationStats(stats);

      // Update images
      const updatedImages = [...images, ...processedImages];
      onImagesChange(updatedImages);

    } catch (error) {
      console.error('Image processing error:', error);
      setError('Rasmlarni qayta ishlashda xatolik yuz berdi');
      if (onError) onError('Rasmlarni qayta ishlashda xatolik yuz berdi');
    } finally {
      setUploading(false);
    }
  }, [images, onImagesChange, onError, enableOptimization, maxWidth, maxHeight, quality, generateResponsive]);

  // Handle file input change
  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    handleFileSelect(files);
    e.target.value = '';
  }, [handleFileSelect]);

  // Remove image
  const removeImage = useCallback((index) => {
    if (!allowDelete) return;
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  }, [images, onImagesChange, allowDelete]);

  // Move image up
  const moveImageUp = useCallback((index) => {
    if (!allowReorder || index === 0) return;
    const updatedImages = [...images];
    [updatedImages[index - 1], updatedImages[index]] = [updatedImages[index], updatedImages[index - 1]];
    onImagesChange(updatedImages);
  }, [images, onImagesChange, allowReorder]);

  // Move image down
  const moveImageDown = useCallback((index) => {
    if (!allowReorder || index === images.length - 1) return;
    const updatedImages = [...images];
    [updatedImages[index], updatedImages[index + 1]] = [updatedImages[index + 1], updatedImages[index]];
    onImagesChange(updatedImages);
  }, [images, onImagesChange, allowReorder]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title and Stats */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {title}
          {enableOptimization && (
            <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Optimized
            </span>
          )}
        </label>
        <span className="text-sm text-gray-500">
          {images.length} / {maxImages}
        </span>
      </div>

      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openFileDialog}
          disabled={uploading || images.length >= maxImages}
          className="bg-primary-orange text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Optimizing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Rasm qo'shish
            </>
          )}
        </button>
        
        <div className="text-sm text-gray-500">
          <span>PNG, JPG, WebP, AVIF</span>
          {enableOptimization && (
            <span className="ml-2 text-green-600">• Auto-optimized</span>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Optimization Stats */}
      {optimizationStats && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center text-sm text-green-800">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Optimized to {optimizationStats.format.toUpperCase()} • 
              Saved {optimizationStats.compressionRatio}% • 
              {formatFileSize(optimizationStats.originalSize - optimizationStats.optimizedSize)} smaller
            </span>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {images.map((imageData, index) => {
            const imageSrc = typeof imageData === 'string' ? imageData : imageData.src;
            const isOptimized = typeof imageData === 'object' && imageData.optimizedSize;
            
            return (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-md overflow-hidden border border-gray-200 hover:border-primary-orange transition-colors">
                  <img
                    src={imageSrc}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Optimization Badge */}
                {isOptimized && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Image Controls Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                    {/* Move Up */}
                    {allowReorder && (
                      <button
                        type="button"
                        onClick={() => moveImageUp(index)}
                        disabled={index === 0}
                        className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Yuqoriga"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Move Down */}
                    {allowReorder && (
                      <button
                        type="button"
                        onClick={() => moveImageDown(index)}
                        disabled={index === images.length - 1}
                        className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Pastga"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Delete */}
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        title="O'chirish"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Image Number Badge */}
                <div className="absolute -top-1 -left-1 bg-primary-orange text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>

                {/* File Size Info */}
                {isOptimized && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      {formatFileSize(imageData.optimizedSize)}
                      {imageData.originalSize && (
                        <span className="text-green-300 ml-1">
                          (-{Math.round((1 - imageData.optimizedSize / imageData.originalSize) * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Text */}
      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-500 mb-2">Rasmlarni bu yerga tashlang yoki</p>
          <button
            type="button"
            onClick={openFileDialog}
            className="text-primary-orange hover:text-primary-orange/80 text-sm font-medium"
          >
            fayllarni tanlang
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs text-red-600 hover:text-red-800 mt-1"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Format Support Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Browser Support:</span>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded ${ImageOptimizer.isWebPSupported() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
              WebP
            </span>
            <span className={`px-2 py-1 rounded ${ImageOptimizer.isAVIFSupported() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
              AVIF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedImageUploader;