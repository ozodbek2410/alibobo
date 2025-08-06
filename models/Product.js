const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
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
  image: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  badge: {
    type: String,
    enum: ['Mashhur', 'Yangi', 'Chegirma', ''],
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  brand: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: 'dona'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 