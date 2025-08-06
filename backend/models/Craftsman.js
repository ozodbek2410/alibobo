const mongoose = require('mongoose');

const craftsmanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'busy'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: ''
  },
  portfolio: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10; // Maximum 10 portfolio images
      },
      message: 'Portfolio can contain maximum 10 images'
    }
  },
  location: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better performance
craftsmanSchema.index({ specialty: 1, status: 1 });
craftsmanSchema.index({ name: 'text', specialty: 'text' });

module.exports = mongoose.model('Craftsman', craftsmanSchema); 