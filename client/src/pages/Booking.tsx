import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, CreditCard } from "lucide-react";
import { propertyApi, bookingApi, paymentApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PriceCalculation } from "@/lib/types";

export default function Booking() {
  const [match, params] = useRoute("/booking/:propertyId");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const propertyId = params?.propertyId;
  const urlParams = new URLSearchParams(window.location.search);
  const checkIn = urlParams.get("checkIn") || "2024-11-05";
  const checkOut = urlParams.get("checkOut") || "2024-11-10";
  const guests = parseInt(urlParams.get("guests") || "2");

  const [paymentMethod, setPaymentMethod] = useState("card");

  const form = useForm({
    defaultValues: {
      specialRequests: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const { data: propertyData, isLoading } = useQuery({
    queryKey: ["/api/properties", propertyId],
    queryFn: () => propertyApi.getProperty(propertyId!),
    enabled: !!propertyId,
  });

  const createBookingMutation = useMutation({
    mutationFn: bookingApi.createBooking,
    onSuccess: async (bookingData) => {
      // Create payment
      const paymentData = {
        bookingId: bookingData.booking.id,
        amount: bookingData.booking.totalAmount,
        paymentMethod,
      };
      
      try {
        await paymentApi.createPayment(paymentData);
        
        toast({
          title: "Booking confirmed!",
          description: "Your reservation has been successfully created.",
        });

        // Show notification
        (window as any).showNotification?.({
          type: "success",
          title: "Booking confirmed!",
          message: "Your reservation has been confirmed",
          icon: "check",
        });

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        
        setLocation("/notifications");
      } catch (error) {
        toast({
          title: "Booking created but payment failed",
          description: "Please contact support to complete your payment.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (!match || !propertyId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Booking not found</h2>
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  const property = propertyData?.property;
  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Property not found</h2>
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const onSubmit = () => {
    const bookingData = {
      propertyId: property.id,
      checkIn,
      checkOut,
      guests,
      totalAmount: priceCalc.total.toString(),
      specialRequests: form.getValues("specialRequests"),
    };

    createBookingMutation.mutate(bookingData);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="booking-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href={`/property/${property.id}`}>
          <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to property</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Request to book</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Form */}
        <div className="space-y-6">
          {/* Trip Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Your trip</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-foreground">Dates</h4>
                    <p className="text-sm text-muted-foreground" data-testid="text-booking-dates">
                      {formatDate(checkIn)} - {formatDate(checkOut)}, 2024
                    </p>
                  </div>
                  <Button variant="link" className="text-primary text-sm">Edit</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-foreground">Guests</h4>
                    <p className="text-sm text-muted-foreground" data-testid="text-booking-guests">
                      {guests} guests
                    </p>
                  </div>
                  <Button variant="link" className="text-primary text-sm">Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Payment method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <label className="flex items-center cursor-pointer">
                      <RadioGroupItem value="card" className="mr-3" />
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span>Credit or debit card</span>
                      </div>
                    </label>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <label className="flex items-center cursor-pointer">
                      <RadioGroupItem value="paypal" className="mr-3" />
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.299-.93 4.778-4.005 6.463-7.955 6.463H10.78c-.218 0-.4.158-.434.372l-1.298 8.232a.335.335 0 0 0 .331.39h3.964c.435 0 .802-.318.87-.748L14.5 19.28c.021-.132.06-.246.114-.353a.564.564 0 0 1 .539-.298h1.21c3.467 0 6.18-1.409 6.971-5.485.312-1.616.2-2.966-.597-3.927z"/>
                        </svg>
                        <span>PayPal</span>
                      </div>
                    </label>
                  </div>
                </div>
              </RadioGroup>
              
              {/* Card Details */}
              {paymentMethod === "card" && (
                <Form {...form}>
                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="1234 5678 9012 3456"
                              {...field}
                              data-testid="input-card-number"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="MM/YY"
                                {...field}
                                data-testid="input-expiry"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123"
                                {...field}
                                data-testid="input-cvv"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Special requests</h3>
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requests for your stay..."
                          rows={4}
                          {...field}
                          data-testid="textarea-special-requests"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cancellation policy</h3>
              <p className="text-sm text-muted-foreground">
                Free cancellation until 24 hours before check-in. Cancel before {formatDate(checkIn)} for a partial refund.
              </p>
              <Button variant="link" className="text-primary text-sm p-0 mt-2">
                Learn more
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:sticky lg:top-24">
          <Card>
            <CardContent className="p-6">
              {/* Property Summary */}
              <div className="flex space-x-4 mb-6">
                <img
                  src={property.images?.[0] || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200"}
                  alt={property.title}
                  className="w-24 h-20 rounded-lg object-cover"
                  data-testid="img-booking-summary"
                />
                <div>
                  <h4 className="font-medium text-foreground" data-testid="text-summary-title">
                    {property.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">Lugar completo</p>
                  <div className="flex items-center text-sm mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{property.rating} ({property.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="underline" data-testid="text-breakdown-base">
                    {formatPrice(parseFloat(property.pricePerNight))} x {priceCalc.nights} noches
                  </span>
                  <span>{formatPrice(priceCalc.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Tarifa de limpieza</span>
                  <span>{formatPrice(priceCalc.cleaningFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Tarifa de servicio</span>
                  <span>{formatPrice(priceCalc.serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Impuestos</span>
                  <span>{formatPrice(priceCalc.taxes)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total (COP)</span>
                  <span data-testid="text-summary-total">{formatPrice(priceCalc.total)}</span>
                </div>
              </div>

              {/* Book Button */}
              <Button
                onClick={onSubmit}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4"
                disabled={createBookingMutation.isPending}
                data-testid="button-confirm-booking"
              >
                {createBookingMutation.isPending ? "Procesando..." : "Confirmar y pagar"}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                You'll be charged the total amount when you submit this reservation request.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
