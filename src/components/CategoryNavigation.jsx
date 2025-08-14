import React from 'react';

const CategoryNavigation = ({ 
  categories = [], 
  selectedCategory = '', 
  onCategorySelect,
  className = '',
  isDesktop = false
}) => {
  // Top 5 categories for desktop, all categories for mobile
  const allCategories = [
    { id: 'all', name: '', displayName: 'Hammasi', icon: 'fas fa-th-large' },
    { id: 'xoz-mag', name: 'xoz-mag', displayName: 'Xo\'z-mag', icon: 'fas fa-home' },
    { id: 'yevro-remont', name: 'yevro-remont', displayName: 'Yevro remont', icon: 'fas fa-tools' },
    { id: 'elektrika', name: 'elektrika', displayName: 'Elektrika', icon: 'fas fa-bolt' },
    { id: 'dekorativ-mahsulotlar', name: 'dekorativ-mahsulotlar', displayName: 'Dekorativ', icon: 'fas fa-paint-brush' },
    { id: 'santexnika', name: 'santexnika', displayName: 'Santexnika', icon: 'fas fa-faucet' },
  ];

  // Desktop: faqat 5 ta asosiy kategoriya, Mobile: barcha kategoriyalar
  const categoriesToUse = categories.length > 0 
    ? categories 
    : isDesktop 
      ? allCategories // Hammasi + 5 ta asosiy kategoriya
      : allCategories;

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category.name);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Horizontal scrollable container */}
      <div className={`overflow-x-auto scrollbar-hide ${isDesktop ? 'lg:overflow-x-visible' : ''}`}>
        <div className={`flex gap-2 px-0 py-2 ${isDesktop ? 'lg:justify-start lg:px-0 lg:gap-3' : 'min-w-max'}`}>
          {categoriesToUse.map((category) => {
            const isSelected = selectedCategory === category.name || 
                             (selectedCategory === '' && category.id === 'all');
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                  whitespace-nowrap transition-all duration-200 min-h-[36px]
                  ${isSelected 
                    ? 'bg-primary-orange text-white shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-primary-orange'
                  }
                `}
              >
                <i className={`${category.icon} text-sm`}></i>
                <span>{category.displayName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;