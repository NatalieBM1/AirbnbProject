import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertBookingSchema, insertNotificationSchema, insertPaymentSchema, insertPropertySchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-key";

// Middleware para verificar el token JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar que el usuario es administrador
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Verificar que el usuario existe y es admin
    const userData = await storage.getUser(user.userId);
    if (!userData || userData.email !== "admin@airbnbbm.com") {
      return res.status(403).json({ message: 'Administrator access required' });
    }
    
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Verificación de salud
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Rutas de autenticación
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
  // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

  // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
  // Crear usuario
      const user = await storage.createUser({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      });

  // Generar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

  // Crear notificación de bienvenida
      await storage.createNotification({
        userId: user.id,
        title: "¡Bienvenido a AIRBNBBM!",
        message: "Tu cuenta ha sido creada exitosamente. Comienza a explorar lugares increíbles para hospedarte.",
        type: "security",
      });

      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
  // Buscar usuario
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

  // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

  // Generar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

  // Crear notificación de inicio de sesión
      await storage.createNotification({
        userId: user.id,
        title: "¡Bienvenido de vuelta!",
        message: "Has iniciado sesión exitosamente en tu cuenta.",
        type: "security",
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Rutas de propiedades
  app.get("/api/properties", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const properties = await storage.getProperties(limit, offset);
      res.json({ properties });
    } catch (error) {
      console.error("Get properties error:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json({ property });
    } catch (error) {
      console.error("Get property error:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Admin property management endpoints - SOLO PARA ADMINISTRADORES
  app.post("/api/properties", authenticateAdmin, async (req: any, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      
      // Create property with admin user as host
      const property = await storage.createProperty({
        ...propertyData,
        hostId: req.user.userId,
      });

      res.status(201).json({ property });
    } catch (error: any) {
      console.error("Create property error:", error);
      res.status(400).json({ message: error.message || "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", authenticateAdmin, async (req: any, res) => {
    try {
      const propertyId = req.params.id;
      // Validar y filtrar solo campos permitidos para actualización
      const allowedFields = ['title', 'description', 'location', 'pricePerNight', 'maxGuests', 'bedrooms', 'bathrooms', 'amenities', 'images'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      // Verify property exists
      const existingProperty = await storage.getProperty(propertyId);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Update property
      const updatedProperty = await storage.updateProperty(propertyId, updateData);
      if (!updatedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json({ property: updatedProperty });
    } catch (error: any) {
      console.error("Update property error:", error);
      res.status(400).json({ message: error.message || "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", authenticateAdmin, async (req: any, res) => {
    try {
      const propertyId = req.params.id;
      
      // Verify property exists and is active
      const existingProperty = await storage.getProperty(propertyId);
      if (!existingProperty || !existingProperty.isActive) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Soft delete by setting isActive to false
      const deletedProperty = await storage.updateProperty(propertyId, { isActive: false });
      if (!deletedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json({ message: "Property deleted successfully", property: deletedProperty });
    } catch (error: any) {
      console.error("Delete property error:", error);
      res.status(400).json({ message: error.message || "Failed to delete property" });
    }
  });

  // Rutas de reservas
  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        guestId: req.user.userId,
      });

  // Verificar que la propiedad existe
      const property = await storage.getProperty(bookingData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

  // Crear reserva
      const booking = await storage.createBooking(bookingData);

  // Crear notificación de confirmación de reserva
      await storage.createNotification({
        userId: req.user.userId,
        title: "Booking confirmed!",
        message: `Your reservation at ${property.title} has been confirmed.`,
        type: "booking",
      });

      res.status(201).json({ booking });
    } catch (error: any) {
      console.error("Create booking error:", error);
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.user.userId);
      res.json({ bookings });
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

  // Verificar si el usuario es dueño de la reserva
      if (booking.guestId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({ booking });
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Rutas de notificaciones
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.userId);
      res.json({ notifications });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req: any, res) => {
    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Rutas de pagos
  app.post("/api/payments", authenticateToken, async (req: any, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);

  // Verificar que la reserva existe y pertenece al usuario
      const booking = await storage.getBooking(paymentData.bookingId);
      if (!booking || booking.guestId !== req.user.userId) {
        return res.status(404).json({ message: "Booking not found" });
      }

  // Crear pago
      const payment = await storage.createPayment({
        ...paymentData,
  status: "completed", // Simular pago exitoso
        transactionId: `txn_${Date.now()}`,
      });

  // Actualizar estado de la reserva
      await storage.updateBooking(booking.id, { status: "confirmed" });

  // Crear notificación de pago
      await storage.createNotification({
        userId: req.user.userId,
        title: "Payment processed",
        message: `Your payment of $${payment.amount} has been successfully processed.`,
        type: "payment",
      });

      res.status(201).json({ payment });
    } catch (error: any) {
      console.error("Create payment error:", error);
      res.status(400).json({ message: error.message || "Payment failed" });
    }
  });

  app.get("/api/payments/booking/:bookingId", authenticateToken, async (req: any, res) => {
    try {
  // Verificar que la reserva pertenece al usuario
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking || booking.guestId !== req.user.userId) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const payments = await storage.getPaymentsByBooking(req.params.bookingId);
      res.json({ payments });
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
