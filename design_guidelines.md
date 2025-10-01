# Cosplay Photo Shoot Tracker - Design Guidelines

## Design Approach

**Selected Approach:** Hybrid - Modern Productivity Design System with Creative Visual Flair

Drawing inspiration from Linear's clean interface and Notion's content organization, enhanced with visual-rich elements suited for the creative cosplay community. This balances professional project management functionality with aesthetic appeal that resonates with photographers and cosplayers.

**Key Design Principles:**
- Visual hierarchy that prioritizes upcoming shoots and quick actions
- Gallery-focused layouts for reference images and inspiration
- Clean, distraction-free interface that lets content (cosplay images) shine
- Professional organization tools with creative personality

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 222 15% 8% (deep charcoal)
- Surface: 222 15% 12% (elevated panels)
- Surface elevated: 222 15% 16% (cards, modals)
- Primary: 280 85% 65% (vibrant purple - cosplay/creative energy)
- Primary hover: 280 85% 72%
- Accent: 320 75% 60% (magenta pink - photography/glamour)
- Text primary: 0 0% 98%
- Text secondary: 0 0% 70%
- Border: 222 15% 22%
- Success: 142 76% 45% (shoot completed)
- Warning: 45 93% 58% (upcoming reminders)
- Muted: 222 10% 35%

**Light Mode:**
- Background: 0 0% 100%
- Surface: 0 0% 98%
- Surface elevated: 0 0% 100%
- Primary: 280 80% 50%
- Accent: 320 70% 50%
- Text primary: 222 15% 15%
- Text secondary: 222 10% 45%
- Border: 222 10% 90%

### B. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - headings, UI elements
- Secondary: 'Inter' with varied weights for hierarchy

**Scale:**
- Hero/Page titles: text-4xl font-bold (36px)
- Section headers: text-2xl font-semibold (24px)
- Card titles: text-lg font-medium (18px)
- Body text: text-base (16px)
- Captions/metadata: text-sm text-secondary (14px)
- Micro-labels: text-xs (12px)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: mb-8 to mb-12
- Card gaps: gap-6
- Icon spacing: mr-2 or mr-3

**Grid System:**
- Dashboard: 12-column grid for flexible layouts
- Shoot cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Reference images: masonry or grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Sidebar width: w-64 (desktop navigation)

### D. Component Library

**Navigation:**
- Sidebar navigation (desktop): Fixed left sidebar with shoot status filters, quick stats, calendar preview
- Mobile: Bottom tab bar or hamburger menu
- Top bar: User profile, notifications, quick add shoot button (prominent)

**Dashboard Components:**
- Upcoming shoots timeline: Horizontal scrollable cards with shoot images, dates, countdown timers
- Quick stats: Grid of metric cards (total shoots, this month, planning, completed)
- Status filters: Pill-style toggles (Idea, Planning, Scheduled, Completed)
- "Add New Shoot" CTA: Large, prominent button with primary color and icon

**Shoot Cards:**
- Card layout: Image thumbnail (3:2 aspect ratio), shoot title, date badge, status indicator, participant count, quick actions
- Hover state: Subtle elevation increase, overlay with quick actions (edit, calendar, docs)
- Status badges: Color-coded pills in top-right corner

**Forms:**
- Shoot creation modal: Multi-step form (Basic Info → References → Schedule → Participants)
- Image upload: Drag-and-drop zone with preview grid
- Instagram link input: URL field with auto-preview of post
- Date/time picker: Integration with calendar view
- Participant tags: Multi-select with avatar chips

**Detail View:**
- Hero section: Featured shoot image with gradient overlay, title, date, status
- Tabbed navigation: Details, References, Planning Doc, Calendar, Participants
- Reference gallery: Masonry grid with lightbox on click
- Instagram embeds: Card-style previews with link to original post
- Integration badges: Visual indicators for connected Google Calendar event and Docs

**Data Display:**
- Timeline view: Vertical timeline showing shoot progression and milestones
- Calendar integration: Small embedded calendar showing shoot dates with color coding
- Participant list: Avatar row with names and roles (photographer, cosplayer, location)

**Overlays:**
- Modals: Centered with backdrop blur, max-w-2xl for forms, max-w-5xl for galleries
- Toasts: Top-right corner for notifications and confirmations
- Image lightbox: Full-screen with navigation arrows and metadata sidebar

### E. Animations

Use sparingly and purposefully:
- Card hover: transform scale(1.02) with transition-transform duration-200
- Page transitions: Fade-in for route changes (opacity 0 to 1)
- Loading states: Subtle skeleton screens for content loading
- Success actions: Brief scale pulse on buttons (scale 0.95 → 1.05 → 1)

---

## Page-Specific Guidelines

### Overview Dashboard
- Full-width layout with sidebar
- Hero banner: "Upcoming Shoots" with count and "Add New" CTA prominently displayed
- Horizontal scrollable section: Next 5 upcoming shoots as large cards
- Grid section: All shoots filterable by status
- Sidebar: Quick filters, mini calendar, recent activity feed

### Shoot Detail Page
- Full-width hero with shoot's primary reference image (if available)
- Breadcrumb navigation back to dashboard
- Content sections in tabs or vertical scroll
- Fixed action bar (mobile): Edit, Share, Mark Complete buttons
- Reference images in responsive masonry grid (2 cols mobile, 4 cols desktop)

### Add/Edit Shoot Modal
- Clean white/dark surface elevated above dashboard
- Progress indicator for multi-step form
- Image upload section with prominent drop zone
- Instagram URL field with live preview generation
- Calendar date picker integrated seamlessly
- Save draft option for "Plan Later" ideas

---

## Images

**Hero Images:**
- Dashboard: No hero image - focus on content and upcoming shoots
- Shoot Detail Pages: YES - Use the first reference image uploaded as the hero (aspect ratio 21:9, with gradient overlay for text readability)

**Reference Images:**
- Location: Reference gallery section in shoot details
- Treatment: Grid/masonry layout, consistent aspect ratios, hover overlay with zoom icon
- Placeholders: Gradient backgrounds with camera icon for shoots without images yet

**Thumbnail Images:**
- Shoot cards on dashboard: 3:2 aspect ratio, object-cover, rounded corners (rounded-lg)
- Fallback: Gradient background with cosplay/camera icon when no image available

---

## Unique Features

- **Status Color System:** Each shoot status has distinct color (Idea: muted, Planning: primary, Scheduled: accent, Completed: success)
- **Integration Badges:** Small, tasteful icons indicating Google Calendar sync and Docs attachment
- **Quick Actions:** Context menu on right-click/long-press for shoot cards
- **Shoot Countdown:** Live countdown timers on upcoming shoots
- **Image Comparison:** Side-by-side view for before/after reference comparison