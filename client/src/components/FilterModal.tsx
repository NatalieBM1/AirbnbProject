import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, X } from "lucide-react";

interface Filters {
  priceRange: [number, number];
  propertyType: string;
  guests: string;
  bedrooms: string;
  amenities: string[];
}

interface FilterModalProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultsCount?: number;
}

const amenitiesList = [
  { id: "wifi", label: "WiFi" },
  { id: "kitchen", label: "Cocina" },
  { id: "washing-machine", label: "Lavadora" },
  { id: "air-conditioning", label: "Aire acondicionado" },
  { id: "pool", label: "Piscina" },
  { id: "gym", label: "Gimnasio" },
  { id: "parking", label: "Estacionamiento" },
  { id: "balcony", label: "Balcón" },
  { id: "garden", label: "Jardín" },
  { id: "tv", label: "TV" },
  { id: "fireplace", label: "Chimenea" },
  { id: "hot-tub", label: "Jacuzzi" }
];

export default function FilterModal({ filters, onChange, resultsCount = 0 }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onChange(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters: Filters = {
      priceRange: [0, 1000],
      propertyType: 'all',
      guests: 'any',
      bedrooms: 'any',
      amenities: []
    };
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
    setIsOpen(false);
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenityId]
        : prev.amenities.filter(id => id !== amenityId)
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price * 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
          data-testid="button-filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros</span>
          {(filters.amenities.length > 0 || filters.propertyType !== 'all' || (filters.guests && filters.guests !== 'any') || (filters.bedrooms && filters.bedrooms !== 'any')) && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
              {filters.amenities.length + (filters.propertyType !== 'all' ? 1 : 0) + (filters.guests && filters.guests !== 'any' ? 1 : 0) + (filters.bedrooms && filters.bedrooms !== 'any' ? 1 : 0)}
            </span>
          )}
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Filtros</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Rango de precio</Label>
            <div className="px-3">
              <Slider
                value={localFilters.priceRange}
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{formatPrice(localFilters.priceRange[0])}</span>
                <span>{localFilters.priceRange[1] >= 1000 ? `${formatPrice(1000)}+` : formatPrice(localFilters.priceRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Huéspedes</Label>
            <Select value={localFilters.guests} onValueChange={(value) => setLocalFilters(prev => ({ ...prev, guests: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Cualquier cantidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquier cantidad</SelectItem>
                <SelectItem value="1">1 huésped</SelectItem>
                <SelectItem value="2">2 huéspedes</SelectItem>
                <SelectItem value="3">3 huéspedes</SelectItem>
                <SelectItem value="4">4 huéspedes</SelectItem>
                <SelectItem value="5">5 huéspedes</SelectItem>
                <SelectItem value="6">6+ huéspedes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bedrooms */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Habitaciones</Label>
            <Select value={localFilters.bedrooms} onValueChange={(value) => setLocalFilters(prev => ({ ...prev, bedrooms: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Cualquier cantidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquier cantidad</SelectItem>
                <SelectItem value="1">1 habitación</SelectItem>
                <SelectItem value="2">2 habitaciones</SelectItem>
                <SelectItem value="3">3 habitaciones</SelectItem>
                <SelectItem value="4">4+ habitaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Servicios</Label>
            <div className="grid grid-cols-2 gap-3">
              {amenitiesList.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.id}
                    checked={localFilters.amenities.includes(amenity.id)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                  />
                  <Label htmlFor={amenity.id} className="text-sm cursor-pointer">
                    {amenity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={handleClear} className="text-gray-600 hover:text-gray-900">
              Limpiar todo
            </Button>
            <Button onClick={handleApply} className="bg-gray-900 text-white hover:bg-gray-800 px-8">
              Mostrar {resultsCount} resultados
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}