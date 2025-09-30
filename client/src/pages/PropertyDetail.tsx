import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { propertyApi } from "@/services/api";
import BookingCard from "@/components/BookingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Home, Waves, Wifi, Users, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyDetail() {
  const [match, params] = useRoute("/property/:id");
  const propertyId = params?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/properties", propertyId],
    queryFn: () => propertyApi.getProperty(propertyId!),
    enabled: !!propertyId,
  });

  if (!match || !propertyId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Property not found</h2>
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Unable to load property</h2>
          <p className="text-muted-foreground mb-4">Please try again later.</p>
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-8 h-96">
          <Skeleton className="w-full h-full" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="w-full h-full" />
            <Skeleton className="w-full h-full" />
            <Skeleton className="w-full h-full" />
            <Skeleton className="w-full h-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const property = data?.property;
  if (!property) return null;

  const features = [
    { icon: Home, title: "Entire place", description: "You'll have the place to yourself" },
    { icon: Waves, title: "Beachfront", description: "Direct access to the beach" },
    { icon: Wifi, title: "Fast WiFi", description: "Perfect for remote work" },
  ];

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="property-detail-page">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" className="flex items-center space-x-2 mb-6" data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to search</span>
        </Button>
      </Link>

      {/* Property Images Gallery */}
      <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-8 h-96">
        <div className="relative">
          <img
            src={property.images?.[0] || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"}
            alt={property.title}
            className="w-full h-full object-cover"
            data-testid="img-main-property"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {property.images?.slice(1, 5).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${property.title} view ${index + 2}`}
              className="w-full h-full object-cover"
              data-testid={`img-gallery-${index}`}
            />
          ))}
        </div>
      </div>

      {/* Property Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="border-b border-border pb-6 mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-property-title">
              {property.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span data-testid="text-property-rating">{property.rating}</span>
                <span className="mx-1">·</span>
                <span data-testid="text-property-reviews">{property.reviewCount} reviews</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span data-testid="text-property-location">{property.location}</span>
              </div>
            </div>
          </div>

          {/* Host Info */}
          <div className="border-b border-border pb-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Hosted by Sarah</h3>
                <p className="text-sm text-muted-foreground">Superhost · 3 years hosting</p>
              </div>
            </div>
          </div>

          {/* Property Features */}
          <div className="border-b border-border pb-6 mb-6">
            <div className="space-y-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <IconComponent className="h-6 w-6 text-foreground mt-1" />
                    <div>
                      <h4 className="font-medium text-foreground">{feature.title}</h4>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="border-b border-border pb-6 mb-6">
            <p className="text-foreground leading-relaxed" data-testid="text-property-description">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-4">
              {property.amenities?.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Wifi className="h-5 w-5 text-muted-foreground" />
                  <span data-testid={`text-amenity-${index}`}>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <BookingCard property={property} />
        </div>
      </div>
    </main>
  );
}
