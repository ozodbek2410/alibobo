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
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    required: true
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