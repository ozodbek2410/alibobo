import React, { useState, useEffect, useRef } from 'react';
import CartSidebar from './CartSidebar';
import ProductDetail from './ProductDetail';

const ProductsGrid = ({ 
  cart, 
  onAddToCart, 
  isCartOpen, 
  onToggleCart, 
  onRemoveFromCart, 
  onUpdateQuantity, 
  onCheckout,
  selectedCategory,
  searchQuery 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const [quickFilter, setQuickFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  // Notification states
  const [showAddToCartNotification, setShowAddToCartNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState('');
  const selectRef = useRef(null);
  
  // Product detail modal states
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Image carousel states for product cards
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [lastHoverTimes, setLastHoverTimes] = useState({});

  // Category mapping function - frontend to backend
  const getCategoryApiValue = (frontendCategory) => {
    const categoryMapping = {
      "g'isht-va-bloklar": "gisht",
      "asbob-uskunalar": "asbob", 
      "bo'yoq-va-lak": "boyoq",
      "elektr-mollalari": "elektr",
      "metall-va-armatura": "metall",
      "yog'och-va-mebel": "yog'och",
      "tom-materiallar": "tom",
      "santexnika": "santexnika",
      "issiqlik-va-konditsioner": "issiqlik",
      "dekor-va-bezatish": "dekor",
      "temir-beton": "temir",
      "gips-va-shpaklovka": "gips",
      "boshqalar": "boshqalar"
    };
    
    return categoryMapping[frontendCategory] || frontendCategory;
  };

  // Initial load
  useEffect(() => {
    loadProducts();
    
    // Set up periodic refresh every 30 seconds to sync with admin changes
    const interval = setInterval(() => {
      console.log(' Avtomatik yangilanish: Admin panel o\'zgarishlarini tekshirish...');
      loadProducts(true); // Silent refresh
    }, 30000); // 30 seconds
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Reload products when category or search changes
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  // Refresh when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log(' Sahifa fokusga qaytdi: Ma\'lumotlarni yangilash...');
      loadProducts(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Scroll event listener to close select dropdown
  useEffect(() => {
    const handleScroll = () => {
      if (selectRef.current) {
        selectRef.current.blur();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Use centralized addToCart function
  const addToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
      
      // Show notification
      setNotificationProduct(product.name);
      setShowAddToCartNotification(true);
      setTimeout(() => {
        setShowAddToCartNotification(false);
      }, 3000);
    }
  };

  const removeFromCart = (productId) => {
    if (onRemoveFromCart) {
      onRemoveFromCart(productId);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(productId, newQuantity);
    }
  };

  const clearCart = () => {
    if (onCheckout) {
      onCheckout();
    }
  };

  const toggleCart = () => {
    if (onToggleCart) {
      onToggleCart();
    }
  };

  const getTotalItems = () => {
    if (cart) {
      return cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    return 0;
  };

  // Product detail modal functions
  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };

  const closeProductDetail = () => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  };

  const loadProducts = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', '100');
      params.append('sortBy', 'updatedAt'); // Sort by last updated to get latest changes first
      params.append('sortOrder', 'desc');
      
      if (selectedCategory && selectedCategory !== '') {
        params.append('category', getCategoryApiValue(selectedCategory));
      }
      
      if (searchQuery && searchQuery.trim() !== '') {
        params.append('search', searchQuery.trim());
      }
      
      console.log(' Backend dan mahsulotlarni yuklash...', silent ? '(silent)' : '');
      const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
      const data = await response.json();
      
      // Debug logging
      if (!silent) {
        console.log('API Request URL:', `http://localhost:5000/api/products?${params.toString()}`);
        console.log('API Response:', data);
        console.log('Products count:', data.products?.length);
        console.log('Selected category:', selectedCategory);
      }
      
      if (response.ok) {
        const newProducts = data.products || [];
        
        // Check if products have changed
        const hasChanged = JSON.stringify(products) !== JSON.stringify(newProducts);
        
        if (hasChanged || !silent) {
          setProducts(newProducts);
          setLastUpdated(new Date());
          
          if (hasChanged && silent) {
            console.log(' Mahsulotlar yangilandi! Admin paneldan o\'zgarishlar keldi.');
            // Show a subtle notification that data was updated
            showUpdateNotification();
          }
        }
        
        // Kategoriyalarni olish
        const uniqueCategories = [...new Set(newProducts.map(p => p.category))];
        setCategories(uniqueCategories);
        
        if (!silent) {
          console.log('Unique categories from products:', uniqueCategories);
          
          // Show individual product categories for debugging
          if (newProducts.length > 0) {
            console.log('First few products with categories:');
            newProducts.slice(0, 5).forEach((product, index) => {
              console.log(`Product ${index + 1}: "${product.name}" - Category: "${getCategoryApiValue(product.category)}"`);
            });
          }
        }
      } else {
        console.error('Mahsulotlar yuklanmadi:', data.message);
        if (!silent) {
          // Show error notification
          showErrorNotification('Ma\'lumotlarni yuklashda xatolik yuz berdi');
        }
      }
    } catch (error) {
      console.error('Mahsulotlar yuklashda xatolik:', error);
      if (!silent) {
        showErrorNotification('Server bilan bog\'lanishda xatolik');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Show update notification when data changes
  const showUpdateNotification = () => {
    // Notification disabled - no longer needed
    return;
  };

  // Show error notification
  const showErrorNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 md:top-24 md:right-6 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log(' Qo\'lda yangilash boshlandi...');
    loadProducts();
  };

  const filterByCategory = (category) => {
    setCurrentCategory(category);
  };

  const getFilteredProducts = () => {
    let filtered = products;
    
    // Kategoriya bo'yicha filtrlash
    if (currentCategory !== 'all') {
      filtered = filtered.filter(product => product.category === getCategoryApiValue(currentCategory));
    }
    
    // Tezkor filter bo'yicha filtrlash
    if (quickFilter !== 'all') {
      const matchingProducts = [];
      const otherProducts = [];
      
      filtered.forEach(product => {
        let matches = false;
        switch (quickFilter) {
          case 'mashhur':
            // Admin paneldan belgilangan mashhur mahsulotlar
            matches = product.isPopular || product.badge === 'Mashhur';
            break;
          case 'chegirma':
            // Chegirmadagi mahsulotlar (eski narx mavjud)
            const currentPrice = parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0');
            const oldPrice = parseInt(product.oldPrice?.toString().replace(/[^\d]/g, '') || '0');
            matches = (oldPrice > 0 && currentPrice > 0 && oldPrice > currentPrice) || 
                     product.badge === 'Chegirma' || 
                     product.isDiscount;
            console.log(`Chegirma check for ${product.name}: oldPrice=${oldPrice}, currentPrice=${currentPrice}, badge=${product.badge}, matches=${matches}`);
            break;
          case 'yangi':
            // Admin paneldan belgilangan yangi mahsulotlar
            matches = product.isNew || product.badge === 'Yangi';
            break;
        }
        
        if (matches) {
          matchingProducts.push(product);
        } else {
          otherProducts.push(product);
        }
      });
      
      // Avval mos kelganlar, keyin qolganlar
      filtered = [...matchingProducts, ...otherProducts];
    } else {
      // Saralash
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return parseInt(a.price?.toString().replace(/[^\d]/g, '') || '0') - 
                   parseInt(b.price?.toString().replace(/[^\d]/g, '') || '0');
          case 'price-high':
            return parseInt(b.price?.toString().replace(/[^\d]/g, '') || '0') - 
                   parseInt(a.price?.toString().replace(/[^\d]/g, '') || '0');
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });
    }
    
    // Qidiruv bo'yicha filtrlash
    if (searchTerm.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Narx oralig'i bo'yicha filtrlash
    if (priceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = parseInt(product.price?.toString().replace(/[^\d]/g, '') || '0');
        switch (priceRange) {
          case '100000':
            return price >= 100000;
          case '200000':
            return price >= 200000;
          case '500000':
            return price >= 500000;
          case '1000000':
            return price >= 1000000;
          case '0-100000':
            return price < 100000;
          case '100000-500000':
            return price >= 100000 && price < 500000;
          case '500000-1000000':
            return price >= 500000 && price < 1000000;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  };

  const calculateDiscount = (currentPrice, oldPrice) => {
    const current = parseInt(currentPrice?.toString().replace(/[^\d]/g, '') || '0');
    const old = parseInt(oldPrice?.toString().replace(/[^\d]/g, '') || '0');
    if (!old || !current || isNaN(old) || isNaN(current)) return 0;
    return Math.round(((old - current) / old) * 100);
  };



  const toggleFavorite = (productId, buttonElement) => {
    const icon = buttonElement.querySelector('i');
    const isFavorited = icon.classList.contains('fas');
    
    if (isFavorited) {
      icon.classList.remove('fas', 'text-red-500');
      icon.classList.add('far', 'text-gray-400');
    } else {
      icon.classList.remove('far', 'text-gray-400');
      icon.classList.add('fas', 'text-red-500');
    }
  };

  const createProductCard = (product) => {
    const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0;
    
    // Helper function to format price safely
    const formatPrice = (price) => {
      if (!price || isNaN(price)) return "0 so'm";
      return price.toLocaleString() + " so'm";
    };
    
    // Get product images (support both new images array and old image field)
    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : (product.image ? [product.image] : []);
    
    // Get current image index for this product
    const currentImageIndex = currentImageIndexes[product._id] || 0;
    const currentImage = productImages.length > 0 ? productImages[currentImageIndex] : null;
    
    // Handle scroll-based image navigation (keep existing)
    const handleScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (productImages.length <= 1) return;
      
      const delta = e.deltaY;
      const direction = delta > 0 ? 'next' : 'prev';
      
      setCurrentImageIndexes(prev => {
        const currentIndex = prev[product._id] || 0;
        let newIndex;
        
        if (direction === 'next') {
          newIndex = currentIndex >= productImages.length - 1 ? 0 : currentIndex + 1;
        } else {
          newIndex = currentIndex <= 0 ? productImages.length - 1 : currentIndex - 1;
        }
        
        return { ...prev, [product._id]: newIndex };
      });
    };

    // Handle hover-based image navigation for desktop (like craftsmen cards)
    const handleMouseMove = (e) => {
      if (productImages.length <= 1) return;
      
      const currentTime = Date.now();
      const lastHoverTime = lastHoverTimes[product._id] || 0;
      const hoverDelay = 800; // 800ms delay between changes
      
      if (currentTime - lastHoverTime < hoverDelay) {
        return; // Too soon, ignore this hover
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      
      const currentIndex = currentImageIndexes[product._id] || 0;
      let newIndex;
      
      if (x < width / 2) {
        // Left side - previous image (don't loop to last image)
        newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      } else {
        // Right side - next image (don't loop to first image)
        newIndex = currentIndex < productImages.length - 1 ? currentIndex + 1 : currentIndex;
      }
      
      if (newIndex !== currentIndex) {
        setCurrentImageIndexes(prev => ({ ...prev, [product._id]: newIndex }));
        setLastHoverTimes(prev => ({ ...prev, [product._id]: currentTime }));
      }
    };

    // Handle mouse leave (keep current image, don't reset)
    const handleMouseLeave = () => {
      // Keep the current image active when mouse leaves
      // Do not reset to first image
      setLastHoverTimes(prev => ({ ...prev, [product._id]: 0 }));
    };

    // Handle touch events for mobile swipe navigation
    const handleTouchStart = (e) => {
      if (productImages.length <= 1) return;
      setTouchEnd(null); // Reset touch end
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
      if (productImages.length <= 1) return;
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e) => {
      if (!touchStart || !touchEnd || productImages.length <= 1) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;
      
      if (isLeftSwipe || isRightSwipe) {
        e.preventDefault();
        e.stopPropagation();
        
        setCurrentImageIndexes(prev => {
          const currentIndex = prev[product._id] || 0;
          let newIndex;
          
          if (isLeftSwipe) {
            // Swipe left - next image
            newIndex = currentIndex >= productImages.length - 1 ? 0 : currentIndex + 1;
          } else {
            // Swipe right - previous image
            newIndex = currentIndex <= 0 ? productImages.length - 1 : currentIndex - 1;
          }
          
          return { ...prev, [product._id]: newIndex };
        });
      }
      
      // Reset touch states
      setTouchStart(null);
      setTouchEnd(null);
    };
    
    // Handle dot navigation
    const handleDotClick = (productId, imageIndex, e) => {
      e.stopPropagation(); // Prevent opening product detail
      setCurrentImageIndexes(prev => ({ ...prev, [productId]: imageIndex }));
    };
    
    return (
      <div key={product._id} className="bg-white rounded-lg lg:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:scale-[1.02]">
        <div className="relative cursor-pointer" onClick={() => openProductDetail(product)}>
          {/* Image Container with Multiple Navigation Methods */}
          <div 
            className="relative w-full h-40 sm:h-48 lg:h-56 overflow-hidden bg-gray-50"
            onWheel={handleScroll}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentImage ? (
              <img 
                src={currentImage} 
                alt={product.name} 
                className="w-full h-full object-contain transition-opacity duration-300" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <i className="fas fa-image text-gray-400 text-3xl"></i>
              </div>
            )}
            
            {/* Image Dots - Show at bottom */}
            {productImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleDotClick(product._id, index, e)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-gray-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Navigation hints for multiple images */}
            {productImages.length > 1 && (
              <>
                {/* Desktop hover hint */}
                <div className="hidden lg:block absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Hover
                </div>
                {/* Mobile swipe hint */}
                <div className="lg:hidden absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Swipe
                </div>
              </>
            )}
          </div>

          {/* Badges */}
          {product.badge && (
            <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-primary-orange text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              {product.badge}
            </span>
          )}
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-red-500 text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </span>
          )}
          
          {/* Chegirma badge'i (prioritet yuqori) */}
          {(product.oldPrice && product.oldPrice > product.price && !product.badge) && (
            <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-red-600 text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              Chegirma
            </span>
          )}
          
          {/* Mashhur badge'i (faqat chegirma yo'q bo'lsa) */}
          {(product.rating >= 4.5 && !product.badge && !(product.oldPrice && product.oldPrice > product.price)) && (
            <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-primary-orange text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              Mashhur
            </span>
          )}
          
          {/* Yangi badge'i (faqat boshqa badge'lar yo'q bo'lsa) */}
          {(product.isNew && !product.badge && !(product.oldPrice && product.oldPrice > product.price) && !(product.rating >= 4.5)) && (
            <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-green-500 text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-semibold z-20">
              Yangi
            </span>
          )}
        </div>
        
        <div className="p-3 lg:p-4 flex flex-col flex-grow bg-white">
          {/* Product Name Section */}
          <div className={`cursor-pointer ${product.description ? 'mb-2' : 'mb-4'}`} onClick={() => openProductDetail(product)}>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] hover:text-primary-orange transition-colors duration-200 leading-snug">{product.name || 'Noma\'lum mahsulot'}</h3>
          </div>
          
          {/* Product Description - Only show if exists */}
          {product.description && (
            <div className="mb-4 p-2 bg-blue-50 rounded-md border-l-3 border-blue-200">
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 line-through text-xs sm:text-sm">
                      {formatPrice(product.oldPrice)}
                    </span>
                    <span className="text-red-500 text-xs sm:text-sm font-medium">
                      -{discount}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Stock info */}
              {product.stock !== undefined && (
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    {product.stock > 0 ? `${product.stock} ${product.unit || 'dona'}` : 'Tugagan'}
                  </p>
                  {product.stock > 0 && product.stock < 10 && (
                    <p className="text-xs text-red-500 font-medium">Kam qoldi!</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Action Button - Always at bottom */}
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-primary-orange text-white py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg hover:bg-opacity-90 transition duration-300 font-semibold flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              <i className="fas fa-shopping-cart text-xs lg:text-sm"></i>
              <span className="hidden sm:inline">Buyurtma berish</span>
              <span className="sm:hidden">Buyurtma</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
              <div className="h-56 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
                  ))}
                </div>
              </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">


      {/* Add to Cart Notification */}
      {showAddToCartNotification && (
        <div className="fixed top-20 right-4 md:top-24 md:right-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 max-w-xs md:max-w-sm">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle"></i>
            <span className="font-medium text-sm md:text-base">{notificationProduct} savatga qo'shildi!</span>
          </div>
        </div>
      )}
      
      {/* Badge Filter */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <span className="text-gray-700 font-medium text-sm lg:text-base">Saralash:</span>
            <div className="relative">
              <select
                ref={selectRef}
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-gray-800 font-medium focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all duration-200 cursor-pointer text-sm min-w-[110px] lg:min-w-[120px]"
              >
                <option value="all">Hammasi</option>
                <option value="mashhur">Mashhur</option>
                <option value="chegirma">Chegirma</option>
                <option value="yangi">Yangi</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none z-10">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
      

   



      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => createProductCard(product))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              {searchTerm ? 'Hech narsa topilmadi' : 
               currentCategory === 'all' ? 'Mahsulotlar yo\'q' : `${currentCategory} kategoriyasida mahsulot yo'q`}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 
                `"${searchTerm}" so'rovi bo'yicha hech qanday mahsulot topilmadi. Boshqa kalit so'zlar bilan qidiring.` :
                currentCategory === 'all' ? 
                  'Hozircha mahsulotlar qo\'shilmagan. Keyinroq qayta urinib ko\'ring.' :
                  'Bu kategoriyada mahsulotlar mavjud emas. Boshqa kategoriyalarni ko\'rib chiqing.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-times"></i>
                  Qidiruvni tozalash
                </button>
              )}
              {currentCategory !== 'all' && (
                <button
                  onClick={() => setCurrentCategory('all')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-globe"></i>
                  Barcha mahsulotlar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => onToggleCart && onToggleCart()}
        cart={cart || []}
        onRemoveFromCart={onRemoveFromCart}
        onUpdateQuantity={onUpdateQuantity}
        onCheckout={onCheckout}
      />
      
      {/* Product Detail Modal */}
      <ProductDetail
        product={selectedProduct}
        isOpen={isProductDetailOpen}
        onClose={closeProductDetail}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default ProductsGrid;