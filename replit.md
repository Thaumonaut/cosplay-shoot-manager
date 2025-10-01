# Cosplay Photo Shoot Tracker

## Overview

A web application for managing and organizing cosplay photo shoots. The system provides a comprehensive platform for tracking photo shoot ideas, planning sessions, scheduling events, and managing participants and references. Built with a modern tech stack featuring React, Express, and PostgreSQL, the application offers both calendar and Kanban board views for shoot management, integrated with Google Calendar and Google Docs for enhanced collaboration.

## Recent Changes

**October 1, 2025**
- Extended signup flow with first/last name, profile picture upload, and team invite code
- Implemented social login (Google, Apple, Microsoft) with OAuth callback handling
- Added automatic team creation: new users without invite codes get a personal team created automatically
- Built resource management UI pages for Personnel, Equipment, Locations, and Props with full CRUD operations
- Fixed FormData parsing: Added multer middleware to personnel, locations, and props endpoints
- Fixed boolean conversion: Props endpoints properly convert "available" string to boolean
- Created comprehensive resource management systems:
  - Personnel/contacts with name, email, phone, role, notes, avatar
  - Equipment tracking with category, description, quantity, availability
  - Locations management with address, notes, images
  - Props tracking with description, availability, images
  - Costume progress tracking with character, series, status, completion percentage
- Added full CRUD API endpoints for all resource management systems
- Implemented user profile management with object storage for avatars
- Added inline editing for all shoot fields (title, status, date/duration, location, description)
- Enhanced accordion cards with placeholder images and improved data display
- Implemented participant management system for shoots
- Fixed sidebar navigation routing and URL synchronization
- Set up object storage for avatar uploads with security best practices

## Known Limitations

**Signup Flow with Email Confirmation**
- Current implementation requires Supabase email confirmation to be disabled
- If email confirmation is enabled, profile creation will fail with 401
- Future enhancement: Implement post-confirmation profile completion flow
- Workaround: Complete profile after email confirmation via a dedicated profile page

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type-safe UI development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component Strategy**
- Radix UI primitives for accessible, headless components
- shadcn/ui design system with the "New York" style variant
- Tailwind CSS for utility-first styling with custom design tokens
- Custom theme system supporting light/dark modes via ThemeProvider context

**Design Philosophy**
- Hybrid approach: Modern productivity design (Linear/Notion-inspired) with creative visual flair
- Gallery-focused layouts prioritizing visual content
- Dark mode as primary interface with purple/magenta accent colors
- Mobile-responsive design using Tailwind breakpoints

**State Management Pattern**
- Server state: TanStack Query with centralized queryClient
- Authentication state: React Context (AuthContext)
- UI state: Local component state with React hooks
- Theme preference: Local storage with context provider

**Routing Strategy**
- Dashboard component responds to multiple routes:
  - `/` - Full dashboard with upcoming shoots and calendar
  - `/calendar` - Calendar-only view
  - `/shoots` - Kanban board view
  - `/status/:status` - Filtered kanban by status (idea, planning, scheduled, completed)
- Individual shoot details rendered when shoot is selected
- Navigation handled via sidebar with proper route updates

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Custom middleware for request logging and error handling
- Vite middleware integration for development hot module replacement

**Authentication & Authorization**
- Supabase Auth for user authentication (JWT-based)
- HTTP-only cookie-based session management for enhanced security
- Custom authenticateUser middleware for route protection and automatic token refresh
- Cookie-based JWT validation (sb-access-token, sb-refresh-token)
- User ID association for data isolation

**API Design**
- RESTful API endpoints under `/api` prefix
- Resource-based routing: `/api/shoots`, `/api/shoots/:id`
- Nested resources for shoot references and participants
  - POST `/api/shoots/:id/participants` - Add participant
  - GET `/api/shoots/:id/participants` - List participants
  - DELETE `/api/participants/:id` - Remove participant
- Standardized error responses with HTTP status codes

**Business Logic Layer**
- Storage abstraction pattern (IStorage interface)
- DatabaseStorage implementation separating data access from routes
- Zod schema validation for request payloads
- Type-safe data models shared between client and server
- Security hardening: updateShoot explicitly omits userId and createdAt to prevent ownership changes

### Data Storage Architecture

**Database**
- PostgreSQL as primary database (Neon serverless hosting)
- Drizzle ORM for type-safe database operations
- Three main tables: shoots, shootReferences, shootParticipants
- UUID primary keys with automatic generation

**Schema Design**
```
shoots: Core entity with userId, title, status, date, location, description, 
        integration URLs (calendarEventUrl, docsUrl), and instagram links
shootReferences: Related images/references linked to shoots (cascade delete)
shootParticipants: People involved in shoots with roles (cascade delete)
  - id: UUID primary key
  - shootId: Foreign key to shoots table
  - name: Participant name (required)
  - role: Role description (required, e.g., "Cosplayer", "Photographer", "Makeup Artist")
  - email: Optional contact email
  - createdAt: Timestamp
```

**Data Access Patterns**
- User-scoped queries filtering by userId for security
- Cascading deletes maintaining referential integrity
- Timestamp tracking (createdAt, updatedAt) for all entities
- Array fields for flexible data (instagramLinks)

### External Dependencies

**Authentication Service**
- Supabase (hosted at ybnzheybytssvtmxktnq.supabase.co)
- Provides user management, JWT tokens, session handling
- Client-side SDK for auth state management
- Server-side SDK for token validation

**Database Hosting**
- Supabase PostgreSQL (configured for postgres-js driver compatibility)
- Connection via DATABASE_URL environment variable (requires Session pooler connection string, port 5432)
- Standard PostgreSQL connection using postgres-js driver

**Third-Party Integrations (Planned)**
- Google Calendar API (calendarEventId, calendarEventUrl fields present)
- Google Docs integration (docsUrl field present)
- Instagram (instagramLinks array for reference storage)

**Development Tools**
- Replit-specific plugins for enhanced development experience
- Runtime error modal overlay
- Cartographer and dev banner in development mode

### Security & Data Isolation

**Authentication Flow (Cookie-Based)**
1. Client authenticates with Supabase Auth (sign up/sign in)
2. Frontend sends session tokens to POST /api/auth/set-session
3. Backend validates tokens and sets HTTP-only cookies (sb-access-token, sb-refresh-token)
4. All API requests automatically include cookies (credentials: 'include')
5. Middleware validates access token and auto-refreshes if expired using refresh token
6. Unauthorized requests clear cookies and redirect to /auth

**Cookie Configuration**
- HttpOnly: true (prevents JavaScript access, protects against XSS)
- SameSite: lax (allows same-site navigation, mitigates CSRF)
- Secure: true in production (HTTPS only)
- Access token: expires based on Supabase JWT expiry
- Refresh token: 30-day expiration

**Authorization Pattern**
- All shoot-related operations scoped to authenticated user
- UserId extracted from validated JWT claims in cookies
- Database queries filter by userId to prevent cross-user data access
- Automatic token refresh maintains session without user intervention
- 401 responses trigger automatic sign-out and redirect