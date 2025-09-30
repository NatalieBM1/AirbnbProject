import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, createBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const { propertyId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Datos del formulario de reserva
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  });
// Redirige a login si no está autenticado y carga la propiedad
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    fetchProperty();
  }, [propertyId, isAuthenticated]);
// Obtiene la propiedad desde la API
  const fetchProperty = async () => {
    try {
      const data = await getProperty(propertyId);
      setProperty(data.property);
    } catch (err) {
      setError('Property not found');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    if (!property || !bookingData.checkIn || !bookingData.checkOut) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return 0;
    
    const basePrice = parseFloat(property.pricePerNight) * nights;
    const cleaningFee = 50; // Fixed cleaning fee
    const serviceFee = basePrice * 0.1; // 10% service fee
    
    return basePrice + cleaningFee + serviceFee;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const total = calculateTotal();
      
      const booking = await createBooking({
        propertyId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: parseInt(bookingData.guests),
        totalAmount: total.toFixed(2),
        specialRequests: bookingData.specialRequests || null
      });

      // Navigate to payment page
      navigate(`/payment/${booking.booking.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="error-container">
        <h2>Property not found</h2>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  const totalPrice = calculateTotal();
  const nights = bookingData.checkIn && bookingData.checkOut ? 
    Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-content">
          {/* Property Summary */}
          <div className="property-summary">
            <img 
              src={property.images?.[0] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300'} 
              alt={property.title}
              className="property-thumbnail"
            />
            <div className="property-details">
              <h2>{property.title}</h2>
              <p>{property.location}</p>
              <div className="rating">
                <span>⭐ {property.rating}</span>
                <span>({property.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="booking-form-container">
            <h3>Complete your booking</h3>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkIn">Check-in</label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={bookingData.checkIn}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkOut">Check-out</label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={bookingData.checkOut}
                    onChange={handleInputChange}
                    required
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="guests">Guests</label>
                <select
                  id="guests"
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleInputChange}
                  required
                >
                  {Array.from({ length: property.maxGuests }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} guest{i > 0 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="specialRequests">Special requests (optional)</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any special requests or requirements..."
                />
              </div>

              {/* Price Breakdown */}
              {totalPrice > 0 && (
                <div className="price-breakdown">
                  <h4>Price breakdown</h4>
                  <div className="price-line">
                    <span>${property.pricePerNight} x {nights} nights</span>
                    <span>${(parseFloat(property.pricePerNight) * nights).toFixed(2)}</span>
                  </div>
                  <div className="price-line">
                    <span>Cleaning fee</span>
                    <span>$50.00</span>
                  </div>
                  <div className="price-line">
                    <span>Service fee</span>
                    <span>${(parseFloat(property.pricePerNight) * nights * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="price-total">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="confirm-booking-button"
                disabled={submitting || totalPrice <= 0}
              >
                {submitting ? 'Processing...' : `Confirm and pay $${totalPrice.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;