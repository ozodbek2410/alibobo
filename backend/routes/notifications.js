const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET /api/notifications - Barcha notification'larni olish
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50); // Oxirgi 50 ta notification
    
    res.json(notifications);
  } catch (error) {
    console.error('Notificationlar yuklanmadi:', error);
    res.status(500).json({ 
      message: 'Notificationlar yuklanmadi',
      error: error.message 
    });
  }
});

// POST /api/notifications - Yangi notification yaratish
router.post('/', async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      icon,
      color,
      entityType,
      entityId,
      entityName,
      action
    } = req.body;

    // Majburiy maydonlarni tekshirish
    if (!type || !title || !message || !icon || !color) {
      return res.status(400).json({
        message: 'Majburiy maydonlar to\'ldirilmagan',
        required: ['type', 'title', 'message', 'icon', 'color']
      });
    }

    const notification = new Notification({
      type,
      title,
      message,
      icon,
      color,
      entityType,
      entityId,
      entityName,
      action,
      read: false
    });

    const savedNotification = await notification.save();
    
    console.log('✅ Yangi notification saqlandi:', savedNotification.title);
    res.status(201).json(savedNotification);
  } catch (error) {
    console.error('Notification saqlanmadi:', error);
    res.status(500).json({ 
      message: 'Notification saqlanmadi',
      error: error.message 
    });
  }
});

// PUT /api/notifications/:id/read - Notification'ni o'qilgan deb belgilash
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification topilmadi' });
    }

    console.log('✅ Notification o\'qilgan deb belgilandi:', notification.title);
    res.json(notification);
  } catch (error) {
    console.error('Notification yangilanmadi:', error);
    res.status(500).json({ 
      message: 'Notification yangilanmadi',
      error: error.message 
    });
  }
});

// PUT /api/notifications/mark-all-read - Barcha notification'larni o'qilgan deb belgilash
router.put('/mark-all-read', async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { read: false },
      { read: true }
    );

    console.log(`✅ ${result.modifiedCount} ta notification o'qilgan deb belgilandi`);
    res.json({ 
      message: `${result.modifiedCount} ta notification o'qilgan deb belgilandi`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Notification\'lar yangilanmadi:', error);
    res.status(500).json({ 
      message: 'Notification\'lar yangilanmadi',
      error: error.message 
    });
  }
});

// GET /api/notifications/unread-count - O'qilmagan notification'lar soni
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    
    res.json({ count });
  } catch (error) {
    console.error('O\'qilmagan notification\'lar soni olinmadi:', error);
    res.status(500).json({ 
      message: 'O\'qilmagan notification\'lar soni olinmadi',
      error: error.message 
    });
  }
});

// DELETE /api/notifications/:id - Notification'ni o'chirish
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification topilmadi' });
    }

    console.log('✅ Notification o\'chirildi:', notification.title);
    res.json({ message: 'Notification muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    console.error('Notification o\'chirilmadi:', error);
    res.status(500).json({ 
      message: 'Notification o\'chirilmadi',
      error: error.message 
    });
  }
});

// DELETE /api/notifications - Barcha notification'larni o'chirish
router.delete('/', async (req, res) => {
  try {
    const result = await Notification.deleteMany({});
    
    console.log(`✅ ${result.deletedCount} ta notification o'chirildi`);
    res.json({ 
      message: `${result.deletedCount} ta notification o'chirildi`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Notification\'lar o\'chirilmadi:', error);
    res.status(500).json({ 
      message: 'Notification\'lar o\'chirilmadi',
      error: error.message 
    });
  }
});

module.exports = router;
