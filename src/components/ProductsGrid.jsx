import React, { useState, useEffect, useRef } from 'react';
import CartSidebar from './CartSidebar';

const ProductsGrid = ({ 
  cart, 
  onAddToCart, 
  isCartOpen, 
  onToggleCart, 
  onRemoveFromCart, 
  onUpdateQuantity, 
  onCheckout 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const [quickFilter, setQuickFilter] = useState('all');
  
  // Notification states
  const [showAddToCartNotification, setShowAddToCartNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState('');
  const selectRef = useRef(null);

  useEffect(() => {
    loadProducts();
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

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products?limit=100');
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
        
        // Kategoriyalarni olish
        const uniqueCategories = [...new Set(data.products.map(p => p.category))];
        setCategories(uniqueCategories);
      } else {
        console.error('Mahsulotlar yuklanmadi:', data.message);
      }
    } catch (error) {
      console.error('Mahsulotlar yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = (category) => {
    setCurrentCategory(category);
  };

  const getFilteredProducts = () => {
    let filtered = products;
    
    // Kategoriya bo'yicha filtrlash
    if (currentCategory !== 'all') {
      filtered = filtered.filter(product => product.category === currentCategory);
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
    
    return (
      <div key={product._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="relative">
          <img src={product.image || '/assets/default-product.png'} alt={product.name} className="w-full h-56 object-cover" />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-primary-orange text-white px-3 py-1 rounded-full text-xs font-semibold">
              {product.badge}
            </span>
          )}
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </span>
          )}
          
          {/* Chegirma badge'i (prioritet yuqori) */}
          {(product.oldPrice && product.oldPrice > product.price && !product.badge) && (
            <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Chegirma
            </span>
          )}
          
          {/* Mashhur badge'i (faqat chegirma yo'q bo'lsa) */}
          {(product.rating >= 4.5 && !product.badge && !(product.oldPrice && product.oldPrice > product.price)) && (
            <span className="absolute top-3 left-3 bg-primary-orange text-white px-3 py-1 rounded-full text-xs font-semibold">
              Mashhur
            </span>
          )}
          
          {/* Yangi badge'i (faqat boshqa badge'lar yo'q bo'lsa) */}
          {(product.isNew && !product.badge && !(product.oldPrice && product.oldPrice > product.price) && !(product.rating >= 4.5)) && (
            <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Yangi
            </span>
          )}
        </div>
        
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 min-h-[2.5rem]">{product.name || 'Noma\'lum mahsulot'}</h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{product.description || 'Tavsif mavjud emas'}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-primary-orange font-bold text-lg">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-gray-400 line-through text-sm decoration-red-500 decoration-2">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            
            <div className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
              {product.stock ? `${product.stock} dona` : 'Mavjud emas'}
            </div>
          </div>
          
          {/* Action Button */}
          <div className="mt-4">
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-primary-orange text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <i className="fas fa-shopping-cart text-sm"></i>
              Buyurtma berish
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
    <div className="container mx-auto px-4 py-8">


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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Saralash:</span>
            <div className="relative z-10">
              <select
                ref={selectRef}
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-gray-800 font-medium focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all duration-200 cursor-pointer text-sm min-w-[120px] relative z-10"
              >
                <option value="all">Hammasi</option>
                <option value="mashhur">Mashhur</option>
                <option value="chegirma">Chegirma</option>
                <option value="yangi">Yangi</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {filteredProducts.length} mahsulot topildi
          </div>
        </div>
      </div>
      

      {/* Category Filter */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <i className="fas fa-th-large text-primary-orange"></i>
              Kategoriyalar
            </h3>
            <span className="text-sm text-gray-500">
              {filteredProducts.length} ta mahsulot
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            <button
              onClick={() => filterByCategory('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                currentCategory === 'all'
                  ? 'bg-primary-orange text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              <i className="fas fa-globe text-xs"></i>
              <span>Barchasi</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                currentCategory === 'all' ? 'bg-white bg-opacity-20' : 'bg-gray-200'
              }`}>
                {products.length}
              </span>
            </button>
            
            {categories.map(category => {
              const categoryCount = products.filter(p => p.category === category).length;
              if (categoryCount === 0) return null;
              
              // Kategoriya ikonlarini belgilash
              const getCategoryIcon = (categoryName) => {
                const iconMap = {
                  "G'isht va bloklar": 'fas fa-cube',
                  'Asbob-uskunalar': 'fas fa-tools',
                  "Bo'yoq va lak": 'fas fa-palette',
                  'Elektr mollalari': 'fas fa-bolt',
                  'Metall va armatura': 'fas fa-industry',
                  "Yog'och va mebel": 'fas fa-tree',
                  'Tom materiallar': 'fas fa-home',
                  'Santexnika': 'fas fa-faucet',
                  'Issiqlik va konditsioner': 'fas fa-thermometer-half',
                  'Dekor va bezatish': 'fas fa-paint-brush',
                  'Temir-beton': 'fas fa-building',
                  'Gips va shpaklovka': 'fas fa-trowel',
                  'Boshqalar': 'fas fa-box',
                  // Eski kategoriyalar uchun
                  'Gisht': 'fas fa-cube',
                  'Blok': 'fas fa-building',
                  'Penoblok': 'fas fa-th-large',
                  'Keramit': 'fas fa-home',
                  'Gazobeton': 'fas fa-square',
                  'Asboblar': 'fas fa-tools',
                  "Bo'yoqlar": 'fas fa-palette',
                  'Elektr': 'fas fa-bolt'
                };
                return iconMap[categoryName] || 'fas fa-box';
              };
              
              return (
                <button
                  key={category}
                  onClick={() => filterByCategory(category)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                    currentCategory === category
                      ? 'bg-primary-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  <i className={`${getCategoryIcon(category)} text-xs`}></i>
                  <span className="truncate">{category}</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                    currentCategory === category ? 'bg-white bg-opacity-20' : 'bg-gray-200'
                  }`}>
                    {categoryCount}
                  </span>
                </button>
              );
            })}
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
    </div>
  );
};

export default ProductsGrid;