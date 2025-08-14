const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['success', 'error', 'info', 'warning', 'danger']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  entityType: {
    type: String,
    enum: ['craftsman', 'product', 'order'],
    required: false
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  entityName: {
    type: String,
    required: false
  },
  action: {
    type: String,
    enum: ['added', 'updated', 'deleted'],
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
