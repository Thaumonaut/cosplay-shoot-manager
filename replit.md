# Cosplay Photo Shoot Tracker

## Overview

A web application designed to streamline the management and organization of cosplay photo shoots. It offers a comprehensive platform for tracking ideas, planning sessions, scheduling events, and managing participants and reference materials. The application provides both calendar and Kanban board views for shoot management, with integrations for Google Calendar and Google Docs to enhance collaboration. The project aims to provide a modern, efficient tool for cosplayers and photographers to manage their creative projects.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, utilizing Vite for development and bundling. Wouter provides lightweight client-side routing. Server state is managed with TanStack Query, while authentication state uses React Context. UI components leverage Radix UI primitives and the shadcn/ui design system with Tailwind CSS for styling, supporting a custom theme with light/dark modes. The design prioritizes a modern productivity aesthetic with a gallery-focused layout and dark mode as the primary interface. The application is mobile-responsive.

### Backend Architecture

The backend is developed with Express.js and TypeScript. Authentication and authorization are handled by Supabase Auth, employing JWT-based, HTTP-only cookie sessions for security. A custom middleware ensures route protection and token refresh. The API is RESTful, with endpoints under `/api`, and uses Zod for request payload validation. Business logic is abstracted through a storage pattern, using Drizzle ORM for type-safe database operations and PostgreSQL as the primary data store. Security measures include user-scoped queries and prevention of direct `userId` manipulation.

### Data Storage Architecture

PostgreSQL, hosted by Neon, serves as the primary database, accessed via Drizzle ORM. Key tables include `shoots`, `shootReferences`, and `shootParticipants`, all utilizing UUID primary keys. The schema is designed with user-scoped queries for data isolation and security, with cascading deletes to maintain referential integrity.

## External Dependencies

- **Supabase**: For user authentication, authorization, and managed PostgreSQL database hosting.
- **Google Calendar API**: Integration for calendar event management (via `calendarEventUrl`).
- **Google Docs**: Integration for document management (via `docsUrl`).
- **Instagram**: Used for linking and storing reference images (`instagramLinks`).
- **Google Maps Places API**: Provides location search and autocomplete functionality, with a backend proxy for API key security.
- **Resend**: For sending email invitations.