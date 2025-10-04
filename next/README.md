# Cosplay Shoot Manager — Next.js Migration

This Next.js app is the new home for the cosplay shoot manager project. We're migrating from Express/Vite to a unified Next.js architecture.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase and other API keys

# Start development server
pnpm dev
```

Visit http://localhost:3000

## Scripts
- `pnpm dev` — Start development server
- `pnpm build` — Production build
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint
- `pnpm lint:fix` — Fix ESLint errors
- `pnpm test` — Run tests (Vitest)
- `pnpm test:watch` — Run tests in watch mode
- `pnpm typecheck` — TypeScript type checking

## Project Structure

```
app/                    # Next.js App Router
├── api/               # API routes (serverless functions)
│   ├── auth/          # Authentication endpoints
│   ├── user/          # User management
│   ├── team/          # Team management
│   ├── shoots/        # Shoot management
│   └── objects/       # File/image management
├── dashboard/         # Dashboard pages
├── globals.css        # Global styles
├── layout.tsx         # Root layout
├── page.tsx          # Home page
└── not-found.tsx     # 404 page

src/
├── components/        # Reusable React components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and clients
│   ├── auth.ts       # JWT authentication
│   ├── supabase.ts   # Supabase browser client
│   ├── supabase-admin.ts # Supabase admin client
│   └── schemas.ts    # Zod validation schemas
└── types/            # TypeScript type definitions
    ├── api.ts        # API types
    └── database.ts   # Database schema types
```

## Migration Checklist

### API Routes ✓ Started
- [x] Basic structure for `/api/auth`, `/api/user`, `/api/team`
- [x] JWT authentication helpers
- [x] Supabase client setup
- [ ] Port all Express routes to Next.js API routes
- [ ] Migrate file upload/object storage logic
- [ ] Add comprehensive error handling
- [ ] Add request validation with Zod schemas

### Frontend Migration
- [ ] Move React components from `client/src/components/`
- [ ] Convert routing from Wouter to Next.js file-based routing
- [ ] Migrate Tailwind configuration and custom styles
- [ ] Update authentication context for Next.js
- [ ] Migrate dashboard and main application pages

### Database & Auth
- [x] Supabase client configuration
- [x] JWT token handling
- [ ] Migrate database schema and migrations
- [ ] Test authentication flow end-to-end
- [ ] Add middleware for protected routes

### Configuration & Deployment
- [x] Next.js configuration with TypeScript
- [x] Tailwind CSS v4 setup
- [x] ESLint and testing configuration
- [x] Environment variable scaffolding
- [ ] Update Vercel deployment configuration
- [ ] Add CI/CD pipeline adjustments

### Testing
- [x] Vitest configuration
- [ ] Migrate existing tests to work with Next.js
- [ ] Add API route testing
- [ ] Add component testing with Testing Library

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Set JWT secret: `JWT_SECRET`
4. Add Google API credentials if needed

## Development Notes

- Using Next.js 15 with App Router
- TypeScript strict mode enabled
- Tailwind CSS v4 with PostCSS
- Vitest for testing
- Supabase for database and authentication
- Zod for schema validation
