import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property, isSelected = false, onClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const mainImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400';

  return (
    <Link 
      to={`/property/${property.id}`} 
      className={`property-card ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(property);
        }
      }}
      data-testid={`property-card-${property.id}`}
    >
      <div className="property-image-container">
        <img 
          src={mainImage} 
          alt={property.title}
          className="property-image"
        />
        <button className="favorite-button">
          <span className="heart-icon">🤍</span>
        </button>
      </div>
      
      <div className="property-info">
        <div className="property-header">
          <div className="property-rating">
            <span className="star-icon">⭐</span>
            <span className="rating-text">{property.rating}</span>
            <span className="review-count">({property.reviewCount})</span>
          </div>
        </div>
        
        <h3 className="property-title">{property.title}</h3>
        <p className="property-location">{property.location}</p>
        
        <div className="property-details">
          <span className="guests">{property.maxGuests} guests</span>
          <span className="bedrooms">{property.bedrooms} bedrooms</span>
          <span className="bathrooms">{property.bathrooms} bathrooms</span>
        </div>
        
        <div className="property-pricing">
          <span className="price">{formatPrice(property.pricePerNight)}</span>
          <span className="price-period">night</span>
        </div>
      </div>
    </Link>
  );
};



export default PropertyCard;