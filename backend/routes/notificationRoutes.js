const express = require('express');
const { 
  getAllNotifications, 
  markAsRead, 
  createNotification, 
  deleteNotification 
} = require('../controllers/notificationController');

// Middleware de autenticación
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de notificaciones requieren autenticación
router.use(authMiddleware);

// Definir las rutas para las notificaciones
router.get('/', getAllNotifications);
router.patch('/:id/read', markAsRead);
router.post('/', createNotification);
router.delete('/:id', deleteNotification);

// Exportar el router
module.exports = router;