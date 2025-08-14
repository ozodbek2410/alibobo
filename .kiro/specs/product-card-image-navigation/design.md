# Design Document

## Overview

This design enhances the ModernProductCard component with intuitive image navigation functionality similar to the existing Craftsmen component. The feature allows users to navigate through multiple product images using hover-based interactions and provides visual progress indicators showing the current image position.

## Architecture

### Component Structure
The enhancement will modify the existing `ModernProductCard.jsx` component to include:
- Progress line indicators at the bottom of the image area
- Hover zone detection for left/right navigation
- Smooth image transitions with proper state management
- Visual feedback for hover areas

### State Management
The component will utilize existing state management patterns:
- `currentImageIndex` - tracks the active image (already exists)
- `lastHoverTime` - prevents rapid image switching (already exists)
- Image navigation callbacks (`onImageChange`, `onHoverTimeChange`) - already exist

## Components and Interfaces

### Enhanced Image Navigation Section
```jsx
{/* Image Progress Lines - Only show if multiple images */}
{hasMultipleImages && (
  <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-2 pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    {productImages.map((_, index) => (
      <button
        key={index}
        onClick={(e) => handleDotClick(index, e)}
        className={`flex-1 h-0.5 rounded-full transition-colors duration-200 ${
          index === currentImageIndex 
            ? 'bg-primary-orange' 
            : 'bg-gray-300 hover:bg-gray-400'
        }`}
        aria-label={`Image ${index + 1}`}
      />
    ))}
  </div>
)}
```

### Hover Zone Visual Feedback
```jsx
{/* Hover Areas Indicator (only visible on hover for multiple images) */}
{hasMultipleImages && (
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
    <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-black/5 to-transparent"></div>
    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-black/5 to-transparent"></div>
  </div>
)}
```

### Mouse Event Handling
The existing `handleMouseMove` function will be enhanced to:
- Detect mouse position within the image area
- Calculate left/right zones (50% split)
- Navigate to previous/next image with hover delay
- Prevent navigation beyond array bounds

## Data Models

### Product Image Structure
```javascript
const productImages = product.images && product.images.length > 0 
  ? product.images 
  : (product.image ? [product.image] : ['/assets/default-product.png']);
```

### Navigation State
```javascript
{
  currentImageIndex: number,    // Current active image index
  lastHoverTime: number,        // Timestamp of last hover action
  hasMultipleImages: boolean,   // Whether to show navigation UI
  hoverDelay: 800              // Milliseconds between navigation actions
}
```

## Error Handling

### Image Loading Errors
- Fallback to default product image if image fails to load
- Graceful handling of missing image arrays
- Loading skeleton display during image transitions

### Navigation Boundary Handling
- Prevent navigation beyond first image (left hover on index 0)
- Prevent navigation beyond last image (right hover on last index)
- Reset hover timing on mouse leave

### Responsive Behavior
- Progress lines scale appropriately on different screen sizes
- Touch-friendly navigation on mobile devices
- Hover effects disabled on touch devices

## Testing Strategy

### Unit Tests
1. **Image Array Handling**
   - Test with multiple images
   - Test with single image (no navigation UI)
   - Test with no images (fallback behavior)

2. **Navigation Logic**
   - Test left/right hover zone detection
   - Test boundary conditions (first/last image)
   - Test hover delay functionality

3. **Visual Indicators**
   - Test progress line highlighting
   - Test hover area visibility
   - Test responsive sizing

### Integration Tests
1. **Parent Component Integration**
   - Test callback functions (`onImageChange`, `onHoverTimeChange`)
   - Test prop passing and state updates
   - Test with different product data structures

2. **User Interaction Tests**
   - Test mouse move events
   - Test click navigation on progress lines
   - Test keyboard accessibility

### Visual Regression Tests
1. **UI Consistency**
   - Compare with Craftsmen component styling
   - Test across different screen sizes
   - Test hover state transitions

2. **Performance Tests**
   - Test image loading performance
   - Test smooth transitions
   - Test memory usage with multiple images

## Implementation Notes

### Styling Consistency
- Use existing Tailwind classes for consistency
- Match the visual style of the Craftsmen component
- Maintain responsive design patterns

### Accessibility
- Include proper ARIA labels for navigation elements
- Support keyboard navigation
- Ensure sufficient color contrast for progress indicators

### Performance Considerations
- Lazy load images to improve initial render time
- Optimize transition animations for smooth performance
- Debounce hover events to prevent excessive state updates

### Browser Compatibility
- Ensure hover effects work across modern browsers
- Provide fallback for older browsers without CSS grid support
- Test touch device compatibility