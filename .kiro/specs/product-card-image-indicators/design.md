# Design Document

## Overview

Bu dizayn product card'larda rasm hover qilganda visual indicator'lar (progress lines/dots) qo'shish uchun mo'ljallangan. Indicator'lar foydalanuvchiga qaysi rasm ko'rsatilayotganini bildiradi va rasmlar orasida navigatsiya imkonini beradi.

## Architecture

### Component Structure
```
ModernProductCard
├── Image Container
│   ├── Main Image
│   ├── Hover Areas
│   └── Progress Indicators (yangi)
└── Product Info
```

### Visual Design

#### Progress Indicators
- **Type**: Horizontal lines (chiziqlar)
- **Position**: Rasmning pastki qismida, 2px balandlikda
- **Active Color**: `#F68622` (primary-orange)
- **Inactive Color**: `#D1D5DB` (gray-300)
- **Hover Color**: `#9CA3AF` (gray-400)

#### Layout
```
┌─────────────────────────┐
│                         │
│      Product Image      │
│                         │
│ ▓▓▓▓ ──── ──── ────     │ ← Progress Lines
└─────────────────────────┘
```

## Components and Interfaces

### Progress Indicator Component
```jsx
const ProgressIndicators = ({ 
  images, 
  currentIndex, 
  onIndicatorClick,
  isVisible 
}) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 flex gap-1 px-2 pb-2 transition-opacity duration-200 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {images.map((_, index) => (
        <button
          key={index}
          onClick={(e) => onIndicatorClick(index, e)}
          className={`flex-1 h-0.5 rounded-full transition-colors duration-200 ${
            index === currentIndex
              ? 'bg-primary-orange'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          aria-label={`Image ${index + 1}`}
        />
      ))}
    </div>
  );
};
```

### Visibility Logic
```jsx
// Desktop: faqat hover'da ko'rinadi
// Mobile: doimo ko'rinadi
const isIndicatorVisible = hasMultipleImages && (
  isMobile || isHovered || isGroupHovered
);
```

## Data Models

### Image Navigation State
```typescript
interface ImageNavigationState {
  currentImageIndex: number;
  lastHoverTime: number;
  isHovered: boolean;
  hasMultipleImages: boolean;
}
```

### Indicator Props
```typescript
interface IndicatorProps {
  images: string[];
  currentIndex: number;
  onIndicatorClick: (index: number, event: MouseEvent) => void;
  isVisible: boolean;
  className?: string;
}
```

## Error Handling

### Edge Cases
1. **Bitta rasm**: Indicator'lar ko'rsatilmaydi
2. **Rasm yuklanmagan**: Default placeholder bilan indicator'lar ishlaydi
3. **Touch va hover conflict**: Touch event'lar hover'dan ustun turadi

### Error States
```jsx
// Agar rasmlar yo'q bo'lsa
if (!productImages || productImages.length <= 1) {
  return null; // Indicator'larni ko'rsatma
}

// Agar currentIndex noto'g'ri bo'lsa
const safeCurrentIndex = Math.max(0, Math.min(currentImageIndex, productImages.length - 1));
```

## Testing Strategy

### Unit Tests
1. **Indicator Rendering**: Indicator'lar to'g'ri miqdorda render qilinishi
2. **Click Handling**: Indicator bosilganda to'g'ri rasm ko'rsatilishi
3. **Visibility Logic**: Desktop/mobile'da to'g'ri ko'rinish/yashirinish
4. **Responsive Behavior**: Turli ekran o'lchamlarida to'g'ri ishlash

### Integration Tests
1. **Hover Navigation**: Hover orqali rasm o'zgarganda indicator yangilanishi
2. **Touch Navigation**: Touch orqali rasm o'zgarganda indicator yangilanishi
3. **Card Click**: Indicator bosilganda card click event'i to'xtatilishi

### Visual Tests
1. **Design Consistency**: Indicator'lar kartochka dizayniga mos kelishi
2. **Color Accuracy**: To'g'ri ranglar ishlatilishi
3. **Animation Smoothness**: Transition'lar silliq ishlashi

## Implementation Notes

### CSS Classes
```css
/* Progress indicator container */
.progress-indicators {
  @apply absolute bottom-0 left-0 right-0 flex gap-1 px-2 pb-2;
  @apply transition-opacity duration-200;
}

/* Individual indicator */
.progress-indicator {
  @apply flex-1 h-0.5 rounded-full transition-colors duration-200;
}

.progress-indicator.active {
  @apply bg-primary-orange;
}

.progress-indicator.inactive {
  @apply bg-gray-300 hover:bg-gray-400;
}

/* Responsive visibility */
.progress-indicators.desktop-hover {
  @apply opacity-0 sm:group-hover:opacity-100;
}

.progress-indicators.mobile-visible {
  @apply opacity-100 sm:opacity-0 sm:group-hover:opacity-100;
}
```

### Performance Considerations
1. **Event Delegation**: Indicator click'lar uchun event delegation
2. **Throttling**: Hover event'larni throttle qilish
3. **Memoization**: Indicator component'ni memo qilish

### Accessibility
1. **ARIA Labels**: Har bir indicator uchun aria-label
2. **Keyboard Navigation**: Tab orqali indicator'larga kirish
3. **Screen Reader**: Hozirgi rasm haqida ma'lumot berish