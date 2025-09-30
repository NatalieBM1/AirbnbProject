// Datos de notificaciones de ejemplo
let notifications = [
  {
    id: 'notif-1',
    userId: '2',
    title: 'Booking Confirmed',
    message: 'Your booking for Beachfront Villa in Malibu has been confirmed!',
    type: 'booking',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-2',
    userId: '2',
    title: 'Payment Successful',
    message: 'Your payment of $897.00 has been processed successfully.',
    type: 'payment',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString() // Hace 1 día
  }
];

const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || '2'; // En producción, obtener desde JWT
    const userNotifications = notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ 
      notifications: userNotifications 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    res.json({ 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    
    const newNotification = {
      id: 'notif-' + Date.now(),
      userId,
      title,
      message,
      type: type || 'general',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    res.status(201).json({ 
      notification: newNotification,
      message: 'Notification created successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notificationIndex = notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notifications.splice(notificationIndex, 1);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

module.exports = {
  getAllNotifications,
  markAsRead,
  createNotification,
  deleteNotification
  
};