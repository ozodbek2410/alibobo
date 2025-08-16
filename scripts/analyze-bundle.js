#!/usr/bin/env node

// Bundle analysis script for production optimization
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Starting bundle analysis...\n');

// Check if build directory exists
const buildDir = path.join(process.cwd(), 'build');
if (!fs.existsSync(buildDir)) {
  console.log('❌ Build directory not found. Running production build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Analyze bundle sizes
const analyzeBundle = () => {
  const staticDir = path.join(buildDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.log('❌ Static directory not found in build');
    return;
  }

  const jsDir = path.join(staticDir, 'js');
  const cssDir = path.join(staticDir, 'css');

  console.log('📦 Bundle Size Analysis:');
  console.log('========================\n');

  // Analyze JavaScript bundles
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    let totalJSSize = 0;

    console.log('📄 JavaScript Bundles:');
    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalJSSize += stats.size;
      
      let bundleType = 'Unknown';
      if (file.includes('main')) bundleType = 'Main Bundle';
      else if (file.includes('chunk')) bundleType = 'Code Split Chunk';
      else if (file.includes('runtime')) bundleType = 'Runtime';
      
      console.log(`  ${bundleType}: ${file} (${sizeKB} KB)`);
    });
    
    console.log(`  Total JS Size: ${(totalJSSize / 1024).toFixed(2)} KB\n`);
  }

  // Analyze CSS bundles
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    let totalCSSSize = 0;

    console.log('🎨 CSS Bundles:');
    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalCSSSize += stats.size;
      
      console.log(`  ${file} (${sizeKB} KB)`);
    });
    
    console.log(`  Total CSS Size: ${(totalCSSSize / 1024).toFixed(2)} KB\n`);
  }

  // Performance recommendations
  console.log('💡 Performance Recommendations:');
  console.log('================================');
  
  if (totalJSSize > 500 * 1024) {
    console.log('⚠️  JavaScript bundle is large (>500KB). Consider:');
    console.log('   - More aggressive code splitting');
    console.log('   - Tree shaking optimization');
    console.log('   - Removing unused dependencies');
  } else {
    console.log('✅ JavaScript bundle size is optimal');
  }
  
  if (totalCSSSize > 100 * 1024) {
    console.log('⚠️  CSS bundle is large (>100KB). Consider:');
    console.log('   - Purging unused Tailwind classes');
    console.log('   - Critical CSS extraction');
    console.log('   - CSS minification');
  } else {
    console.log('✅ CSS bundle size is optimal');
  }
};

// Check for webpack-bundle-analyzer
const runWebpackAnalyzer = () => {
  try {
    console.log('\n🔬 Running webpack-bundle-analyzer...');
    execSync('npx webpack-bundle-analyzer build/static/js/*.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('ℹ️  webpack-bundle-analyzer not available. Install with:');
    console.log('   npm install --save-dev webpack-bundle-analyzer');
  }
};

// Main execution
try {
  analyzeBundle();
  
  // Ask user if they want to run detailed analysis
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n🔬 Run detailed webpack analysis? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      runWebpackAnalyzer();
    }
    rl.close();
  });
  
} catch (error) {
  console.error('❌ Analysis failed:', error.message);
  process.exit(1);
}