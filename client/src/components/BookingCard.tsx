import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { Property } from "@shared/schema";
import { PriceCalculation } from "@/lib/types";

interface BookingCardProps {
  property: Property;
}

export default function BookingCard({ property }: BookingCardProps) {
  const [, setLocation] = useLocation();
  const [checkIn, setCheckIn] = useState("2024-11-05");
  const [checkOut, setCheckOut] = useState("2024-11-10");
  const [guests, setGuests] = useState(2);

  const calculatePrice = (): PriceCalculation => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = parseFloat(property.pricePerNight) * nights;
    const cleaningFee = 50;
    const serviceFee = Math.round(basePrice * 0.06);
    const taxes = Math.round(basePrice * 0.08);
    const total = basePrice + cleaningFee + serviceFee + taxes;

    return {
      nights,
      basePrice,
      cleaningFee,
      serviceFee,
      taxes,
      total,
    };
  };

  const priceCalc = calculatePrice();

  const handleReserve = () => {
    setLocation(`/booking/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="sticky top-24" data-testid="booking-card">
      <CardContent className="p-6">
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-2xl font-bold text-foreground" data-testid="text-price-per-night">
            {formatPrice(parseFloat(property.pricePerNight))}
          </span>
          <span className="text-muted-foreground">noche</span>
        </div>
        
        <div className="border border-border rounded-lg mb-4">
          <div className="grid grid-cols-2">
            <div className="border-r border-border p-3">
              <Label className="text-xs font-medium text-muted-foreground">ENTRADA</Label>
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="border-0 p-0 text-sm font-medium bg-transparent"
                data-testid="input-checkin"
              />
            </div>
            <div className="p-3">
              <Label className="text-xs font-medium text-muted-foreground">SALIDA</Label>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="border-0 p-0 text-sm font-medium bg-transparent"
                data-testid="input-checkout"
              />
            </div>
          </div>
          <div className="border-t border-border p-3">
            <Label className="text-xs font-medium text-muted-foreground">HUÉSPEDES</Label>
            <Input
              type="number"
              min="1"
              max={property.maxGuests}
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="border-0 p-0 text-sm font-medium bg-transparent"
              data-testid="input-guests"
            />
          </div>
        </div>

        <Button
          onClick={handleReserve}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 mb-4"
          data-testid="button-reserve"
        >
          Reservar
        </Button>

        <p className="text-center text-sm text-muted-foreground mb-4">
          Aún no se te cobrará
        </p>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="underline" data-testid="text-base-calculation">
              {formatPrice(parseFloat(property.pricePerNight))} x {priceCalc.nights} noches
            </span>
            <span data-testid="text-base-price">{formatPrice(priceCalc.basePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Tarifa de limpieza</span>
            <span data-testid="text-cleaning-fee">{formatPrice(priceCalc.cleaningFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Tarifa de servicio</span>
            <span data-testid="text-service-fee">{formatPrice(priceCalc.serviceFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Impuestos</span>
            <span data-testid="text-taxes">{formatPrice(priceCalc.taxes)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span data-testid="text-total-price">{formatPrice(priceCalc.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
