const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal helper function
const createNotification = async (userId, title, message, type = 'system', io = null) => {
  try {
    const notification = await Notification.create({ user: userId, title, message, type });
    
    // Emit real-time WebSocket event to the specific user's room
    if (io) {
      io.to(userId.toString()).emit('new_notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

module.exports = { getNotifications, markAsRead, createNotification };
