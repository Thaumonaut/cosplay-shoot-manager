# Complete Migration Guide: Old App to New Next.js Stack

## 🎯 **Executive Summary**

Based on comprehensive analysis of both applications, this guide provides everything needed for a complete migration from the old React + Express app to the new Next.js App Router application. The migration involves **6 critical phases** with specific technical requirements and implementation steps.

## 📊 **Current State Analysis**

### **✅ What's Already Working**
- **Authentication System**: Supabase Auth with JWT tokens ✅
- **Core API Routes**: Basic CRUD for shoots, teams, users ✅
- **Database Schema**: Supabase PostgreSQL with proper tables ✅
- **Basic UI Components**: Shadcn/ui components implemented ✅
- **Project Structure**: Next.js App Router properly configured ✅

### **❌ Critical Missing Features**
- **Visual Design System**: Missing elevation system, Space Grotesk fonts
- **Resource Management**: Equipment, personnel, costumes, locations (API stubs only)
- **File Upload System**: No image upload or file management
- **External Integrations**: Google Calendar, Docs, Maps (placeholders only)
- **Email Notifications**: No email system implemented
- **Advanced UI**: Missing sophisticated interactions and polish

## 🚨 **Phase 1: Visual Design System (CRITICAL - 3 hours)**

### **1.1 CSS Variables & Theme System**
```css
/* app/globals.css - Add these EXACTLY */
:root {
  /* Elevation system - CRITICAL for visual depth */
  --elevate-1: rgba(0,0,0, .03);
  --elevate-2: rgba(0,0,0, .08);
  
  /* Border intensity system */
  --opaque-button-border-intensity: -8;
  
  /* Advanced color calculations */
  --primary-border: hsl(from hsl(var(--primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  
  /* Font system - MUST use Space Grotesk */
  --font-sans: 'Space Grotesk', sans-serif;
  --font-serif: 'Geist', sans-serif;
  --font-mono: 'Geist Mono', monospace;
}

.dark {
  --elevate-1: rgba(255,255,255, .04);
  --elevate-2: rgba(255,255,255, .09);
  --opaque-button-border-intensity: 9;
  --radius: 1.3rem;
}
```

### **1.2 Elevation System Implementation**
```css
/* Add to app/globals.css */
@layer utilities {
  .hover-elevate:not(.no-default-hover-elevate),
  .active-elevate:not(.no-default-active-elevate) {
    position: relative;
    z-index: 0;
  }

  .hover-elevate:not(.no-default-hover-elevate)::after,
  .active-elevate:not(.no-default-active-elevate)::after {
    content: "";
    pointer-events: none;
    position: absolute;
    inset: 0px;
    border-radius: inherit;
    z-index: 999;
  }

  .hover-elevate:hover:not(.no-default-hover-elevate)::after,
  .active-elevate:active:not(.no-default-active-elevate)::after {
    background-color: var(--elevate-1);
  }

  .border.hover-elevate:not(.no-hover-interaction-elevate)::after {
    inset: -1px;
  }
}
```

### **1.3 Tailwind Configuration Update**
```typescript
// tailwind.config.ts - Update EXACTLY
export default {
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem", /* 9px - EXACT match */
        md: ".375rem", /* 6px - EXACT match */
        sm: ".1875rem", /* 3px - EXACT match */
      },
      fontFamily: {
        sans: ["var(--font-sans)"], // Space Grotesk
        serif: ["var(--font-serif)"], // Geist
        mono: ["var(--font-mono)"], // Geist Mono
      },
    }
  }
}
```

### **1.4 Font Installation**
```bash
# Install Space Grotesk font
npm install @next/font
```

```typescript
// app/layout.tsx - Add font loading
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

// Apply to body className
<body className={spaceGrotesk.variable}>
```

## 🏗️ **Phase 2: Resource Management APIs (HIGH PRIORITY - 6 hours)**

### **2.1 Database Schema Updates**
```sql
-- Run these migrations in Supabase
-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personnel table
CREATE TABLE IF NOT EXISTS personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Costumes table
CREATE TABLE IF NOT EXISTS costumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    character TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2.2 Storage Layer Updates**
```typescript
// src/lib/storage.ts - Add these methods
export class Storage {
  // Equipment CRUD
  async getTeamEquipment(teamId: string): Promise<Equipment[]> {
    const { data, error } = await this.supabase
      .from('equipment')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async createEquipment(data: CreateEquipmentData): Promise<Equipment> {
    const { data: equipment, error } = await this.supabase
      .from('equipment')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return equipment
  }

  // Similar methods for personnel, costumes, locations...
}
```

### **2.3 API Route Implementation**
```typescript
// app/api/equipment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest, getUserTeamId } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    const equipment = await storage.getTeamEquipment(teamId)
    return NextResponse.json(equipment)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    const equipmentData = await req.json()
    const data = { ...equipmentData, teamId }
    
    const createdEquipment = await storage.createEquipment(data)
    return NextResponse.json(createdEquipment, { status: 201 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
```

## 📁 **Phase 3: File Upload System (HIGH PRIORITY - 4 hours)**

### **3.1 Supabase Storage Setup**
```typescript
// src/lib/storage.ts - Add file upload methods
export class Storage {
  async uploadFile(file: File, teamId: string): Promise<FileMetadata> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${teamId}/${fileName}`

    const { data, error } = await this.supabase.storage
      .from('uploads')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = this.supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)

    return {
      id: crypto.randomUUID(),
      teamId,
      filename: file.name,
      storagePath: filePath,
      publicUrl,
      fileType: file.type,
      fileSize: file.size,
      createdAt: new Date().toISOString()
    }
  }
}
```

### **3.2 File Upload API Route**
```typescript
// app/api/files/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest, getUserTeamId } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const teamId = await getUserTeamId(userId)
    if (!teamId) {
      return NextResponse.json({ error: 'No active team found' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileMetadata = await storage.uploadFile(file, teamId)
    return NextResponse.json(fileMetadata, { status: 201 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
```

### **3.3 File Upload Component**
```typescript
// src/components/FileUpload.tsx
'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

export function FileUpload({ onUpload }: { onUpload: (file: FileMetadata) => void }) {
  const [dragActive, setDragActive] = useState(false)
  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Upload failed')
      return response.json()
    },
    onSuccess: (data) => {
      onUpload(data)
    }
  })

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadMutation.mutate(files[0])
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center hover-elevate ${
        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
    >
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Drag and drop files here, or click to select
        </p>
        {uploadMutation.isPending && (
          <p className="text-sm text-primary">Uploading...</p>
        )}
      </div>
    </div>
  )
}
```

## 🔗 **Phase 4: External Integrations (MEDIUM PRIORITY - 8 hours)**

### **4.1 Google Calendar Integration**
```typescript
// app/api/google/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  try {
    const { shootId, accessToken } = await req.json()
    
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Create calendar event
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: 'Cosplay Shoot',
        description: 'Photo shoot session',
        start: { dateTime: '2024-01-01T10:00:00Z' },
        end: { dateTime: '2024-01-01T12:00:00Z' },
      }
    })
    
    return NextResponse.json({ eventId: event.data.id, eventUrl: event.data.htmlLink })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 })
  }
}
```

### **4.2 Google Docs Integration**
```typescript
// app/api/google/docs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  try {
    const { shootData, accessToken } = await req.json()
    
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })
    
    const docs = google.docs({ version: 'v1', auth: oauth2Client })
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    
    // Create document
    const doc = await docs.documents.create({
      requestBody: {
        title: `Shoot: ${shootData.title}`,
      }
    })
    
    // Add content
    await docs.documents.batchUpdate({
      documentId: doc.data.documentId!,
      requestBody: {
        requests: [{
          insertText: {
            location: { index: 1 },
            text: `Shoot: ${shootData.title}\n\nDescription: ${shootData.description}`
          }
        }]
      }
    })
    
    return NextResponse.json({ 
      docId: doc.data.documentId,
      docUrl: `https://docs.google.com/document/d/${doc.data.documentId}/edit`
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
```

## 📧 **Phase 5: Email Notifications (MEDIUM PRIORITY - 3 hours)**

### **5.1 Email Service Setup**
```typescript
// src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendShootReminder(email: string, shootData: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'CosPlans <noreply@cosplans.com>',
      to: [email],
      subject: `Upcoming Shoot: ${shootData.title}`,
      html: `
        <h2>Upcoming Shoot Reminder</h2>
        <p><strong>Title:</strong> ${shootData.title}</p>
        <p><strong>Date:</strong> ${shootData.date}</p>
        <p><strong>Location:</strong> ${shootData.location || 'TBD'}</p>
        <p>Please prepare for your upcoming cosplay shoot!</p>
      `
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}
```

### **5.2 Email API Route**
```typescript
// app/api/email/reminders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { sendShootReminder } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { shootId, participantEmails } = await req.json()
    
    // Get shoot data
    const shoot = await storage.getShoot(shootId)
    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    // Send reminders to all participants
    const results = await Promise.allSettled(
      participantEmails.map((email: string) => 
        sendShootReminder(email, shoot)
      )
    )

    const successCount = results.filter(r => r.status === 'fulfilled').length
    
    return NextResponse.json({ 
      success: true, 
      count: successCount,
      message: `Reminders sent to ${successCount} participants`
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
```

## 🎨 **Phase 6: UI Component Updates (LOW PRIORITY - 4 hours)**

### **6.1 Button Component Enhancement**
```typescript
// src/components/ui/button.tsx - Add hover-elevate to all buttons
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover-elevate", // Added hover-elevate
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### **6.2 Card Component Enhancement**
```typescript
// src/components/ui/card.tsx - Add elevation system
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm hover-elevate", // Added hover-elevate
      className
    )}
    {...props}
  />
))
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret

# Google APIs (for integrations)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email service
RESEND_API_KEY=your_resend_api_key

# Optional: Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 📊 **Implementation Timeline**

| Phase | Priority | Time Estimate | Dependencies |
|-------|----------|---------------|--------------|
| **Phase 1: Visual Design** | CRITICAL | 3 hours | None |
| **Phase 2: Resource APIs** | HIGH | 6 hours | Phase 1 |
| **Phase 3: File Upload** | HIGH | 4 hours | Phase 2 |
| **Phase 4: External APIs** | MEDIUM | 8 hours | Phase 2 |
| **Phase 5: Email System** | MEDIUM | 3 hours | Phase 2 |
| **Phase 6: UI Polish** | LOW | 4 hours | Phase 1 |

**Total Estimated Time: 28 hours**

## 🎯 **Success Criteria**

### **Visual Parity**
- [ ] Screenshots indistinguishable from old app
- [ ] Space Grotesk fonts loaded and applied
- [ ] Elevation system working on all interactive elements
- [ ] Exact color scheme and spacing

### **Functional Parity**
- [ ] All resource management working (equipment, personnel, costumes, locations)
- [ ] File upload system functional
- [ ] Google Calendar integration working
- [ ] Google Docs export working
- [ ] Email notifications sending

### **Technical Quality**
- [ ] All API routes properly authenticated
- [ ] Database schema complete
- [ ] Error handling comprehensive
- [ ] Performance optimized

## 🚨 **Critical Success Factors**

1. **Start with Phase 1** - Visual design is the foundation
2. **Implement elevation system early** - It's what makes the app look professional
3. **Complete resource APIs before external integrations** - Build core functionality first
4. **Test with real data** - Empty states don't show the full experience
5. **Maintain authentication throughout** - All routes must be properly protected

## 💡 **Pro Tips**

- **Use the old app as reference** - Study the live application for exact behavior
- **Implement incrementally** - Complete each phase fully before moving to the next
- **Test authentication flow** - Ensure JWT tokens work properly across all routes
- **Focus on empty states** - They're crucial for user guidance
- **Maintain code quality** - This is a production application

This comprehensive guide provides everything needed to achieve 100% parity with the old application while leveraging the benefits of the Next.js App Router architecture.
