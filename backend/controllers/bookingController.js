// Datos de reservas de ejemplo
let bookings = [];

const getAllBookings = async (req, res) => {
  try {
    const userId = req.user?.userId || '2'; // En producción, obtener desde JWT
    const userBookings = bookings.filter(b => b.guestId === userId);
    
    res.json({ 
      bookings: userBookings 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests, totalAmount, specialRequests } = req.body;
    
    const newBooking = {
      id: 'booking-' + Date.now(),
      propertyId,
      guestId: req.user?.userId || '2', // En producción, obtener desde JWT
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
      totalAmount,
      status: 'pending',
      specialRequests: specialRequests || null,
      createdAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    res.status(201).json({ 
      booking: newBooking,
      message: 'Booking created successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingIndex = bookings.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    bookings[bookingIndex] = { ...bookings[bookingIndex], ...req.body };
    res.json({ booking: bookings[bookingIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booking', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingIndex = bookings.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    bookings[bookingIndex].status = 'cancelled';
    res.json({ 
      booking: bookings[bookingIndex],
      message: 'Booking cancelled successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
};
module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking
};