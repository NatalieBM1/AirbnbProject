import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Booking from './pages/Booking';
import Notifications from './pages/Notifications';
import Payment from './pages/Payment';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const navigate = useNavigate();

  const handleGlobalSearch = (query) => {
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  return (
    <AuthProvider>
      <div className="App">
        <Navbar onSearch={handleGlobalSearch} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/booking/:propertyId" element={<Booking />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/payment/:bookingId" element={<Payment />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;