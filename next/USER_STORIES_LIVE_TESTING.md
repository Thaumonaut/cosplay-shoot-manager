# User Stories for Live Application Testing

## Testing Overview

This document provides comprehensive user stories for testing both the old React + Express application (deployed on Render) and the new Next.js application (running locally). These stories will help ensure feature parity and identify any missing functionality.

**Test Applications:**
- **Old App**: https://cosplay-shoot-manager.onrender.com
- **New App**: http://localhost:3000
- **Test Credentials**: user@example.com / password1234

## Epic 1: Authentication & User Management

### Story 1.1: User Login Flow
**As a** new user  
**I want to** log into the application  
**So that** I can access my cosplay shoot management features

#### Test Scenarios:
1. **Successful Login**
   - Navigate to login page
   - Enter valid credentials (user@example.com / password1234)
   - Verify redirect to dashboard
   - Verify user session persists on page refresh

2. **Invalid Credentials**
   - Enter incorrect email/password
   - Verify error message displays
   - Verify user remains on login page

3. **Password Reset** (if available)
   - Click "Forgot Password" link
   - Enter email address
   - Verify reset email sent (check implementation)

#### Comparison Points:
- [ ] Login form UI consistency
- [ ] Error message styling and content
- [ ] Redirect behavior after login
- [ ] Session persistence mechanism

### Story 1.2: User Registration
**As a** new user  
**I want to** create an account  
**So that** I can start managing cosplay shoots

#### Test Scenarios:
1. **Account Creation**
   - Navigate to registration page
   - Fill in required fields (email, password, name)
   - Submit form
   - Verify account created and user logged in
   - Verify automatic team creation

2. **Duplicate Email**
   - Attempt to register with existing email
   - Verify appropriate error message

#### Comparison Points:
- [ ] Registration form fields and validation
- [ ] Automatic team creation behavior
- [ ] Welcome/onboarding flow

### Story 1.3: User Profile Management
**As a** logged-in user  
**I want to** view and edit my profile  
**So that** I can keep my information up to date

#### Test Scenarios:
1. **View Profile**
   - Navigate to profile page
   - Verify profile information displays correctly
   - Check avatar/image display

2. **Edit Profile**
   - Update profile information
   - Save changes
   - Verify changes persist
   - Verify changes reflect across the app

#### Comparison Points:
- [ ] Profile page layout and functionality
- [ ] Avatar upload capability
- [ ] Form validation and error handling

## Epic 2: Team Management

### Story 2.1: Team Creation and Management
**As a** user  
**I want to** create and manage teams  
**So that** I can organize shoots with different groups

#### Test Scenarios:
1. **Create New Team**
   - Navigate to team management
   - Click "Create New Team"
   - Enter team name and details
   - Verify team created successfully
   - Verify user becomes team owner

2. **Switch Between Teams**
   - Create multiple teams
   - Use team switcher to change active team
   - Verify all data updates to reflect new team context
   - Verify team selection persists on page refresh

3. **Edit Team Details**
   - Select a team
   - Edit team name or details
   - Save changes
   - Verify changes reflected

4. **Delete Team**
   - Select a team to delete
   - Confirm deletion
   - Verify team removed and user switched to another team

#### Comparison Points:
- [ ] Team creation flow and UI
- [ ] Team switcher functionality and persistence
- [ ] Team editing capabilities
- [ ] Data isolation between teams

### Story 2.2: Team Member Management
**As a** team owner/admin  
**I want to** invite and manage team members  
**So that** I can collaborate on shoots

#### Test Scenarios:
1. **Invite Team Members**
   - Navigate to team member management
   - Click "Invite Member"
   - Enter email address
   - Send invitation
   - Verify invitation sent (check email implementation)

2. **Manage Member Roles**
   - View team member list
   - Change member roles (owner, admin, member)
   - Verify role changes take effect

3. **Remove Team Members**
   - Remove a team member
   - Verify member removed from team
   - Verify member loses access to team data

#### Comparison Points:
- [ ] Member invitation system
- [ ] Role management interface
- [ ] Email notification system
- [ ] Permission enforcement

## Epic 3: Shoot Management

### Story 3.1: Shoot Creation
**As a** user  
**I want to** create new cosplay shoots  
**So that** I can plan and organize photo sessions

#### Test Scenarios:
1. **Basic Shoot Creation**
   - Navigate to "Create New Shoot"
   - Fill in required fields (title, date, description)
   - Save shoot
   - Verify shoot created and appears in dashboard
   - Verify shoot details are correct

2. **Advanced Shoot Creation**
   - Add participants to shoot
   - Assign equipment and costumes
   - Add location details
   - Add reference images
   - Save and verify all data persists

3. **Shoot Status Management**
   - Create shoot with different statuses (idea, planning, ready to shoot, completed)
   - Verify status affects dashboard display
   - Verify status filtering works

#### Comparison Points:
- [ ] Shoot creation form fields and validation
- [ ] Participant assignment functionality
- [ ] Equipment/costume assignment
- [ ] Reference image upload
- [ ] Status management system

### Story 3.2: Shoot Viewing and Organization
**As a** user  
**I want to** view and organize my shoots  
**So that** I can track progress and plan effectively

#### Test Scenarios:
1. **Dashboard Views**
   - View upcoming shoots section
   - Test calendar view functionality
   - Test Kanban board view
   - Verify shoot filtering by status
   - Verify date-based filtering

2. **Shoot Detail View**
   - Click on a shoot from dashboard
   - Verify all shoot details display correctly
   - Verify participant information
   - Verify assigned resources
   - Verify reference images

3. **Shoot Editing**
   - Edit shoot details
   - Add/remove participants
   - Update resource assignments
   - Save changes and verify persistence

#### Comparison Points:
- [ ] Dashboard layout and functionality
- [ ] Calendar view implementation
- [ ] Kanban board functionality
- [ ] Shoot detail page layout
- [ ] Editing capabilities

### Story 3.3: Shoot Participants and Resources
**As a** user  
**I want to** manage shoot participants and resources  
**So that** I can coordinate all aspects of the shoot

#### Test Scenarios:
1. **Participant Management**
   - Add participants to shoot
   - Assign roles to participants
   - Remove participants
   - Verify participant information displays correctly

2. **Resource Assignment**
   - Assign equipment to shoot
   - Assign costumes to shoot
   - Assign locations to shoot
   - Verify resource availability checking
   - Verify conflict detection

3. **Reference Management**
   - Upload reference images
   - Add Instagram links as references
   - Organize references by category
   - Verify reference display in shoot details

#### Comparison Points:
- [ ] Participant management interface
- [ ] Resource assignment system
- [ ] Reference image upload functionality
- [ ] Resource availability checking
- [ ] Conflict detection system

## Epic 4: Resource Management

### Story 4.1: Equipment Management
**As a** user  
**I want to** manage equipment inventory  
**So that** I can track what's available for shoots

#### Test Scenarios:
1. **Equipment CRUD Operations**
   - Navigate to equipment page
   - Add new equipment items
   - Edit existing equipment
   - Delete equipment items
   - Verify all operations work correctly

2. **Equipment Assignment**
   - Assign equipment to shoots
   - Verify equipment shows as "in use"
   - Remove equipment from shoots
   - Verify equipment shows as "available"

3. **Equipment Search and Filtering**
   - Search equipment by name
   - Filter by equipment type
   - Filter by availability status
   - Verify search and filtering work correctly

#### Comparison Points:
- [ ] Equipment management page layout
- [ ] CRUD operation functionality
- [ ] Assignment system
- [ ] Search and filtering capabilities

### Story 4.2: Personnel Management
**As a** user  
**I want to** manage personnel directory  
**So that** I can easily assign people to shoots

#### Test Scenarios:
1. **Personnel CRUD Operations**
   - Navigate to personnel page
   - Add new personnel entries
   - Edit existing personnel information
   - Delete personnel entries
   - Verify all operations work correctly

2. **Personnel Assignment**
   - Assign personnel to shoots
   - Verify personnel availability
   - Check for scheduling conflicts
   - Verify assignment displays correctly

3. **Contact Information Management**
   - Add contact details for personnel
   - Verify contact information displays
   - Test contact functionality (if implemented)

#### Comparison Points:
- [ ] Personnel management interface
- [ ] Contact information handling
- [ ] Assignment system
- [ ] Conflict detection

### Story 4.3: Costume Management
**As a** user  
**I want to** manage costume inventory  
**So that** I can track costumes for shoots

#### Test Scenarios:
1. **Costume CRUD Operations**
   - Navigate to costumes page
   - Add new costume entries
   - Edit existing costume information
   - Delete costume entries
   - Verify all operations work correctly

2. **Costume Assignment**
   - Assign costumes to shoots
   - Verify costume availability
   - Check for scheduling conflicts
   - Verify assignment displays correctly

#### Comparison Points:
- [ ] Costume management interface
- [ ] Assignment system
- [ ] Availability tracking

### Story 4.4: Location Management
**As a** user  
**I want to** manage shooting locations  
**So that** I can organize shoots at different venues

#### Test Scenarios:
1. **Location CRUD Operations**
   - Navigate to locations page
   - Add new location entries
   - Edit existing location information
   - Delete location entries
   - Verify all operations work correctly

2. **Location Assignment**
   - Assign locations to shoots
   - Verify location availability
   - Check for scheduling conflicts
   - Verify assignment displays correctly

3. **Google Maps Integration**
   - Test location search functionality
   - Verify map display
   - Test location selection from map
   - Verify address autocomplete

#### Comparison Points:
- [ ] Location management interface
- [ ] Google Maps integration
- [ ] Location search functionality
- [ ] Assignment system

## Epic 5: External Integrations

### Story 5.1: Google Calendar Integration
**As a** user  
**I want to** sync shoots with Google Calendar  
**So that** I can manage my schedule effectively

#### Test Scenarios:
1. **Calendar Event Creation**
   - Create a shoot with date/time
   - Click "Add to Calendar"
   - Verify Google Calendar event created
   - Verify event details are correct

2. **Calendar Event Updates**
   - Modify shoot details
   - Verify calendar event updates
   - Verify changes sync correctly

3. **Calendar Event Deletion**
   - Delete a shoot
   - Verify calendar event removed
   - Verify cleanup works correctly

#### Comparison Points:
- [ ] Google Calendar integration
- [ ] Event creation functionality
- [ ] Event update synchronization
- [ ] Event deletion handling

### Story 5.2: Google Docs Integration
**As a** user  
**I want to** export shoot details to Google Docs  
**So that** I can share information with team members

#### Test Scenarios:
1. **Document Export**
   - Select a shoot
   - Click "Export to Google Docs"
   - Verify document created
   - Verify document contains correct information
   - Verify document is shareable

2. **Document Updates**
   - Modify shoot details
   - Verify document updates automatically
   - Verify changes reflect in document

#### Comparison Points:
- [ ] Google Docs integration
- [ ] Document export functionality
- [ ] Document update synchronization
- [ ] Document sharing capabilities

### Story 5.3: Email Notifications
**As a** user  
**I want to** receive email notifications  
**So that** I can stay informed about shoot updates

#### Test Scenarios:
1. **Shoot Reminders**
   - Create a shoot with upcoming date
   - Verify reminder email sent
   - Verify email content is correct
   - Verify timing is appropriate

2. **Team Invitations**
   - Invite team member
   - Verify invitation email sent
   - Verify email contains correct information
   - Verify invitation link works

3. **Shoot Updates**
   - Modify shoot details
   - Verify notification email sent to participants
   - Verify email content is accurate

#### Comparison Points:
- [ ] Email notification system
- [ ] Reminder functionality
- [ ] Invitation system
- [ ] Update notifications

## Epic 6: User Experience and Interface

### Story 6.1: Navigation and Layout
**As a** user  
**I want to** navigate easily through the application  
**So that** I can access all features efficiently

#### Test Scenarios:
1. **Sidebar Navigation**
   - Test all sidebar navigation links
   - Verify active page highlighting
   - Test sidebar collapse/expand
   - Verify navigation works on mobile

2. **Breadcrumb Navigation**
   - Navigate to nested pages
   - Verify breadcrumb display
   - Test breadcrumb click functionality
   - Verify breadcrumb accuracy

3. **Mobile Responsiveness**
   - Test application on mobile devices
   - Verify responsive design works
   - Test touch interactions
   - Verify mobile navigation

#### Comparison Points:
- [ ] Navigation consistency
- [ ] Active page highlighting
- [ ] Mobile responsiveness
- [ ] Touch interaction support

### Story 6.2: Search and Filtering
**As a** user  
**I want to** search and filter content  
**So that** I can find information quickly

#### Test Scenarios:
1. **Global Search**
   - Test search functionality across different pages
   - Verify search results accuracy
   - Test search performance
   - Verify search highlighting

2. **Page-Specific Filtering**
   - Test filters on shoots page
   - Test filters on equipment page
   - Test filters on personnel page
   - Verify filter combinations work

3. **Sorting Options**
   - Test sorting by date
   - Test sorting by name
   - Test sorting by status
   - Verify sorting persistence

#### Comparison Points:
- [ ] Search functionality
- [ ] Filtering capabilities
- [ ] Sorting options
- [ ] Performance

### Story 6.3: Error Handling and Feedback
**As a** user  
**I want to** receive clear feedback  
**So that** I understand what's happening in the application

#### Test Scenarios:
1. **Error Messages**
   - Trigger various error conditions
   - Verify error messages are clear
   - Verify error messages are helpful
   - Test error recovery options

2. **Success Feedback**
   - Perform successful operations
   - Verify success messages display
   - Verify success feedback is appropriate
   - Test auto-dismissal of messages

3. **Loading States**
   - Test loading indicators
   - Verify loading states are clear
   - Test loading state transitions
   - Verify loading doesn't block UI

#### Comparison Points:
- [ ] Error message clarity
- [ ] Success feedback quality
- [ ] Loading state implementation
- [ ] User experience consistency

## Epic 7: Performance and Reliability

### Story 7.1: Application Performance
**As a** user  
**I want to** experience fast and responsive performance  
**So that** I can work efficiently

#### Test Scenarios:
1. **Page Load Times**
   - Measure initial page load time
   - Measure navigation between pages
   - Test with different data volumes
   - Verify performance is acceptable

2. **API Response Times**
   - Test API endpoint response times
   - Test with different data volumes
   - Verify timeout handling
   - Test error recovery

3. **Memory Usage**
   - Monitor memory usage during use
   - Test with multiple browser tabs
   - Verify memory leaks don't occur
   - Test long session usage

#### Comparison Points:
- [ ] Page load performance
- [ ] API response times
- [ ] Memory usage efficiency
- [ ] Overall responsiveness

### Story 7.2: Data Consistency
**As a** user  
**I want to** see consistent data across the application  
**So that** I can trust the information displayed

#### Test Scenarios:
1. **Real-time Updates**
   - Make changes in one browser tab
   - Verify changes appear in other tabs
   - Test with multiple users
   - Verify data synchronization

2. **Offline Resilience**
   - Test application behavior offline
   - Verify data persistence
   - Test reconnection handling
   - Verify data synchronization on reconnect

3. **Concurrent Access**
   - Test multiple users editing same data
   - Verify conflict resolution
   - Test data integrity
   - Verify proper error handling

#### Comparison Points:
- [ ] Real-time data synchronization
- [ ] Offline functionality
- [ ] Conflict resolution
- [ ] Data integrity

## Testing Methodology

### Phase 1: Core Functionality Testing (Week 1)
- [ ] Authentication and user management
- [ ] Team management
- [ ] Basic shoot CRUD operations
- [ ] Dashboard functionality

### Phase 2: Resource Management Testing (Week 2)
- [ ] Equipment management
- [ ] Personnel management
- [ ] Costume management
- [ ] Location management

### Phase 3: Advanced Features Testing (Week 3)
- [ ] Google integrations
- [ ] Email notifications
- [ ] File upload functionality
- [ ] Advanced UI features

### Phase 4: Performance and Edge Cases (Week 4)
- [ ] Performance testing
- [ ] Error handling
- [ ] Mobile responsiveness
- [ ] Data consistency

## Success Criteria

### Must Have (Critical)
- [ ] All core CRUD operations work correctly
- [ ] Authentication and team management function properly
- [ ] Dashboard displays data correctly
- [ ] Basic shoot management works

### Should Have (Important)
- [ ] Resource management systems work
- [ ] Google integrations function
- [ ] Email notifications work
- [ ] File upload system works

### Nice to Have (Enhancement)
- [ ] Advanced UI features work
- [ ] Performance exceeds old app
- [ ] Mobile experience is excellent
- [ ] All edge cases handled gracefully

## Test Data Requirements

### Test Users
- **Primary User**: user@example.com / password1234
- **Secondary User**: test2@example.com / password1234
- **Admin User**: admin@example.com / password1234

### Test Data Sets
- **Small Dataset**: 5-10 shoots, 10-20 resources
- **Medium Dataset**: 50-100 shoots, 100-200 resources
- **Large Dataset**: 500+ shoots, 1000+ resources

### Test Scenarios
- **Happy Path**: Normal user workflows
- **Edge Cases**: Boundary conditions and error states
- **Stress Testing**: High data volumes and concurrent users
- **Regression Testing**: Previously working features

## Reporting Template

For each user story tested, document:

1. **Test Results**: Pass/Fail status
2. **Differences Found**: Any discrepancies between old and new apps
3. **Performance Comparison**: Speed and responsiveness differences
4. **User Experience Notes**: UI/UX differences and improvements
5. **Bug Reports**: Any issues found
6. **Recommendations**: Suggestions for improvements

This comprehensive testing approach will ensure that all features from the old application have been successfully migrated to the new Next.js application, and will identify any areas that need additional work.
