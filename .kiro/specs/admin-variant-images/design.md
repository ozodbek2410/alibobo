# Design Document

## Overview

Bu loyiha admin panelda mahsulot variantlari uchun alohida rasmlar boshqarish tizimini yaratadi. Joriy tizimda mahsulotlar umumiy rasmlar bilan ishlaydi, lekin yangi tizimda har bir variant o'zining rasmlariga ega bo'ladi. Admin panel yangi mahsulot qo'shish va tahrirlash interfeysi o'zgartiriladi, frontend'da esa variant tanlanganda tegishli rasmlar ko'rsatiladi.

## Architecture

### Backend Architecture

```
Product Model (Existing)
├── Common Fields (name, category, description, badge)
├── hasVariants: Boolean
└── variants: Array
    └── options: Array
        ├── value: String
        ├── price: Number
        ├── stock: Number
        └── images: Array[String] (NEW)
```

### Frontend Architecture

```
Admin Panel
├── ProductForm Component (Modified)
│   ├── CommonFields Section
│   └── VariantsManager Section
│       └── VariantEditor Component (NEW)
│           ├── VariantDetails
│           └── ImageUploader Component (NEW)
└── ImageManager Service (NEW)

User Interface
├── ProductDetail Component (Modified)
│   ├── ImageGallery Component (Modified)
│   └── VariantSelector Component (Modified)
└── ProductCard Component (Modified)
```

## Components and Interfaces

### 1. Backend Changes

#### Product Model Enhancement
```javascript
// Variant option schema enhancement
const variantOptionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  images: [{ type: String, trim: true }] // NEW: Array of image URLs
}, { _id: false });
```

#### API Endpoints
- `POST /api/admin/products` - Yangi mahsulot yaratish (variant rasmlari bilan)
- `PUT /api/admin/products/:id` - Mahsulotni yangilash (variant rasmlari bilan)
- `POST /api/admin/upload/variant-images` - Variant rasmlari yuklash
- `DELETE /api/admin/images/:filename` - Rasmni o'chirish

### 2. Admin Panel Components

#### VariantEditor Component
```jsx
const VariantEditor = ({ variant, onUpdate, onDelete }) => {
  // Variant ma'lumotlarini tahrirlash
  // Rasm yuklash va boshqarish
  // Narx va stock boshqarish
}
```

#### ImageUploader Component
```jsx
const ImageUploader = ({ images, onImagesChange, maxImages = 5 }) => {
  // Drag & drop rasm yuklash
  // Rasmlarni preview qilish
  // Rasmlarni o'chirish va tartibini o'zgartirish
}
```

#### ProductForm Component (Modified)
```jsx
const ProductForm = ({ product, onSubmit }) => {
  // Umumiy maydonlar (nom, kategoriya, tavsif, badge)
  // Variant boshqarish bo'limi
  // Form validation va submit
}
```

### 3. Frontend User Components

#### ImageGallery Component (Modified)
```jsx
const ImageGallery = ({ images, selectedIndex, onImageSelect }) => {
  // Variant rasmlarini ko'rsatish
  // Rasm navigatsiyasi
  // Responsive design
}
```

#### ProductVariantSelector Component (Modified)
```jsx
const ProductVariantSelector = ({ product, onVariantChange }) => {
  // Variant tanlash
  // Rasm o'zgarishini trigger qilish
  // Narx va stock yangilash
}
```

## Data Models

### Enhanced Product Schema
```javascript
{
  // Umumiy maydonlar
  name: String,
  category: String,
  description: String,
  badge: String,
  
  // Variant tizimi
  hasVariants: Boolean,
  variants: [{
    name: String, // "Rang", "O'lcham"
    options: [{
      value: String, // "Qizil", "Katta"
      price: Number,
      stock: Number,
      images: [String] // Variant rasmlari
    }]
  }],
  
  // Legacy support
  price: Number, // Base price
  image: String, // Default image
  images: [String] // Default images
}
```

### Admin Form Data Structure
```javascript
{
  // Umumiy ma'lumotlar
  commonData: {
    name: String,
    category: String,
    description: String,
    badge: String
  },
  
  // Variant ma'lumotlari
  variants: [{
    name: String,
    options: [{
      value: String,
      price: Number,
      stock: Number,
      images: [File] // Upload uchun
    }]
  }]
}
```

## Error Handling

### Backend Error Handling
- Rasm yuklash xatolari (fayl hajmi, format)
- Variant validation xatolari
- Database connection xatolari
- File system xatolari

### Frontend Error Handling
- Network xatolari
- Form validation xatolari
- Image upload xatolari
- User feedback notifications

### Error Response Format
```javascript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Variant rasmi yuklashda xatolik",
    details: {
      field: "variant.images",
      reason: "File size too large"
    }
  }
}
```

## Testing Strategy

### Unit Tests
- Product model validation tests
- Variant image upload tests
- Form validation tests
- Component rendering tests

### Integration Tests
- Admin panel workflow tests
- Image upload and display tests
- Variant selection and image change tests
- API endpoint tests

### E2E Tests
- Complete admin workflow (mahsulot yaratish)
- User variant selection workflow
- Image gallery navigation tests
- Mobile responsiveness tests

### Test Scenarios
1. **Admin mahsulot yaratish**
   - Umumiy ma'lumotlar kiritish
   - Variantlar qo'shish
   - Har variant uchun rasmlar yuklash
   - Saqlash va tasdiqlash

2. **Variant rasmlarini boshqarish**
   - Rasm yuklash
   - Rasmlarni o'chirish
   - Rasm tartibini o'zgartirish
   - Variant o'chirish

3. **Frontend variant tanlash**
   - Variant o'zgartirganda rasm o'zgarishi
   - Narx va stock yangilanishi
   - Mobile responsive ishlash

## Implementation Phases

### Phase 1: Backend Enhancement
- Product model yangilash
- API endpoints yaratish
- Image upload service
- Validation logic

### Phase 2: Admin Panel
- VariantEditor component
- ImageUploader component
- ProductForm modification
- Form validation

### Phase 3: Frontend Integration
- ProductVariantSelector yangilash
- ImageGallery modification
- ProductDetail component yangilash
- Mobile optimization

### Phase 4: Testing & Polish
- Unit va integration testlar
- E2E test scenarios
- Performance optimization
- Bug fixes va polish