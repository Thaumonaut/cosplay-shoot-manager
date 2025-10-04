# Style Guide Quick Reference

## 🏗️ Architecture Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI Library**: Radix UI + Tailwind CSS
- **Backend**: Supabase (Database + Auth + Storage)
- **State Management**: React Query + React Hooks
- **Testing**: Jest + React Testing Library + Playwright

## 📝 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Database Tables | `snake_case` | `photo_shoots`, `team_members` |
| Database Columns | `snake_case` | `created_at`, `team_id` |
| TypeScript Interfaces | `PascalCase` | `Shoot`, `Personnel` |
| Components | `PascalCase.tsx` | `ShootCard.tsx` |
| Variables/Functions | `camelCase` | `shootData`, `handleSubmit` |
| Constants | `UPPER_SNAKE_CASE` | `API_BASE_URL` |
| Files (utils) | `kebab-case` | `date-utils.ts` |

## 🎨 UI Component Checklist
- ✅ Use Radix UI primitives when available
- ✅ Follow `src/components/ui/` pattern
- ✅ Use `class-variance-authority` for variants
- ✅ Include TypeScript props interface
- ✅ Use `cn()` for conditional classes
- ✅ Add proper accessibility attributes

## 🗄️ Database Rules
- ✅ Database is source of truth for naming
- ✅ All tables have `id`, `created_at`, `updated_at`
- ✅ Foreign keys: `{table}_id`
- ✅ TypeScript interfaces mirror database exactly
- ✅ Enable Row Level Security (RLS)

## 📁 Import Order
1. React/Next.js imports
2. External libraries
3. UI components (`@/components/ui/`)
4. Feature components
5. Hooks and utilities
6. Types

## 🔐 Supabase Patterns
```typescript
// Auth check (always first)
const { data: { user }, error } = await supabase.auth.getUser()

// Query with types
const { data, error } = await supabase
  .from('shoots')
  .select('*')
  .returns<Shoot[]>()

// RLS policy example
CREATE POLICY "team_access" ON shoots
  FOR ALL USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  ));
```

## 🧪 Component Template
```typescript
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { Shoot } from '@/lib/shared-schema'

interface ComponentProps {
  data: Shoot
  onAction?: () => void
  children?: ReactNode
  className?: string
}

export function Component({ data, onAction, children, className }: ComponentProps) {
  return (
    <div className={cn("base-classes", className)}>
      {children}
    </div>
  )
}
```

## 🚨 Code Quality Rules
- ❌ No `any` types
- ❌ No direct conditional className strings
- ❌ No custom UI components when Radix exists
- ❌ No auth logic outside Supabase
- ✅ Always handle loading/error states
- ✅ Use React Query for server state
- ✅ Include proper TypeScript types
- ✅ Test user interactions