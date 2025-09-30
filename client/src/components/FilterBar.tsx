import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home, Mountain, Waves, TreePine, Building, Flame, Map, Palmtree, SlidersHorizontal } from "lucide-react";
import FilterModal from "./FilterModal";

interface Filters {
  priceRange: [number, number];
  propertyType: string;
  guests: string;
  bedrooms: string;
  amenities: string[];
}

interface FilterBarProps {
  filters?: Filters;
  onChange?: (filters: Filters) => void;
  resultsCount?: number;
}

const categories = [
  { id: "all", label: "Todo", icon: Home },
  { id: "pools", label: "Piscinas", icon: Waves },
  { id: "cabins", label: "Cabañas", icon: Mountain },
  { id: "beachfront", label: "Costa", icon: Palmtree },
  { id: "tiny-homes", label: "Pequeñas", icon: Home },
  { id: "design", label: "Modernas", icon: Building },
  { id: "trending", label: "Populares", icon: Flame },
];

export default function FilterBar({ filters, onChange, resultsCount = 0 }: FilterBarProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (onChange && filters) {
      onChange({
        ...filters,
        propertyType: categoryId
      });
    }
  };

  return (
    <section className="bg-white border-b border-gray-200 sticky top-20 z-30" data-testid="filter-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Category Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = filters?.propertyType === category.id;
              return (
                <button
                  key={category.id}
                  className={`flex flex-col items-center space-y-1 min-w-max px-3 py-2 transition-all duration-200 ${
                    isSelected 
                      ? "text-gray-900 border-b-2 border-gray-900" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                  data-testid={`button-category-${category.id}`}
                >
                  <IconComponent className={`h-5 w-5 ${
                    isSelected ? "text-gray-900" : "text-gray-600"
                  }`} />
                  <span className={`text-xs font-medium ${
                    isSelected ? "text-gray-900 font-semibold" : "text-gray-600"
                  }`}>
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-3">
            {filters && onChange && (
              <FilterModal 
                filters={filters} 
                onChange={onChange} 
                resultsCount={resultsCount}
              />
            )}
            
            {/* Botón de mapa eliminado, solo se muestra el filtro */}
          </div>
        </div>
      </div>
    </section>
  );
}
