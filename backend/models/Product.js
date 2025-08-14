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
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    trim: true
  }
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

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Product', productSchema);
