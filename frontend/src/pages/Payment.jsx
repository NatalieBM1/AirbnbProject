import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBooking, createPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const { bookingId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  

  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBooking();
  }, [bookingId, isAuthenticated]);

  const fetchBooking = async () => {
    try {
      const data = await getBooking(bookingId);
      setBooking(data.booking);
    } catch (err) {
      setError('Booking not found');
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e) => {
    let value = e.target.value;
    
    // Format card number
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    // Format expiry date
    if (e.target.name === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }
    
    // Format CVV
    if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '');
    }

    setPaymentData({
      ...paymentData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await createPayment({
        bookingId,
        amount: booking.totalAmount,
        paymentMethod: paymentData.paymentMethod
      });

      setSuccess(true);
      
      // Redirect to success page after delay
      setTimeout(() => {
        navigate('/', { 
          state: { message: 'Payment successful! Your booking is confirmed.' }
        });
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="error-container">
        <h2>Booking not found</h2>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="payment-success">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>Your booking has been confirmed. You will receive a confirmation email shortly.</p>
          <div className="booking-details">
            <p><strong>Booking ID:</strong> {booking.id}</p>
            <p><strong>Amount Paid:</strong> ${parseFloat(booking.totalAmount).toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-content">
          {/* Booking Summary */}
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-details">
              <p><strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}</p>
              <p><strong>Guests:</strong> {booking.guests}</p>
              <p><strong>Total Amount:</strong> ${parseFloat(booking.totalAmount).toFixed(2)}</p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-container">
            <h3>Payment Information</h3>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={paymentData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {paymentData.paymentMethod === 'card' && (
                <>
                  <div className="form-group">
                    <label htmlFor="nameOnCard">Name on Card</label>
                    <input
                      type="text"
                      id="nameOnCard"
                      name="nameOnCard"
                      value={paymentData.nameOnCard}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate">Expiry Date</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handleInputChange}
                        required
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handleInputChange}
                        required
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="billingAddress">Billing Address</label>
                    <textarea
                      id="billingAddress"
                      name="billingAddress"
                      value={paymentData.billingAddress}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  </div>
                </>
              )}

              <div className="payment-total">
                <h4>Total: ${parseFloat(booking.totalAmount).toFixed(2)}</h4>
              </div>

              <button 
                type="submit" 
                className="pay-button"
                disabled={processing}
              >
                {processing ? 'Processing Payment...' : `Pay $${parseFloat(booking.totalAmount).toFixed(2)}`}
              </button>

              <p className="payment-note">
                Your payment information is secure and encrypted. 
                This is a demo - no real charges will be made.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;