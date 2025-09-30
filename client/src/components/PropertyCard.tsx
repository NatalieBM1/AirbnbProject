import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  return (
    <Card 
      className="card-hover cursor-pointer overflow-hidden border-0 shadow-none"
      data-testid={`card-property-${property.id}`}
    >
      <Link href={`/property/${property.id}`}>
        <div className="relative rounded-xl overflow-hidden mb-3">
          <img
            src={property.images?.[0] || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400"}
            alt={property.title}
            className="w-full h-64 object-cover"
            data-testid={`img-property-${property.id}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // TODO: Add to favorites
            }}
            data-testid={`button-favorite-${property.id}`}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-medium" data-testid={`text-rating-${property.id}`}>
              {property.rating}
            </span>
            <span className="text-muted-foreground ml-2" data-testid={`text-reviews-${property.id}`}>
              ({property.reviewCount})
            </span>
          </div>
          
          <h3 
            className="font-medium text-foreground line-clamp-2" 
            data-testid={`text-title-${property.id}`}
          >
            {property.title}
          </h3>
          
          <p 
            className="text-muted-foreground text-sm" 
            data-testid={`text-location-${property.id}`}
          >
            {property.location}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Disponible</span>
            <div>
              <span 
                className="font-semibold" 
                data-testid={`text-price-${property.id}`}
              >
                {formatPrice(property.pricePerNight)}
              </span>
              <span className="text-muted-foreground"> noche</span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
