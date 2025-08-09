// Category mapping utility for consistent category display across the app

// Admin panel canonical categories
export const ADMIN_CATEGORIES = [
  "G'isht va bloklar",
  "Asbob-uskunalar", 
  "Bo'yoq va lak",
  "Elektr mollalari",
  "Metall va armatura",
  "Yog'och va mebel",
  "Tom materiallar",
  "Santexnika",
  "Issiqlik va konditsioner",
  "Dekor va bezatish",
  "Temir-beton",
  "Gips va shpaklovka",
  "Boshqalar"
];

// Mapping from database/API values to admin panel display names
export const CATEGORY_MAPPING = {
  // Full category names
  "g'isht-va-bloklar": "G'isht va bloklar",
  "asbob-uskunalar": "Asbob-uskunalar", 
  "bo'yoq-va-lak": "Bo'yoq va lak",
  "elektr-mollalari": "Elektr mollalari",
  "metall-va-armatura": "Metall va armatura",
  "yog'och-va-mebel": "Yog'och va mebel",
  "tom-materiallar": "Tom materiallar",
  "santexnika": "Santexnika",
  "issiqlik-va-konditsioner": "Issiqlik va konditsioner",
  "dekor-va-bezatish": "Dekor va bezatish",
  "temir-beton": "Temir-beton",
  "gips-va-shpaklovka": "Gips va shpaklovka",
  "boshqalar": "Boshqalar",
  
  // Short/variant category names
  "gisht": "G'isht va bloklar",
  "g'isht": "G'isht va bloklar",
  "blok": "G'isht va bloklar",
  "bloklar": "G'isht va bloklar",
  "asbob": "Asbob-uskunalar",
  "uskunalar": "Asbob-uskunalar",
  "tools": "Asbob-uskunalar",
  "boyoq": "Bo'yoq va lak",
  "bo'yoq": "Bo'yoq va lak",
  "lak": "Bo'yoq va lak",
  "paint": "Bo'yoq va lak",
  "elektr": "Elektr mollalari",
  "electrical": "Elektr mollalari",
  "metall": "Metall va armatura",
  "armatura": "Metall va armatura",
  "metal": "Metall va armatura",
  "yogoch": "Yog'och va mebel",
  "yog'och": "Yog'och va mebel",
  "mebel": "Yog'och va mebel",
  "wood": "Yog'och va mebel",
  "tom": "Tom materiallar",
  "roof": "Tom materiallar",
  "temir": "Temir-beton",
  "beton": "Temir-beton",
  "concrete": "Temir-beton",
  "gips": "Gips va shpaklovka",
  "shpaklovka": "Gips va shpaklovka",
  "dekor": "Dekor va bezatish",
  "bezatish": "Dekor va bezatish",
  "decoration": "Dekor va bezatish"
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
