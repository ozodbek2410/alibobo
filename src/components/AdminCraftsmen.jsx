import React, { useState, useEffect, useCallback } from 'react';
import AdminNotificationBell from './AdminNotificationBell';
import AdminNotificationModals from './AdminNotificationModals';
import LoadingSpinner from './LoadingSpinner';
import LoadingCard from './LoadingCard';
import useNotifications from '../hooks/useNotifications';

const AdminCraftsmen = ({ onCountChange, onMobileToggle }) => {
  // Use notification system
  const {
    notifications,
    setNotifications,
    alertModal,
    confirmModal,
    promptModal,
    closeAlert,
    handleConfirmResponse,
    handlePromptResponse,
    showAlert,
    showConfirm,
    notifySuccess,
    notifyError,
    notifyCraftsmanAdded,
    notifyCraftsmanDeleted
  } = useNotifications();

  // Safe notification handlers to prevent setState during render
  const safeNotifySuccess = useCallback((message) => {
    setTimeout(() => notifySuccess(message), 0);
  }, [notifySuccess]);

  const safeNotifyError = useCallback((message) => {
    setTimeout(() => notifyError(message), 0);
  }, [notifyError]);

  const safeNotifyCraftsmanAdded = useCallback((name, specialty) => {
    setTimeout(() => notifyCraftsmanAdded(name, specialty), 0);
  }, [notifyCraftsmanAdded]);

  const safeNotifyCraftsmanDeleted = useCallback((name, specialty) => {
    setTimeout(() => notifyCraftsmanDeleted(name, specialty), 0);
  }, [notifyCraftsmanDeleted]);
  const [craftsmen, setCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('joinDate');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Component states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCraftsman, setSelectedCraftsman] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    customSpecialty: '',
    price: '',
    status: 'active',
    description: '',
    portfolio: []
  });
  const [showCustomSpecialty, setShowCustomSpecialty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const specialties = [
    "Barcha mutaxassisliklar",
    "Elektrik",
    "Santexnik",
    "Quruvchi",
    "Duradgor",
    "Plitka yotqizuvchi",
    "Suv o'tkazgich",
    "Elektr o'tkazgich",
    "Betonchi",
    "Temirchi",
    "Shamol o'tkazgich",
    "Gaz o'tkazgich",
    "Konditsioner o'rnatuvchi",
    "Lift o'rnatuvchi",
    "Xavfsizlik tizimi o'rnatuvchi",
    "Aloqa tizimi o'rnatuvchi",
    "Maishiy texnika o'rnatuvchi",
    "Oshxona jihozlari o'rnatuvchi",
    "Hammom jihozlari o'rnatuvchi",
    "Dekorativ ishlar ustasi",
    "Rang beruvchi",
    "Parket yotqizuvchi",
    "Laminat yotqizuvchi",
    "Mozaika yotqizuvchi",
    "Shisha o'rnatuvchi",
    "Metall konstruksiya ustasi",
    "Yog'och ishlari ustasi",
    "Boshqa"
  ];

  const statusMap = {
    active: { text: 'Faol', class: 'bg-green-100 text-green-800' },
    inactive: { text: 'Faol emas', class: 'bg-red-100 text-red-800' }
  };

  // Load craftsmen from MongoDB
  const loadCraftsmen = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        specialty: filterSpecialty,
        sortBy: sortField,
        sortOrder: sortDirection
      });

      const response = await fetch(`http://localhost:5000/api/craftsmen?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCraftsmen(data.craftsmen);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        if (onCountChange) {
          onCountChange(data.totalCount);
        }
      } else {
        throw new Error(data.message || 'Ustalar yuklanmadi');
      }
    } catch (error) {
      safeNotifyError('Ustalar yuklanmadi');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterSpecialty, sortField, sortDirection, onCountChange]);

  useEffect(() => {
    loadCraftsmen();
  }, [loadCraftsmen]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isModalOpen || isViewModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen, isViewModalOpen]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openAddModal = () => {
    setSelectedCraftsman(null);
    setFormData({
      name: '',
      phone: '',
      specialty: '',
      customSpecialty: '',
      price: '',
      status: 'active',
      description: '',
      portfolio: []
    });
    setShowCustomSpecialty(false);
    setIsModalOpen(true);
  };

  const openEditModal = (craftsman) => {
    console.log('🔍 Tahrirlash uchun usta ma\'lumotlari:', JSON.stringify(craftsman, null, 2));
    setSelectedCraftsman(craftsman);
    
    // Check if specialty is in the predefined list
    const predefinedSpecialties = specialties.slice(1);
    const isPredefinedSpecialty = predefinedSpecialties.includes(craftsman.specialty);
    
    const formDataToSet = {
      name: craftsman.name || '',
      phone: craftsman.phone || '',
      specialty: isPredefinedSpecialty ? craftsman.specialty : 'Boshqa',
      customSpecialty: isPredefinedSpecialty ? '' : (craftsman.specialty || ''),
      price: craftsman.price ? craftsman.price.toString() : '',
      status: craftsman.status || 'active',
      description: craftsman.description || '',
      portfolio: craftsman.portfolio || []
    };
    
    console.log('📝 Form ma\'lumotlari:', JSON.stringify(formDataToSet, null, 2));
    console.log('🔍 Mutaxassislik tekshiruv:', {
      specialty: craftsman.specialty,
      isPredefined: isPredefinedSpecialty,
      predefinedList: predefinedSpecialties
    });
    
    setFormData(formDataToSet);
    setShowCustomSpecialty(!isPredefinedSpecialty);
    setIsModalOpen(true);
  };

  const openViewModal = (craftsman) => {
    setSelectedCraftsman(craftsman);
    setIsViewModalOpen(true);
  };

  const openDeleteConfirm = (craftsman) => {
    if (!craftsman || !craftsman._id) {
      safeNotifyError('Usta ma\'lumotlari to\'g\'ri emas');
      return;
    }

    showConfirm(
      'Ustani o\'chirish',
      `"${craftsman.name}" ni o'chirishni xohlaysizmi?`,
      () => deleteCraftsman(craftsman._id),
      null, // onCancel callback - null means just close modal
      'danger'
    );
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCraftsman(null);
    setFormData({
      name: '',
      phone: '',
      specialty: '',
      customSpecialty: '',
      price: '',
      status: 'active',
      description: '',
      portfolio: []
    });
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('🔄 Input changed:', name, '=', value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('📝 Updated form data:', newData);
      return newData;
    });

    if (name === 'specialty' && value === 'Boshqa') {
      setShowCustomSpecialty(true);
    } else if (name === 'specialty') {
      setShowCustomSpecialty(false);
    }
  };

  const handlePortfolioChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Convert files to base64 for preview and storage
    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(filePromises).then(results => {
      setFormData(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, ...results]
      }));
      
      // Clear the file input
      e.target.value = '';
      
      // Show success message
      console.log(`${results.length} ta rasm qo'shildi`);
    }).catch(error => {
      console.error('Rasm yuklashda xatolik:', error);
      safeNotifyError('Rasmlarni yuklashda xatolik yuz berdi');
    });
  };

  const removePortfolioImage = (index) => {
    console.log(`Rasm olib tashlanmoqda: ${index}`);
    setFormData(prev => {
      const newPortfolio = prev.portfolio.filter((_, i) => i !== index);
      console.log(`Yangi portfolio uzunligi: ${newPortfolio.length}`);
      return {
        ...prev,
        portfolio: newPortfolio
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Test backend connection first
      try {
        const testResponse = await fetch('http://localhost:5000/api/craftsmen', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!testResponse.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (error) {
        console.error('❌ Backend connection failed:', error);
        safeNotifyError('Backend server ishlamayapti. Server ni ishga tushiring.');
        setIsSubmitting(false);
        return;
      }

      const craftsmanData = {
        name: formData.name,
        phone: formData.phone,
        specialty: showCustomSpecialty ? formData.customSpecialty : formData.specialty,
        price: Number(formData.price),
        status: formData.status,
        description: formData.description,
        portfolio: formData.portfolio
      };

      console.log('📤 Yuborilayotgan ma\'lumotlar:', JSON.stringify(craftsmanData, null, 2));

      const url = selectedCraftsman 
        ? `http://localhost:5000/api/craftsmen/${selectedCraftsman._id}`
        : 'http://localhost:5000/api/craftsmen';
      
      const method = selectedCraftsman ? 'PUT' : 'POST';

      console.log('🌐 URL:', url, 'Method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(craftsmanData),
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📥 Response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        if (selectedCraftsman) {
          // Tahrirlash - local state ni yangilash
          console.log('🔄 Local state yangilanmoqda...', JSON.stringify(data, null, 2));
          setCraftsmen(prevCraftsmen => 
            prevCraftsmen.map(craftsman => 
              craftsman._id === selectedCraftsman._id 
                ? { ...craftsman, ...data }
                : craftsman
            )
          );
          console.log('✅ Local state yangilandi');
        } else {
          // Yangi qo'shish - local state ga qo'shish
          setCraftsmen(prevCraftsmen => [...prevCraftsmen, data]);
          setTotalCount(prev => {
            const newCount = prev + 1;
            // Prevent setState during render by deferring onCountChange
            if (onCountChange) {
              setTimeout(() => {
                onCountChange(newCount);
              }, 0);
            }
            return newCount;
          });
        }

        // Reload craftsmen data to ensure persistence
        await loadCraftsmen();

        // Trigger appropriate notification after state update
        if (selectedCraftsman) {
          safeNotifySuccess('Usta muvaffaqiyatli tahrirlandi');
        } else {
          safeNotifyCraftsmanAdded(craftsmanData.name, craftsmanData.specialty);
        }
        closeModal();
      } else {
        // Har qanday xatolik (404 ham) haqiqiy xatolik
        const errorMessage = data.message || `Server xatoligi: ${response.status}`;
        console.error('❌ Xatolik:', errorMessage);
        safeNotifyError(errorMessage);
        closeModal();
      }
    } catch (error) {
      console.error('Craftsman saqlashda xatolik:', error);
      safeNotifyError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCraftsman = async (id) => {
    if (!id) {
      safeNotifyError('Usta ID si topilmadi');
      return;
    }

    // Find craftsman details before deletion for notification
    const craftsmanToDelete = craftsmen.find(craftsman => craftsman._id === id);
    const craftsmanName = craftsmanToDelete?.name || 'Noma\'lum usta';
    const craftsmanSpecialty = craftsmanToDelete?.specialty || 'Noma\'lum mutaxassislik';

    try {
      const response = await fetch(`http://localhost:5000/api/craftsmen/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Muvaffaqiyatli o'chirish
        setCraftsmen(prevCraftsmen => prevCraftsmen.filter(craftsman => craftsman._id !== id));
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
        
        // Show deletion notification with craftsman details
        safeNotifyCraftsmanDeleted(craftsmanName, craftsmanSpecialty);
      } else {
        // Har qanday xatolik (404 ham) haqiqiy xatolik
        const data = await response.json();
        const errorMessage = data.message || `Server xatoligi: ${response.status}`;
        
        // Local state ni yangilash (agar usta mavjud bo'lsa)
        setCraftsmen(prevCraftsmen => prevCraftsmen.filter(craftsman => craftsman._id !== id));
        
        // Xatolik xabarini ko'rsatish
        safeNotifyError(errorMessage);
      }
    } catch (error) {
      console.error('Craftsman o\'chirishda xatolik:', error);
      
      // Tarmoq xatoligi bo'lsa ham local state ni yangilash
      setCraftsmen(prevCraftsmen => prevCraftsmen.filter(craftsman => craftsman._id !== id));
      
      // Tarmoq xatoligi uchun notification
      safeNotifyError('Server bilan bog\'lanishda xatolik yuz berdi');
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCraftsmanInitials = (name) => {
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

  const formatCurrency = (price) => {
    if (!price || isNaN(price)) return "0 so'm/soat";
    return price.toLocaleString() + " so'm/soat";
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Sana formatlashda xatolik:', error);
      return date;
    }
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getNotificationIcon = (type) => {
    const iconConfig = {
      'success': { bg: 'bg-green-100', icon: 'fas fa-check-circle', color: 'text-green-600' },
      'error': { bg: 'bg-red-100', icon: 'fas fa-times-circle', color: 'text-red-600' },
      'info': { bg: 'bg-blue-100', icon: 'fas fa-info-circle', color: 'text-blue-600' },
      'order': { bg: 'bg-orange-100', icon: 'fas fa-shopping-cart', color: 'text-orange-600' },
      'stock': { bg: 'bg-yellow-100', icon: 'fas fa-exclamation-triangle', color: 'text-yellow-600' },
      'user': { bg: 'bg-purple-100', icon: 'fas fa-user-plus', color: 'text-purple-600' }
    };
    return iconConfig[type] || iconConfig.info;
  };

  const removeExistingPortfolioImage = (index) => {
    setSelectedCraftsman(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Top Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0 z-20">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={onMobileToggle}
              className="lg:hidden text-gray-600 p-1"
            >
              <i className="fas fa-bars text-lg sm:text-xl"></i>
            </button>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-dark">Ustalar</h2>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <AdminNotificationBell notifications={notifications} setNotifications={setNotifications} />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex flex-col ">
        <div className="p-3 sm:p-4 lg:p-6 flex flex-col max-w-7xl mx-auto w-full">
          {/* Fixed controls section */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-4 lg:space-y-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-dark">Ustalar</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Usta qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange w-full sm:w-48 lg:w-64 text-sm sm:text-base"
                />
                <i className="fas fa-search absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              </div>
              {/* Specialty Filter */}
              <select 
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange text-sm sm:text-base"
              >
                <option value="">Barcha mutaxassisliklar</option>
                {specialties.slice(1).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button 
                onClick={openAddModal}
                className="bg-primary-orange text-white px-3 sm:px-4 lg:px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300 whitespace-nowrap text-sm sm:text-base"
              >
                <i className="fas fa-plus mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Yangi usta</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>

          {/* Table container - only this scrolls horizontally */}
          <div className="bg-white rounded-xl shadow-sm">
            {/* Table wrapper with horizontal scroll */}
            <div className="overflow-x-auto scrollbar-hide">
              {loading ? (
                <div className="p-3 sm:p-6">
                  <LoadingCard count={5} type="craftsman" />
                </div>
              ) : (
                <table className="min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                        onClick={() => handleSort('name')}
                      >
                        <span className="hidden sm:inline">Usta</span>
                        <span className="sm:hidden">Usta</span>
                        <i className="fas fa-sort ml-1"></i>
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">
                        <span className="hidden sm:inline">Mutaxassislik</span>
                        <span className="sm:hidden">Kasb</span>
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">
                        <span className="hidden sm:inline">Telefon</span>
                        <span className="sm:hidden">Tel</span>
                      </th>
                      <th 
                        className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                        onClick={() => handleSort('price')}
                      >
                        <span className="hidden sm:inline">Narx</span>
                        <span className="sm:hidden">Narx</span>
                        <i className="fas fa-sort ml-1"></i>
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 font-medium text-sm sm:text-base whitespace-nowrap">
                        <span className="hidden lg:inline">Tavsif</span>
                        <span className="lg:hidden">Tavsif</span>
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="hidden sm:inline">Status</span>
                        <span className="sm:hidden">Status</span>
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="hidden sm:inline">Amallar</span>
                        <span className="sm:hidden">Amal</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                      {craftsmen.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-primary-orange rounded-full flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-gray-100 flex-shrink-0">
                              <i className="fas fa-user text-white text-sm sm:text-base lg:text-xl"></i>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-800 text-sm sm:text-base hover:text-primary-orange transition-colors cursor-pointer truncate">{c.name}</div>
                              <div className="text-xs sm:text-sm text-gray-500 flex items-center mt-0.5">
                                <i className="fas fa-calendar-alt text-xs mr-1 sm:mr-1.5 text-gray-400 flex-shrink-0"></i>
                                  <span className="whitespace-nowrap">{formatDate(c.joinDate)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="px-1 sm:px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full inline-block leading-tight max-w-full overflow-hidden text-ellipsis" title={c.specialty}>{c.specialty}</span>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-primary-orange whitespace-nowrap">
                          <a href={`tel:${c.phone}`} className="hover:underline text-sm sm:text-base truncate block">{c.phone}</a>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 font-medium text-sm sm:text-base whitespace-nowrap">
                          {c.price ? formatCurrency(c.price) : 'Narx belgilanmagan'}
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                          <div className="max-w-xs">
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2" title={c.description}>
                              {c.description || 'Tavsif mavjud emas'}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`status-badge ${statusMap[c.status]?.class || statusMap.active.class}`}>{statusMap[c.status]?.text || statusMap.active.text}</span>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex space-x-1 sm:space-x-2">
                            <button 
                              onClick={() => openViewModal(c)}
                              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50" 
                              title="Ko'rish"
                            >
                              <i className="fas fa-eye text-sm sm:text-base"></i>
                            </button>
                            <button 
                              onClick={() => openEditModal(c)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" 
                              title="Tahrirlash"
                            >
                              <i className="fas fa-edit text-sm sm:text-base"></i>
                            </button>
                            <button 
                              onClick={() => openDeleteConfirm(c)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" 
                              title="O'chirish"
                            >
                              <i className="fas fa-trash text-sm sm:text-base"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Fixed pagination section */}
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Ko'rsatilmoqda <span>{(currentPage - 1) * itemsPerPage + 1}</span> dan <span>{Math.min(currentPage * itemsPerPage, totalCount)}</span> gacha, jami <span>{totalCount}</span> ta
              </div>
              <div className="flex space-x-1 sm:space-x-2">
                <button 
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="pagination-btn px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left mr-1"></i>
                  <span className="hidden sm:inline">Oldingi</span>
                  <span className="sm:hidden">Old</span>
                </button>
                <button 
                  onClick={nextPage}
                  disabled={currentPage >= totalPages}
                  className="pagination-btn px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Keyingi</span>
                  <span className="sm:hidden">Key</span>
                  <i className="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 modal z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-xl max-w-lg w-full max-h-[96vh] sm:max-h-[92vh] overflow-y-auto m-1 sm:m-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-5 border-b flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-primary-dark">
                {selectedCraftsman ? 'Ustani tahrirlash' : 'Yangi usta qo\'shish'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-3 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ism *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon raqami *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange" 
                    placeholder="+998901234567"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mutaxassislik *</label>
                  <select 
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                  >
                    <option value="">Tanlang</option>
                    {specialties.slice(1).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                {showCustomSpecialty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Boshqa mutaxassislik</label>
                    <input 
                      type="text" 
                      name="customSpecialty"
                      value={formData.customSpecialty}
                      onChange={handleInputChange}
                      required={showCustomSpecialty}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                      placeholder="Mutaxassislikni kiriting..."
                    />
                  </div>
                )}
              </div>
                
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Narx (so'm/soat) *</label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required 
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                  >
                    <option value="active">Faol</option>
                    <option value="inactive">Faol emas</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tavsif</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                  placeholder="Usta haqida qisqacha ma'lumot..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                <input 
                  type="file" 
                  name="portfolio"
                  multiple
                  accept="image/*"
                  onChange={handlePortfolioChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
                />
                {formData.portfolio && formData.portfolio.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Yuklangan rasmlar ({formData.portfolio.length}):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formData.portfolio.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Portfolio ${index + 1}`} 
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button 
                            type="button"
                            onClick={() => removePortfolioImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saqlanmoqda...
                    </span>
                  ) : (
                    selectedCraftsman ? 'Tahrirlash' : 'Qo\'shish'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedCraftsman && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 modal z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-lg w-full max-h-[96vh] sm:max-h-[92vh] overflow-y-auto m-1 sm:m-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-5 border-b flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-primary-dark">Usta ma'lumotlari</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-3 sm:p-5 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center shadow-lg">
                  <i className="fas fa-user text-white text-2xl"></i>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedCraftsman.name}</h4>
                  <p className="text-gray-600">{selectedCraftsman.specialty}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <p className="text-gray-900">{selectedCraftsman.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Narx</label>
                  <p className="text-gray-900">{formatCurrency(selectedCraftsman.price)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`status-badge ${statusMap[selectedCraftsman.status]?.class || statusMap.active.class}`}>
                    {statusMap[selectedCraftsman.status]?.text || statusMap.active.text}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qo'shilgan sana</label>
                  <p className="text-gray-900">{formatDate(selectedCraftsman.joinDate)}</p>
                </div>
              </div>
              
              {selectedCraftsman.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                  <p className="text-gray-900">{selectedCraftsman.description}</p>
                </div>
              )}
              
              {selectedCraftsman.portfolio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCraftsman.portfolio.map((image, index) => (
                      <div key={index} className="relative">
                        <img src={image} alt="Portfolio image" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeExistingPortfolioImage(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times text-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Yopish
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedCraftsman);
                  }}
                  className="flex-1 px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 font-medium"
                >
                  Tahrirlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modals */}
      <AdminNotificationModals
        alertModal={alertModal}
        confirmModal={confirmModal}
        promptModal={promptModal}
        closeAlert={closeAlert}
        onConfirmResponse={handleConfirmResponse}
        onPromptResponse={handlePromptResponse}
      />
    </div>
  );
};

export default AdminCraftsmen;