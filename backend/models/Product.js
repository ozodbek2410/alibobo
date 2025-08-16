const mongoose = require('mongoose');

// Variant option schema
const variantOptionSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  oldPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Variant schema
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  options: [variantOptionSchema]
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  oldPrice: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    default: 'dona',
    trim: true
  },
  badge: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  // Legacy fields for backward compatibility
  colors: [{
    type: String,
    trim: true
  }],
  sizes: [{
    type: String,
    trim: true
  }],
  // New variant system
  hasVariants: {
    type: Boolean,
    default: false
  },
  variants: [variantSchema],
  // SEO fields
  slug: {
    type: String,
    trim: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Create slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Comprehensive indexing strategy for optimal query performance

// 1. Text search index for full-text search functionality
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text' 
}, {
  weights: {
    name: 10,        // Name is most important for search
    category: 5,     // Category is moderately important
    description: 1   // Description is least important
  },
  name: 'product_text_search'
});

// 2. Category-based queries (most common filter)
productSchema.index({ category: 1, status: 1 });
productSchema.index({ category: 1, price: 1 }); // Category + price filtering
productSchema.index({ category: 1, createdAt: -1 }); // Category + newest first

// 3. Price-based queries and sorting
productSchema.index({ price: 1, status: 1 }); // Price filtering with active products
productSchema.index({ price: -1, status: 1 }); // Price high to low
productSchema.index({ oldPrice: 1, price: 1 }); // Discount calculations

// 4. Status and availability indexes
productSchema.index({ status: 1, createdAt: -1 }); // Active products, newest first
productSchema.index({ status: 1, stock: 1 }); // Available products
productSchema.index({ stock: 1 }); // Stock availability

// 5. Popularity and featured products
productSchema.index({ isPopular: 1, status: 1 });
productSchema.index({ isNew: 1, status: 1 });
productSchema.index({ badge: 1, status: 1 });
productSchema.index({ rating: -1, status: 1 }); // Highest rated first

// 6. Time-based queries
productSchema.index({ createdAt: -1, status: 1 }); // Newest products
productSchema.index({ updatedAt: -1, status: 1 }); // Recently updated

// 7. Compound indexes for common query patterns
productSchema.index({ 
  status: 1, 
  category: 1, 
  price: 1, 
  createdAt: -1 
}); // Complete product listing with filters

productSchema.index({ 
  status: 1, 
  isPopular: 1, 
  rating: -1 
}); // Popular products by rating

productSchema.index({ 
  status: 1, 
  stock: 1, 
  category: 1 
}); // Available products by category

// 8. Variant-specific indexes
productSchema.index({ hasVariants: 1, status: 1 });
productSchema.index({ 'variants.options.stock': 1 }); // Variant stock

// 9. SEO and slug indexes
productSchema.index({ slug: 1 }, { unique: true, sparse: true });

// 10. Admin dashboard indexes
productSchema.index({ createdAt: -1 }); // For admin product listing
productSchema.index({ updatedAt: -1 }); // For recently modified products

module.exports = mongoose.model('Product', productSchema);
