import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminNotificationBell from './AdminNotificationBell';
import AdminNotificationModals from './AdminNotificationModals';
import LoadingCard from './LoadingCard';
import useNotifications from '../hooks/useNotifications';
import ProductVariants from './admin/ProductVariants';
import ImageUploader from './admin/ImageUploader';
import VariantEditor from './admin/VariantEditor';
import SimpleProductForm from './admin/SimpleProductForm';
import VariantManager from './admin/VariantManager';
import '../styles/select-styles.css';

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
    images: [], // Changed from single image to images array
    badge: '',
    hasVariants: false,
    variants: []
  });
  const [selectedImages, setSelectedImages] = useState([]); // Changed from selectedImage to selectedImages
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for debouncing and initialization tracking
  const debounceTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Dynamic categories loaded from database
  const [categories, setCategories] = useState(['Barcha kategoriyalar']);

  // Main categories (asosiy kategoriyalar) - only the 5 main categories
  const mainCategories = [
    'xoz-mag',
    'yevro-remont', 
    'elektrika',
    'dekorativ-mahsulotlar',
    'santexnika'
  ];

  // Load categories from API with fallback to main categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/categories/list');
      if (response.ok) {
        const categoriesData = await response.json();
        console.log('📋 Loaded categories from API:', categoriesData);
        setCategories(['Barcha kategoriyalar', ...categoriesData]);
      } else {
        console.log('⚠️ API failed, using main categories as fallback');
        setCategories(['Barcha kategoriyalar', ...mainCategories]);
      }
    } catch (error) {
      console.error('❌ Error loading categories, using main categories as fallback:', error);
      setCategories(['Barcha kategoriyalar', ...mainCategories]);
    }
  }, []);

  // categoryMap removed - now using direct category names from database

  const badgeOptions = [
    { value: '', label: "Badge yo'q" },
    { value: 'Mashhur', label: 'Mashhur' },
    { value: 'Yangi', label: 'Yangi' }
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
        // Removed onCountChange call to prevent infinite re-renders
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
  }, [sortField, sortDirection, itemsPerPage]); // Removed onCountChange to prevent infinite re-renders

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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
      images: [], // Changed from single image to images array
      badge: '',
      hasVariants: false,
      variants: []
    });
    setSelectedImages([]); // Changed from selectedImage to selectedImages
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
    
    console.log('🔍 Tahrirlash uchun mahsulot ma\'lumotlari:', JSON.stringify(product, null, 2));

    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      oldPrice: product.oldPrice ? product.oldPrice.toString() : '',
      stock: product.stock ? product.stock.toString() : '',
      unit: product.unit || 'dona',
      images: product.images || (product.image ? [product.image] : []), // Support both old and new format
      badge: product.badge || '',
      hasVariants: product.hasVariants || false,
      variants: product.variants || []
    });
    setSelectedImages([]); // Changed from selectedImage to selectedImages
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
      images: [], // Changed from single image to images array
      badge: '',
      hasVariants: false,
      variants: []
    });
    setSelectedImages([]); // Changed from selectedImage to selectedImages
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



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Majburiy maydonlarni tekshirish
    if (!formData.name.trim() || !formData.category) {
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Mahsulot nomi va kategoriya kiritilishi shart');
      }, 0);
      return;
    }

    // Variant bo'lmagan mahsulotlar uchun narx va stock tekshirish
    if (!formData.hasVariants) {
      if (!formData.price || !formData.stock) {
        setTimeout(() => {
          safeNotifyError('Xatolik', 'Narx va zaxira kiritilishi shart');
        }, 0);
        return;
      }
    } else {
      // Variant bo'lgan mahsulotlar uchun kamida bitta variant bo'lishi kerak
      if (!formData.variants || formData.variants.length === 0) {
        setTimeout(() => {
          safeNotifyError('Xatolik', 'Kamida bitta variant qo\'shish kerak');
        }, 0);
        return;
      }

      // Har bir variantda kamida bitta option bo'lishi kerak
      const hasValidVariants = formData.variants.every(variant => 
        variant.name && variant.options && variant.options.length > 0 &&
        variant.options.every(option => 
          option.value && option.price && option.stock !== undefined
        )
      );

      if (!hasValidVariants) {
        setTimeout(() => {
          safeNotifyError('Xatolik', 'Barcha variantlar to\'liq to\'ldirilishi kerak');
        }, 0);
        return;
      }
    }

    setIsSubmitting(true);

    console.log('🔄 Mahsulot saqlanmoqda...', selectedProduct ? 'Tahrirlash' : 'Yangi qo\'shish');
    console.log('📝 Form ma\'lumotlari:', formData);

    try {
      // For non-variant products, combine existing and new images
      let allImages = formData.images || [];
      if (!formData.hasVariants) {
        allImages = [...(formData.images || []), ...(selectedImages || [])];
        
        // Ensure at least one image is provided for non-variant products
        if (allImages.length === 0) {
          safeNotifyError('Xatolik', 'Kamida bitta rasm qo\'shish kerak');
          setIsSubmitting(false);
          return;
        }
      } else {
        // For variant products, images are handled within variants
        // Check if at least one variant has images
        const hasVariantImages = formData.variants.some(variant => 
          variant.options.some(option => option.images && option.images.length > 0)
        );
        if (!hasVariantImages) {
          safeNotifyError('Xatolik', 'Kamida bitta variant uchun rasm qo\'shish kerak');
          setIsSubmitting(false);
          return;
        }
      }
      
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        unit: formData.unit,
        badge: formData.badge,
        hasVariants: formData.hasVariants,
        variants: formData.variants || [],
        rating: 0,
        reviews: 0,
        status: 'active'
      };

      // Add price, stock, and images based on variant status
      if (formData.hasVariants) {
        // For variant products, use base price from first variant or 0
        const firstVariantOption = formData.variants[0]?.options[0];
        productData.price = firstVariantOption?.price ? parseFloat(firstVariantOption.price) : 0;
        productData.oldPrice = firstVariantOption?.oldPrice ? parseFloat(firstVariantOption.oldPrice) : null;
        productData.stock = formData.variants.reduce((total, variant) => 
          total + variant.options.reduce((sum, option) => sum + (parseInt(option.stock) || 0), 0), 0
        );
        productData.image = firstVariantOption?.images?.[0] || '';
        productData.images = firstVariantOption?.images || [];
      } else {
        // For non-variant products, use form data
        productData.price = parseFloat(formData.price);
        productData.oldPrice = formData.oldPrice ? parseFloat(formData.oldPrice) : null;
        productData.stock = parseInt(formData.stock);
        productData.image = allImages[0]; // First image for backward compatibility
        productData.images = allImages; // All images array
      }

      console.log('📤 Yuborilayotgan ma\'lumotlar:', productData);
      console.log('🖼️ Rasmlar soni:', allImages.length);
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
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend xatolik response:', errorText);
        throw new Error(`Backend xatolik: ${response.status} - ${errorText}`);
      }

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
          loadCategories(); // Reload categories to include new ones
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

  // getCategoryName function removed - now using direct category names from database

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
    console.log('🔄 Filter changed to:', value);
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

  // Image handling functions
  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 8;
    const currentImageCount = formData.images.length + selectedImages.length;
    
    if (currentImageCount >= maxImages) {
      setTimeout(() => {
        safeNotifyError('Xatolik', `Maksimal ${maxImages}ta rasm qo'shish mumkin`);
      }, 0);
      return;
    }
    
    const remainingSlots = maxImages - currentImageCount;
    const filesToProcess = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      setTimeout(() => {
        safeNotifyWarning('Ogohlantirish', `Faqat ${remainingSlots}ta rasm qo'shildi. Maksimal ${maxImages}ta rasm mumkin.`);
      }, 0);
    }
    
    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setTimeout(() => {
          safeNotifyError('Xatolik', `${file.name} fayli juda katta (maksimal 5MB)`);
        }, 0);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImageDown = (index, isSelected) => {
    if (isSelected) {
      setSelectedImages(prev => {
        if (index >= prev.length - 1) return prev;
        const newImages = [...prev];
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        return newImages;
      });
    } else {
      setFormData(prev => {
        if (index >= prev.images.length - 1) return prev;
        const newImages = [...prev.images];
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        return { ...prev, images: newImages };
      });
    }
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
              className="custom-select"
            >
              <option value="">Barcha kategoriyalar</option>
              {mainCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
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
                  {(product.images && product.images.length > 0) || product.image ? (
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0] : product.image} 
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
                  <div className="flex items-center justify-center space-x-2 mt-auto">
                    <button 
                      onClick={() => openViewModal(product)}
                      className="flex-1 bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
                      title="Ko'rish"
                    >
                      <i className="fas fa-eye mr-1"></i>
                      <span className="text-sm">Ko'rish</span>
                    </button>
                    <button 
                      onClick={() => openEditModal(product)}
                      className="flex-1 bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition duration-200 flex items-center justify-center"
                      title="Tahrirlash"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      <span className="text-sm">Tahrir</span>
                    </button>
                    <button 
                      onClick={() => openDeleteConfirm(product)}
                      className="flex-1 bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition duration-200 flex items-center justify-center"
                      title="O'chirish"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      <span className="text-sm">O'chir</span>
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay overflow-hidden p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {selectedProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mahsulot nomi *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="Mahsulot nomini kiriting"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Kategoriya *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="custom-select custom-select-modal"
                    required
                  >
                    <option value="">Kategoriya tanlang</option>
                    {mainCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                

                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    O'lchov birligi
                  </label>
                  <select
                    value={formData.unit === 'boshqa' ? 'boshqa' : (unitOptions.find(opt => opt.value === formData.unit) ? formData.unit : 'boshqa')}
                    onChange={e => {
                      if (e.target.value === 'boshqa') {
                        setFormData(prev => ({ ...prev, unit: '' }));
                      } else {
                        setFormData(prev => ({ ...prev, unit: e.target.value }));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  >
                    {unitOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option value="boshqa">Boshqa</option>
                  </select>
                  {(formData.unit === '' || !unitOptions.find(opt => opt.value === formData.unit)) && (
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent mt-2"
                      placeholder="Masalan: qop, quti, to'plam"
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                   <label className="block text-sm font-medium text-gray-700">
                   Badge (Chegirma badge yo'q)
                 </label>
                <select
                  value={formData.badge}
                  onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent w-auto inline-block max-w-full"
                >
                  {badgeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                  placeholder="Mahsulot haqida batafsil ma'lumot"
                />
              </div>

              {/* Variant System Toggle */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasVariants"
                    checked={formData.hasVariants}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      hasVariants: e.target.checked,
                      variants: e.target.checked ? prev.variants : []
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasVariants" className="ml-2 block text-sm font-medium text-gray-700">
                    Bu mahsulotda variantlar bor (rang, o'lcham, xotira va h.k.)
                  </label>
                </div>
                
                {formData.hasVariants ? (
                  <div className="mt-4">
                    <VariantManager
                      variants={formData.variants}
                      onVariantsChange={(variants) => setFormData(prev => ({ ...prev, variants }))}
                    />
                  </div>
                ) : (
                  <div className="mt-4">
                    <SimpleProductForm
                      price={formData.price}
                      oldPrice={formData.oldPrice}
                      stock={formData.stock}
                      images={formData.images}
                      onPriceChange={(price) => setFormData(prev => ({ ...prev, price }))}
                      onOldPriceChange={(oldPrice) => setFormData(prev => ({ ...prev, oldPrice }))}
                      onStockChange={(stock) => setFormData(prev => ({ ...prev, stock }))}
                      onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Rasmlar (maksimal 8ta)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-orange file:text-white hover:file:bg-opacity-90"
                />
                
                {/* Existing images */}
                {formData.images.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Mavjud rasmlar:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img 
                            src={image} 
                            alt={`Existing ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-300" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                              <button
                                type="button"
                                onClick={() => moveImageDown(index, false)}
                                disabled={index === formData.images.length - 1}
                                className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Pastga ko'chirish"
                              >
                                <i className="fas fa-chevron-down"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                title="Rasmni o'chirish"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                          <div className="absolute -top-2 -left-2 bg-primary-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New selected images */}
                {selectedImages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Yangi rasmlar:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={`selected-${index}`} className="relative group">
                          <img 
                            src={image} 
                            alt={`Selected ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg border-2 border-green-300" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                              <button
                                type="button"
                                onClick={() => moveImageDown(index, true)}
                                disabled={index === selectedImages.length - 1}
                                className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Pastga ko'chirish"
                              >
                                <i className="fas fa-chevron-down"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSelectedImage(index)}
                                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                title="Rasmni o'chirish"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                          <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {formData.images.length + index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Image count info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Jami rasmlar: {formData.images.length + selectedImages.length}/8</span>
                    {(formData.images.length + selectedImages.length) >= 8 && (
                      <span className="text-amber-600 font-medium">Maksimal rasm soni</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 transition duration-200 disabled:opacity-50 font-medium min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <span><i className="fas fa-spinner fa-spin mr-2"></i>Saqlanmoqda...</span>
                    ) : (
                      <span>{selectedProduct ? 'Yangilash' : 'Qo\'shish'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay overflow-hidden p-4"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Mahsulot ma'lumotlari</h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Product Images */}
              {((selectedProduct.images && selectedProduct.images.length > 0) || selectedProduct.image) && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Mahsulot rasmlari</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      selectedProduct.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`${selectedProduct.name} - ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-primary-orange transition-colors cursor-pointer"
                          />
                          <div className="absolute -top-2 -left-2 bg-primary-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                      ))
                    ) : selectedProduct.image && (
                      <div className="relative group">
                        <img 
                          src={selectedProduct.image} 
                          alt={selectedProduct.name}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-primary-orange transition-colors cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Mahsulot nomi</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Kategoriya</label>
                    <p className="text-gray-900 capitalize">{selectedProduct.category}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Narx</label>
                    <div className="flex items-center space-x-3">
                      <p className="text-xl font-bold text-primary-dark">{formatCurrency(selectedProduct.price)}</p>
                      {selectedProduct.oldPrice && selectedProduct.oldPrice > selectedProduct.price && (
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-400 line-through decoration-red-500 decoration-2">{formatCurrency(selectedProduct.oldPrice)}</p>
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            -{Math.round(((selectedProduct.oldPrice - selectedProduct.price) / selectedProduct.oldPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Zaxira</label>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 font-medium">{selectedProduct.stock} {selectedProduct.unit}</p>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStockStatus(selectedProduct.stock).class}`}>
                        {getStockStatus(selectedProduct.stock).text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-500 mb-2">O'lchov birligi</label>
                    <p className="text-gray-900">{selectedProduct.unit}</p>
                  </div>

                  {selectedProduct.badge && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 mb-2">Badge</label>
                      <span className="bg-primary-orange text-white text-sm px-3 py-1 rounded-full font-medium">
                        {selectedProduct.badge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedProduct.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Tavsif</label>
                  <p className="text-gray-900 leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedProduct.stock}</div>
                  <div className="text-sm text-blue-600 font-medium">Zaxirada</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedProduct.price)}</div>
                  <div className="text-sm text-green-600 font-medium">Joriy narx</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600 capitalize">{selectedProduct.category}</div>
                  <div className="text-sm text-purple-600 font-medium">Kategoriya</div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <div className="flex items-center justify-end space-x-4">
                  <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
                  >
                    Yopish
                  </button>
                  <button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openEditModal(selectedProduct);
                    }}
                    className="px-6 py-3 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 transition duration-200 font-medium"
                  >
                    <i className="fas fa-edit mr-2"></i>Tahrirlash
                  </button>
                </div>
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