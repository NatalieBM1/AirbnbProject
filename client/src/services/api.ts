import { apiRequest } from "@/lib/queryClient";
import { LoginData, RegisterData, User, Property, Booking, Notification, Payment } from "@shared/schema";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("airbnb_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authApi = {
  login: async (data: LoginData): Promise<{ user: User; token: string }> => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await fetch("/api/auth/me", {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },
};

export const propertyApi = {
  getProperties: async (limit = 20, offset = 0): Promise<{ properties: Property[] }> => {
    const response = await fetch(`/api/properties?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error("Failed to fetch properties");
    return response.json();
  },

  getProperty: async (id: string): Promise<{ property: Property }> => {
    const response = await fetch(`/api/properties/${id}`);
    if (!response.ok) throw new Error("Failed to fetch property");
    return response.json();
  },
};

export const bookingApi = {
  createBooking: async (data: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: string;
    specialRequests?: string;
  }): Promise<{ booking: Booking }> => {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create booking");
    return response.json();
  },

  getBookings: async (): Promise<{ bookings: Booking[] }> => {
    const response = await fetch("/api/bookings", {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch bookings");
    return response.json();
  },

  getBooking: async (id: string): Promise<{ booking: Booking }> => {
    const response = await fetch(`/api/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch booking");
    return response.json();
  },
};

export const notificationApi = {
  getNotifications: async (): Promise<{ notifications: Notification[] }> => {
    const response = await fetch("/api/notifications", {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return response.json();
  },

  markAsRead: async (id: string): Promise<void> => {
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to mark notification as read");
  },
};

export const paymentApi = {
  createPayment: async (data: {
    bookingId: string;
    amount: string;
    paymentMethod: string;
  }): Promise<{ payment: Payment }> => {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Payment failed");
    return response.json();
  },

  getPaymentsByBooking: async (bookingId: string): Promise<{ payments: Payment[] }> => {
    const response = await fetch(`/api/payments/booking/${bookingId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch payments");
    return response.json();
  },
};
