# Live Application Testing Checklist

## Quick Start Guide

**Test Applications:**
- **Old App**: https://cosplay-shoot-manager.onrender.com
- **New App**: http://localhost:3000 (start with `npm run dev`)
- **Test Credentials**: user@example.com / password1234

## Phase 1: Authentication & Basic Navigation (30 minutes)

### ✅ Login Flow Testing
- [ ] **Old App**: Navigate to login page, enter credentials, verify dashboard loads
- [ ] **New App**: Navigate to login page, enter credentials, verify dashboard loads
- [ ] **Compare**: Login form UI, error messages, redirect behavior
- [ ] **Notes**: ________________________________

### ✅ Dashboard Comparison
- [ ] **Old App**: Check dashboard layout, upcoming shoots, calendar view
- [ ] **New App**: Check dashboard layout, upcoming shoots, calendar view
- [ ] **Compare**: Layout differences, missing features, UI improvements
- [ ] **Notes**: ________________________________

### ✅ Navigation Testing
- [ ] **Old App**: Test all sidebar navigation links, verify active highlighting
- [ ] **New App**: Test all sidebar navigation links, verify active highlighting
- [ ] **Compare**: Navigation consistency, missing pages, different behaviors
- [ ] **Notes**: ________________________________

## Phase 2: Core Shoot Management (45 minutes)

### ✅ Shoot Creation
- [ ] **Old App**: Create new shoot, fill all fields, add participants, save
- [ ] **New App**: Create new shoot, fill all fields, add participants, save
- [ ] **Compare**: Form fields, validation, participant management, save behavior
- [ ] **Notes**: ________________________________

### ✅ Shoot Viewing
- [ ] **Old App**: View shoot details, check all information displays correctly
- [ ] **New App**: View shoot details, check all information displays correctly
- [ ] **Compare**: Detail page layout, missing information, different displays
- [ ] **Notes**: ________________________________

### ✅ Shoot Editing
- [ ] **Old App**: Edit shoot details, modify participants, update resources
- [ ] **New App**: Edit shoot details, modify participants, update resources
- [ ] **Compare**: Editing capabilities, form behavior, save functionality
- [ ] **Notes**: ________________________________

### ✅ Dashboard Views
- [ ] **Old App**: Test calendar view, Kanban board, status filtering
- [ ] **New App**: Test calendar view, Kanban board, status filtering
- [ ] **Compare**: View functionality, missing features, different implementations
- [ ] **Notes**: ________________________________

## Phase 3: Resource Management (60 minutes)

### ✅ Equipment Management
- [ ] **Old App**: Navigate to equipment page, add/edit/delete equipment
- [ ] **New App**: Navigate to equipment page, add/edit/delete equipment
- [ ] **Compare**: Page functionality, CRUD operations, UI differences
- [ ] **Notes**: ________________________________

### ✅ Personnel Management
- [ ] **Old App**: Navigate to personnel page, manage team members
- [ ] **New App**: Navigate to personnel page, manage team members
- [ ] **Compare**: Management capabilities, contact information, assignment system
- [ ] **Notes**: ________________________________

### ✅ Costume Management
- [ ] **Old App**: Navigate to costumes page, manage costume inventory
- [ ] **New App**: Navigate to costumes page, manage costume inventory
- [ ] **Compare**: Inventory management, assignment capabilities
- [ ] **Notes**: ________________________________

### ✅ Location Management
- [ ] **Old App**: Navigate to locations page, test Google Maps integration
- [ ] **New App**: Navigate to locations page, test Google Maps integration
- [ ] **Compare**: Location management, Maps integration, search functionality
- [ ] **Notes**: ________________________________

## Phase 4: Advanced Features (45 minutes)

### ✅ File Upload Testing
- [ ] **Old App**: Upload reference images, test image cropping, verify storage
- [ ] **New App**: Upload reference images, test image cropping, verify storage
- [ ] **Compare**: Upload functionality, image processing, storage system
- [ ] **Notes**: ________________________________

### ✅ Google Calendar Integration
- [ ] **Old App**: Create calendar event from shoot, verify Google Calendar sync
- [ ] **New App**: Create calendar event from shoot, verify Google Calendar sync
- [ ] **Compare**: Calendar integration, event creation, sync functionality
- [ ] **Notes**: ________________________________

### ✅ Google Docs Integration
- [ ] **Old App**: Export shoot to Google Docs, verify document creation
- [ ] **New App**: Export shoot to Google Docs, verify document creation
- [ ] **Compare**: Document export, template generation, sharing capabilities
- [ ] **Notes**: ________________________________

### ✅ Email Notifications
- [ ] **Old App**: Test shoot reminders, team invitations, verify email sending
- [ ] **New App**: Test shoot reminders, team invitations, verify email sending
- [ ] **Compare**: Email system, notification types, delivery confirmation
- [ ] **Notes**: ________________________________

## Phase 5: Team Management (30 minutes)

### ✅ Team Creation
- [ ] **Old App**: Create new team, verify team switching works
- [ ] **New App**: Create new team, verify team switching works
- [ ] **Compare**: Team creation flow, switching behavior, data isolation
- [ ] **Notes**: ________________________________

### ✅ Team Member Management
- [ ] **Old App**: Invite team members, manage roles, test permissions
- [ ] **New App**: Invite team members, manage roles, test permissions
- [ ] **Compare**: Invitation system, role management, permission enforcement
- [ ] **Notes**: ________________________________

## Phase 6: User Experience & Performance (30 minutes)

### ✅ Mobile Responsiveness
- [ ] **Old App**: Test on mobile device, check responsive design
- [ ] **New App**: Test on mobile device, check responsive design
- [ ] **Compare**: Mobile experience, touch interactions, layout adaptation
- [ ] **Notes**: ________________________________

### ✅ Performance Testing
- [ ] **Old App**: Measure page load times, test with multiple shoots
- [ ] **New App**: Measure page load times, test with multiple shoots
- [ ] **Compare**: Load times, responsiveness, memory usage
- [ ] **Notes**: ________________________________

### ✅ Error Handling
- [ ] **Old App**: Test error scenarios, verify error messages
- [ ] **New App**: Test error scenarios, verify error messages
- [ ] **Compare**: Error message quality, recovery options, user guidance
- [ ] **Notes**: ________________________________

## Critical Issues Found

### 🔴 High Priority Issues
- [ ] **Issue**: ________________________________
  - **Old App Behavior**: ________________________________
  - **New App Behavior**: ________________________________
  - **Impact**: ________________________________

- [ ] **Issue**: ________________________________
  - **Old App Behavior**: ________________________________
  - **New App Behavior**: ________________________________
  - **Impact**: ________________________________

### 🟡 Medium Priority Issues
- [ ] **Issue**: ________________________________
  - **Old App Behavior**: ________________________________
  - **New App Behavior**: ________________________________
  - **Impact**: ________________________________

### 🟢 Low Priority Issues
- [ ] **Issue**: ________________________________
  - **Old App Behavior**: ________________________________
  - **New App Behavior**: ________________________________
  - **Impact**: ________________________________

## Missing Features Summary

### ❌ Completely Missing
- [ ] **Feature**: ________________________________
  - **Description**: ________________________________
  - **Priority**: ________________________________

### ⚠️ Partially Implemented
- [ ] **Feature**: ________________________________
  - **Missing Parts**: ________________________________
  - **Priority**: ________________________________

### 🔄 Different Implementation
- [ ] **Feature**: ________________________________
  - **Differences**: ________________________________
  - **Priority**: ________________________________

## Performance Comparison

| Metric | Old App | New App | Difference | Notes |
|--------|---------|---------|------------|-------|
| Initial Load Time | _____s | _____s | _____s | _____ |
| Navigation Speed | _____s | _____s | _____s | _____ |
| Form Submission | _____s | _____s | _____s | _____ |
| Mobile Performance | _____ | _____ | _____ | _____ |

## User Experience Comparison

### UI/UX Improvements in New App
- [ ] ________________________________
- [ ] ________________________________
- [ ] ________________________________

### UI/UX Regressions in New App
- [ ] ________________________________
- [ ] ________________________________
- [ ] ________________________________

## Recommendations

### Immediate Actions Required
1. ________________________________
2. ________________________________
3. ________________________________

### Short-term Improvements
1. ________________________________
2. ________________________________
3. ________________________________

### Long-term Enhancements
1. ________________________________
2. ________________________________
3. ________________________________

## Testing Notes

### Overall Assessment
**Migration Success Rate**: _____%

**Key Strengths**:
- ________________________________
- ________________________________
- ________________________________

**Key Weaknesses**:
- ________________________________
- ________________________________
- ________________________________

### Next Steps
1. **Priority 1**: ________________________________
2. **Priority 2**: ________________________________
3. **Priority 3**: ________________________________

---

## Quick Test Commands

### Start New App
```bash
cd next
npm run dev
```

### Test URLs
- Old App: https://cosplay-shoot-manager.onrender.com
- New App: http://localhost:3000

### Test Credentials
- Email: user@example.com
- Password: password1234

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Test Data Setup
- [ ] Create test shoots with different statuses
- [ ] Add test equipment, personnel, costumes
- [ ] Set up test locations
- [ ] Create test teams with multiple members

This checklist provides a systematic approach to comparing both applications and identifying any missing features or differences in functionality.
