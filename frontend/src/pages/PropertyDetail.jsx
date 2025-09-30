import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProperty } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PropertyDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  
  const fetchProperty = async () => {
    try {
      setLoading(true);
      const data = await getProperty(id);
      setProperty(data.property);
    } catch (err) {
      setError('Property not found');
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="error-container">
        <h2>Property not found</h2>
        <p>{error}</p>
        <Link to="/" className="back-button">
          Back to Home
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'];

  return (
    <div className="property-detail-page">
      <div className="container">
        {/* Back Button */}
        <Link to="/" className="back-link">
          ← Back to search
        </Link>

        {/* Property Header */}
        <div className="property-header">
          <h1 className="property-title">{property.title}</h1>
          <div className="property-meta">
            <div className="rating">
              <span className="star">⭐</span>
              <span>{property.rating}</span>
              <span>({property.reviewCount} reviews)</span>
            </div>
            <div className="location">📍 {property.location}</div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img 
              src={images[selectedImage]} 
              alt={property.title}
              className="featured-image"
            />
          </div>
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.slice(0, 5).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${property.title} view ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="property-content">
          <div className="property-info">
            {/* Basic Info */}
            <div className="basic-info">
              <h2>About this place</h2>
              <div className="property-specs">
                <span>{property.maxGuests} guests</span>
                <span>{property.bedrooms} bedrooms</span>
                <span>{property.bathrooms} bathrooms</span>
              </div>
              <p className="description">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="amenities-section">
                <h3>What this place offers</h3>
                <div className="amenities-grid">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <span className="amenity-icon">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="booking-sidebar">
            <div className="booking-card">
              <div className="price-display">
                <span className="price">{formatPrice(property.pricePerNight)}</span>
                <span className="period">night</span>
              </div>

              <div className="rating-summary">
                <span className="star">⭐</span>
                <span>{property.rating}</span>
                <span>({property.reviewCount} reviews)</span>
              </div>

              {isAuthenticated ? (
                <Link 
                  to={`/booking/${property.id}`}
                  className="book-button primary"
                >
                  Reserve
                </Link>
              ) : (
                <Link 
                  to="/login"
                  className="book-button primary"
                >
                  Log in to book
                </Link>
              )}

              <p className="booking-note">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;