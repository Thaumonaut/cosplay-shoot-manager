# AI Agent Instructions: Perfect App Replication Guide

## 🎯 **Mission Brief: Perfect App Replication**

You need to replicate the old Cosplay Shoot Manager (https://cosplay-shoot-manager.onrender.com) using Next.js App Router, maintaining 100% visual and functional parity. Here's your complete roadmap:

## 📋 **Phase 1: Visual Design System Migration (CRITICAL)**

### **1. CSS Variables & Theme System**
```css
/* Copy EXACTLY from old app's globals.css */
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

### **2. Elevation System Implementation**
```css
/* CRITICAL: This creates the visual depth that makes the old app look professional */
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
}
```

### **3. Tailwind Configuration Update**
```typescript
// tailwind.config.ts - MUST match old app exactly
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

## 🏗️ **Phase 2: Component Architecture (HIGH PRIORITY)**

### **1. Sidebar Component Structure**
```typescript
// Must replicate EXACTLY:
// - Logo: "CosPlans" with "Photo Shoot Manager" tagline
// - Team selector dropdown
// - Navigation sections: Dashboard, All Shoots, Calendar, Map View
// - Resources section: Crew, Equipment, Locations, Props, Costumes
// - User profile link with initials and email
// - Header controls: sidebar toggle, theme toggle, sign out
```

### **2. Dashboard Layout**
```typescript
// EXACT layout from old app:
// - Header: "Upcoming Shoots" + "Add New Shoot" button
// - Two-column layout:
//   - Left: Interactive calendar (October 2025 navigation)
//   - Right: "Events on [Date]" panel
// - Bottom: "All Shoots" accordion with status filters
```

### **3. Kanban Board Implementation**
```typescript
// Four columns with EXACT styling:
// - Ideas (Lightbulb icon, 0 count)
// - Planning (Clock icon, 0 count)  
// - Ready to Shoot (Calendar icon, 0 count)
// - Completed (CheckCircle icon, 0 count)
// Each column shows "No shoots in [status]" when empty
```

## 🎨 **Phase 3: Visual Polish (MEDIUM PRIORITY)**

### **1. Button Styling**
```typescript
// Add hover-elevate class to ALL interactive buttons
<Button className="hover-elevate">
  <Icon />
  Text
</Button>
```

### **2. Card Components**
```typescript
// Implement elevation system on all cards
<Card className="hover-elevate">
  <CardContent>
    // Content
  </CardContent>
</Card>
```

### **3. Form Components**
```typescript
// Shoot creation form MUST match old app exactly:
// - Title input with placeholder
// - Status dropdown (Idea, Planning, Ready to Shoot, Completed)
// - Description textarea
// - Color picker (#3b82f6 default)
// - Resource sections with "Add" buttons
// - Reference image upload area
// - Instagram URL input
```

## 🔧 **Phase 4: Functional Features (HIGH PRIORITY)**

### **1. Authentication System**
```typescript
// EXACTLY replicate:
// - Google OAuth integration
// - GitHub OAuth integration  
// - Email/password login
// - User profile display with initials
// - Team management system
```

### **2. Shoot Management**
```typescript
// Complete CRUD operations:
// - Create shoot with all fields
// - Update shoot status
// - Delete shoot
// - View shoot details
// - Status-based filtering
```

### **3. Resource Management**
```typescript
// Implement ALL resource types:
// - Crew (personnel management)
// - Equipment (gear tracking)
// - Locations (venue management)
// - Props (prop tracking)
// - Costumes (costume management)
```

## 📱 **Phase 5: Page Structure (CRITICAL)**

### **1. Route Structure**
```typescript
// EXACT route matching:
/                    // Dashboard
/shoots             // All Shoots (Kanban)
/calendar           // Calendar View
/map                // Map View
/personnel          // Crew Management
/equipment          // Equipment Management
/locations          // Location Management
/props              // Props Management
/costumes           // Costumes Management
/shoots/new         // Create New Shoot
/shoots/[id]        // Edit Shoot
/profile            // User Profile
```

### **2. Navigation States**
```typescript
// Active state highlighting
// Breadcrumb navigation
// Back button functionality
// Consistent header across all pages
```

## 🎯 **Phase 6: Advanced Features (MEDIUM PRIORITY)**

### **1. Google Integrations**
```typescript
// Prepare UI for (functionality can be added later):
// - Google Calendar event creation
// - Google Docs export
// - Email reminder system
```

### **2. File Upload System**
```typescript
// Reference image upload
// File management
// Image preview
```

### **3. Map Integration**
```typescript
// Geographic visualization
// Location markers
// Shoot location display
```

## 🚨 **CRITICAL SUCCESS FACTORS**

### **1. Visual Parity Checklist**
- [ ] Space Grotesk font family loaded
- [ ] Elevation system implemented on all interactive elements
- [ ] Exact color scheme (#3b82f6 primary, lime green accents)
- [ ] Border radius values match exactly (.5625rem, .375rem, .1875rem)
- [ ] Hover states with elevation effects
- [ ] Empty state illustrations and messaging

### **2. Functional Parity Checklist**
- [ ] All routes implemented and working
- [ ] Authentication system functional
- [ ] Shoot CRUD operations complete
- [ ] Resource management for all categories
- [ ] Status-based filtering and organization
- [ ] Calendar navigation and event display

### **3. User Experience Checklist**
- [ ] Smooth page transitions
- [ ] Consistent navigation patterns
- [ ] Helpful empty states
- [ ] Intuitive form layouts
- [ ] Professional visual hierarchy

## 📊 **Implementation Priority Matrix**

| Phase | Priority | Time Estimate | Impact |
|-------|----------|---------------|---------|
| CSS Variables & Fonts | CRITICAL | 1 hour | HIGH |
| Elevation System | CRITICAL | 2 hours | HIGH |
| Component Structure | HIGH | 4 hours | HIGH |
| Visual Polish | MEDIUM | 3 hours | MEDIUM |
| Functional Features | HIGH | 6 hours | HIGH |
| Advanced Features | LOW | 4 hours | LOW |

## 🎯 **Final Success Criteria**

The replication is successful when:
1. **Visual**: Screenshots of both apps are indistinguishable
2. **Functional**: All features work identically
3. **Performance**: Smooth interactions and fast loading
4. **User Experience**: Identical navigation and workflow

## 💡 **Pro Tips**

1. **Start with CSS variables** - This is the foundation of visual parity
2. **Implement elevation system early** - It's what makes the old app look professional
3. **Use Space Grotesk font** - It's a key differentiator
4. **Focus on empty states** - They're crucial for user guidance
5. **Test with real data** - Empty states don't show the full experience

## 🔍 **Reference URLs**

- **Old App**: https://cosplay-shoot-manager.onrender.com
- **Key Pages to Study**:
  - Dashboard: https://cosplay-shoot-manager.onrender.com/
  - All Shoots: https://cosplay-shoot-manager.onrender.com/shoots
  - Calendar: https://cosplay-shoot-manager.onrender.com/calendar
  - Crew: https://cosplay-shoot-manager.onrender.com/personnel
  - Equipment: https://cosplay-shoot-manager.onrender.com/equipment
  - Map: https://cosplay-shoot-manager.onrender.com/map
  - New Shoot: https://cosplay-shoot-manager.onrender.com/shoots/new

## 📝 **Implementation Notes**

### **Current State Analysis**
- New app is built with Next.js App Router
- Uses Supabase for backend and authentication
- Has basic Tailwind CSS setup
- Missing advanced CSS variables and elevation system
- Missing Space Grotesk font family
- Missing sophisticated component styling

### **Key Files to Modify**
1. `app/globals.css` - Add CSS variables and elevation system
2. `tailwind.config.ts` - Update font families and border radius
3. `components/ui/button.tsx` - Add hover-elevate classes
4. `components/ui/card.tsx` - Add elevation system
5. `components/app-sidebar.tsx` - Refine styling and navigation
6. All page components - Add proper styling and functionality

### **Font Installation**
```bash
# Install Space Grotesk font
npm install @next/font
# Add to layout.tsx:
import { Space_Grotesk } from 'next/font/google'
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })
```

The old app is **exceptionally well-designed** - replicate it exactly and you'll have a professional-grade application that users will love!
