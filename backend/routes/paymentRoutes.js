const express = require('express');
const { 
  getAllPayments, 
  getPaymentById, 
  getPaymentsByBooking, 
  createPayment, 
  updatePaymentStatus, 
  refundPayment 
} = require('../controllers/paymentController');

// Middleware de autenticación
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de pagos requieren autenticación
router.use(authMiddleware);

// Definir las rutas para los pagos
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.get('/booking/:bookingId', getPaymentsByBooking);
router.post('/', createPayment);
router.patch('/:id/status', updatePaymentStatus);
router.patch('/:id/refund', refundPayment);

// Exportar el router
module.exports = router;