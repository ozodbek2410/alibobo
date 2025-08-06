import React, { useState, useEffect } from 'react';
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

  // Notification states
  const [showAddToCartNotification, setShowAddToCartNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState('');

  useEffect(() => {
    loadProducts();
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
      <div key={product._id} className="bg-white border border-gray-200 overflow-hidden shadow-sm min-h-[400px] rounded-lg">
        <div className="relative bg-gray-50">
          <img src={product.image || '/assets/default-product.png'} alt={product.name} className="w-full h-48 object-cover" />
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
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-base line-clamp-2 min-h-[2rem]">{product.name || 'Noma\'lum mahsulot'}</h3>
            <div className="flex items-center gap-1">
              <i className="fas fa-star text-yellow-400 text-sm"></i>
              <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
            </div>
          </div>

          <p className="text-gray-600 text-xs mb-2 line-clamp-2 min-h-[2rem]">{product.description || 'Tavsif mavjud emas'}</p>

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

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 bg-primary-orange text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <i className="fas fa-shopping-cart text-sm"></i>
              Buyurtma berish
            </button>
            <button
              onClick={(e) => toggleFavorite(product._id, e.currentTarget)}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition duration-300"
            >
              <i className="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 overflow-hidden shadow-sm animate-pulse rounded-lg">
              <div className="h-48 bg-gray-200"></div>
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
      {/* Inline Search Section */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mahsulot qidirish..."
              className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all duration-200 text-gray-700"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Price Range Select */}
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full pl-3 pr-8 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all duration-200 text-gray-700 appearance-none bg-white"
            >
              <option value="all">Barcha narxlar</option>
              <option value="0-100000">100 ming gacha</option>
              <option value="100000">100 ming dan yuqori</option>
              <option value="200000">200 ming dan yuqori</option>
              <option value="500000">500 ming dan yuqori</option>
              <option value="1000000">1 million dan yuqori</option>
              <option value="100000-500000">100-500 ming</option>
              <option value="500000-1000000">500 ming - 1 million</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <i className="fas fa-chevron-down text-gray-400"></i>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-3 pr-8 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all duration-200 text-gray-700 appearance-none bg-white"
            >
              <option value="name">Nomi bo'yicha</option>
              <option value="price-low">Arzon narxdan</option>
              <option value="price-high">Qimmat narxdan</option>
              <option value="rating">Reyting bo'yicha</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <i className="fas fa-chevron-down text-gray-400"></i>
            </div>
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
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${currentCategory === 'all'
                ? 'bg-primary-orange text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
            >
              <i className="fas fa-globe text-xs"></i>
              <span>Barchasi</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${currentCategory === 'all' ? 'bg-white bg-opacity-20' : 'bg-gray-200'
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${currentCategory === category
                    ? 'bg-primary-orange text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                >
                  <i className={`${getCategoryIcon(category)} text-xs`}></i>
                  <span className="truncate">{category}</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${currentCategory === category ? 'bg-white bg-opacity-20' : 'bg-gray-200'
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
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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