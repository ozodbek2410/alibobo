# Design Document

## Overview

This design implements comprehensive loading indicators throughout the application to improve user experience during data fetching operations. The solution leverages existing loading states from the `useOptimizedFetch` and `useParallelFetch` hooks while adding visual feedback components that integrate seamlessly with the current UI design.

The loading indicators will be consistent, accessible, and performant, providing clear feedback to users about the application's state during data operations.

## Architecture

### Component Structure

```
LoadingIndicator/
├── LoadingSpinner.jsx          # Reusable spinner component
├── LoadingSkeleton.jsx         # Skeleton loading components
├── LoadingOverlay.jsx          # Full-screen loading overlay
└── index.js                    # Export barrel file
```

### Integration Points

1. **MainPage Component**: Orchestrates loading states for parallel data fetching
2. **ProductsGrid Component**: Shows loading during product searches and filtering
3. **Craftsmen Component**: Displays loading while craftsmen data loads
4. **useOptimizedFetch Hook**: Already provides loading states, will be utilized
5. **useParallelFetch Hook**: Already provides loading states, will be utilized

## Components and Interfaces

### LoadingSpinner Component

```jsx
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  'aria-label'?: string;
}
```

**Features:**
- Configurable size and color
- Accessible with ARIA labels
- CSS animations for smooth rotation
- Consistent with brand colors (primary orange)

### LoadingSkeleton Component

```jsx
interface LoadingSkeletonProps {
  type: 'product-card' | 'craftsman-card' | 'product-grid' | 'craftsmen-grid';
  count?: number;
  className?: string;
}
```

**Features:**
- Multiple skeleton types for different content
- Shimmer animation effect
- Matches actual content dimensions
- Responsive design

### LoadingOverlay Component

```jsx
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  children?: React.ReactNode;
  backdrop?: boolean;
}
```

**Features:**
- Optional backdrop blur
- Custom loading messages
- Prevents user interaction during loading
- Smooth fade in/out transitions

## Data Models

### Loading State Interface

```typescript
interface LoadingState {
  isLoading: boolean;
  loadingType: 'initial' | 'search' | 'filter' | 'refresh';
  message?: string;
  progress?: number;
}
```

### Component Loading Props

```typescript
interface ComponentLoadingProps {
  loading?: boolean;
  loadingComponent?: React.ComponentType;
  fallback?: React.ReactNode;
  skeleton?: boolean;
}
```

## Error Handling

### Loading Error States

1. **Network Errors**: Show retry button with loading indicator
2. **Timeout Errors**: Display timeout message with refresh option
3. **Server Errors**: Show error message while maintaining loading context
4. **Cancelled Requests**: Gracefully handle aborted requests without error states

### Error Recovery

- Automatic retry mechanisms with exponential backoff
- Manual retry buttons with loading feedback
- Graceful degradation when loading fails
- Clear error messages with actionable solutions

## Testing Strategy

### Unit Tests

1. **LoadingSpinner Component**
   - Renders with different sizes and colors
   - Applies correct CSS classes
   - Includes proper ARIA attributes

2. **LoadingSkeleton Component**
   - Renders correct skeleton type
   - Shows appropriate number of skeleton items
   - Maintains responsive behavior

3. **LoadingOverlay Component**
   - Shows/hides based on visibility prop
   - Prevents interaction when active
   - Displays custom messages correctly

### Integration Tests

1. **MainPage Loading Flow**
   - Shows loading during initial data fetch
   - Hides loading when data arrives
   - Handles parallel loading states correctly

2. **ProductsGrid Loading**
   - Shows skeleton during product loading
   - Updates loading state during search
   - Maintains loading state during filtering

3. **Craftsmen Loading**
   - Displays loading during data fetch
   - Shows skeleton for craftsmen cards
   - Handles empty states correctly

### Accessibility Tests

1. **Screen Reader Compatibility**
   - ARIA labels are present and descriptive
   - Loading state changes are announced
   - Focus management during loading

2. **Keyboard Navigation**
   - Loading states don't break keyboard navigation
   - Interactive elements remain accessible
   - Focus is properly managed

### Performance Tests

1. **Animation Performance**
   - Smooth animations on various devices
   - No layout thrashing during loading
   - Efficient CSS animations

2. **Memory Usage**
   - No memory leaks from loading components
   - Proper cleanup of loading states
   - Efficient re-renders

## Implementation Details

### CSS Animations

```css
/* Spinner rotation animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Skeleton shimmer effect */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
```

### Loading State Management

1. **Centralized Loading Context**: Optional context provider for global loading states
2. **Component-Level Loading**: Individual components manage their own loading states
3. **Hook Integration**: Leverage existing `useOptimizedFetch` and `useParallelFetch` loading states

### Responsive Design

- Mobile-first approach for loading indicators
- Appropriate sizing for different screen sizes
- Touch-friendly loading states on mobile devices
- Optimized animations for mobile performance

### Brand Consistency

- Use primary orange color (#FF6B35) for loading indicators
- Consistent spacing and typography
- Match existing UI patterns and design language
- Maintain visual hierarchy during loading states

## Performance Considerations

1. **Lazy Loading**: Load skeleton components only when needed
2. **CSS Animations**: Use transform and opacity for smooth animations
3. **Request Cancellation**: Properly cancel requests when components unmount
4. **Debouncing**: Prevent excessive loading state changes during rapid interactions
5. **Memory Management**: Clean up loading timers and animations