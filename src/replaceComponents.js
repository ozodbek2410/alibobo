// Script to replace original components with optimized versions
// Run this after testing the optimized components

const fs = require('fs');
const path = require('path');

const replacements = [
  {
    original: './components/ProductsGrid.jsx',
    optimized: './components/ProductsGridOptimized.jsx',
    backup: './components/ProductsGrid.backup.jsx'
  },
  {
    original: './components/MainPage.jsx',
    optimized: './components/MainPageOptimized.jsx',
    backup: './components/MainPage.backup.jsx'
  }
];

console.log('🔄 Starting component replacement...');

replacements.forEach(({ original, optimized, backup }) => {
  try {
    // Create backup of original
    if (fs.existsSync(original)) {
      fs.copyFileSync(original, backup);
      console.log(`✅ Backup created: ${backup}`);
    }
    
    // Replace with optimized version
    if (fs.existsSync(optimized)) {
      fs.copyFileSync(optimized, original);
      console.log(`✅ Replaced: ${original} with optimized version`);
    } else {
      console.log(`❌ Optimized file not found: ${optimized}`);
    }
  } catch (error) {
    console.error(`❌ Error replacing ${original}:`, error.message);
  }
});

console.log('🎯 Component replacement completed!');
console.log('📝 To revert changes, rename .backup.jsx files back to .jsx');
