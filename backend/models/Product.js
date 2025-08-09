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

// Index for better performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ name: 'text', category: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema); 