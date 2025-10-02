# Cosplay Photo Shoot Tracker

## Overview

A web application designed to streamline the management and organization of cosplay photo shoots. It offers a comprehensive platform for tracking ideas, planning sessions, scheduling events, and managing participants and reference materials. The application provides both calendar and Kanban board views for shoot management, with integrations for Google Calendar and Google Docs to enhance collaboration. The project aims to provide a modern, efficient tool for cosplayers and photographers to manage their creative projects.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, utilizing Vite for development and bundling. Wouter provides lightweight client-side routing. Server state is managed with TanStack Query, while authentication state uses React Context. UI components leverage Radix UI primitives and the shadcn/ui design system with Tailwind CSS for styling, supporting a custom theme with light/dark modes. The design prioritizes a modern productivity aesthetic with a gallery-focused layout and dark mode as the primary interface. The application is mobile-responsive.

### Backend Architecture

The backend is developed with Express.js and TypeScript. Authentication and authorization are handled by Supabase Auth, employing JWT-based, HTTP-only cookie sessions for security. A custom middleware ensures route protection and token refresh. The API is RESTful, with endpoints under `/api`, and uses Zod for request payload validation. Business logic is abstracted through a storage pattern (SupabaseStorage) that interfaces with Supabase's REST API (PostgREST) for all database operations. Security measures include user-scoped queries and prevention of direct `userId` manipulation.

### Data Storage Architecture

PostgreSQL, hosted by Supabase, serves as the primary database, accessed via Supabase's REST API (PostgREST). The application uses the Supabase admin client with service role key for server-side operations. All database operations include automatic conversion between TypeScript's camelCase conventions and PostgreSQL's snake_case column names using `toSnakeCase`/`toCamelCase` helper functions. Key tables include `shoots`, `shoot_references`, `shoot_participants`, and team-based resources (`personnel`, `equipment`, `locations`, `props`, `costume_progress`), all utilizing UUID primary keys. The schema is designed with Row Level Security (RLS) policies for data isolation and team-scoped access control, with cascading deletes to maintain referential integrity.

## External Dependencies

- **Supabase**: Comprehensive backend platform providing:
  - User authentication and authorization (JWT-based sessions)
  - PostgreSQL database hosting (accessed via REST API/PostgREST)
  - File storage (Supabase Storage with 'shoot-images' bucket)
  - Row Level Security (RLS) policies for data isolation
- **Google Calendar API**: Integration for calendar event management (via `calendarEventUrl`).
- **Google Docs**: Integration for document management (via `docsUrl`).
- **Instagram**: Used for linking and storing reference images (`instagramLinks`).
- **Google Maps Places API**: Provides location search and autocomplete functionality, with a backend proxy for API key security.
- **Resend**: For sending email invitations.

## Recent Architecture Changes (October 2025)

### Supabase Migration Completed
- Migrated from direct PostgreSQL/Drizzle ORM to Supabase REST API (PostgREST)
- Replaced Google Cloud Storage with Supabase Storage
- Implemented automatic camelCase ↔ snake_case conversion for all database operations
- All 15 database tables created in Supabase with RLS policies
- Helper RPC functions added: `get_user_shoots_with_counts`, `get_shoot_with_details`, `ensure_user_team`

### Page-Based Navigation & Codebase Cleanup (October 2025)
- Merged ShootDialog and ShootDetailView into unified ShootPage component
- Implemented page-based navigation (/shoots/new and /shoots/:id) replacing dialog-based workflow
- Cleaned up unused components: ShootDialog.tsx, ShootDetailView.tsx, AddParticipantDialog.tsx
- Removed examples/ folder (7 deprecated example files)
- Renamed MapboxLocationSearch.tsx to GoogleMapsLocationSearch.tsx to accurately reflect Google Maps API usage
- Updated all component imports and references across CreateLocationDialog and Locations pages

### Team Authorization Pattern Refactor (October 2025)
- **Critical Fix**: Refactored all team endpoints to use `getTeamMember(teamId, userId)` instead of `getUserTeamMember(userId)`
  - Old pattern returned any team membership, causing 403 errors when switching teams
  - New pattern verifies membership for the specific team being accessed
- **Robust Active Team Handling**: Enhanced `getUserTeamId()` helper to verify active team membership still exists
  - Falls back to another team or creates personal team if active team is invalid
  - Prevents stale `activeTeamId` references after team deletion or leaving
- **Leave Team Flow**: Fixed `/api/team/leave` endpoint to properly set new personal team as active after leaving
- **Profile UX**: Moved delete account section to "Danger Zone" card at bottom with destructive styling
- **Affected Endpoints**: All team-related routes now properly authorize against specific teams
  - `/api/user/team-member` - returns membership for active team only
  - `/api/team/:id`, `/api/team/:id/members`, `/api/team/:id/invite` - verify membership for requested team
  - Team member management routes verify admin/owner role for specific team