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
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: 1 });
productSchema.index({ updatedAt: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ createdAt: 1, updatedAt: 1 }, { name: 'edit_tracking' });
productSchema.index({ name: 'text', category: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema); 