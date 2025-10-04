# Copilot Instructions for Cosplay Shoot Manager

## Architecture Overview

This is a **team-based cosplay photo shoot management application** built with:
- **Frontend**: React + TypeScript + TailwindCSS + shadcn/ui + TanStack Query + Wouter routing
- **Backend**: Express.js + TypeScript with cookie-based Supabase auth
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **File structure**: Monorepo with `client/`, `server/`, `shared/` folders

## Critical Team Authorization Pattern

**Key principle**: All data is team-scoped. Users belong to teams and can only access their team's data.

```typescript
// CORRECT: Verify team membership for specific team
const teamId = await getUserTeamId(userId);
const member = await storage.getTeamMember(teamId, userId);

// WRONG: Returns any team membership (causes 403 errors)
const member = await storage.getUserTeamMember(userId);
```

The `getUserTeamId()` helper automatically:
- Uses user's active team if membership still exists
- Falls back to first available team
- Creates personal team if user has none

## Database Schema Patterns

All tables use:
- **UUID primary keys**: `varchar("id").primaryKey().default(sql\`gen_random_uuid()\`)`
- **Team scoping**: `teamId` foreign key for multi-tenant isolation
- **Snake/camel conversion**: `toSnakeCase()`/`toCamelCase()` helpers for Supabase
- **Cascading deletes**: Team deletion removes all associated data
- **RLS policies**: Row-level security enforces team boundaries

Core entities: `shoots`, `personnel`, `equipment`, `locations`, `props`, `costumeProgress`

## Development Workflows

### Environment Setup (Windows-specific)
```powershell
# Required: Install cross-env for Windows compatibility
npm install --save-dev cross-env

# Scripts use cross-env for NODE_ENV (check package.json)
npm run dev          # Development with Vite hot reload
npm run db:push      # Apply schema changes without migrations
npm run check        # TypeScript checking
```

### Testing
```bash
npm run test         # Vitest with jsdom environment
npm run test:watch   # Watch mode for TDD
```

Tests use `@testing-library/react` with `data-testid` attributes for reliable selection.

## UI Component Patterns

### shadcn/ui Integration
- Components in `client/src/components/ui/` (auto-generated)
- Custom components extend shadcn patterns
- Use `cn()` utility for conditional classes
- **Card pattern**: `<Card><CardHeader><CardTitle>` structure throughout

### Data Fetching
```typescript
// Standard TanStack Query pattern
const { data: shoots, isLoading } = useQuery({
  queryKey: ['shoots'],
  queryFn: () => apiRequest('/api/shoots')
});

// Mutations with optimistic updates
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/shoots', { method: 'POST', body: data }),
  onSuccess: () => queryClient.invalidateQueries(['shoots'])
});
```

### Route Protection
All routes except auth/public use `<ProtectedRoute>` wrapper. Navigation via Wouter: `useLocation()`, `navigate()`.

## Integration Points

### Supabase Services
- **Authentication**: Cookie-based session management (not localStorage)
- **Storage**: Image uploads to `shoot-images` bucket with team-scoped paths
- **Admin client**: Server-side operations use service role key

### Google Integrations
- **Calendar**: OAuth2 for creating/updating calendar events
- **Docs**: Automated shoot planning document generation
- **Maps**: Location search and display (requires GOOGLE_MAPS_API_KEY)

### File Upload Pattern
```typescript
// Support both direct upload (Uppy) and traditional form upload
let imageUrl: string | undefined = undefined;
if (req.body?.imageUrl) {
  imageUrl = req.body.imageUrl; // Client-side upload
} else if (req.file) {
  // Server-side upload to Supabase Storage
  const fileName = `public/${resource}/${teamId}/${Date.now()}-${safeFilename}`;
  // ... upload logic
}
```

## Key Conventions

### Error Handling
- **Client**: Use `useToast()` for user feedback
- **Server**: Return structured JSON errors with appropriate HTTP status codes
- **Auth failures**: Always check team membership before data access

### State Management
- **Global state**: React Context for auth (`useAuth()`)
- **Server state**: TanStack Query with optimistic updates
- **Forms**: React Hook Form with Zod validation

### Styling
- **Primary patterns**: Cards for content containers, badges for status
- **Responsive**: Mobile-first with sidebar navigation
- **Theme**: Next-themes with dark/light mode support
- **Icons**: Lucide React + react-icons for Google services

## File Organization

- `shared/schema.ts`: Single source of truth for types and validation
- `server/routes.ts`: All API endpoints (3000+ lines - consider splitting)
- `client/src/pages/`: Route components (Dashboard, Equipment, etc.)
- `client/src/components/`: Reusable UI components
- Path aliases: `@/` → `client/src/`, `@shared/` → `shared/`

## Common Pitfalls

1. **Team authorization**: Always use `getTeamMember(teamId, userId)` not `getUserTeamMember(userId)`
2. **Environment variables**: Required vars must be set - see README troubleshooting
3. **Windows development**: Use cross-env or run `npx --yes cross-env NODE_ENV=development tsx server/index.ts`
4. **Database changes**: Use `npm run db:push` not migrations for schema updates
5. **Image paths**: Ensure team-scoped storage paths for access control