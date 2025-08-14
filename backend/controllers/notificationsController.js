const Notification = require('../models/Notification');

// GET all notifications with pagination
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    
    const query = {};
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Notification.countDocuments(query);
    
    res.json({
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count,
      unreadCount: await Notification.countDocuments({ read: false })
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      message: error.message 
    });
  }
};

// GET single notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Bildirishnoma topilmadi' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notification',
      message: error.message 
    });
  }
};

// POST create new notification
const createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    const newNotification = await notification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(400).json({ 
      error: 'Failed to create notification',
      message: error.message 
    });
  }
};

// PUT mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirishnoma topilmadi' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(400).json({ 
      error: 'Failed to mark notification as read',
      message: error.message 
    });
  }
};

// PUT mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { read: false },
      { read: true }
    );
    
    res.json({ message: 'Barcha bildirishnomalar o\'qilgan deb belgilandi' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark all notifications as read',
      message: error.message 
    });
  }
};

// DELETE notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirishnoma topilmadi' });
    }
    
    res.json({ message: 'Bildirishnoma muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      error: 'Failed to delete notification',
      message: error.message 
    });
  }
};

// DELETE all notifications
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'Barcha bildirishnomalar o\'chirildi' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ 
      error: 'Failed to delete all notifications',
      message: error.message 
    });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};
