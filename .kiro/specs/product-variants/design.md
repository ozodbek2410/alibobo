# Design Document

## Overview

This design implements a comprehensive product variant system that allows administrators to add variants (size, color, material, etc.) to products through the admin panel. The system builds upon the existing variant infrastructure in the codebase and ensures proper data persistence and frontend display functionality.

## Architecture

### Current State Analysis
- **Backend**: Product model already has `variants` array and `hasVariants` boolean field
- **Frontend**: ProductVariants component exists but variants are not being saved properly
- **Admin Panel**: AdminProducts component has variant support but form submission needs fixing
- **Product Detail**: ProductDetail component has ProductVariantSelector integration

### System Components
1. **Backend API Enhancement**: Fix product creation/update endpoints to properly handle variant data
2. **Admin Panel Integration**: Ensure ProductVariants component data flows correctly to form submission
3. **Frontend Display**: Enhance ProductDetail component to properly display and handle variant selection
4. **Data Validation**: Add proper validation for variant data structure

## Components and Interfaces

### Backend Components

#### Product Model (Already Exists)
```javascript
variants: [{
  name: String,        // "Rang", "O'lcham", "Xotira"
  options: [{
    value: String,     // "Qora", "L", "128GB"
    price: Number,     // Additional price
    stock: Number,     // Stock for this variant
    image: String,     // Variant-specific image
    sku: String        // Unique identifier
  }]
}],
hasVariants: Boolean
```

#### API Endpoints (Enhancement Required)
- `POST /api/products` - Fix variant data handling
- `PUT /api/products/:id` - Fix variant data handling
- `GET /api/products` - Already returns variant data

### Frontend Components

#### ProductVariants Component (Already Exists)
- Location: `src/components/admin/ProductVariants.jsx`
- Functionality: Allows adding/editing variant types and options
- **Issue**: Data not properly flowing to parent form

#### AdminProducts Component (Enhancement Required)
- Location: `src/components/AdminProducts.jsx`
- **Issue**: Form submission not including variant data properly
- **Fix**: Ensure `formData.variants` is populated from ProductVariants component

#### ProductDetail Component (Enhancement Required)
- Location: `src/components/ProductDetail.jsx`
- **Current**: Has ProductVariantSelector integration
- **Enhancement**: Ensure proper variant price/stock calculation

#### ProductVariantSelector Component (Needs Creation)
- Location: `src/components/ProductVariantSelector.jsx`
- Functionality: Display variant options and handle selection
- Integration: Used in ProductDetail component

## Data Models

### Variant Data Structure
```javascript
{
  hasVariants: true,
  variants: [
    {
      name: "Rang",
      options: [
        {
          value: "Qora",
          price: 0,
          stock: 10,
          image: "https://...",
          sku: "PROD-001-BLACK"
        },
        {
          value: "Oq",
          price: 50000,
          stock: 5,
          image: "https://...",
          sku: "PROD-001-WHITE"
        }
      ]
    },
    {
      name: "O'lcham",
      options: [
        {
          value: "S",
          price: 0,
          stock: 8,
          image: "",
          sku: "PROD-001-S"
        },
        {
          value: "L",
          price: 25000,
          stock: 3,
          image: "",
          sku: "PROD-001-L"
        }
      ]
    }
  ]
}
```

### Form Data Integration
```javascript
// AdminProducts formData structure
{
  name: String,
  category: String,
  price: Number,
  // ... other fields
  hasVariants: Boolean,
  variants: Array // From ProductVariants component
}
```

## Error Handling

### Validation Rules
1. **Variant Names**: Must not be empty if hasVariants is true
2. **Variant Options**: Each variant must have at least one option
3. **Option Values**: Must not be empty
4. **Price Values**: Must be non-negative numbers
5. **Stock Values**: Must be non-negative integers

### Error Scenarios
1. **Backend Validation Errors**: Return 400 with specific error messages
2. **Database Save Errors**: Return 500 with generic error message
3. **Frontend Validation**: Show user-friendly error messages before submission
4. **Network Errors**: Handle connection failures gracefully

## Testing Strategy

### Backend Testing
1. **Unit Tests**: Test variant data validation and saving
2. **Integration Tests**: Test API endpoints with variant data
3. **Database Tests**: Verify variant data persistence

### Frontend Testing
1. **Component Tests**: Test ProductVariants component functionality
2. **Integration Tests**: Test admin panel form submission with variants
3. **User Experience Tests**: Test product detail variant selection
4. **Responsive Tests**: Ensure variant UI works on mobile devices

### Test Scenarios
1. **Create Product with Variants**: Admin adds variants and saves successfully
2. **Edit Product Variants**: Admin modifies existing variants
3. **Remove Variants**: Admin removes variant types or options
4. **Customer Variant Selection**: Customer selects variants and sees price updates
5. **Stock Management**: Variant-specific stock tracking
6. **Price Calculation**: Correct price calculation with variant additions

## Implementation Flow

### Phase 1: Backend Fixes
1. Fix product creation endpoint to properly handle variant data
2. Fix product update endpoint to properly handle variant data
3. Add proper validation for variant data structure

### Phase 2: Admin Panel Integration
1. Fix ProductVariants component data flow to parent form
2. Ensure form submission includes variant data
3. Add proper error handling for variant validation

### Phase 3: Frontend Display
1. Create/enhance ProductVariantSelector component
2. Integrate variant selection in ProductDetail component
3. Implement price and stock updates based on variant selection

### Phase 4: Testing and Validation
1. Test complete flow from admin panel to customer view
2. Validate data persistence and retrieval
3. Ensure proper error handling throughout the system