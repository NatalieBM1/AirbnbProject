const express = require('express');
const { 
  getAllPayments, 
  getPaymentById, 
  getPaymentsByBooking, 
  createPayment, 
  updatePaymentStatus, 
  refundPayment 
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de pagos requieren autenticación
router.use(authMiddleware);

router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.get('/booking/:bookingId', getPaymentsByBooking);
router.post('/', createPayment);
router.patch('/:id/status', updatePaymentStatus);
router.patch('/:id/refund', refundPayment);

module.exports = router;