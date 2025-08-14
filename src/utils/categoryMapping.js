// Category mapping utility for consistent category display across the app

// Admin panel canonical categories
export const ADMIN_CATEGORIES = [
  "Xoz-Mag",
  "Yevro-Remont",
  "Elektrika",
  "Dekorativ-Mahsulotlar",
  "Santexnika",
];

// Mapping from database/API values to admin panel display names
export const CATEGORY_MAPPING = {
  // Full category names
  "xoz-mag": "Xoz-Mag",
  "yevro-remont": "Yevro-Remont",
  "elektrika": "Elektrika",
  "dekorativ-mahsulotlar": "Dekorativ-Mahsulotlar",
  "santexnika": "Santexnika",
  

  
  // Short/variant category names
  "xoz": "Xoz-Mag",
  "mag": "Xoz-Mag",
  "yevro": "Yevro-Remont",
  "remont": "Yevro-Remont",
  "dekorativ": "Dekorativ-Mahsulotlar",
   "santexnik" : "Santexnika",
};

// Function to get display name for a category
export const getCategoryDisplayName = (category) => {
  if (!category) return 'Boshqalar';
  return CATEGORY_MAPPING[category.toLowerCase()] || CATEGORY_MAPPING[category] || category;
};

// Function to get database value from display name
export const getCategoryDatabaseValue = (displayName) => {
  const entry = Object.entries(CATEGORY_MAPPING).find(([key, value]) => value === displayName);
  return entry ? entry[0] : displayName;
};

// Function to check if a category is valid
export const isValidCategory = (category) => {
  return ADMIN_CATEGORIES.includes(category) || Object.keys(CATEGORY_MAPPING).includes(category);
};
