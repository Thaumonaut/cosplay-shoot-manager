# Cosplay Shoot Manager - Style Guide

## Table of Contents
1. [Database Schema Conventions](#database-schema-conventions)
2. [TypeScript Naming Conventions](#typescript-naming-conventions)
3. [Component Architecture](#component-architecture)
4. [UI Library Standards](#ui-library-standards)
5. [File Organization](#file-organization)
6. [Backend Services](#backend-services)
7. [Testing Conventions](#testing-conventions)
8. [Code Quality Standards](#code-quality-standards)

---

## Database Schema Conventions

### **Database is Source of Truth**
- All TypeScript interfaces must mirror database schema exactly
- Database column names define property names in TypeScript
- No transformation of field names between database and application layer
- Schema changes must be made in database first, then reflected in TypeScript types

### **Naming Rules**
- **Tables**: `snake_case` (e.g., `photo_shoots`, `costume_progress`)
- **Columns**: `snake_case` (e.g., `created_at`, `team_id`, `participant_count`)
- **Primary Keys**: Always `id` (UUID)
- **Foreign Keys**: `{table_name}_id` (e.g., `team_id`, `user_id`)
- **Timestamps**: Always include `created_at` and `updated_at`
- **Boolean Fields**: Use positive naming (e.g., `is_public`, `available`)

### **Required Fields for All Tables**
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### **Status Enums**
Use string literals, not integers:
```sql
status TEXT CHECK (status IN ('idea', 'planning', 'ready to shoot', 'completed'))
```

---

## TypeScript Naming Conventions

### **Interfaces and Types**
```typescript
// Database entities - PascalCase, singular
export interface Shoot {
  id: string
  title: string
  team_id: string  // Matches database exactly
  created_at: string
  updated_at: string
}

// Insert types for new records
export type InsertShoot = Omit<Shoot, 'id' | 'created_at' | 'updated_at'>

// Enriched types for UI components
export interface EnrichedShoot extends Shoot {
  location?: Location
  participants?: Personnel[]
}
```

### **File Naming**
- **Components**: `PascalCase.tsx` (e.g., `ShootCard.tsx`, `CreateLocationDialog.tsx`)
- **Hooks**: `camelCase.ts` starting with `use` (e.g., `useShootData.ts`, `useAuth.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `date-utils.ts`, `api-client.ts`)
- **Types/Schemas**: `kebab-case.ts` (e.g., `shared-schema.ts`, `api-types.ts`)

### **Variable Naming**
```typescript
// camelCase for variables and functions
const shootData = await fetchShoot(id)
const handleCreateShoot = () => {}

// PascalCase for components and classes
const ShootCard = ({ shoot }: ShootCardProps) => {}

// UPPER_SNAKE_CASE for constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
const DEFAULT_SHOOT_STATUS = 'idea'
```

### **Props Interfaces**
```typescript
// Always suffix with Props
interface ShootCardProps {
  shoot: Shoot
  onEdit?: (shoot: Shoot) => void
  className?: string
}

// Use descriptive boolean prop names
interface CreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading?: boolean
}
```

---

## Component Architecture

### **Component Types**
1. **Page Components**: Top-level route components in `app/` directory
2. **Feature Components**: Complex components with business logic
3. **UI Components**: Reusable, presentational components in `src/components/ui/`
4. **Composite Components**: Combinations of UI components for specific features

### **Component Structure**
```typescript
// 1. Imports (external first, then internal)
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import type { Shoot } from '@/lib/shared-schema'

// 2. Types and interfaces
interface ShootDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shoot?: Shoot
}

// 3. Component definition
export function ShootDialog({ open, onOpenChange, shoot }: ShootDialogProps) {
  // 4. Hooks and state
  const [loading, setLoading] = useState(false)
  
  // 5. Event handlers
  const handleSubmit = () => {}
  
  // 6. Effects
  useEffect(() => {}, [])
  
  // 7. Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* JSX */}
    </Dialog>
  )
}
```

### **State Management**
- Use React Query for server state
- Use React hooks for local component state
- Prefer controlled components
- Use React Context sparingly (auth, theme only)

---

## UI Library Standards

### **Radix UI First**
- **Always use Radix UI** for interactive components when available
- Custom implementations only when Radix doesn't provide the component
- Follow the established pattern in `src/components/ui/`

### **UI Component Pattern**
```typescript
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### **Required Radix Components**
```typescript
// Always use these instead of custom implementations:
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Toast } from '@/components/ui/toast'
import { Tooltip } from '@/components/ui/tooltip'
import { Popover } from '@/components/ui/popover'
import { Sheet } from '@/components/ui/sheet'
import { Tabs } from '@/components/ui/tabs'
import { Accordion } from '@/components/ui/accordion'
import { Collapsible } from '@/components/ui/collapsible'
import { NavigationMenu } from '@/components/ui/navigation-menu'
import { ContextMenu } from '@/components/ui/context-menu'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { Menubar } from '@/components/ui/menubar'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { HoverCard } from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar } from '@/components/ui/avatar'
```

### **Styling Standards**
- Use Tailwind CSS for all styling
- Use CSS variables for theme colors
- Follow the design system defined in `tailwind.config.ts`
- Use `cn()` utility for conditional classes

```typescript
import { cn } from '@/lib/utils'

// Good
<div className={cn(
  "flex items-center space-x-2",
  isActive && "bg-accent",
  className
)} />

// Bad - direct conditional logic
<div className={`flex items-center space-x-2 ${isActive ? 'bg-accent' : ''} ${className}`} />
```

---

## File Organization

### **Directory Structure**
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── shoots/            # Feature-based routing
├── components/
│   ├── ui/                # Radix-based UI primitives
│   ├── ShootCard.tsx      # Feature components
│   └── CreateShootDialog.tsx
├── contexts/              # React contexts (minimal usage)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── shared-schema.ts   # Database types (source of truth)
│   ├── utils.ts           # Common utilities
│   └── supabase.ts        # Supabase client
└── styles/                # Global styles
```

### **Import Organization**
```typescript
// 1. React and Next.js
import { useState, useEffect } from 'react'
import { NextRequest, NextResponse } from 'next/server'
import Image from 'next/image'

// 2. External libraries
import { supabase } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// 3. Internal UI components
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

// 4. Internal feature components
import { ShootCard } from '@/components/ShootCard'
import { CreateShootDialog } from '@/components/CreateShootDialog'

// 5. Hooks and utilities
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

// 6. Types
import type { Shoot, Personnel } from '@/lib/shared-schema'
```

---

## Backend Services

### **Supabase Integration**
- **Authentication**: Always use Supabase Auth
- **Database**: PostgreSQL via Supabase
- **Storage**: Supabase Storage for file uploads
- **Realtime**: Supabase Realtime for live updates when needed

### **API Routes Pattern**
```typescript
// app/api/shoots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Always verify auth first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Database query using exact schema names
    const { data, error } = await supabase
      .from('shoots')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **Database Queries**
```typescript
// Always use TypeScript for query results
const { data, error } = await supabase
  .from('shoots')
  .select(`
    *,
    location:locations(*),
    participants:shoot_participants(
      personnel:personnel(*)
    )
  `)
  .eq('team_id', teamId)
  .returns<EnrichedShoot[]>()
```

### **Row Level Security (RLS)**
- Enable RLS on all tables
- Use team-based access control
- Verify user permissions in policies

```sql
-- Example RLS Policy
CREATE POLICY "Users can view shoots in their teams" ON shoots
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );
```

---

## Testing Conventions

### **Testing Framework**
- **Unit/Integration Tests**: Jest with React Testing Library
- **Component Documentation**: Storybook for component showcase and testing
- **NO Vitest**: This project uses Jest, not Vitest
- **Configuration**: Use `jest.config.js` and `jest.setup.js` - no `vitest.config.ts` should exist

### **When to Use Each Testing Tool**
- **Jest**: Unit tests, integration tests, API testing, business logic
- **Storybook**: Component development, visual testing, design system documentation
- **React Testing Library**: Component behavior testing, user interaction testing

### **Testing Commands**
```bash
# Run Jest tests
pnpm test

# Run Jest tests in watch mode
pnpm test:watch

# Run Jest tests with coverage (CI)
pnpm test:ci

# TODO: Set up Storybook
# pnpm storybook
# pnpm build-storybook
```

### **Test File Naming**
- Unit tests: `ComponentName.test.tsx`
- Integration tests: `feature-name.integration.test.ts`
- E2E tests: `user-journey.e2e.test.ts`
- Storybook stories: `ComponentName.stories.tsx`

### **Jest Test Structure**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ShootCard } from '../ShootCard'
import type { Shoot } from '@/lib/shared-schema'

const mockShoot: Shoot = {
  id: '1',
  title: 'Test Shoot',
  status: 'planning',
  team_id: 'team1',
  user_id: 'user1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

describe('ShootCard', () => {
  it('displays shoot title', () => {
    render(<ShootCard shoot={mockShoot} />)
    expect(screen.getByText('Test Shoot')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn()
    render(<ShootCard shoot={mockShoot} onEdit={mockOnEdit} />)
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(mockOnEdit).toHaveBeenCalledWith(mockShoot)
  })
})
```

### **Storybook Stories**
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { ShootCard } from './ShootCard'

const meta: Meta<typeof ShootCard> = {
  title: 'Components/ShootCard',
  component: ShootCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    shoot: {
      id: '1',
      title: 'Cyberpunk Photoshoot',
      status: 'planning',
      team_id: 'team1',
      user_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  },
}

export const Completed: Story = {
  args: {
    shoot: {
      ...Default.args.shoot,
      status: 'completed',
    },
  },
}
```

---

## Code Quality Standards

### **TypeScript Configuration**
- Strict mode enabled
- No `any` types (use `unknown` or proper typing)
- Prefer interfaces over types for object shapes
- Use type assertions sparingly

### **Error Handling**
```typescript
// API Routes
try {
  const result = await operation()
  return NextResponse.json(result)
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  )
}

// Components
const [error, setError] = useState<string | null>(null)

try {
  await mutation.mutateAsync(data)
} catch (error) {
  setError(error instanceof Error ? error.message : 'Unknown error')
}
```

### **Performance Guidelines**
- Use React.memo for expensive components
- Implement proper loading states
- Use React Query for data fetching
- Optimize images with Next.js Image component

### **Accessibility**
- Include proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Use semantic HTML elements

### **Code Documentation**
```typescript
/**
 * Creates a new photo shoot with the provided data
 * @param shootData - The shoot data to create
 * @returns Promise resolving to the created shoot
 * @throws Error if user is not authenticated or creation fails
 */
export async function createShoot(shootData: InsertShoot): Promise<Shoot> {
  // Implementation
}
```

---

## Migration Guidelines

When migrating or updating existing code:

1. **Database First**: Update schema in Supabase, then TypeScript types
2. **UI Components**: Replace custom components with Radix equivalents
3. **Auth**: Migrate to Supabase Auth patterns
4. **File Uploads**: Use Supabase Storage
5. **Styling**: Convert to Tailwind CSS classes
6. **Testing**: Add tests for new functionality

---

## AI Development Guidelines

When working with AI assistants:

1. **Reference this style guide** for all naming and architecture decisions
2. **Always check database schema** before creating TypeScript interfaces
3. **Use established UI components** rather than creating new ones
4. **Follow the import organization** pattern
5. **Implement proper error handling** and loading states
6. **Include TypeScript types** for all props and function parameters
7. **Test components** after creation or modification

---

This style guide should be the primary reference for all development work on the Cosplay Shoot Manager application. It ensures consistency, maintainability, and scalability across the codebase.