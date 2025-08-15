# Design Document

## Overview

Sahifaga birinchi marta kirganda va mahsulotlar yuklanayotganda skeleton loader ko'rsatish tizimini yaratish. Bu tizim foydalanuvchi tajribasini yaxshilaydi va sahifa ishlab turganini ko'rsatadi.

## Architecture

### Current State Analysis

Hozirda ProductsGrid komponentida skeleton loader mavjud, lekin u to'g'ri ishlayotganga o'xshamaydi. Muammo shundaki:

1. `loading` state to'g'ri boshqarilmayotgan
2. `useOptimizedFetch` hook cache tufayli darhol data qaytarishi mumkin
3. Initial loading state to'g'ri aniqlanmayotgan

### Loading State Logic

```javascript
// Current problematic logic
if ((loading && products.length === 0) || (apiLoading && products.length === 0)) {
  // Show skeleton
}
```

Bu logic muammoli chunki:
- Cache mavjud bo'lsa, `apiLoading` darhol `false` bo'ladi
- `loading` state ham to'g'ri yangilanmaydi

### Improved Loading State Logic

```javascript
// New improved logic
const [isInitialLoad, setIsInitialLoad] = useState(true);
const [showSkeleton, setShowSkeleton] = useState(true);

// Show skeleton when:
// 1. Initial load and no products
// 2. API is loading and no products
// 3. Category/search changed and loading new data
const shouldShowSkeleton = (
  (isInitialLoad && products.length === 0) ||
  (apiLoading && products.length === 0) ||
  (showSkeleton && products.length === 0)
);
```

## Components and Interfaces

### 1. Enhanced ProductsGrid Component

**Props:**
- Existing props remain the same
- Add internal state management for skeleton display

**State Management:**
```javascript
const [isInitialLoad, setIsInitialLoad] = useState(true);
const [showSkeleton, setShowSkeleton] = useState(true);
const [previousFilters, setPreviousFilters] = useState({});
```

**Loading Logic:**
```javascript
// Detect filter changes
const currentFilters = { selectedCategory, searchQuery };
const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(previousFilters);

// Show skeleton logic
const shouldShowSkeleton = (
  isInitialLoad || 
  (apiLoading && products.length === 0) ||
  (filtersChanged && apiLoading)
);
```

### 2. Skeleton Component Structure

**ProductGridSkeleton Component:**
```jsx
const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="container mx-auto px-4 py-8">
    {/* Category Navigation Skeleton */}
    <CategoryNavigationSkeleton />
    
    {/* Filter Section Skeleton */}
    <FilterSectionSkeleton />
    
    {/* Products Grid Skeleton */}
    <ProductCardsSkeleton count={count} />
  </div>
);
```

**Sub-components:**
- `CategoryNavigationSkeleton` - kategoriya tugmalari skeleton
- `FilterSectionSkeleton` - filtr qismi skeleton
- `ProductCardsSkeleton` - mahsulot kartalari skeleton

### 3. Responsive Design

**Mobile (2 columns):**
```css
.grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

**Skeleton Card Structure:**
```jsx
<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
  {/* Image skeleton */}
  <div className="h-56 bg-gray-200"></div>
  
  {/* Content skeleton */}
  <div className="p-4">
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 bg-gray-200 rounded mb-3"></div>
    <div className="h-6 bg-gray-200 rounded"></div>
  </div>
</div>
```

## Data Models

### Loading State Model

```javascript
const loadingState = {
  isInitialLoad: boolean,      // Birinchi yuklash
  showSkeleton: boolean,       // Skeleton ko'rsatish
  apiLoading: boolean,         // API dan ma'lumot olish
  products: Array,             // Mahsulotlar ro'yxati
  previousFilters: Object      // Oldingi filtrlar
};
```

### Filter Change Detection

```javascript
const filterState = {
  selectedCategory: string,
  searchQuery: string,
  appliedMinPrice: string,
  appliedMaxPrice: string,
  quickFilter: string
};
```

## Error Handling

### API Error States

1. **Network Error:** Skeleton yo'qoladi, xatolik xabari ko'rsatiladi
2. **Empty Response:** Skeleton yo'qoladi, "Mahsulot topilmadi" xabari
3. **Timeout:** Skeleton davom etadi, retry tugmasi ko'rsatiladi

### Error Recovery

```javascript
const handleApiError = (error) => {
  setShowSkeleton(false);
  setIsInitialLoad(false);
  
  if (error.name === 'AbortError') {
    // Request was cancelled, don't show error
    return;
  }
  
  // Show appropriate error message
  setError(error);
};
```

## Testing Strategy

### Unit Tests

1. **Skeleton Display Tests:**
   - Initial load skeleton ko'rsatilishi
   - Filter o'zgarishida skeleton ko'rsatilishi
   - Ma'lumot kelganda skeleton yo'qolishi

2. **Loading State Tests:**
   - `isInitialLoad` to'g'ri yangilanishi
   - `showSkeleton` to'g'ri boshqarilishi
   - Filter o'zgarishlarini aniqlash

3. **Responsive Tests:**
   - Turli ekran o'lchamlarida to'g'ri grid
   - Mobile va desktop skeleton farqlari

### Integration Tests

1. **API Integration:**
   - Cache mavjud bo'lganda skeleton ko'rsatilmasligi
   - Yangi ma'lumot so'raganda skeleton ko'rsatilishi
   - Xatolik holatlarida to'g'ri ishlash

2. **User Flow Tests:**
   - Sahifaga birinchi kirish
   - Kategoriya o'zgartirish
   - Qidiruv amalga oshirish
   - Filtr qo'llash

### Performance Tests

1. **Skeleton Rendering:**
   - Skeleton tez render bo'lishi
   - Animatsiya smooth ishlashi
   - Memory leak yo'qligi

2. **State Management:**
   - Ortiqcha re-render yo'qligi
   - Efficient state updates
   - Proper cleanup

## Implementation Notes

### Key Changes Required

1. **ProductsGrid.jsx:**
   - Loading logic qayta yozish
   - Filter change detection qo'shish
   - Skeleton display logic yaxshilash

2. **useOptimizedFetch.js:**
   - Initial loading state to'g'ri qaytarish
   - Cache hit holatlarini boshqarish

3. **New Components:**
   - Dedicated skeleton components yaratish
   - Reusable skeleton building blocks

### Performance Considerations

1. **Skeleton Animation:**
   - CSS animatsiya ishlatish (JS emas)
   - GPU acceleration uchun transform ishlatish
   - Smooth 60fps animatsiya

2. **State Updates:**
   - Debounced filter changes
   - Memoized skeleton components
   - Efficient re-render prevention

### Accessibility

1. **Screen Readers:**
   - `aria-label="Mahsulotlar yuklanmoqda"` qo'shish
   - Loading state announce qilish

2. **Visual Indicators:**
   - Contrast ratio requirements
   - Animation preferences respect qilish