import React, { useEffect, useRef, useState } from 'react';

const MapView = ({ properties, onPropertyClick, selectedProperty }) => {
  const canvasRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 34.0522, lng: -118.2437 }); // Default to LA
  const [zoom, setZoom] = useState(10);
  const [tooltip, setTooltip] = useState(null);

  // Convert lat/lng to canvas coordinates
  const latLngToPixel = (lat, lng, canvasWidth, canvasHeight) => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    
    // Simple mercator projection
    const x = ((lng - mapCenter.lng) * zoom + canvasWidth / 2);
    const y = (canvasHeight / 2 - (lat - mapCenter.lat) * zoom);
    
    return { x, y };
  };

  // Draw the map
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw property markers
    properties.forEach((property, index) => {
      const lat = parseFloat(property.latitude);
      const lng = parseFloat(property.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const { x, y } = latLngToPixel(lat, lng, width, height);
      
      // Skip if marker is outside canvas
      if (x < 0 || x > width || y < 0 || y > height) return;

      // Draw marker background (larger circle)
      ctx.fillStyle = selectedProperty?.id === property.id ? '#ef4444' : '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw marker border
      ctx.strokeStyle = selectedProperty?.id === property.id ? '#dc2626' : '#ff385c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw price text
      ctx.fillStyle = selectedProperty?.id === property.id ? '#ffffff' : '#ff385c';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`$${property.pricePerNight}`, x, y);

      // Store marker bounds for click detection
      if (!property._markerBounds) {
        property._markerBounds = { x: x - 16, y: y - 16, width: 32, height: 32 };
      }
    });
  };

  // Handle canvas click
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check if click is on a marker
    const clickedProperty = properties.find(property => {
      if (!property._markerBounds) return false;
      const { x, y, width, height } = property._markerBounds;
      return clickX >= x && clickX <= x + width && 
             clickY >= y && clickY <= y + height;
    });

    if (clickedProperty && onPropertyClick) {
      onPropertyClick(clickedProperty);
    }
  };

  // Handle mouse move for tooltips
  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if mouse is over a marker
    const hoveredProperty = properties.find(property => {
      if (!property._markerBounds) return false;
      const { x, y, width, height } = property._markerBounds;
      return mouseX >= x && mouseX <= x + width && 
             mouseY >= y && mouseY <= y + height;
    });

    if (hoveredProperty) {
      setTooltip({
        property: hoveredProperty,
        x: mouseX,
        y: mouseY
      });
      canvas.style.cursor = 'pointer';
    } else {
      setTooltip(null);
      canvas.style.cursor = 'default';
    }
  };

  // Auto-center map on properties
  useEffect(() => {
    if (properties.length > 0) {
      const validProps = properties.filter(p => 
        !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude))
      );
      
      if (validProps.length > 0) {
        const avgLat = validProps.reduce((sum, p) => sum + parseFloat(p.latitude), 0) / validProps.length;
        const avgLng = validProps.reduce((sum, p) => sum + parseFloat(p.longitude), 0) / validProps.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      }
    }
  }, [properties]);

  // Redraw when properties or settings change
  useEffect(() => {
    drawMap();
  }, [properties, mapCenter, zoom, selectedProperty]);

  // Handle zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 50));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 5));

  return (
    <div className="map-container" data-testid="map-container">
      <div className="map-wrapper">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setTooltip(null)}
          data-testid="map-canvas"
        />
        
        {/* Map Controls */}
        <div className="map-controls">
          <button 
            onClick={handleZoomIn} 
            className="map-control-btn"
            data-testid="zoom-in-btn"
            title="Zoom In"
          >
            +
          </button>
          <button 
            onClick={handleZoomOut} 
            className="map-control-btn"
            data-testid="zoom-out-btn"
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* Property Tooltip */}
        {tooltip && (
          <div 
            className="map-tooltip"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10
            }}
            data-testid="map-tooltip"
          >
            <div className="tooltip-content">
              <h4>{tooltip.property.title}</h4>
              <p>{tooltip.property.location}</p>
              <p className="tooltip-price">${tooltip.property.pricePerNight}/night</p>
              <div className="tooltip-rating">
                ⭐ {tooltip.property.rating} ({tooltip.property.reviewCount} reviews)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-marker"></div>
          <span>Available Properties ({properties.length})</span>
        </div>
      </div>
    </div>
  );
};


export default MapView;