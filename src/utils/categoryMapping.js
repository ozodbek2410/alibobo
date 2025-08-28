// Category mapping utility for consistent category display across the app

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
