// Datos de pagos de ejemplo
let payments = [];

const getAllPayments = async (req, res) => {
  try {
    const userId = req.user?.userId || '2'; // En producción, obtener desde JWT
    // Get bookings for user to filter payments
    // Obtiene las reservas del usuario para filtrar los pagos
    const userPayments = payments.filter(p => p.userId === userId);
    
    res.json({ 
      payments: userPayments 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = payments.find(p => p.id === id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json({ payment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
  }
};

const getPaymentsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookingPayments = payments.filter(p => p.bookingId === bookingId);
    
    res.json({ 
      payments: bookingPayments 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;
    
    const newPayment = {
      id: 'payment-' + Date.now(),
      bookingId,
      userId: req.user?.userId || '2', // En producción, obtener desde JWT
      amount,
      paymentMethod,
      status: 'completed', // Simula un pago exitoso
      transactionId: 'txn-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    
    payments.push(newPayment);
    res.status(201).json({ 
      payment: newPayment,
      message: 'Payment processed successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const paymentIndex = payments.findIndex(p => p.id === id);
    
    if (paymentIndex === -1) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    payments[paymentIndex].status = status;
    res.json({ 
      payment: payments[paymentIndex],
      message: 'Payment status updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
};

const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIndex = payments.findIndex(p => p.id === id);
    
    if (paymentIndex === -1) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payments[paymentIndex].status === 'refunded') {
      return res.status(400).json({ message: 'Payment already refunded' });
    }
    
    payments[paymentIndex].status = 'refunded';
    res.json({ 
      payment: payments[paymentIndex],
      message: 'Payment refunded successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to refund payment', error: error.message });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByBooking,
  createPayment,
  updatePaymentStatus,
  refundPayment
  
};