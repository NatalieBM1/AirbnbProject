import { type User, type InsertUser, type Property, type InsertProperty, type Booking, type InsertBooking, type Notification, type InsertNotification, type Payment, type InsertPayment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Usuarios
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Propiedades
  getProperties(limit?: number, offset?: number): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  getPropertiesByHost(hostId: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined>;

  // Reservas
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByProperty(propertyId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;

  // Notificaciones
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;

  // Pagos
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private properties: Map<string, Property> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private payments: Map<string, Payment> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
  // Crear usuarios de ejemplo
    const adminUser: User = {
      id: "admin-1",
      email: "admin@airbnbbm.com",
      password: "$2b$10$GLRdbRGWm45IdXq8re9GTOsvQ5O95KwjYwBCuKd5PPMycEuTQgFwi", // password: admin123
      firstName: "Admin",
      lastName: "AirBnbBM",
      phone: "+57 (310) 123-4567",
      avatar: "",
      isHost: true,
      createdAt: new Date(),
    };

    const sampleHost: User = {
      id: "host-1",
      email: "sarah@example.com",
      password: "hashedpassword",
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "+1 (555) 123-4567",
      avatar: "",
      isHost: true,
      createdAt: new Date(),
    };

    const sampleGuest: User = {
      id: "guest-1",
      email: "john@example.com",
      password: "hashedpassword",
      firstName: "John",
      lastName: "Doe",
      phone: "+1 (555) 987-6543",
      avatar: "",
      isHost: false,
      createdAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(sampleHost.id, sampleHost);
    this.users.set(sampleGuest.id, sampleGuest);

  // Crear propiedades de ejemplo
    const sampleProperties: Property[] = [
  // Cartagena
      {
        id: "prop-1",
        title: "Casa Colonial en el Centro Histórico de Cartagena",
        description: "Hermosa casa colonial completamente restaurada en el corazón de la Ciudad Amurallada. Con balcones típicos, patio interior y vista a las murallas históricas.",
        location: "Cartagena, Bolívar",
        latitude: "10.3932",
        longitude: "-75.4832",
        pricePerNight: "720000",
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "AC", "Kitchen", "Balcony", "Historic Location"],
        hostId: "host-1",
        rating: "4.89",
        reviewCount: 143,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prop-2", 
        title: "Apartamento Moderno en Bocagrande",
        description: "Moderno apartamento frente al mar en la zona turística de Bocagrande con piscina, gimnasio y acceso directo a la playa.",
        location: "Cartagena, Bolívar",
        latitude: "10.3997",
        longitude: "-75.5516",
        pricePerNight: "580000",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Pool", "WiFi", "AC", "Beach Access", "Gym", "Kitchen"],
        hostId: "host-1",
        rating: "4.76",
        reviewCount: 89,
        isActive: true,
        createdAt: new Date(),
      },
  // Bogotá
      {
        id: "prop-3",
        title: "Loft Contemporáneo en La Candelaria",
        description: "Elegante loft en el barrio histórico de La Candelaria, cerca de museos, teatros y la cultura bogotana.",
        location: "Bogotá, Cundinamarca",
        latitude: "4.5981",
        longitude: "-74.0758",
        pricePerNight: "340000",
        maxGuests: 3,
        bedrooms: 1,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "Kitchen", "Historic Location", "Museums Nearby"],
        hostId: "host-1",
        rating: "4.72",
        reviewCount: 67,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prop-4",
        title: "Apartamento Ejecutivo en Zona Rosa",
        description: "Moderno apartamento en el exclusivo sector de Zona Rosa, ideal para viajeros de negocios y turistas.",
        location: "Bogotá, Cundinamarca",
        latitude: "4.6634",
        longitude: "-74.0642",
        pricePerNight: "380000",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "Kitchen", "Business Center", "Shopping Nearby"],
        hostId: "host-1",
        rating: "4.85",
        reviewCount: 124,
        isActive: true,
        createdAt: new Date(),
      },
  // Medellín
      {
        id: "prop-5",
        title: "Penthouse con Vista en El Poblado",
        description: "Espectacular penthouse en el corazón de El Poblado con vista panorámica a la ciudad y terrazas privadas.",
        location: "Medellín, Antioquia",
        latitude: "6.2088",
        longitude: "-75.5713",
        pricePerNight: "660000",
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 3,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Pool", "WiFi", "AC", "City View", "Terrace", "Kitchen"],
        hostId: "host-1",
        rating: "4.93",
        reviewCount: 156,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prop-6",
        title: "Casa de Campo en Guatapé",
        description: "Encantadora casa de campo cerca del colorido pueblo de Guatapé, perfecta para explorar la región.",
        location: "Guatapé, Antioquia",
        latitude: "6.2333",
        longitude: "-75.1581",
        pricePerNight: "480000",
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        images: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "Kitchen", "Garden", "Mountain View", "Fireplace"],
        hostId: "host-1",
        rating: "4.81",
        reviewCount: 94,
        isActive: true,
        createdAt: new Date(),
      },
  // Santa Marta
      {
        id: "prop-7",
        title: "Cabaña Frente al Mar en Taganga",
        description: "Acogedora cabaña con acceso directo a la playa en el pintoresco pueblo pesquero de Taganga.",
        location: "Santa Marta, Magdalena",
        latitude: "11.2644",
        longitude: "-74.1896",
        pricePerNight: "440000",
        maxGuests: 5,
        bedrooms: 2,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Beach Access", "WiFi", "Kitchen", "Fishing Nearby"],
        hostId: "host-1",
        rating: "4.68",
        reviewCount: 72,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prop-8",
        title: "Eco Lodge en el Parque Tayrona",
        description: "Eco lodge sostenible en los alrededores del Parque Nacional Tayrona, experiencia única en la naturaleza.",
        location: "Santa Marta, Magdalena",
        latitude: "11.3067",
        longitude: "-74.0367",
        pricePerNight: "540000",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Eco-Friendly", "Nature Trails", "WiFi", "Kitchen"],
        hostId: "host-1",
        rating: "4.91",
        reviewCount: 108,
        isActive: true,
        createdAt: new Date(),
      },
  // Cali
      {
        id: "prop-9",
        title: "Apartamento de Salsa en Granada",
        description: "Vibrante apartamento en el corazón del barrio Granada, cerca de escuelas de salsa y vida nocturna.",
        location: "Cali, Valle del Cauca",
        latitude: "3.4372",
        longitude: "-76.5225",
        pricePerNight: "300000",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "Kitchen", "Dance Studios Nearby", "Nightlife"],
        hostId: "host-1",
        rating: "4.77",
        reviewCount: 85,
        isActive: true,
        createdAt: new Date(),
      },
  // San Andrés
      {
        id: "prop-10",
        title: "Hotel Boutique en San Andrés",
        description: "Exclusivo hotel boutique en la isla de San Andrés con vista al mar Caribe de siete colores.",
        location: "San Andrés, Archipiélago de San Andrés",
        latitude: "12.5847",
        longitude: "-81.7006",
        pricePerNight: "780000",
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Beach Access", "WiFi", "AC", "Ocean View", "Minibar"],
        hostId: "host-1",
        rating: "4.95",
        reviewCount: 137,
        isActive: true,
        createdAt: new Date(),
      },
  // Bucaramanga
      {
        id: "prop-11",
        title: "Casa Moderna en Cabecera",
        description: "Moderna casa en el exclusivo sector de Cabecera del Llano, ideal para familias y grupos.",
        location: "Bucaramanga, Santander",
        latitude: "7.1193",
        longitude: "-73.1227",
        pricePerNight: "360000",
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Pool", "WiFi", "Kitchen", "Garden", "Parking"],
        hostId: "host-1",
        rating: "4.73",
        reviewCount: 61,
        isActive: true,
        createdAt: new Date(),
      },
  // Barranquilla
      {
        id: "prop-12",
        title: "Apartamento Carnavalero en El Prado",
        description: "Colorido apartamento en el histórico barrio El Prado, perfecto para vivir el Carnaval de Barranquilla.",
        location: "Barranquilla, Atlántico",
        latitude: "10.9639",
        longitude: "-74.7964",
        pricePerNight: "320000",
        maxGuests: 5,
        bedrooms: 2,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "AC", "Kitchen", "Cultural Area"],
        hostId: "host-1",
        rating: "4.69",
        reviewCount: 78,
        isActive: true,
        createdAt: new Date(),
      },
  // Pereira
      {
        id: "prop-13",
        title: "Finca Cafetera en el Eje Cafetero",
        description: "Auténtica finca cafetera en los alrededores de Pereira, experiencia completa del café colombiano.",
        location: "Pereira, Risaralda",
        latitude: "4.8133",
        longitude: "-75.6961",
        pricePerNight: "500000",
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        images: [
          "https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Coffee Tours", "WiFi", "Kitchen", "Mountain View", "Nature"],
        hostId: "host-1",
        rating: "4.88",
        reviewCount: 112,
        isActive: true,
        createdAt: new Date(),
      },
  // Villa de Leyva
      {
        id: "prop-14",
        title: "Casa Colonial en Villa de Leyva",
        description: "Encantadora casa colonial en el pueblo más hermoso de Colombia, con arquitectura preservada del siglo XVI.",
        location: "Villa de Leyva, Boyacá",
        latitude: "5.6342",
        longitude: "-73.5253",
        pricePerNight: "420000",
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "Kitchen", "Historic Location", "Fireplace"],
        hostId: "host-1",
        rating: "4.82",
        reviewCount: 95,
        isActive: true,
        createdAt: new Date(),
      },
  // Leticia
      {
        id: "prop-15",
        title: "Lodge Amazónico en Leticia",
        description: "Eco lodge en plena Amazonía colombiana, experiencia única de contacto con la naturaleza y culturas indígenas.",
        location: "Leticia, Amazonas",
        latitude: "-4.2153",
        longitude: "-69.9406",
        pricePerNight: "600000",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Eco-Friendly", "Nature Tours", "WiFi", "Indigenous Culture"],
        hostId: "host-1",
        rating: "4.94",
        reviewCount: 87,
        isActive: true,
        createdAt: new Date(),
      },
  // Manizales
      {
        id: "prop-16",
        title: "Apartamento con Vista en Manizales",
        description: "Moderno apartamento con vista panorámica a los nevados y al paisaje cafetero de Manizales.",
        location: "Manizales, Caldas",
        latitude: "5.0704",
        longitude: "-75.5138",
        pricePerNight: "340000",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Mountain View", "WiFi", "Kitchen", "University Area"],
        hostId: "host-1",
        rating: "4.76",
        reviewCount: 68,
        isActive: true,
        createdAt: new Date(),
      },
  // Popayán
      {
        id: "prop-17",
        title: "Casa Republicana en Popayán",
        description: "Elegante casa republicana en la Ciudad Blanca de Colombia, patrimonio histórico y cultural.",
        location: "Popayán, Cauca",
        latitude: "2.4448",
        longitude: "-76.6147",
        pricePerNight: "380000",
        maxGuests: 5,
        bedrooms: 3,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "Kitchen", "Historic Location", "Cultural Tours"],
        hostId: "host-1",
        rating: "4.79",
        reviewCount: 73,
        isActive: true,
        createdAt: new Date(),
      },
  // Neiva
      {
        id: "prop-18",
        title: "Hotel Hacienda en el Huila",
        description: "Tradicional hacienda en el departamento del Huila, puerta de entrada al Desierto de la Tatacoa.",
        location: "Neiva, Huila",
        latitude: "2.9273",
        longitude: "-75.2819",
        pricePerNight: "460000",
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1549638441-b787d2e11f14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Desert Tours", "WiFi", "Kitchen", "Star Gazing"],
        hostId: "host-1",
        rating: "4.71",
        reviewCount: 54,
        isActive: true,
        createdAt: new Date(),
      },
  // Pasto
      {
        id: "prop-19",
        title: "Casa Andina en Pasto",
        description: "Acogedora casa en la capital de Nariño, punto de partida para explorar Las Lajas y la cultura andina.",
        location: "Pasto, Nariño",
        latitude: "1.2136",
        longitude: "-77.2811",
        pricePerNight: "280000",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        images: [
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "Kitchen", "Mountain View", "Cultural Tours"],
        hostId: "host-1",
        rating: "4.66",
        reviewCount: 42,
        isActive: true,
        createdAt: new Date(),
      },
  // Armenia
      {
        id: "prop-20",
        title: "Finca Turística en Armenia",
        description: "Hermosa finca turística en el corazón del Eje Cafetero, perfecta para relajarse y conocer la cultura cafetera.",
        location: "Armenia, Quindío",
        latitude: "4.5339",
        longitude: "-75.6811",
        pricePerNight: "560000",
        maxGuests: 10,
        bedrooms: 5,
        bathrooms: 4,
        images: [
          "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["Pool", "Coffee Tours", "WiFi", "Kitchen", "Garden", "BBQ Area"],
        hostId: "host-1",
        rating: "4.92",
        reviewCount: 156,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    sampleProperties.forEach(property => {
      this.properties.set(property.id, property);
    });
  }

  // Métodos de usuario
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      avatar: insertUser.avatar || null,
      isHost: insertUser.isHost || false,
      phone: insertUser.phone || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Métodos de propiedad
  async getProperties(limit = 20, offset = 0): Promise<Property[]> {
    const allProperties = Array.from(this.properties.values())
      .filter(p => p.isActive)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    return allProperties.slice(offset, offset + limit);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getPropertiesByHost(hostId: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.hostId === hostId);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      ...insertProperty,
      id,
      latitude: insertProperty.latitude || null,
      longitude: insertProperty.longitude || null,
      images: (insertProperty.images as string[]) || [],
      amenities: (insertProperty.amenities as string[]) || [],
      rating: "0",
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  // Métodos de reserva
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.guestId === userId);
  }

  async getBookingsByProperty(propertyId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.propertyId === propertyId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      status: insertBooking.status || "pending",
      specialRequests: insertBooking.specialRequests || null,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Métodos de notificación
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: insertNotification.isRead || false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  // Métodos de pago
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.bookingId === bookingId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      status: insertPayment.status || "pending",
      transactionId: insertPayment.transactionId || null,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();
