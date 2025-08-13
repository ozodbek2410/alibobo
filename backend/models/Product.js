const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  oldPrice: {
    type: Number,
    min: 0,
    default: null
  },
  // Variant system - Uzum Market style
  variants: [{
    name: {
      type: String,
      required: true // e.g., "Rang", "Xotira", "O'lcham"
    },
    options: [{
      value: {
        type: String,
        required: true // e.g., "Qora", "128GB", "L"
      },
      price: {
        type: Number,
        default: 0 // Additional price for this variant
      },
      stock: {
        type: Number,
        default: 0
      },
      image: {
        type: String,
        default: '' // Specific image for this variant
      },
      sku: {
        type: String,
        default: '' // Unique identifier for this variant
      }
    }]
  }],
  hasVariants: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    required: false
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: 'dona'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  badge: {
    type: String,
    default: ''
  },
  craftsman: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Craftsman',
      required: false
    },
    name: {
      type: String,
      required: false
    },
    specialty: {
      type: String,
      required: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ category: 1, updatedAt: -1 }); // Most common query pattern
productSchema.index({ price: 1 }); // Price range filtering
productSchema.index({ rating: -1 }); // Rating sorting
productSchema.index({ isActive: 1 }); // Active products filter
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: 1 });
productSchema.index({ updatedAt: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ createdAt: 1, updatedAt: 1 }, { name: 'edit_tracking' });
productSchema.index({ name: 'text', category: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema); 