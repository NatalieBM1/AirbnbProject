import { useEffect, useRef, useState } from "react";
import { Property } from "@shared/schema";
import { ZoomIn, ZoomOut, RotateCcw, Maximize } from "lucide-react";
import L from 'leaflet';

// Importar CSS de Leaflet
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  properties: Property[];
  onMarkerClick?: (propertyId: string) => void;
  selectedPropertyId?: string;
}

export default function MapView({ properties, onMarkerClick, selectedPropertyId }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [isMapReady, setIsMapReady] = useState(false);

  // Crear íconos de marcadores personalizados
  const createMarkerIcon = (property: Property, isSelected: boolean = false) => {
    const price = Math.floor(parseFloat(property.pricePerNight));
    const size = isSelected ? [120, 40] : [100, 35];
    const backgroundColor = isSelected ? '#ef4444' : '#ff385c';
    const textColor = '#ffffff';
    
    return L.divIcon({
      html: `
        <div style="
          background: linear-gradient(145deg, ${backgroundColor}, ${isSelected ? '#dc2626' : '#e11d48'});
          color: ${textColor};
          padding: ${isSelected ? '8px 16px' : '6px 12px'};
          border-radius: 20px;
          font-weight: bold;
          font-size: ${isSelected ? '14px' : '12px'};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 2px solid white;
          text-align: center;
          white-space: nowrap;
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          transition: transform 0.2s ease;
          cursor: pointer;
        ">
          $${price}
        </div>
      `,
      className: 'custom-marker',
      iconSize: size as [number, number],
      iconAnchor: [size[0] / 2, size[1]],
      popupAnchor: [0, -size[1]]
    });
  };

  // Inicializar el mapa de Leaflet
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
  // Calcular el centro de las propiedades en Colombia
      const validProps = properties.filter(p => 
        p.latitude && p.longitude && 
        !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude))
      );
      
  let center: [number, number] = [4.5709, -74.2973]; // Centro predeterminado de Colombia
      
      if (validProps.length > 0) {
        const avgLat = validProps.reduce((sum, p) => sum + parseFloat(p.latitude!), 0) / validProps.length;
        const avgLng = validProps.reduce((sum, p) => sum + parseFloat(p.longitude!), 0) / validProps.length;
        center = [avgLat, avgLng];
      }

  // Crear el mapa con dimensiones explícitas
      const map = L.map(mapRef.current, {
        center: center,
        zoom: 6,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: false,
        maxZoom: 19,
        minZoom: 2
      });

      console.log('Map initialized with center:', center);

  // Agregar capas de mapa - usando varios proveedores confiables
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd'
      });
      
      tileLayer.on('tileerror', () => {
        console.log('Tile error, trying fallback...');
  // Alternativa a OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);
      });
      
      tileLayer.addTo(map);
      
      console.log('Tiles added to map');

  // Forzar el redimensionamiento del mapa después de un momento
      setTimeout(() => {
        map.invalidateSize();
        console.log('Map size invalidated');
      }, 200);

  // Agregar otra verificación de redimensionamiento
      setTimeout(() => {
        map.invalidateSize();
        const container = map.getContainer();
        console.log('Map container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
      }, 500);

      mapInstanceRef.current = map;
      setIsMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // Actualizar los marcadores en el mapa
  const updateMarkers = () => {
    if (!mapInstanceRef.current || !isMapReady) return;

  // Limpiar los marcadores existentes
    Object.values(markersRef.current).forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = {};

  // Agregar nuevos marcadores
    properties.forEach(property => {
      const lat = parseFloat(property.latitude || '0');
      const lng = parseFloat(property.longitude || '0');
      
      if (isNaN(lat) || isNaN(lng)) return;

      const isSelected = selectedPropertyId === property.id;
      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(property, isSelected)
      });

  // Crear contenido del popup
      const popupContent = `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-width: 250px;
          padding: 4px;
        ">
          <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 8px;">
            <h4 style="font-weight: bold; font-size: 14px; margin: 0; color: #111; line-height: 1.3;">
              ${property.title}
            </h4>
            <div style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-left: 8px;">
              ⭐ ${property.rating}
            </div>
          </div>
          
          <p style="margin: 4px 0; color: #666; font-size: 12px; display: flex; align-items: center;">
            <span style="margin-right: 4px;">📍</span>
            ${property.location}
          </p>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #888;">
              <span>👥 ${property.maxGuests}</span>
              <span>•</span>
              <span>🛏️ ${property.bedrooms}</span>
              <span>•</span>
              <span>🚿 ${property.bathrooms}</span>
            </div>
            <span style="font-size: 10px; color: #aaa;">(${property.reviewCount} reseñas)</span>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 16px; font-weight: bold; color: #111;">
              $${property.pricePerNight}
              <span style="font-size: 12px; font-weight: normal; color: #666;">/noche</span>
            </span>
            <div style="display: flex; gap: 4px;">
              ${property.amenities?.slice(0, 3).map(amenity => 
                `<span style="background: #e0f2fe; color: #0277bd; font-size: 10px; padding: 2px 6px; border-radius: 8px;">${amenity}</span>`
              ).join('')}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(property.id);
        }
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current[property.id] = marker;
    });
  };

  // Funciones de control del mapa
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([4.5709, -74.2973], 6);
    }
  };

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || properties.length === 0) return;
    
    const validProps = properties.filter(p => 
      p.latitude && p.longitude && 
      !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude))
    );
    
    if (validProps.length > 0) {
      const bounds = L.latLngBounds(
        validProps.map(p => [parseFloat(p.latitude!), parseFloat(p.longitude!)] as [number, number])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  // Inicializar el mapa al montar el componente
  useEffect(() => {
  // Agregar un pequeño retraso para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Actualizar los marcadores cuando cambian las propiedades
  useEffect(() => {
    if (isMapReady) {
      updateMarkers();
    }
  }, [properties, selectedPropertyId, isMapReady]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden relative shadow-lg" data-testid="map-container">
      <div className="relative">
  {/* Contenedor del mapa Leaflet */}
        <div
          ref={mapRef}
          className="w-full h-[600px] relative z-0 bg-blue-50"
          data-testid="map-canvas"
          style={{ 
            minHeight: '600px',
            maxHeight: '600px',
            height: '600px'
          }}
        />
        
  {/* Controles del mapa */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg"
            data-testid="zoom-in-btn"
            title="Acercar"
          >
            <ZoomIn className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg"
            data-testid="zoom-out-btn"
            title="Alejar"
          >
            <ZoomOut className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handleResetView}
            className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg"
            data-testid="reset-view-btn"
            title="Centrar en Colombia"
          >
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handleFitBounds}
            className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg"
            data-testid="fit-bounds-btn"
            title="Ver todos los hospedajes"
          >
            <Maximize className="h-4 w-4 text-gray-600" />
          </button>
        </div>

  {/* Capa de carga */}
        {!isMapReady && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando mapa de calles...</p>
              <p className="text-xs text-gray-500 mt-2">Conectando con OpenStreetMap</p>
            </div>
          </div>
        )}
      </div>

  {/* Leyenda del mapa */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full border border-white shadow-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">$</span>
              </div>
              <span className="text-gray-700 font-medium">Hospedajes ({properties.length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-4 bg-gradient-to-r from-red-500 to-red-700 rounded-full border border-white shadow-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">$</span>
              </div>
              <span className="text-gray-700 font-medium">Seleccionado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <span className="text-gray-700 font-medium">Calles y ciudades</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              🖱️ Arrastra • 👆 Click en marcadores • 🔍 Zoom con scroll
            </div>
            <div className="text-xs text-gray-400">
              Mapa © OpenStreetMap
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
