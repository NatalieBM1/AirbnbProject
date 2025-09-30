import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Common search suggestions
  const searchSuggestions = [
    'Malibu, California',
    'Aspen, Colorado', 
    'New York, NY',
    'Miami Beach, Florida',
    'San Francisco, California',
    'Austin, Texas',
    'Seattle, Washington',
    'Portland, Oregon'
  ];

  const filteredSuggestions = searchSuggestions.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Call parent component's search function
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
      setShowSuggestions(false);
      
      // Navigate to home if not already there
      if (window.location.pathname !== '/') {
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
    if (window.location.pathname !== '/') {
      navigate(`/?search=${encodeURIComponent(suggestion)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">airbnbbm</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="navbar-search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <input
                type="text"
                placeholder="Where are you going?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="search-input"
                data-testid="search-input"
              />
              <button type="submit" className="search-button" data-testid="search-button">
                <span className="search-icon">🔍</span>
              </button>
              
              {/* Search Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="search-suggestions" data-testid="search-suggestions">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="search-suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                      data-testid={`search-suggestion-${index}`}
                    >
                      📍 {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-icon">👤</span>
                <span className="user-name">{user?.firstName}</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to="/notifications" className="dropdown-item">
                    Notifications
                  </Link>
                  <Link to="/bookings" className="dropdown-item">
                    My Bookings
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button login">
                Log In
              </Link>
              <Link to="/register" className="auth-button signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;