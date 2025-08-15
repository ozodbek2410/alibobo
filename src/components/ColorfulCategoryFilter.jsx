import React from 'react';
import { ADMIN_CATEGORIES } from '../utils/categoryMapping';

const ColorfulCategoryFilter = ({ selectedCategory, onCategorySelect, className = "" }) => {
  const handleCategoryClick = (category) => {
    onCategorySelect(category === selectedCategory ? '' : category);
  };

  return (
    <div className={`w-full ${className}`}>
        {/* Category List - Clean underline style with horizontal scroll */}
        <div className="overflow-x-auto scrollbar-hide">
          <ul className="flex gap-4 sm:gap-6 justify-start list-none p-0 m-0 whitespace-nowrap min-w-max">
          {/* All Categories Item */}
          <li className="category">
            <a
              onClick={() => onCategorySelect('')}
              className={`
                ui-link category__body cursor-pointer inline-block px-2 py-3 font-medium text-sm transition-all duration-300 border-b-2 hover:pb-2
                ${!selectedCategory || selectedCategory === '' 
                  ? 'active-link exact-active-link text-primary-orange border-primary-orange' 
                  : 'text-gray-600 border-transparent hover:text-primary-orange hover:border-primary-orange'
                }
              `}
            >
              Barchasi
            </a>
          </li>

          {/* Category Items */}
          {ADMIN_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            
            return (
              <li key={category} className="category">
                <a
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    ui-link category__body cursor-pointer inline-block px-2 py-3 font-medium text-sm transition-all duration-300 border-b-2 hover:pb-2
                    ${isSelected 
                      ? 'active-link exact-active-link text-primary-orange border-primary-orange' 
                      : 'text-gray-600 border-transparent hover:text-primary-orange hover:border-primary-orange'
                    }
                  `}
                >
                {/* Show short names on mobile, full names on desktop */}
                <span className="hidden sm:inline">
                  {category.replace(/'/g, "'")}
                </span>
                <span className="sm:hidden">
                  {category === "Xoz-Mag" ? "Xoz-Mag" :
                   category === "Yevro-Remont" ? "Yevro" :
                   category === "Elektrika" ? "Elektr" :
                   category === "Santexnika" ? "Santex" :
                   category === "Dekorativ-Mahsulotlar" ? "Dekor" :
                   category}
                </span>
                </a>
              </li>
            );
          })}
          </ul>
        </div>
      </div>
  );
};

export default ColorfulCategoryFilter;
