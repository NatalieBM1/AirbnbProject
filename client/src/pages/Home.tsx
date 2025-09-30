import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { propertyApi } from "@/services/api";
import PropertyCard from "@/components/PropertyCard";
import FilterBar from "@/components/FilterBar";
import MapView from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid, Map, X } from "lucide-react";

interface Filters {
  priceRange: [number, number];
  propertyType: string;
  guests: string;
  bedrooms: string;
  amenities: string[];
}

export default function Home() {
  const [location] = useLocation();
  const [currentView, setCurrentView] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 1000],
    propertyType: 'all',
    guests: 'any',
    bedrooms: 'any',
    amenities: []
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => propertyApi.getProperties(),
  });

  // Get search query from URL - reactive to location changes
  useEffect(() => {
    const urlPart = location.split('?')[1] || '';
    const urlParams = new URLSearchParams(urlPart);
    const search = urlParams.get('search') || '';
    setSearchQuery(search);
  }, [location]);

  // Filter properties based on search and filters
  const filteredProperties = data?.properties?.filter((property: any) => {
    // Apply search filter
    if (searchQuery) {
      const searchMatch = 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;
    }

    // Apply property type filter
    if (filters.propertyType && filters.propertyType !== 'all') {
      let typeMatch = false;
      
      switch (filters.propertyType) {
        case 'pools':
          typeMatch = property.amenities?.some((amenity: string) => 
            amenity.toLowerCase().includes('piscina') || 
            amenity.toLowerCase().includes('pool')
          );
          break;
        case 'cabins':
          typeMatch = property.title.toLowerCase().includes('cabaña') || 
                     property.title.toLowerCase().includes('cabin') ||
                     property.location.toLowerCase().includes('montaña');
          break;
        case 'beachfront':
          typeMatch = property.location.toLowerCase().includes('cartagena') || 
                     property.location.toLowerCase().includes('santa marta') ||
                     property.location.toLowerCase().includes('costa') ||
                     property.amenities?.some((amenity: string) => 
                       amenity.toLowerCase().includes('playa')
                     );
          break;
        case 'tiny-homes':
          typeMatch = property.title.toLowerCase().includes('pequeña') || 
                     property.title.toLowerCase().includes('tiny') ||
                     property.bedrooms <= 1;
          break;
        case 'treehouses':
          typeMatch = property.title.toLowerCase().includes('árbol') || 
                     property.title.toLowerCase().includes('tree');
          break;
        case 'design':
          typeMatch = property.title.toLowerCase().includes('moderna') || 
                     property.title.toLowerCase().includes('loft') ||
                     property.title.toLowerCase().includes('diseño');
          break;
        case 'trending':
          typeMatch = property.rating >= 4.8;
          break;
        case 'castles':
          typeMatch = property.title.toLowerCase().includes('castillo') || 
                     property.title.toLowerCase().includes('palacio');
          break;
        case 'camping':
          typeMatch = property.title.toLowerCase().includes('camping') || 
                     property.title.toLowerCase().includes('tienda');
          break;
        default:
          typeMatch = true;
      }
      
      if (!typeMatch) return false;
    }

    // Apply price range filter
    if (filters.priceRange[1] < 1000) {
      const price = parseFloat(property.pricePerNight);
      if (price > filters.priceRange[1]) return false;
    }

    // Apply guests filter
    if (filters.guests && filters.guests !== 'any') {
      const guestCount = parseInt(filters.guests);
      if (property.maxGuests < guestCount) return false;
    }

    // Apply bedrooms filter
    if (filters.bedrooms && filters.bedrooms !== 'any') {
      const bedroomCount = parseInt(filters.bedrooms);
      if (property.bedrooms < bedroomCount) return false;
    }

    // Apply amenities filter
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => {
        return property.amenities?.some((propAmenity: string) => {
          const amenityLower = propAmenity.toLowerCase();
          switch (amenity) {
            case 'wifi':
              return amenityLower.includes('wifi') || amenityLower.includes('internet');
            case 'kitchen':
              return amenityLower.includes('cocina') || amenityLower.includes('kitchen');
            case 'washing-machine':
              return amenityLower.includes('lavadora') || amenityLower.includes('washing');
            case 'air-conditioning':
              return amenityLower.includes('aire') || amenityLower.includes('air conditioning');
            case 'pool':
              return amenityLower.includes('piscina') || amenityLower.includes('pool');
            case 'gym':
              return amenityLower.includes('gimnasio') || amenityLower.includes('gym');
            case 'parking':
              return amenityLower.includes('estacionamiento') || amenityLower.includes('parking');
            case 'balcony':
              return amenityLower.includes('balcón') || amenityLower.includes('balcony');
            case 'garden':
              return amenityLower.includes('jardín') || amenityLower.includes('garden');
            case 'tv':
              return amenityLower.includes('tv') || amenityLower.includes('televisión');
            case 'fireplace':
              return amenityLower.includes('chimenea') || amenityLower.includes('fireplace');
            case 'hot-tub':
              return amenityLower.includes('jacuzzi') || amenityLower.includes('hot tub');
            default:
              return amenityLower.includes(amenity.toLowerCase());
          }
        });
      });
      if (!hasAllAmenities) return false;
    }

    return true;
  }) || [];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Unable to load properties</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <main data-testid="home-page">
      <FilterBar filters={filters} onChange={setFilters} resultsCount={filteredProperties.length} />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle and Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant={currentView === 'grid' ? 'default' : 'outline'}
              onClick={() => setCurrentView('grid')}
              className="flex items-center space-x-2"
              data-testid="grid-view-btn"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Lista</span>
            </Button>
            <Button
              variant={currentView === 'map' ? 'default' : 'outline'}
              onClick={() => setCurrentView('map')}
              className="flex items-center space-x-2"
              data-testid="map-view-btn"
            >
              <Map className="h-4 w-4" />
              <span>Mapa</span>
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {filteredProperties.length} propiedades disponibles
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || filters.propertyType !== 'all' || filters.priceRange[1] < 1000 || 
          filters.guests || filters.bedrooms || filters.amenities.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>Búsqueda: "{searchQuery}"</span>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                  data-testid="remove-search-filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.propertyType !== 'all' && (
              <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>Tipo: {filters.propertyType}</span>
                <button 
                  onClick={() => setFilters({...filters, propertyType: 'all'})}
                  className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  data-testid="remove-type-filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.priceRange[1] < 1000 && (
              <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>Máximo: ${filters.priceRange[1]}</span>
                <button 
                  onClick={() => setFilters({...filters, priceRange: [0, 1000]})}
                  className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  data-testid="remove-price-filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.guests && (
              <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>Huéspedes: {filters.guests}+</span>
                <button 
                  onClick={() => setFilters({...filters, guests: ''})}
                  className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  data-testid="remove-guests-filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.bedrooms && (
              <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>Habitaciones: {filters.bedrooms}+</span>
                <button 
                  onClick={() => setFilters({...filters, bedrooms: ''})}
                  className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  data-testid="remove-bedrooms-filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.amenities.map((amenity, index) => (
              <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>{amenity}</span>
                <button 
                  onClick={() => setFilters({...filters, amenities: filters.amenities.filter(a => a !== amenity)})}
                  className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  data-testid={`remove-amenity-filter-${index}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  priceRange: [0, 1000],
                  propertyType: 'all',
                  guests: '',
                  bedrooms: '',
                  amenities: []
                });
              }}
              data-testid="clear-all-filters"
            >
              Limpiar todo
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {currentView === 'map' ? (
              <MapView 
                properties={filteredProperties}
                selectedPropertyId={selectedProperty?.id}
                onMarkerClick={(propertyId) => {
                  const property = filteredProperties.find(p => p.id === propertyId);
                  setSelectedProperty(property);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="properties-grid">
                {filteredProperties.map((property: any) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                  />
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !isLoading && (
              <div className="text-center py-12" data-testid="no-properties">
                <h3 className="text-lg font-medium text-foreground mb-2">No properties found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria.</p>
              </div>
            )}

            {filteredProperties.length > 0 && currentView === 'grid' && (
              <div className="text-center mt-12">
                <Button 
                  variant="outline" 
                  className="px-8 py-3"
                  data-testid="button-load-more"
                >
                  Continue exploring amazing places
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
