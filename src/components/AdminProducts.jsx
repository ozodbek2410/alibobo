import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminNotificationBell from './AdminNotificationBell';
import AdminNotificationModals from './AdminNotificationModals';
import LoadingCard from './LoadingCard';
import useNotifications from '../hooks/useNotifications';

const AdminProducts = ({ onCountChange, onMobileToggle, notifications, setNotifications }) => {
  // Notification system - matching index.html exactly
  const {
    notifications: notificationList,
    alertModal,
    confirmModal,
    promptModal,
    showAlert,
    showConfirm,
    closeAlert,
    handleConfirmResponse,
    handlePromptResponse,
    safeNotifySuccess,
    safeNotifyError,
    safeNotifyWarning,
    notifyProductAdded,
    safeNotifyProductDeleted,
    addNotification
  } = useNotifications();

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modal states - simplified with new notification system
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    oldPrice: '',
    stock: '',
    unit: 'dona',
    image: '',
    badge: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for debouncing and initialization tracking
  const debounceTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  const categories = [
    'Barcha kategoriyalar',
    "G'isht va bloklar",
    'Asbob-uskunalar',
    "Bo'yoq va lak",
    'Elektr mollalari',
    'Metall va armatura',
    "Yog'och va mebel",
    'Tom materiallar',
    'Santexnika',
    'Issiqlik va konditsioner',
    'Dekor va bezatish',
    'Temir-beton',
    'Gips va shpaklovka',
    'Boshqalar'
  ];

  const categoryMap = {
    'gisht': "G'isht va bloklar",
    'asbob': 'Asbob-uskunalar',
    'boyoq': "Bo'yoq va lak",
    'elektr': 'Elektr mollalari',
    'metall': 'Metall va armatura',
    'yogoch': "Yog'och va mebel",
    'tom': 'Tom materiallar',
    'santexnika': 'Santexnika',
    'issiqlik': 'Issiqlik va konditsioner',
    'dekor': 'Dekor va bezatish',
    'temir-beton': 'Temir-beton',
    'gips': 'Gips va shpaklovka',
    'boshqa': 'Boshqalar'
  };

  const badgeOptions = [
    { value: '', label: "Badge yo'q" },
    { value: 'Mashhur', label: 'Mashhur' },
    { value: 'Yangi', label: 'Yangi' },
    { value: 'Chegirma', label: 'Chegirma' }
  ];

  const unitOptions = [
    { value: 'dona', label: 'Dona' },
    { value: 'kg', label: 'Kilogramm' },
    { value: 'm', label: 'Metr' },
    { value: 'm2', label: 'Kvadrat metr' },
    { value: 'm3', label: 'Kub metr' },
    { value: 'litr', label: 'Litr' },
    { value: 'paket', label: 'Paket' },
    { value: 'rulon', label: 'Rulon' }
  ];

  // Centralized API call function - completely stable
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const {
        page = 1,
        search = '',
        category = '',
        sortBy = sortField,
        sortOrder = sortDirection
      } = params;

      console.log('🔄 API chaqiruv boshlandi:', {
        page,
        search,
        category,
        sort: `${sortBy},${sortOrder}`
      });

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: search || '',
        category: category || '',
        sortBy,
        sortOrder
      });

      const response = await fetch(`http://localhost:5000/api/products?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        console.log('✅ API chaqiruv muvaffaqiyatli:', data.products.length, 'ta mahsulot');
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        if (onCountChange) {
          onCountChange(data.totalCount);
        }
      } else {
        throw new Error(data.message || 'Mahsulotlar yuklanmadi');
      }
    } catch (error) {
      console.error('❌ API chaqiruvda xatolik:', error);
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Mahsulotlar yuklanmadi');
      }, 0);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection, itemsPerPage, onCountChange]); // Faqat barqaror dependencylar

  // Single useEffect for search and filter with proper debouncing
  useEffect(() => {
    // Initial load - only once
    if (!isInitializedRef.current) {
      console.log('🚀 Dastlabki yuklash boshlandi');
      isInitializedRef.current = true;
      fetchProducts();
      return;
    }

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      console.log('🧹 Avvalgi timeout tozalandi');
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new debounced timeout
    console.log('⏰ Yangi debounce timeout o\'rnatildi:', { search: searchTerm, filter: filterCategory });
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Debounce tugadi, API chaqiruv boshlandi');
      setCurrentPage(1);
      fetchProducts({
        page: 1,
        search: searchTerm,
        category: filterCategory
      });
    }, 500); // 500ms debounce

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        console.log('🧹 Cleanup: timeout tozalandi');
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, filterCategory]); // Faqat search va filter o'zgarishida

  // Separate useEffect for page changes
  useEffect(() => {
    if (isInitializedRef.current && currentPage > 1) {
      console.log('📄 Sahifa o\'zgartirildi:', currentPage);
      fetchProducts({
        page: currentPage,
        search: searchTerm,
        category: filterCategory
      });
    }
  }, [currentPage]); // Faqat sahifa o'zgarishida

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        console.log('🧹 Komponent unmount: timeout tozalandi');
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Prevent body scrolling when any modal is open
  useEffect(() => {
    if (isModalOpen || isViewModalOpen || alertModal?.show || confirmModal?.show || promptModal?.show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen, isViewModalOpen, alertModal?.show, confirmModal?.show, promptModal?.show]);

  const openAddModal = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      oldPrice: '',
      stock: '',
      unit: 'dona',
      image: '',
      badge: ''
    });
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    // Product null yoki undefined bo'lsa, xatolik ko'rsatamiz
    if (!product || !product._id) {
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Mahsulot ma\'lumotlari to\'g\'ri emas');
      }, 0);
      return;
    }

    // Kategoriya formatini to'g'rilash
    let categoryValue = '';
    if (product.category) {
      // Avval to'g'ridan-to'g'ri kategoriya nomini topishga harakat qilamiz
      const categoryName = getCategoryName(product.category);
      if (categoryName && categoryName !== product.category) {
        // Agar getCategoryName boshqa nom qaytarsa, uni ishlatamiz
        categoryValue = categoryName.toLowerCase().replace(/\s+/g, '-');
      } else {
        // Agar yo'qsa, original kategoriyani ishlatamiz
        categoryValue = product.category.toLowerCase().replace(/\s+/g, '-');
      }
    }
    
    console.log('🔍 Tahrirlash uchun mahsulot ma\'lumotlari:', JSON.stringify(product, null, 2));
    console.log('📝 Kategoriya tekshiruv:', {
      originalCategory: product.category,
      formattedCategory: categoryValue,
      availableCategories: categories.slice(1),
      categoryMap: Object.keys(categoryMap)
    });

    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      category: categoryValue,
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      oldPrice: product.oldPrice ? product.oldPrice.toString() : '',
      stock: product.stock ? product.stock.toString() : '',
      unit: product.unit || 'dona',
      image: product.image || '',
      badge: product.badge || ''
    });
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const openViewModal = (product) => {
    // Product null yoki undefined bo'lsa, xatolik ko'rsatamiz
    if (!product || !product._id) {
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Mahsulot ma\'lumotlari to\'g\'ri emas');
      }, 0);
      return;
    }

    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      oldPrice: '',
      stock: '',
      unit: 'dona',
      image: '',
      badge: ''
    });
    setSelectedImage(null);
  };

  const openDeleteConfirm = (product) => {
    if (!product || !product._id) {
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Mahsulot ma\'lumotlari to\'g\'ri emas');
      }, 0);
      return;
    }

    setSelectedProduct(product);
    showConfirm(
      'Mahsulotni o\'chirish',
      `"${product.name}" mahsulotini o\'chirishni xohlaysizmi?`,
      () => deleteProduct(product._id),
      null,
      'danger'
    );
  };

  const deleteProduct = async (id) => {
    if (!id) {
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Mahsulot ID si topilmadi');
      }, 0);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Get product info for notification before removing
        const deletedProduct = products.find(p => p._id === id);
        const productName = deletedProduct?.name || 'Mahsulot';
        const productPrice = deletedProduct?.price || 0;
        
        // Muvaffaqiyatli o'chirish
        setProducts(prevProducts => prevProducts.filter(product => product._id !== id));
        setTotalCount(prev => {
          const newCount = prev - 1;
          // Prevent setState during render by deferring onCountChange
          if (onCountChange) {
            setTimeout(() => {
              onCountChange(newCount);
            }, 0);
          }
          return newCount;
        });
        
        // Show deletion notification and add to recent activities
        safeNotifyProductDeleted(productName, productPrice);
      } else {
        // Har qanday xatolik (404 ham) haqiqiy xatolik
        const data = await response.json();
        const errorMessage = data.message || `Server xatoligi: ${response.status}`;
        
        // Local state ni yangilash (agar mahsulot mavjud bo'lsa)
        setProducts(prevProducts => prevProducts.filter(product => product._id !== id));
        
        // Xatolik xabarini ko'rsatish
        setTimeout(() => {
          safeNotifyError('Xatolik', errorMessage);
        }, 0);
      }
    } catch (error) {
      console.error('Mahsulot o\'chirishda xatolik:', error);
      
      // Tarmoq xatoligi bo'lsa ham local state ni yangilash
      setProducts(prevProducts => prevProducts.filter(product => product._id !== id));
      
      // Tarmoq xatoligi uchun modal
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Server bilan bog\'lanishda xatolik yuz berdi');
      }, 0);
    }
  };

  // cancelDelete function removed - now using useNotifications hook

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setFormData(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Majburiy maydonlarni tekshirish
    if (!formData.name.trim() || !formData.category || !formData.price || !formData.stock) {
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Barcha majburiy maydonlarni to\'ldiring');
      }, 0);
      return;
    }

    setIsSubmitting(true);

    console.log('🔄 Mahsulot saqlanmoqda...', selectedProduct ? 'Tahrirlash' : 'Yangi qo\'shish');
    console.log('📝 Form ma\'lumotlari:', formData);

    try {
    const productData = {
        name: formData.name.trim(),
      category: formData.category,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        stock: parseInt(formData.stock),
        unit: formData.unit,
        image: formData.image,
        badge: formData.badge,
        rating: 0,
        reviews: 0,
        status: 'active'
      };

      console.log('📤 Yuborilayotgan ma\'lumotlar:', productData);
      console.log('💰 Eski narx:', productData.oldPrice);

      const url = selectedProduct && selectedProduct._id 
        ? `http://localhost:5000/api/products/${selectedProduct._id}`
        : 'http://localhost:5000/api/products';
      
      const method = selectedProduct && selectedProduct._id ? 'PUT' : 'POST';

      console.log('🌐 URL:', url, 'Method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📥 Response data:', data);
      console.log('💰 Qaytgan eski narx:', data.oldPrice);

      if (response.ok) {
        console.log('✅ Muvaffaqiyatli saqlandi');
    if (selectedProduct) {
          // Tahrirlash - local state ni yangilash
          setProducts(prevProducts => 
            prevProducts.map(product => 
              product._id === selectedProduct._id 
                ? { ...product, ...data }
                : product
            )
          );
    } else {
          // Yangi qo'shish - local state ga qo'shish
          setProducts(prevProducts => [...prevProducts, data]);
          setTotalCount(prev => prev + 1);
        }

        // Notification with product details - matching index.html
        setTimeout(() => {
          if (selectedProduct) {
            safeNotifySuccess('Mahsulot yangilandi', `${data.name} muvaffaqiyatli yangilandi`);
          } else {
            safeNotifySuccess('Mahsulot qo\'shildi', `${data.name} muvaffaqiyatli qo\'shildi`);
            // Add to recent activities
            notifyProductAdded(data);
          }
        }, 0);
        closeModal();
        
        // Mahsulotlarni qayta yuklash
        setTimeout(() => {
          fetchProducts(); // Use fetchProducts to reload with current filters
        }, 500);
      } else {
        // Har qanday xatolik (404 ham) haqiqiy xatolik
        const errorMessage = data.message || `Server xatoligi: ${response.status}`;
        console.error('❌ Xatolik:', errorMessage);
        setTimeout(() => {
          safeNotifyError('Xatolik', errorMessage);
        }, 0);
        closeModal();
      }
    } catch (error) {
      console.error('❌ Mahsulot saqlashda xatolik:', error);
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Mahsulot saqlanmadi');
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changePage = (direction) => {
    setCurrentPage(prev => {
      const newPage = direction === 'next' ? prev + 1 : prev - 1;
      return Math.max(1, Math.min(newPage, totalPages));
    });
  };

  // Old modal functions removed - now using useNotifications hook

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryName = (category) => {
    // Agar kategoriya categoryMap da bo'lsa, uni qaytaradi
    if (categoryMap[category]) {
      return categoryMap[category];
    }
    
    // Agar kategoriya to'g'ridan-to'g'ri kategoriya nomi bo'lsa, uni qaytaradi
    const categoryValue = category.toLowerCase().replace(/\s+/g, '-');
    if (categoryMap[categoryValue]) {
      return categoryMap[categoryValue];
    }
    
    // Agar hech qanday moslik topilmasa, original kategoriyani qaytaradi
    return category;
  };

  const getProductInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600'
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  const getStockStatus = (stock) => {
    if (stock > 100) return { text: 'Zaxira', class: 'bg-green-100 text-green-800' };
    if (stock > 20) return { text: 'O\'rtacha', class: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Kam', class: 'bg-red-100 text-red-800' };
  };

  // Old openAlert function removed - now using useNotifications hook

  // Search and filter handlers
  const handleSearchChange = (value) => {
    console.log('🔍 Search input o\'zgartirildi:', value);
    setSearchTerm(value);
  };

  const handleFilterChange = (value) => {
    console.log('🔍 Filter input o\'zgartirildi:', value);
    setFilterCategory(value);
  };

  const clearSearchAndFilter = () => {
    console.log('🧹 Qidiruv va filter tozalandi');
    setSearchTerm('');
    setFilterCategory('');
    setCurrentPage(1);
    
    // Clear timeout
    if (debounceTimeoutRef.current) {
      console.log('🧹 Clear: timeout tozalandi');
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Reload all products using centralized function
    console.log('🔄 Barcha mahsulotlar yuklanmoqda...');
    fetchProducts({
      page: 1,
      search: '',
      category: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30 responsive-header">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onMobileToggle}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold text-primary-dark">Mahsulotlar</h2>
          </div>
          <div className="flex items-center space-x-4">
            <AdminNotificationBell notifications={notifications} setNotifications={setNotifications} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Search and Filter Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0 responsive-search-filter">
            <h2 className="text-2xl font-bold text-primary-dark">Mahsulotlar</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mobile-search-container">
            {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Mahsulot qidirish..."
                  value={searchTerm}
                  onChange={e => {
                    const value = e.target.value;
                    handleSearchChange(value);
                  }}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      console.log('🔍 Enter bosildi, qidiruv boshlandi');
                      // Clear existing timeouts
                      if (debounceTimeoutRef.current) {
                        clearTimeout(debounceTimeoutRef.current);
                      }
                      // Immediate search using centralized function
                      setCurrentPage(1);
                      fetchProducts({
                        page: 1,
                        search: searchTerm,
                        category: filterCategory
                      });
                    }
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange w-full sm:w-64"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                {(searchTerm || filterCategory) && (
                  <button
                    onClick={clearSearchAndFilter}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            
            {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={e => {
                  const value = e.target.value;
                  handleFilterChange(value);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
              >
                <option value="">Barcha kategoriyalar</option>
              {categories.slice(1).map(category => {
                const categoryValue = category.toLowerCase().replace(/\s+/g, '-');
                return (
                  <option key={category} value={categoryValue}>
                    {category}
                  </option>
                );
              })}
              </select>
            
            {/* Add Product Button */}
              <button 
                onClick={openAddModal}
                className="bg-primary-orange text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300 whitespace-nowrap"
              >
                <i className="fas fa-plus mr-2"></i>Yangi mahsulot
              </button>
            </div>
          </div>

        {/* Products Grid */}
        <div className="desktop-grid grid gap-4 mb-6">
          {loading ? (
            <div className="col-span-full">
              <LoadingCard count={6} />
            </div>
          ) : products.length === 0 ? (
                <div className="col-span-full text-center py-12">
              <div className="text-gray-500">
                <i className="fas fa-box-open text-6xl mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">Mahsulotlar topilmadi</h3>
                <p className="text-gray-400">Qidiruv natijalariga mos mahsulotlar yo\'q</p>
              </div>
                </div>
              ) : (
            products.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 product-card flex flex-col h-full">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r ${getAvatarGradient(product.name)}`}>
                      <span className="text-white text-2xl font-bold">{getProductInitials(product.name)}</span>
                            </div>
                  )}
                  
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary-orange text-white text-xs px-2 py-1 rounded-full">
                        {product.badge}
                      </span>
                          </div>
                        )}
                  
                  {/* Discount Badge */}
                  {product.oldPrice && product.oldPrice > product.price && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                          </span>
                        </div>
                  )}
                  
                  {/* Stock Status */}
                  <div className="absolute bottom-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStockStatus(product.stock).class}`}>
                      {getStockStatus(product.stock).text}
                    </span>
                      </div>
                    </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                      </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-primary-dark">{formatCurrency(product.price)}</span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through decoration-red-500 decoration-2">{formatCurrency(product.oldPrice)}</span>
                      )}
                      </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{product.stock} {product.unit}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-center space-x-2 mt-auto pt-3">
                        <button 
                          onClick={() => openViewModal(product)}
                      className="flex-1 bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
                        >
                      <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          onClick={() => openEditModal(product)}
                      className="flex-1 bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition duration-200 flex items-center justify-center"
                        >
                      <i className="fas fa-edit"></i>
                        </button>
                        <button 
                      onClick={() => openDeleteConfirm(product)}
                      className="flex-1 bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition duration-200 flex items-center justify-center"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">
              {totalCount} ta mahsulotdan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} tasi ko'rsatilmoqda
          </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changePage('prev')}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="px-3 py-2 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => changePage('next')}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
        </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay overflow-hidden"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mahsulot nomi *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                      required
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategoriya *
                    </label>
                    <select
                      value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                      required
                    >
                    <option value="">Kategoriya tanlang</option>
                    {categories.slice(1).map(category => {
                      const categoryValue = category.toLowerCase().replace(/\s+/g, '-');
                      return (
                        <option key={category} value={categoryValue}>
                          {category}
                        </option>
                      );
                    })}
                    </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Narx (so'm) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eski narx (so'm)
                    </label>
                    <input
                      type="number"
                    value={formData.oldPrice}
                    onChange={e => setFormData(prev => ({ ...prev, oldPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                      min="0"
                    step="0.01"
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zaxira *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                    onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                      min="0"
                      required
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    O'lchov birligi
                    </label>
                    <select
                      value={formData.unit}
                    onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                  >
                    {unitOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    </select>
                  </div>
                </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge
                    </label>
                <select
                  value={formData.badge}
                  onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                >
                  {badgeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                  </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tavsif
                  </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                />
                      </div>
              
                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rasm
                </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                />
                {selectedImage && (
                  <div className="mt-2 relative">
                    <img src={selectedImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                      </div>
                    )}
                </div>
                
              <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 transition duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span><i className="fas fa-spinner fa-spin mr-2"></i>Saqlanmoqda...</span>
                  ) : (
                    <span>{selectedProduct ? 'Yangilash' : 'Qo\'shish'}</span>
                  )}
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay overflow-hidden"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Mahsulot ma'lumotlari</h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
                    </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Mahsulot nomi</label>
                  <p className="text-gray-900">{selectedProduct.name}</p>
                  </div>
                  
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Kategoriya</label>
                  <p className="text-gray-900">{getCategoryName(selectedProduct.category)}</p>
                      </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Narx</label>
                  <p className="text-gray-900">{formatCurrency(selectedProduct.price)}</p>
                      </div>
                
                {selectedProduct.oldPrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Eski narx</label>
                    <p className="text-gray-900 line-through">{formatCurrency(selectedProduct.oldPrice)}</p>
                      </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Zaxira</label>
                  <p className="text-gray-900">{selectedProduct.stock} {selectedProduct.unit}</p>
                      </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${selectedProduct.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedProduct.status === 'active' ? 'Faol' : 'Nofaol'}
                  </span>
                    </div>
                  </div>
              
              {selectedProduct.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tavsif</label>
                  <p className="text-gray-900">{selectedProduct.description}</p>
                </div>
              )}
              
              {selectedProduct.badge && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Badge</label>
                  <span className="bg-primary-orange text-white text-xs px-2 py-1 rounded-full">
                    {selectedProduct.badge}
                      </span>
                    </div>
              )}
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                      <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  Yopish
                      </button>
                      <button 
                        onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedProduct);
                  }}
                  className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 transition duration-200"
                >
                  Tahrirlash
                      </button>
                    </div>
                  </div>
                        </div>
                        </div>
      )}

      {/* AdminNotificationModals - matching index.html exactly */}
      <AdminNotificationModals
        alertModal={alertModal}
        confirmModal={confirmModal}
        promptModal={promptModal}
        closeAlert={closeAlert}
        onConfirmResponse={handleConfirmResponse}
        onPromptResponse={handlePromptResponse}
      />

      {/* Old alert modal removed - now using AdminNotificationModals */}
    </div>
  );
};

export default AdminProducts; 