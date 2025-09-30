export interface PropertyWithImages {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: string;
  longitude?: string;
  pricePerNight: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  hostId: string;
  rating: string;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface BookingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: string;
  specialRequests?: string;
}

export interface PriceCalculation {
  nights: number;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  price: string;
  title: string;
}

export interface FilterOptions {
  priceRange: [number, number];
  propertyTypes: string[];
  amenities: string[];
  guests: number;
}
