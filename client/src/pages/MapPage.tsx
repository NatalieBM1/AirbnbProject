import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { X, Star } from "lucide-react";
import { propertyApi } from "@/services/api";
import MapView from "@/components/MapView";
import { Property } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterState {
  priceRange: [number, number];
  propertyTypes: string[];
}

export default function MapPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [50, 500],
    propertyTypes: ["house", "apartment"],
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => propertyApi.getProperties(100, 0), // Get more properties for map view
  });

  const handleMarkerClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    const property = data?.properties.find(p => p.id === propertyId);
    setPreviewProperty(property || null);
  };

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: checked 
        ? [...prev.propertyTypes, type]
        : prev.propertyTypes.filter(t => t !== type)
    }));
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  // Filter properties based on current filters
  const filteredProperties = data?.properties.filter(property => {
    const price = parseFloat(property.pricePerNight);
    return price >= filters.priceRange[0] && price <= filters.priceRange[1];
  }) || [];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Unable to load map</h2>
          <p className="text-muted-foreground mb-4">Please try again later.</p>
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full h-screen" data-testid="map-page">
      {isLoading ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      ) : (
        <MapView 
          properties={filteredProperties} 
          onMarkerClick={handleMarkerClick}
          selectedPropertyId={selectedPropertyId || undefined}
        />
      )}

      {/* Map Controls */}
      <Card className="absolute top-4 left-4 shadow-lg min-w-80" data-testid="map-controls">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Map View</h3>
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-close-map">
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground mb-4" data-testid="text-property-count">
            <span>{filteredProperties.length}</span> stays in your area
          </div>
          
          {/* Price Range Filter */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Price range
            </Label>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                max={1000}
                min={50}
                step={25}
                className="mb-3"
                data-testid="slider-price-range"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}+</span>
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Property type
            </Label>
            <div className="space-y-3">
              {[
                { id: "house", label: "House" },
                { id: "apartment", label: "Apartment" },
                { id: "villa", label: "Villa" },
                { id: "cabin", label: "Cabin" },
              ].map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={filters.propertyTypes.includes(type.id)}
                    onCheckedChange={(checked) => 
                      handlePropertyTypeChange(type.id, checked as boolean)
                    }
                    data-testid={`checkbox-${type.id}`}
                  />
                  <Label htmlFor={type.id} className="text-sm cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Preview Card */}
      {previewProperty && (
        <Card 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 shadow-lg w-80"
          data-testid="property-preview"
        >
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={previewProperty.images?.[0] || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200"}
                  alt={previewProperty.title}
                  className="w-full h-full object-cover"
                  data-testid="img-preview"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center text-sm mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium" data-testid="text-preview-rating">
                    {previewProperty.rating}
                  </span>
                  <span className="text-muted-foreground ml-2" data-testid="text-preview-reviews">
                    ({previewProperty.reviewCount})
                  </span>
                </div>
                <h4 
                  className="font-medium text-foreground mb-1 line-clamp-2" 
                  data-testid="text-preview-title"
                >
                  {previewProperty.title}
                </h4>
                <p className="text-sm text-muted-foreground" data-testid="text-preview-price">
                  {formatPrice(previewProperty.pricePerNight)} noche
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Link href={`/property/${previewProperty.id}`}>
                <Button className="w-full" data-testid="button-view-property">
                  Ver Propiedad
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
