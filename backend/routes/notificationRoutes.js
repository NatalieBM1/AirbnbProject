const express = require('express');
const { 
  getAllNotifications, 
  markAsRead, 
  createNotification, 
  deleteNotification 
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de notificaciones requieren autenticación
router.use(authMiddleware);

router.get('/', getAllNotifications);
router.patch('/:id/read', markAsRead);
router.post('/', createNotification);
router.delete('/:id', deleteNotification);

module.exports = router;