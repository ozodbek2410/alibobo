import React, { useState } from 'react';
import CategoryNavigation from './CategoryNavigation';
import Catalog from './Catalog';

const CategorySection = ({ onCategorySelect, selectedCategory }) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  return (
    <>
      {/* Category Navigation - Desktop Only */}
      <CategoryNavigation 
        onCategorySelect={onCategorySelect}
        selectedCategory={selectedCategory}
        isModalOpen={isCategoryModalOpen}
        setIsModalOpen={setIsCategoryModalOpen}
      />

      {/* Mobile Category Navigation - Show below header */}
      <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* All Products Button */}
            <button
              onClick={() => onCategorySelect('')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-primary-orange text-white border-primary-orange shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-orange'
              }`}
            >
              🏠 Barchasi
            </button>
            
            {/* Category Buttons */}
            {[
              { name: "Santexnika", value: "santexnika" },
              { name: "Yevro-Remont", value: "yevro-remont" },
              { name: "Elektrika", value: "elektrika" },
              { name: "Xoz-Mag", value: "xoz-mag" },
              { name: "Dekorativ", value: "dekorativ-mahsulotlar" }
            ].map((category) => (
              <button
                key={category.value}
                onClick={() => onCategorySelect(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.value
                    ? 'bg-primary-orange text-white border-primary-orange shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-orange'
                }`}
                title={category.name}
              >
                {category.name}
              </button>
            ))}
            
            {/* More Button */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 rounded-full text-sm font-medium border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-orange whitespace-nowrap"
            >
              📂 Yana...
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Modal */}
      {isCategoryModalOpen && (
        <Catalog
          onCategorySelect={onCategorySelect}
          onClose={() => setIsCategoryModalOpen(false)}
          selectedCategory={selectedCategory}
        />
      )}
    </>
  );
};

export default CategorySection;