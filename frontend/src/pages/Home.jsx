import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import FilterBar from '../components/FilterBar';
import MapView from '../components/MapView';


const Home = () => {
  const location = useLocation();
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    propertyType: 'all',
    guests: '',
    bedrooms: '',
    amenities: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentView, setCurrentView] = useState('grid'); // 'grid' or 'map'

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    fetchProperties();
  }, []);


  
  useEffect(() => {
    applyFilters();
  }, [allProperties, filters, searchQuery]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties();
      setAllProperties(data.properties || []);
    } catch (err) {
      setError('Failed to load properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProperties];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply property type filter
    if (filters.propertyType && filters.propertyType !== 'all') {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(filters.propertyType.toLowerCase())
      );
    }

    // Apply price range filter
    if (filters.priceRange && filters.priceRange[1] < 1000) {
      filtered = filtered.filter(property =>
        parseFloat(property.pricePerNight) <= filters.priceRange[1]
      );
    }

    // Apply guests filter
    if (filters.guests) {
      const guestCount = parseInt(filters.guests);
      filtered = filtered.filter(property =>
        property.maxGuests >= guestCount
      );
    }

    // Apply bedrooms filter
    if (filters.bedrooms) {
      const bedroomCount = parseInt(filters.bedrooms);
      filtered = filtered.filter(property =>
        property.bedrooms >= bedroomCount
      );
    }

    // Apply amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(property =>
        filters.amenities.every(amenity =>
          property.amenities.some(propAmenity =>
            propAmenity.toLowerCase().includes(amenity.toLowerCase()) ||
            (amenity === 'ac' && propAmenity.toLowerCase().includes('air conditioning')) ||
            (amenity === 'wifi' && propAmenity.toLowerCase().includes('wifi'))
          )
        )
      );
    }

    setFilteredProperties(filtered);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.propertyType !== 'all') count++;
    if (filters.priceRange[1] < 1000) count++;
    if (filters.guests) count++;
    if (filters.bedrooms) count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    if (searchQuery) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing places to stay...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchProperties} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Find your next adventure</h1>
          <p className="hero-subtitle">
            Discover unique places to stay around the world
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="container">
          <FilterBar 
            onFiltersChange={handleFiltersChange} 
            activeFilters={filters}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
        </div>
      </section>

      {/* View Toggle and Results */}
      <section className="properties-section">
        <div className="container">
          {/* View Toggle */}
          <div className="search-filters-row">
            <div className="view-toggle">
              <button 
                className={`view-toggle-btn ${currentView === 'grid' ? 'active' : ''}`}
                onClick={() => setCurrentView('grid')}
                data-testid="grid-view-btn"
              >
                <span>📋</span> Grid View
              </button>
              <button 
                className={`view-toggle-btn ${currentView === 'map' ? 'active' : ''}`}
                onClick={() => setCurrentView('map')}
                data-testid="map-view-btn"
              >
                <span>🗺️</span> Map View
              </button>
            </div>
            
            <h2 className="section-title">
              {filteredProperties.length} stays available
              {getActiveFiltersCount() > 0 && (
                <span className="filter-count"> ({getActiveFiltersCount()} filters applied)</span>
              )}
            </h2>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="active-filters">
              {searchQuery && (
                <div className="active-filter-tag">
                  Search: "{searchQuery}"
                  <button 
                    className="filter-remove-btn" 
                    onClick={() => setSearchQuery('')}
                    data-testid="remove-search-filter"
                  >
                    ×
                  </button>
                </div>
              )}
              {filters.propertyType !== 'all' && (
                <div className="active-filter-tag">
                  Type: {filters.propertyType}
                  <button 
                    className="filter-remove-btn" 
                    onClick={() => setFilters({...filters, propertyType: 'all'})}
                  >
                    ×
                  </button>
                </div>
              )}
              {filters.priceRange[1] < 1000 && (
                <div className="active-filter-tag">
                  Max: ${filters.priceRange[1]}
                  <button 
                    className="filter-remove-btn" 
                    onClick={() => setFilters({...filters, priceRange: [0, 1000]})}
                  >
                    ×
                  </button>
                </div>
              )}
              {filters.guests && (
                <div className="active-filter-tag">
                  {filters.guests} guest{filters.guests !== '1' ? 's' : ''}
                  <button 
                    className="filter-remove-btn" 
                    onClick={() => setFilters({...filters, guests: ''})}
                  >
                    ×
                  </button>
                </div>
              )}
              {filters.bedrooms && (
                <div className="active-filter-tag">
                  {filters.bedrooms} bedroom{filters.bedrooms !== '1' ? 's' : ''}
                  <button 
                    className="filter-remove-btn" 
                    onClick={() => setFilters({...filters, bedrooms: ''})}
                  >
                    ×
                  </button>
                </div>
              )}
              {filters.amenities.map((amenity, index) => (
                <div key={amenity} className="active-filter-tag">
                  {amenity === 'ac' ? 'Air conditioning' : amenity}
                  <button 
                    className="filter-remove-btn" 
                    onClick={() => setFilters({
                      ...filters, 
                      amenities: filters.amenities.filter(a => a !== amenity)
                    })}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button 
                className="clear-all-filters-btn"
                onClick={() => {
                  setFilters({
                    priceRange: [0, 1000],
                    propertyType: 'all',
                    guests: '',
                    bedrooms: '',
                    amenities: []
                  });
                  setSearchQuery('');
                }}
                data-testid="clear-all-filters"
              >
                Clear all
              </button>
            </div>
          )}
          
          {/* Content based on current view */}
          {currentView === 'map' ? (
            <MapView 
              properties={filteredProperties}
              onPropertyClick={handlePropertyClick}
              selectedProperty={selectedProperty}
            />
          ) : (
            filteredProperties.length > 0 ? (
              <div className="properties-grid" data-testid="properties-grid">
                {filteredProperties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    isSelected={selectedProperty?.id === property.id}
                    onClick={() => handlePropertyClick(property)}
                  />
                ))}
              </div>
            ) : (
              <div className="no-properties" data-testid="no-properties">
                <p>No properties found matching your criteria.</p>
                <button onClick={fetchProperties} className="refresh-button">
                  Refresh
                </button>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;