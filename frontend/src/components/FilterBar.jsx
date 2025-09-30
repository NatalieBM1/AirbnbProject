import React, { useState } from 'react'; 

// incluyendo rango de precios, tipo de propiedad, número de huéspedes, habitaciones y amenidades.
const FilterBar = ({ onFiltersChange }) => {
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 1000],
    propertyType: 'all',
    guests: '',
    bedrooms: '',
    amenities: []
  });

  const propertyTypes = [
    { id: 'all', label: 'All types', icon: '🏠' },
    { id: 'house', label: 'House', icon: '🏡' },
    { id: 'apartment', label: 'Apartment', icon: '🏢' },
    { id: 'villa', label: 'Villa', icon: '🏖️' },
    { id: 'cabin', label: 'Cabin', icon: '🏔️' },
    { id: 'loft', label: 'Loft', icon: '🏙️' }
  ];

  const amenities = [
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'pool', label: 'Pool', icon: '🏊' },
    { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { id: 'parking', label: 'Parking', icon: '🚗' },
    { id: 'ac', label: 'Air conditioning', icon: '❄️' },
    { id: 'tv', label: 'TV', icon: '📺' }
  ];

  const handlePropertyTypeChange = (type) => {
    const updatedFilters = { ...activeFilters, propertyType: type };
    setActiveFilters(updatedFilters);
    onFiltersChange && onFiltersChange(updatedFilters);
  };

  const handleAmenityToggle = (amenityId) => {
    const updatedAmenities = activeFilters.amenities.includes(amenityId)
      ? activeFilters.amenities.filter(id => id !== amenityId)
      : [...activeFilters.amenities, amenityId];
    
    const updatedFilters = { ...activeFilters, amenities: updatedAmenities };
    setActiveFilters(updatedFilters);
    onFiltersChange && onFiltersChange(updatedFilters);
  };

  const handleInputChange = (field, value) => {
    const updatedFilters = { ...activeFilters, [field]: value };
    setActiveFilters(updatedFilters);
    onFiltersChange && onFiltersChange(updatedFilters);
  };

  return (
    <div className="filter-bar">
      {/* Property Types */}
      <div className="filter-section">
        <div className="filter-types">
          {propertyTypes.map((type) => (
            <button
              key={type.id}
              className={`filter-type-button ${activeFilters.propertyType === type.id ? 'active' : ''}`}
              onClick={() => handlePropertyTypeChange(type.id)}
            >
              <span className="filter-icon">{type.icon}</span>
              <span className="filter-label">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="filter-section">
        <div className="quick-filters">
          <div className="filter-input-group">
            <label>Guests</label>
            <select 
              value={activeFilters.guests}
              onChange={(e) => handleInputChange('guests', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1 guest</option>
              <option value="2">2 guests</option>
              <option value="4">4 guests</option>
              <option value="6">6+ guests</option>
            </select>
          </div>

          <div className="filter-input-group">
            <label>Bedrooms</label>
            <select 
              value={activeFilters.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1 bedroom</option>
              <option value="2">2 bedrooms</option>
              <option value="3">3 bedrooms</option>
              <option value="4">4+ bedrooms</option>
            </select>
          </div>

          <div className="filter-input-group">
            <label>Price Range</label>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="1000"
                value={activeFilters.priceRange[1]}
                onChange={(e) => handleInputChange('priceRange', [0, parseInt(e.target.value)])}
              />
              <span className="price-display">Up to ${activeFilters.priceRange[1]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="filter-section">
        <h4>Amenities</h4>
        <div className="amenity-filters">
          {amenities.map((amenity) => (
            <button
              key={amenity.id}
              className={`amenity-button ${activeFilters.amenities.includes(amenity.id) ? 'active' : ''}`}
              onClick={() => handleAmenityToggle(amenity.id)}
            >
              <span className="amenity-icon">{amenity.icon}</span>
              <span className="amenity-label">{amenity.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;