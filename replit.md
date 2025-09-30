# AirBnB Clone - Property Rental Platform

## Overview

This is a full-stack property rental application inspired by Airbnb, built with a modern tech stack. The platform allows users to browse properties, make bookings, process payments, and receive notifications. It includes both guest and host functionality, with an admin panel for property management.

The application features a dual architecture with both a legacy Express backend and a modern unified server architecture, indicating an ongoing migration or transition period.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- React Router (wouter) for client-side routing
- TanStack Query (React Query) for server state management
- React Hook Form with Zod validation for form handling

**UI Components:**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom Airbnb-inspired theme
- Leaflet for interactive map functionality
- Custom responsive design with mobile-first approach

**State Management:**
- Context API for authentication state
- TanStack Query for server state caching and synchronization
- Local storage for token persistence

**Key Features:**
- Property search and filtering with multiple criteria (price, amenities, location)
- Interactive map view with property markers
- Booking flow with date selection and guest count
- Payment processing interface
- Real-time notifications system
- Admin dashboard for property management

### Backend Architecture

**Dual Server Setup:**

1. **Legacy Backend** (backend/ directory):
   - Express.js REST API on port 4000
   - In-memory data storage with mock data
   - Simple JWT-like authentication using fake tokens
   - Separate route controllers for auth, properties, bookings, notifications, and payments

2. **Modern Backend** (server/ directory):
   - Express.js with TypeScript on port 5000 (development)
   - Drizzle ORM with PostgreSQL (Neon serverless)
   - Proper JWT authentication with bcrypt password hashing
   - Integrated with Vite for SSR-ready architecture
   - Shared schema definitions between client and server

**Data Models:**
- Users (with host/guest roles)
- Properties (listings with location, pricing, amenities)
- Bookings (with status tracking: pending, confirmed, canceled, completed)
- Notifications (user-specific alerts)
- Payments (booking-related transactions)

**Authentication Strategy:**
- JWT-based authentication with session secrets
- Role-based access control (regular users vs admin)
- Token stored in localStorage and sent via Authorization header
- Admin user identified by specific email: admin@airbnbbm.com

**API Design:**
- RESTful endpoints organized by resource
- Middleware for authentication and admin verification
- Error handling with appropriate HTTP status codes
- CORS configuration for cross-origin requests

### External Dependencies

**Database:**
- PostgreSQL via Neon serverless (@neondatabase/serverless)
- Drizzle ORM for type-safe database operations
- Migration support via drizzle-kit

**Third-Party Services:**
- Leaflet for map rendering and marker management
- Google Fonts for typography (Circular, DM Sans, Geist Mono)

**Authentication & Security:**
- bcrypt/bcryptjs for password hashing
- jsonwebtoken for JWT token generation and verification
- Session-based authentication with secure token storage

**Development Tools:**
- Replit-specific plugins for development experience
- TypeScript for type safety across the stack
- ESBuild for production builds
- Cross-env for environment variable management

**UI Libraries:**
- Radix UI for accessible component primitives (25+ components)
- class-variance-authority for component variants
- tailwind-merge and clsx for className management
- date-fns for date formatting and manipulation
- react-day-picker for calendar functionality

**API Communication:**
- Axios (in legacy frontend)
- Native fetch API (in modern client)
- TanStack Query for request caching and state management

**Notable Configuration:**
- Custom path aliases (@/, @shared/, @assets/)
- Tailwind CSS with custom color scheme matching Airbnb branding
- Dual package.json setup indicating separated frontend/backend in legacy structure
- Environment variables for database URL, CORS origin, and JWT secrets