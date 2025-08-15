import React, { useState, useRef } from 'react';

const ImageUploader = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5,
  title = "Rasmlar",
  allowReorder = true,
  allowDelete = true,
  className = "",
  onError = null
}) => {

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (files) => {
    setError(null);
    const fileArray = Array.from(files);
    
    // Validate file count
    if (fileArray.length === 0) {
      return;
    }

    const filesToProcess = fileArray;
    const invalidFiles = [];
    const validFiles = [];

    // Validate files
    filesToProcess.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} - noto'g'ri fayl turi`);
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} - fayl hajmi katta (5MB dan oshmasligi kerak)`);
        return;
      }
      
      validFiles.push(file);
    });

    // Show validation errors
    if (invalidFiles.length > 0) {
      const errorMsg = `Quyidagi fayllar yuklana olmadi:\n${invalidFiles.join('\n')}`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }

    if (validFiles.length === 0) {
      return;
    }

    setUploading(true);

    const processFiles = async () => {
      const newImages = [];
      const processingErrors = [];
      
      for (const file of validFiles) {
        try {
          const base64 = await convertToBase64(file);
          newImages.push(base64);
        } catch (error) {
          console.error('Rasm yuklashda xatolik:', error);
          processingErrors.push(`${file.name} - yuklashda xatolik`);
        }
      }

      if (processingErrors.length > 0) {
        const errorMsg = `Quyidagi fayllar yuklana olmadi:\n${processingErrors.join('\n')}`;
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        onImagesChange(updatedImages);
      }
      
      setUploading(false);
    };

    processFiles();
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };



  // Handle file input change
  const handleInputChange = (e) => {
    const files = e.target.files;
    handleFileSelect(files);
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  // Remove image
  const removeImage = (index) => {
    if (!allowDelete) return;
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  // Move image up
  const moveImageUp = (index) => {
    if (!allowReorder || index === 0) return;
    const updatedImages = [...images];
    [updatedImages[index - 1], updatedImages[index]] = [updatedImages[index], updatedImages[index - 1]];
    onImagesChange(updatedImages);
  };

  // Move image down
  const moveImageDown = (index) => {
    if (!allowReorder || index === images.length - 1) return;
    const updatedImages = [...images];
    [updatedImages[index], updatedImages[index + 1]] = [updatedImages[index + 1], updatedImages[index]];
    onImagesChange(updatedImages);
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };



  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {title}
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
          disabled={uploading}
          className="bg-primary-orange text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {uploading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Yuklanmoqda...
            </>
          ) : (
            <>
              <i className="fas fa-plus"></i>
              Rasm qo'shish
            </>
          )}
        </button>
        <span className="text-sm text-gray-500">PNG, JPG, GIF, WebP</span>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-md overflow-hidden border border-gray-200 hover:border-primary-orange transition-colors">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
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
                      <i className="fas fa-chevron-up"></i>
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
                      <i className="fas fa-chevron-down"></i>
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
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Image Number Badge */}
              <div className="absolute -top-1 -left-1 bg-primary-orange text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {images.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Hali rasmlar yuklanmagan</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <i className="fas fa-exclamation-triangle text-red-600 mr-2 mt-0.5"></i>
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


    </div>
  );
};

export default ImageUploader;