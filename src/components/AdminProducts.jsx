import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useProducts, useDeleteProduct, useRestoreProduct, useUpdateProduct, useCreateProduct } from '../hooks/useProductQueries';
import { useRecentActivitiesCache } from '../hooks/useRecentActivities';
import { queryClient, queryKeys } from '../lib/queryClient';

import AdminNotificationBell from './AdminNotificationBell';
import AdminNotificationModals from './AdminNotificationModals';
import LoadingCard from './LoadingCard';
import useNotifications from '../hooks/useNotifications';
import useRealNotifications from '../hooks/useRealNotifications';
import ProductVariants from './admin/ProductVariants';
import ImageUploader from './admin/ImageUploader';
import VariantEditor from './admin/VariantEditor';
import SimpleProductForm from './admin/SimpleProductForm';
import VariantManager from './admin/VariantManager';
import '../styles/select-styles.css';

const AdminProducts = ({ onCountChange, notifications, setNotifications }) => {
  // Real notification system for notification bell
  const {
    notifications: realNotifications,
    setNotifications: setRealNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    deleteAllNotifications,
    notifyProductAdded,
    notifyProductDeleted
  } = useRealNotifications(true, 30000);

  // Demo notification system for modals (keep existing modal functionality)
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
    safeNotifyProductDeleted,
    addNotification
  } = useNotifications();

  // React Query hooks for product operations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  
  // Recent activities cache management
  const activitiesCache = useRecentActivitiesCache();
  
  // State management
  const [products, setProducts] = useState([]);
  // Local loading removed; use React Query's isLoading/isFetching
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modal states - simplified with new notification system
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Delete notification states
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);
  const [deleteNotificationMessage, setDeleteNotificationMessage] = useState('');
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedCategory, setDebouncedCategory] = useState('');

  // Image slideshow state (per product)
  const imageIndexRef = useRef(new Map()); // productId -> current image index
  const [, setImageStateVersion] = useState(0); // bump to trigger rerender
  const hoverTimerRef = useRef(new Map()); // productId -> interval id
  const touchStartXRef = useRef(new Map()); // productId -> startX

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
        // Ensure categoriesData is an array before spreading
        const categoryArray = Array.isArray(categoriesData) ? categoriesData : [];
        setCategories(['Barcha kategoriyalar', ...categoryArray]);
      } else {
        console.log('⚠️ API failed, using main categories as fallback');
        setCategories(['Barcha kategoriyalar', ...mainCategories]);
      }
    } catch (error) {
      console.error('❌ Error loading categories, using main categories as fallback:', error);
      // Ensure mainCategories is an array before spreading
      const categoryArray = Array.isArray(mainCategories) ? mainCategories : [];
      setCategories(['Barcha kategoriyalar', ...categoryArray]);
    }
  }, []);

  // React Query mutations for product actions
  const { mutateAsync: softDeleteProductMutate } = useDeleteProduct();
  const { mutateAsync: restoreProductMutate } = useRestoreProduct();

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

  // Collect all possible images for a product (variants -> product.images -> product.image)
  const getAllProductImages = useCallback((product) => {
    const allImages = [];
    try {
      if (product?.hasVariants && Array.isArray(product?.variants)) {
        product.variants.forEach(variant => {
          if (Array.isArray(variant?.options)) {
            variant.options.forEach(option => {
              if (Array.isArray(option?.images) && option.images.length > 0) {
                allImages.push(...option.images);
              } else if (option?.image) {
                allImages.push(option.image);
              }
            });
          }
        });
      }
      if (allImages.length === 0) {
        if (Array.isArray(product?.images) && product.images.length > 0) {
          allImages.push(...product.images);
        } else if (product?.image) {
          allImages.push(product.image);
        }
      }
    } catch (e) {
      // ignore, fallback below
    }
    const unique = [...new Set(allImages.filter(Boolean))];
    return unique.length > 0 ? unique : [];
  }, []);

  // Handlers to change images on hover/move and touch
  const startHoverSlideshow = useCallback((product) => {
    const id = product?._id || product?.id;
    const images = getAllProductImages(product);
    if (!id || images.length <= 1) return;
    if (hoverTimerRef.current.get(id)) return; // already running
    const interval = setInterval(() => {
      const current = imageIndexRef.current.get(id) || 0;
      const next = (current + 1) % images.length;
      imageIndexRef.current.set(id, next);
      setImageStateVersion(v => v + 1);
    }, 1200);
    hoverTimerRef.current.set(id, interval);
  }, [getAllProductImages]);

  const stopHoverSlideshow = useCallback((product) => {
    const id = product?._id || product?.id;
    if (!id) return;
    const interval = hoverTimerRef.current.get(id);
    if (interval) {
      clearInterval(interval);
      hoverTimerRef.current.delete(id);
    }
  }, []);

  // Removed mouse move based switcher to keep UX simple; using slideshow on hover instead.

  const handleTouchStartOnImage = useCallback((product, e) => {
    const id = product?._id || product?.id;
    const images = getAllProductImages(product);
    if (!id || images.length <= 1) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    touchStartXRef.current.set(id, touch.clientX);
  }, [getAllProductImages]);

  const handleTouchEndOnImage = useCallback((product, e) => {
    const id = product?._id || product?.id;
    const images = getAllProductImages(product);
    if (!id || images.length <= 1) return;
    const touch = e.changedTouches && e.changedTouches[0];
    const startX = touchStartXRef.current.get(id);
    if (!touch || typeof startX !== 'number') return;
    const deltaX = touch.clientX - startX;
    const threshold = 30; // px
    let current = imageIndexRef.current.get(id) || 0;
    if (deltaX <= -threshold) {
      // swipe left -> next
      current = (current + 1) % images.length;
      // prevent triggering click after swipe
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    } else if (deltaX >= threshold) {
      // swipe right -> prev
      current = (current - 1 + images.length) % images.length;
      // prevent triggering click after swipe
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    } else {
      return; // ignore tiny moves
    }
    imageIndexRef.current.set(id, current);
    setImageStateVersion(v => v + 1);
  }, [getAllProductImages]);

  // Cleanup hover timers on unmount
  useEffect(() => {
    return () => {
      try {
        hoverTimerRef.current.forEach((intervalId) => clearInterval(intervalId));
        hoverTimerRef.current.clear();
      } catch (_) {}
    };
  }, []);

  // React Query: fetch products with debounced inputs
  const { data: productsData, isLoading, isFetching, isFetched, isSuccess, isError, error } = useProducts(
    debouncedCategory,
    debouncedSearch,
    currentPage,
    ITEMS_PER_PAGE
  );

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Debounce search/filter to reduce query churn
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedCategory(filterCategory);
      setCurrentPage(1);
    }, 500);
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [searchTerm, filterCategory]);

  // Restore product with confirmation
  const openRestoreConfirm = (product) => {
    if (!product || !product._id) {
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Mahsulot ma\'lumotlari to\'g\'ri emas');
      }, 0);
      return;
    }
    const title = 'Mahsulotni tiklash';
    const message = `"${product.name}" mahsuloti tiklansinmi?`;
    setSelectedProduct(product);
    showConfirm(title, message, () => restoreProduct(product._id), null, 'info');
  };

  const restoreProduct = async (id) => {
    if (!id) {
      setTimeout(() => {
        safeNotifyError('Xatolik', 'Mahsulot ID si topilmadi');
      }, 0);
      return;
    }
    try {
      await restoreProductMutate({ id });
      // If the product is in the current list, update its status locally
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isDeleted: false, status: 'active' } : p));
      setTimeout(() => {
        safeNotifySuccess('Tiklandi', 'Mahsulot muvaffaqiyatli tiklandi');
      }, 0);
      // Invalidate to keep pagination/count accurate
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    } catch (error) {
      console.error('Mahsulotni tiklashda xatolik:', error);
      setTimeout(() => {
        safeNotifyError('Xatolik', (error && error.message) ? error.message : 'Tiklash amalga oshmadi');
      }, 0);
    }
  };

  // Prefetch next page when available
  useEffect(() => {
    const p = productsData?.pagination;
    if (p?.hasNextPage) {
      const nextPage = (p.currentPage || currentPage) + 1;
      const key = queryKeys.products.list(debouncedCategory, debouncedSearch, nextPage, ITEMS_PER_PAGE);
      const params = new URLSearchParams({
        limit: String(ITEMS_PER_PAGE),
        page: String(nextPage),
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      if (debouncedCategory) params.append('category', debouncedCategory);
      if (debouncedSearch) params.append('search', debouncedSearch);
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: ({ signal }) => fetch(`http://localhost:5000/api/products?${params.toString()}`, { signal }).then(r => r.json()),
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [productsData, debouncedCategory, debouncedSearch, currentPage]);

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

    // Show confirmation modal before deletion
    showConfirm(
      'Mahsulotni o\'chirish',
      `"${product.name}" mahsulotini o'chirishni xohlaysizmi?`,
      () => deleteProduct(product._id),
      null, // onCancel callback - null means just close modal
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
      // Soft-delete via React Query mutation (backend marks isDeleted: true)
      await softDeleteProductMutate(id);

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
      notifyProductDeleted({ 
        _id: id, 
        name: productName, 
        price: productPrice 
      });
      
      // Show delete notification
      setDeleteNotificationMessage(`Mahsulot "${productName}" o'chirildi`);
      setShowDeleteNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowDeleteNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Mahsulot o\'chirishda xatolik:', error);
      
      // Tarmoq xatoligi uchun modal
      setTimeout(() => {
        safeNotifyError('Xatolik', (error && error.message) ? error.message : 'Server bilan bog\'lanishda xatolik yuz berdi');
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

    console.log(' Mahsulot saqlanmoqda...', selectedProduct ? 'Tahrirlash' : 'Yangi qo\'shish');
    console.log(' Form ma\'lumotlari:', formData);

    try {
      // For non-variant products, rely on images managed by SimpleProductForm's ImageUploader
      let allImages = formData.images || [];
      if (!formData.hasVariants) {
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

      console.log(' Yuborilayotgan ma\'lumotlar:', productData);

      // Use React Query mutations for automatic cache invalidation
      if (selectedProduct && selectedProduct._id) {
        // Update existing product using React Query mutation
        const updatedProduct = await updateProductMutation.mutateAsync({
          id: selectedProduct._id,
          ...productData
        });
        
        console.log('✅ Muvaffaqiyatli yangilandi:', updatedProduct);
        
        setTimeout(() => {
          safeNotifySuccess('Mahsulot yangilandi', `${productData.name} muvaffaqiyatli yangilandi`);
        }, 0);
      } else {
        // Create new product using React Query mutation
        const newProduct = await createProductMutation.mutateAsync(productData);
        
        console.log('✅ Muvaffaqiyatli qo\'shildi:', newProduct);
        
        setTimeout(() => {
          safeNotifySuccess('Mahsulot qo\'shildi', `${productData.name} muvaffaqiyatli qo\'shildi`);
          // Add to recent activities
          notifyProductAdded(newProduct);
        }, 0);
      }

      // Close modal after successful operation
      closeModal();
      
      // Refresh notifications and recent activities
      setTimeout(() => {
        // Invalidate notifications to show new notification
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        // Refresh recent activities to show new activity
        activitiesCache.refreshAll();
        // Reload categories to include new ones (if any)
        loadCategories();
      }, 300);

    } catch (error) {
      console.error('❌ Mahsulot saqlashda xatolik:', error);
      
      // Handle specific error types from React Query mutations
      if (error?.response?.status === 409 || error?.code === 'DUPLICATE_SLUG') {
        setTimeout(() => {
          safeNotifyError('Slug xatosi', "Slug allaqachon mavjud. Iltimos mahsulot nomini o'zgartiring.");
        }, 0);
        // Keep modal open so user can adjust the name and resubmit
        return;
      } else if (error?.response?.status === 400) {
        setTimeout(() => {
          safeNotifyError('Xatolik', "Yaroqsiz ma'lumotlar");
        }, 0);
        return;
      } else {
        setTimeout(() => {
          safeNotifyError('Xatolik', 'Mahsulot saqlanmadi');
        }, 0);
      }
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
    if (debounceTimeoutRef.current) {
      console.log('🧹 Clear: timeout tozalandi');
      clearTimeout(debounceTimeoutRef.current);
    }
  };

  // ... (rest of the code remains the same)

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

  // Derive products and pagination from query
  const queriedProducts = productsData?.products || [];
  useEffect(() => {
    setProducts(queriedProducts);
    const p = productsData?.pagination;
    setTotalPages(p?.totalPages || 1);
    setTotalCount(p?.totalCount || productsData?.totalCount || 0);
  }, [productsData]);

  const loading = isLoading;
  const showSkeleton = loading || (isFetching && (products?.length || 0) === 0);
  const showEmpty = !loading && !isFetching && isSuccess && (products?.length || 0) === 0;

  return (
  <div className="min-h-screen bg-gray-50">
    <style>{`
      /* Notification animations */
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .notification-enter {
        animation: slideInRight 0.3s ease-out;
      }
      
      .notification-exit {
        animation: slideOutRight 0.3s ease-in;
      }
    `}</style>
    {/* Main Content */}
    <main className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Top Bar: Title + Notification Bell (no mobile menu) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-primary-dark">Mahsulotlar</h2>
        <div className="flex items-center">
          <AdminNotificationBell 
            notifications={realNotifications} 
            setNotifications={setRealNotifications}
            markAllAsRead={markAllAsRead}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
            deleteAllNotifications={deleteAllNotifications}
          />
        </div>
      </div>

      {/* Mobile-only divider under header */}
      <div className="sm:hidden border-b border-gray-200 mb-3"></div>

      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full">
          {/* Search - first row full width on mobile */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Mahsulot qidirish..."
              value={searchTerm}
              onChange={e => {
                const value = e.target.value;
                handleSearchChange(value);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  console.log('🔍 Enter bosildi, qidiruv boshlandi');
                  if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                  }
                  // Immediately apply debounced values and reset to page 1
                  setDebouncedSearch(searchTerm);
                  setDebouncedCategory(filterCategory);
                  setCurrentPage(1);
                  // Trigger React Query to refetch with updated params
                  queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
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
          {/* Row 2 on mobile: Category + Add button in one row */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={e => {
                const value = e.target.value;
                handleFilterChange(value);
              }}
              className="custom-select flex-1"
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
              className="bg-primary-orange text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300 whitespace-nowrap"
            >
              <i className="fas fa-plus mr-2"></i>Yangi mahsulot
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mb-6">
        {showSkeleton ? (
          <div className="col-span-full">
            <LoadingCard count={6} />
          </div>
        ) : showEmpty ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">Mahsulot topilmadi</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
                <div key={product._id || product.id} className="group bg-white rounded-lg shadow-md p-2 sm:p-2.5 md:p-3 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-gray-200 hover:border-orange-200 relative h-full flex flex-col">
                  {/* Product Image */}
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-lg mb-2 sm:mb-3 border border-gray-100 bg-white h-44 sm:h-52 lg:h-60"
                    onClick={() => openViewModal(product)}
                    onMouseEnter={() => startHoverSlideshow(product)}
                    onMouseLeave={() => { stopHoverSlideshow(product); }}
                    onTouchStart={(e) => handleTouchStartOnImage(product, e)}
                    onTouchEnd={(e) => handleTouchEndOnImage(product, e)}
                  >
                    {(function(){ const imgs = getAllProductImages(product); return imgs && imgs.length > 0; })() ? (
                      <img 
                        src={(function(){ const imgs = getAllProductImages(product); const id = product?._id || product?.id; const idx = (id && imageIndexRef.current.get(id)) || 0; return imgs[idx] || imgs[0]; })()} 
                        alt={product.name}
                        className="w-full h-full object-contain p-2 bg-white transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r ${getAvatarGradient(product.name)}`}>
                        <span className="text-white text-2xl font-bold">{getProductInitials(product.name)}</span>
                      </div>
                    )}
                    {product.badge && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-primary-orange text-white text-xs px-2 py-1 rounded-full">
                          {product.badge}
                        </span>
                      </div>
                    )}
                    {product.oldPrice && product.oldPrice > product.price && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStockStatus(product.stock).class}`}>
                        {getStockStatus(product.stock).text}
                      </span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex flex-col flex-1">
                    <div className="mb-2">
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 leading-tight hover:text-primary-orange transition-colors duration-200 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                    </div>
                    {product.description && (
                      <div className="bg-slate-50 p-2 rounded border-l-2 border-slate-200 mb-3">
                        <p className="text-slate-600 text-[11px] sm:text-xs leading-snug line-clamp-2 m-0">{product.description}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold text-primary-orange">{formatCurrency(product.price)}</span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="text-xs sm:text-sm text-gray-400 line-through">{formatCurrency(product.oldPrice)}</span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{product.stock} {product.unit}</span>
                    </div>
                    <div className="mt-auto flex gap-1.5 pt-2">
                      <button 
                        onClick={() => openViewModal(product)}
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 px-1 rounded-md font-medium transition-colors duration-200 flex items-center justify-center border border-green-200"
                        title="Ko'rish"
                        aria-label="Ko'rish"
                      >
                        <i className="fas fa-eye text-green-600 text-sm"></i>
                        <span className="hidden sm:inline ml-1 text-xs">Ko'rish</span>
                      </button>
                      <button 
                        onClick={() => openEditModal(product)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-1 rounded-md font-medium transition-colors duration-200 flex items-center justify-center border border-blue-200"
                        title="Tahrirlash"
                        aria-label="Tahrirlash"
                      >
                        <i className="fas fa-edit text-blue-600 text-sm"></i>
                        <span className="hidden sm:inline ml-1 text-xs">Tahrir</span>
                      </button>
                      {(product?.isDeleted || product?.status === 'inactive') && (
                        <button 
                          onClick={() => openRestoreConfirm(product)}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 px-1 rounded-md font-medium transition-colors duration-200 flex items-center justify-center border border-green-200"
                          title="Tiklash"
                          aria-label="Tiklash"
                        >
                          <i className="fas fa-rotate-left text-green-600 text-sm"></i>
                          <span className="hidden sm:inline ml-1 text-xs">Tiklash</span>
                        </button>
                      )}
                      <button 
                        onClick={() => openDeleteConfirm(product)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-1 rounded-md font-medium transition-colors duration-200 flex items-center justify-center border border-red-200"
                        title="O'chirish"
                        aria-label="O'chirish"
                      >
                        <i className="fas fa-trash text-red-600 text-sm"></i>
                        <span className="hidden sm:inline ml-1 text-xs">O'chir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm flex-nowrap">
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {totalCount} ta mahsulotdan {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} tasi ko'rsatilmoqda
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => changePage('prev')}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <i className="fas fa-chevron-left mr-1"></i>
                <span className="hidden sm:inline">Oldingi</span>
              </button>
              <span className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap shrink-0 text-center inline-flex items-center gap-1">
                <span>{currentPage}</span>
                <span>/</span>
                <span>{totalPages}</span>
              </span>
              <button
                onClick={() => changePage('next')}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <span className="hidden sm:inline mr-1">Keyingi</span>
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
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-lg z-20">
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
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-lg z-20">
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
              
              <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 z-10">
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
