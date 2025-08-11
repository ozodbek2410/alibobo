import React, { useState } from 'react';

const CategoryNavigation = ({ onCategorySelect, selectedCategory, isModalOpen, setIsModalOpen }) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  
  // Use external modal state if provided, otherwise use internal state
  const modalOpen = isModalOpen !== undefined ? isModalOpen : internalModalOpen;
  const setModalOpen = setIsModalOpen !== undefined ? setIsModalOpen : setInternalModalOpen;

  // Categories from admin panel - Main categories first
  const categories = [
    { name: "Santexnika", value: "santexnika", icon: "fas fa-faucet", hasProducts: true },
    { name: "Yevro remont", value: "yevro-remont", icon: "fas fa-home", hasProducts: true },
    { name: "Elektrika", value: "elektrika", icon: "fas fa-bolt", hasProducts: true },
    { name: "Xoz mag", value: "xoz-mag", icon: "fas fa-shopping-basket", hasProducts: true },
    { name: "Dekorativ mahsulotlar", value: "dekorativ-mahsulotlar", icon: "fas fa-palette", hasProducts: true },
    { name: "G'isht va bloklar", value: "g'isht-va-bloklar", icon: "fas fa-cube", hasProducts: true },
    { name: "Asbob-uskunalar", value: "asbob-uskunalar", icon: "fas fa-tools", hasProducts: true },
    { name: "Bo'yoq va lak", value: "bo'yoq-va-lak", icon: "fas fa-paint-brush", hasProducts: true },
    { name: "Elektr mollalari", value: "elektr-mollalari", icon: "fas fa-plug", hasProducts: true },
    { name: "Issiqlik va konditsioner", value: "issiqlik-va-konditsioner", icon: "fas fa-thermometer-half", hasProducts: true },
    { name: "Metall va armatura", value: "metall-va-armatura", icon: "fas fa-industry" },
    { name: "Yog'och va mebel", value: "yog'och-va-mebel", icon: "fas fa-tree" },
    { name: "Tom materiallar", value: "tom-materiallar", icon: "fas fa-home" },
    { name: "Temir-beton", value: "temir-beton", icon: "fas fa-building" },
    { name: "Gips va shpaklovka", value: "gips-va-shpaklovka", icon: "fas fa-trowel" },
    { name: "Boshqalar", value: "boshqalar", icon: "fas fa-ellipsis-h" }
  ];

  // Show first 7 categories with products in the horizontal bar
  const visibleCategories = categories.filter(category => category.hasProducts).slice(0, 7);
  const hasMoreCategories = categories.length > 7;

  const handleCategoryClick = (categoryValue) => {
    if (onCategorySelect) {
      onCategorySelect(categoryValue);
    }
    setModalOpen(false); // Close modal when category is selected
  };

  const handleAllProductsClick = () => {
    if (onCategorySelect) {
      onCategorySelect('');
    }
    setModalOpen(false); // Close modal when "All" is selected
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-lg hidden lg:block">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-1">
            {/* All Products Button */}
            <button
              onClick={handleAllProductsClick}
              className={`px-4 py-2 whitespace-nowrap transition-all duration-200 relative ${
                selectedCategory === '' 
                  ? 'text-primary-orange border-b-2 border-primary-orange' 
                  : 'text-gray-700 hover:text-primary-orange hover:border-b-2 hover:border-primary-orange'
              }`}
            >
              <span className="font-medium text-sm">Barchasi</span>
            </button>

            {/* Visible Category Buttons */}
            {visibleCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(category.value)}
                className={`px-4 py-2 whitespace-nowrap transition-all duration-200 relative ${
                  selectedCategory === category.value 
                    ? 'text-primary-orange border-b-2 border-primary-orange' 
                    : 'text-gray-700 hover:text-primary-orange hover:border-b-2 hover:border-primary-orange'
                }`}
              >
                <span className="font-medium text-sm">{category.name}</span>
              </button>
            ))}

            </div>
            
            {/* Yana (More) Button */}
            {hasMoreCategories && (
              <button
                onClick={openModal}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-primary-orange border border-gray-300"
              >
                <i className="fas fa-ellipsis-h text-sm"></i>
                <span className="font-medium text-sm">Yana</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Barcha kategoriyalar</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* All Products Button */}
              <div className="mb-6">
                <button
                  onClick={handleAllProductsClick}
                  className={`flex items-center space-x-3 p-4 rounded-lg w-full text-left transition-all duration-200 ${
                    selectedCategory === '' 
                      ? 'bg-primary-orange text-white shadow-md' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-primary-orange'
                  }`}
                >
                  <i className="fas fa-th-large text-lg"></i>
                  <span className="font-medium">Barcha mahsulotlar</span>
                </button>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category.value)}
                    className={`flex items-center space-x-3 p-4 rounded-lg text-left transition-all duration-200 ${
                      selectedCategory === category.value 
                        ? 'bg-primary-orange text-white shadow-md' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-primary-orange'
                    }`}
                  >
                    <i className={`${category.icon} text-lg`}></i>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryNavigation;
