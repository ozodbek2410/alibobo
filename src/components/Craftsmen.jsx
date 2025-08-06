import React, { useState, useEffect } from 'react';

const Craftsmen = ({ craftsmenData = [] }) => {
  // Filter only active craftsmen for the main page
  const activeCraftsmen = craftsmenData.filter(craftsman => craftsman.status === 'active');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCraftsman, setSelectedCraftsman] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callPhone, setCallPhone] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [modalSlideIndex, setModalSlideIndex] = useState(0);

  // Helper function to format price safely
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0 so'm/kun";
    return price.toLocaleString() + " so'm/kun";
  };

  // Get portfolio images for craftsman - only from database
  const getCraftsmanImages = (craftsman) => {
    // Return only portfolio images from database
    if (craftsman.portfolio && craftsman.portfolio.length > 0) {
      return craftsman.portfolio;
    }
    
    // Return empty array if no portfolio images - will show placeholder
    return [];
  };

  // Show craftsman details modal
  const showCraftsmanDetails = (craftsman) => {
    setSelectedCraftsman(craftsman);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCraftsman(null);
    document.body.style.overflow = 'auto';
  };

  // Open lightbox
  const openLightbox = (images, startIndex = 0) => {
    setLightboxImages(images);
    setCurrentLightboxIndex(startIndex);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImages([]);
    setCurrentLightboxIndex(0);
    document.body.style.overflow = 'auto';
  };

  // Navigate lightbox
  const navigateLightbox = (direction) => {
    if (direction === 'prev' && currentLightboxIndex > 0) {
      setCurrentLightboxIndex(currentLightboxIndex - 1);
    } else if (direction === 'next' && currentLightboxIndex < lightboxImages.length - 1) {
      setCurrentLightboxIndex(currentLightboxIndex + 1);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Create a simple toast notification instead of alert
      const toast = document.createElement('div');
      toast.textContent = 'Telefon raqami nusxalandi!';
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(toast);
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      const toast = document.createElement('div');
      toast.textContent = 'Telefon raqami nusxalandi!';
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(toast);
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 2000);
    }
  };

  // Modal image sliding functionality
  const slideModalImages = (direction) => {
    if (!selectedCraftsman) return;
    
    const images = getCraftsmanImages(selectedCraftsman);
    const maxSlide = Math.max(0, images.length - 3);
    
    if (direction === 'prev' && modalSlideIndex > 0) {
      setModalSlideIndex(modalSlideIndex - 1);
    } else if (direction === 'next' && modalSlideIndex < maxSlide) {
      setModalSlideIndex(modalSlideIndex + 1);
    }
  };

  // Handle phone call - mobile vs desktop
  const handlePhoneCall = (phone) => {
    // Better mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768 || 
                     'ontouchstart' in window;
    
    if (isMobile) {
      // Mobile - direct call
      window.location.href = `tel:${phone}`;
    } else {
      // Desktop - show call modal
      setCallPhone(phone);
      setShowCallModal(true);
    }
  };

  // Image carousel component - exactly like ustalar-qismi with hover effect
  const ImageCarousel = ({ images, craftsmanIndex }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lastHoverTime, setLastHoverTime] = useState(0);
    const hoverDelay = 800; // 800ms delay between changes (slower)

    const handleMouseMove = (e) => {
      const currentTime = Date.now();
      if (currentTime - lastHoverTime < hoverDelay) {
        return; // Too soon, ignore this hover
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      
      let newIndex;
      if (x < width / 2) {
        // Left side - previous image (don't loop to last image)
        newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : currentImageIndex;
      } else {
        // Right side - next image (don't loop to first image)
        newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : currentImageIndex;
      }
      
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
        setLastHoverTime(currentTime);
      }
    };

    const handleMouseLeave = () => {
      // Keep the current image active when mouse leaves
      // Do not reset to first image
      setLastHoverTime(0);
    };

    return (
      <div 
        className="image-carousel h-48 bg-gray-100 rounded-t-xl cursor-pointer relative overflow-hidden"
        onClick={() => openLightbox(images, currentImageIndex)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="Ish namunasi"
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ opacity: index === currentImageIndex ? 1 : 0 }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Header - exactly like ustalar-qismi */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-800 text-center">Professional Ustalar</h1>
          <p className="text-gray-600 text-center mt-2">Eng malakali hunarmandlar bilan tanishing</p>
        </div>
      </header>

      {/* Main Content - exactly like ustalar-qismi */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {activeCraftsmen.map((craftsman, index) => {
            const images = getCraftsmanImages(craftsman);
            
            return (
              <div key={craftsman._id} className="bg-white rounded-xl shadow-lg hover-scale overflow-hidden">
                <ImageCarousel images={images} craftsmanIndex={index} />
                
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1">{craftsman.name || 'Noma\'lum'}</h3>
                    <p className="text-gray-600 text-sm">{craftsman.specialty || 'Mutaxassislik belgilanmagan'}</p>
                    <p className="text-sm text-green-600 font-medium">{formatPrice(craftsman.price)}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-700 mb-2">{craftsman.description || 'Tavsif mavjud emas'}</p>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                      {craftsman.phone || '+998 00 000 00 00'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Faol
                    </span>
                    <button 
                      onClick={() => showCraftsmanDetails(craftsman)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium"
                    >
                      Bog'lanish
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeCraftsmen.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Ustalar topilmadi</h3>
            <p className="text-gray-500">Hozirda faol ustalar mavjud emas</p>
          </div>
        )}
      </main>

      {/* Master Details Modal - exactly like ustalar-qismi */}
      {isModalOpen && selectedCraftsman && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Simple Header */}
            <div className="relative bg-white p-4 rounded-t-lg border-b">
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-800 pr-10">Usta haqida ma'lumot</h2>
            </div>
            
            {/* Work samples - moved to top */}
            <div className="px-4 pt-6 pb-4">
              <div className="mb-6">
                <div className="relative">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="col-span-3 grid grid-cols-3 gap-3 transition-all duration-300">
                      {(() => {
                        const images = getCraftsmanImages(selectedCraftsman);
                        return images.slice(modalSlideIndex, modalSlideIndex + 3).map((img, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer" onClick={() => openLightbox(images, modalSlideIndex + index)}>
                            <img
                              src={img}
                              alt={`Ish namunasi ${modalSlideIndex + index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full items-center justify-center bg-gray-200">
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  
                  {(() => {
                    const images = getCraftsmanImages(selectedCraftsman);
                    if (images.length > 3) {
                      const maxSlide = Math.max(0, images.length - 3);
                      
                      return (
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => slideModalImages('prev')}
                            disabled={modalSlideIndex === 0}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          <div className="flex items-center justify-center space-x-1">
                            {Array.from({ length: maxSlide + 1 }, (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  i === modalSlideIndex ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          
                          <button
                            onClick={() => slideModalImages('next')}
                            disabled={modalSlideIndex >= maxSlide}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              
              {/* Master Info - moved below images */}
              <div className="border-t pt-4">
                <div className="mb-4 space-y-3">
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">Ism:</span>
                    <h3 className="text-sm font-semibold text-gray-800">{selectedCraftsman.name}</h3>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">Mutaxassislik:</span>
                    <p className="text-sm text-gray-600">{selectedCraftsman.specialty}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact details */}
            <div className="px-4 pb-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex py-1">
                  <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">Telefon:</span>
                  <p className="text-sm text-blue-600 font-medium">{selectedCraftsman.phone}</p>
                </div>
                
                <div className="flex py-1">
                  <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">Narx:</span>
                  <p className="text-sm font-semibold text-green-600">{formatPrice(selectedCraftsman.price)}</p>
                </div>
                
                <div className="flex py-1">
                  <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">Status:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    selectedCraftsman.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCraftsman.status === 'active' ? 'Faol' : 'Nofaol'}
                  </span>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700 block mb-2">Tavsif:</span>
                  <p className="text-sm text-gray-600">{selectedCraftsman.description}</p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="pt-4 border-t mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePhoneCall(selectedCraftsman.phone)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Qo'ng'iroq qilish
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Call Modal - exactly like ustalar-qismi */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Telefon raqami
              </h3>
              
              <div className="mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
                  <p className="text-xl font-mono font-semibold text-gray-800">{callPhone}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <button
                  onClick={() => copyToClipboard(callPhone)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {showCopySuccess ? (
                    <>
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Nusxalandi
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Nusxalash
                    </>
                  )}
                </button>
              </div>
              
              <div className="text-sm text-gray-600 mb-6 space-y-2">
                <p><strong>1-qadam:</strong> Yuqoridagi "Nusxalash" tugmasini bosing</p>
                <p><strong>2-qadam:</strong> Telefoningizni oling</p>
                <p><strong>3-qadam:</strong> Raqamni terib, qo'ng'iroq qiling</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCallModal(false);
                    setShowCopySuccess(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Lightbox - exactly like ustalar-qismi */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button 
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Previous button */}
            {lightboxImages.length > 1 && currentLightboxIndex > 0 && (
              <button 
                onClick={() => navigateLightbox('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/30 rounded-full p-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Next button */}
            {lightboxImages.length > 1 && currentLightboxIndex < lightboxImages.length - 1 && (
              <button 
                onClick={() => navigateLightbox('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/30 rounded-full p-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {/* Image container */}
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <img 
                src={lightboxImages[currentLightboxIndex]} 
                alt="Ish namunasi" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                <span>{currentLightboxIndex + 1} / {lightboxImages.length}</span>
              </div>
              
              {/* Image title */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">Ish namunasi</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .hover-scale {
          transition: transform 0.3s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        .image-carousel img {
          transition: opacity 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default Craftsmen;