const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: false
  },
  customerAddress: {
    type: String,
    required: false
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ updatedAt: 1 });
orderSchema.index({ totalAmount: 1 });
orderSchema.index({ status: 1, createdAt: 1 });
orderSchema.index({ createdAt: 1, updatedAt: 1 }, { name: 'edit_tracking' });
orderSchema.index({ createdAt: 1, totalAmount: 1 }, { name: 'revenue_calculations' });
orderSchema.index({ customerName: 'text', customerPhone: 'text' });

module.exports = mongoose.model('Order', orderSchema);
