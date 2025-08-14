# Design Document

## Overview

Mobil qurilmalarda kategoriya navigatsiyasini qo'shish uchun gorizontal scroll qilinadigan kategoriyalar ro'yxatini yaratamiz. Bu ro'yxat mahsulotlar sahifasining yuqori qismida joylashadi va foydalanuvchilarga tez va oson kategoriya tanlash imkonini beradi.

## Architecture

### Component Structure
```
ProductsGrid
├── CategoryNavigation (yangi komponent)
│   ├── Category buttons (gorizontal scroll)
│   └── Active category indicator
└── Products display
```

### State Management
- `selectedCategory` - hozirda tanlangan kategoriya
- `categories` - mavjud kategoriyalar ro'yxati
- `onCategorySelect` - kategoriya tanlash callback funksiyasi

## Components and Interfaces

### CategoryNavigation Component

```jsx
interface CategoryNavigationProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  className?: string;
}

interface Category {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
}
```

### Design Specifications

#### Layout
- Gorizontal scroll container
- Fixed height: 60px
- Padding: 16px horizontal
- Gap between items: 12px
- Sticky positioning (top: header height)

#### Category Button Design
- Background: White with border
- Active state: Orange background with white text
- Border radius: 24px (pill shape)
- Padding: 8px 16px
- Font size: 14px
- Font weight: 500
- Transition: all 200ms ease

#### Responsive Behavior
- Mobile: Show 2.5-3 categories visible at once
- Tablet: Show 4-5 categories visible at once
- Smooth scroll behavior
- Touch-friendly tap targets (minimum 44px height)

## Data Models

### Categories List
```javascript
const categories = [
  { id: 'all', name: 'all', displayName: 'Hammasi', icon: 'fas fa-th-large' },
  { id: 'xoz-mag', name: 'xoz-mag', displayName: 'Xo\'z-mag', icon: 'fas fa-home' },
  { id: 'yevro-remont', name: 'yevro-remont', displayName: 'Yevro remont', icon: 'fas fa-tools' },
  { id: 'elektrika', name: 'elektrika', displayName: 'Elektrika', icon: 'fas fa-bolt' },
  { id: 'dekorativ-mahsulotlar', name: 'dekorativ-mahsulotlar', displayName: 'Dekorativ', icon: 'fas fa-paint-brush' },
  { id: 'santexnika', name: 'santexnika', displayName: 'Santexnika', icon: 'fas fa-faucet' },
  // ... qolgan kategoriyalar
];
```

## Error Handling

### Category Loading Errors
- Fallback to "Hammasi" category if API fails
- Show error message if categories cannot be loaded
- Graceful degradation - hide category navigation if critical error

### Selection Errors
- Validate category exists before selection
- Reset to "Hammasi" if invalid category selected
- Log errors for debugging

## Testing Strategy

### Unit Tests
- Category selection functionality
- Active state management
- Scroll behavior
- Responsive design breakpoints

### Integration Tests
- Category filtering with ProductsGrid
- State synchronization between components
- API integration for category-based product loading

### Mobile Testing
- Touch interaction testing
- Scroll performance on various devices
- Accessibility testing (screen readers, keyboard navigation)

## Performance Considerations

### Optimization Strategies
- Virtualized scrolling for large category lists
- Debounced category selection (300ms)
- Memoized category components
- Lazy loading of category icons

### Memory Management
- Cleanup scroll event listeners
- Optimize re-renders with React.memo
- Use CSS transforms for smooth animations