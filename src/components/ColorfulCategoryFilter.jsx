import React from 'react';
import { ADMIN_CATEGORIES } from '../utils/categoryMapping';

const ColorfulCategoryFilter = ({ selectedCategory, onCategorySelect, className = "" }) => {
  const handleCategoryClick = (category) => {
    onCategorySelect(category === selectedCategory ? '' : category);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Category List - Clean underline style */}
      <ul className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start list-none p-0 m-0">
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
          
          // Define text colors for each category (no backgrounds)
          const getCategoryColors = (cat) => {
            switch(cat) {
              case "Elektrika":
                return {
                  active: "text-yellow-600 border-yellow-600",
                  hover: "hover:text-yellow-600 hover:border-yellow-600"
                };
              case "Xoz-Mag":
                return {
                  active: "text-green-600 border-green-600",
                  hover: "hover:text-green-600 hover:border-green-600"
                };
              case "Yevro-Remont":
                return {
                  active: "text-blue-600 border-blue-600",
                  hover: "hover:text-blue-600 hover:border-blue-600"
                };
              case "Santexnika":
                return {
                  active: "text-cyan-600 border-cyan-600",
                  hover: "hover:text-cyan-600 hover:border-cyan-600"
                };
              case "Dekorativ-Mahsulotlar":
                return {
                  active: "text-pink-600 border-pink-600",
                  hover: "hover:text-pink-600 hover:border-pink-600"
                };
              default:
                return {
                  active: "text-gray-600 border-gray-600",
                  hover: "hover:text-gray-600 hover:border-gray-600"
                };
            }
          };

          const colors = getCategoryColors(category);
          
          return (
            <li key={category} className="category">
              <a
                onClick={() => handleCategoryClick(category)}
                className={`
                  ui-link category__body cursor-pointer inline-block px-2 py-3 font-medium text-sm transition-all duration-300 border-b-2 hover:pb-2
                  ${isSelected 
                    ? `active-link exact-active-link ${colors.active}` 
                    : `text-gray-600 border-transparent ${colors.hover}`
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
  );
};

export default ColorfulCategoryFilter;
