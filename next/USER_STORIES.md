# User Stories & E2E Test Scenarios

## 🎭 Core User Personas

### Primary User: **Maya** - Cosplay Photographer
- Organizes 2-3 cosplay shoots per month
- Manages teams of 3-8 people (models, assistants, makeup artists)
- Needs to coordinate schedules, equipment, and locations
- Values organization and clear communication

### Secondary User: **Alex** - Cosplay Model
- Participates in multiple shoots per month
- Needs visibility into shoot details and requirements
- Often brings own costumes and props
- Values clear expectations and timing

## 📝 Epic 1: Authentication & Team Management

### Story 1.1: First-Time User Registration
**As a** new user  
**I want to** create an account and set up my first team  
**So that** I can start organizing cosplay shoots

#### Acceptance Criteria:
- [ ] User can sign up with email/password via Supabase Auth
- [ ] System automatically creates first team for new user
- [ ] User is redirected to dashboard after successful registration
- [ ] Team switcher shows the new team as active

#### Test Scenario:
```gherkin
Given I am a new user visiting the site
When I click "Sign Up" and enter valid credentials
Then I should be redirected to the dashboard
And I should see my automatically created team
And I should see a welcome message or onboarding flow
```

### Story 1.2: Team Switching
**As a** team member  
**I want to** switch between multiple teams I belong to  
**So that** I can manage different groups' shoots separately

#### Acceptance Criteria:
- [ ] Team switcher shows all teams user belongs to
- [ ] Switching teams updates all resource lists (shoots, equipment, etc.)
- [ ] Active team is persisted across browser sessions
- [ ] Team switching invalidates relevant queries

#### Test Scenario:
```gherkin
Given I belong to multiple teams
When I select a different team from the dropdown
Then all resources should update to show the new team's data
And the team selection should persist on page refresh
```

## 📝 Epic 2: Shoot Management

### Story 2.1: Creating a New Shoot
**As a** photographer  
**I want to** create a comprehensive shoot plan  
**So that** all participants know what to expect

#### Acceptance Criteria:
- [ ] User can navigate to /shoots/new from dashboard
- [ ] Form includes all required fields (title, date, location, description)
- [ ] User can add participants, equipment, costumes, and props
- [ ] Create action saves shoot and redirects to shoot detail page
- [ ] All team members can see the new shoot in their list

#### Test Scenario:
```gherkin
Given I am on the dashboard
When I click "Create New Shoot"
Then I should see a comprehensive shoot creation form
When I fill in all required details and click "Create"
Then the shoot should be saved
And I should be redirected to the shoot detail page
And the shoot should appear in my team's shoot list
```

### Story 2.2: Managing Shoot Resources
**As a** photographer  
**I want to** assign equipment, costumes, and personnel to a shoot  
**So that** everyone knows what they need to bring

#### Acceptance Criteria:
- [ ] User can add existing resources from team inventory
- [ ] User can create new resources inline during shoot planning
- [ ] Resources are categorized (Personnel, Equipment, Costumes, Props)
- [ ] Resources show availability/conflict indicators
- [ ] Changes are saved automatically or with clear save action

#### Test Scenario:
```gherkin
Given I am creating or editing a shoot
When I click "Add Equipment" 
Then I should see a list of available equipment
When I select equipment or create new equipment
Then it should be added to the shoot's equipment list
And the equipment should show as "assigned" in the inventory
```

### Story 2.3: Viewing Shoot Calendar
**As a** team member  
**I want to** see all shoots in a calendar view  
**So that** I can manage my schedule and avoid conflicts

#### Acceptance Criteria:
- [ ] Dashboard shows upcoming shoots in chronological order
- [ ] Calendar component displays shoots by date
- [ ] Shoots show basic info (title, time, participants count)
- [ ] Clicking a shoot navigates to detailed view
- [ ] Calendar filters by team context

#### Test Scenario:
```gherkin
Given I have multiple shoots scheduled
When I view the dashboard
Then I should see upcoming shoots listed chronologically
When I view the calendar
Then shoots should appear on their scheduled dates
And clicking a shoot should show its details
```

## 📝 Epic 3: Resource Management

### Story 3.1: Equipment Inventory
**As a** team lead  
**I want to** manage our equipment inventory  
**So that** I know what's available for shoots

#### Acceptance Criteria:
- [ ] Equipment page shows all team equipment
- [ ] User can add new equipment with details (name, type, status)
- [ ] Equipment can be marked as available/unavailable/in-use
- [ ] Equipment shows which shoots it's assigned to
- [ ] Search and filter functionality works

#### Test Scenario:
```gherkin
Given I am on the equipment page
When I click "Add Equipment"
Then I should see an equipment creation form
When I fill in equipment details and save
Then the equipment should appear in the inventory
And I should be able to search for it by name
```

### Story 3.2: Personnel Directory
**As a** photographer  
**I want to** maintain a directory of team members and collaborators  
**So that** I can easily assign people to shoots

#### Acceptance Criteria:
- [ ] Personnel page lists all team members and contacts
- [ ] User can add new personnel with contact information
- [ ] Personnel show their role/specialization
- [ ] Personnel can be assigned to shoots
- [ ] Contact information is easily accessible

#### Test Scenario:
```gherkin
Given I need to add a new team member
When I go to the personnel page and click "Add Person"
Then I should see a form for personnel details
When I save the new person
Then they should appear in the personnel directory
And be available for assignment to shoots
```

## 📝 Epic 4: Navigation & User Experience

### Story 4.1: Sidebar Navigation
**As a** user  
**I want to** navigate between different sections easily  
**So that** I can access all features efficiently

#### Acceptance Criteria:
- [ ] Sidebar shows all main sections (Dashboard, Shoots, Equipment, etc.)
- [ ] Active section is highlighted in sidebar
- [ ] Navigation updates URL and page content
- [ ] Sidebar is responsive on mobile devices
- [ ] User can collapse/expand sidebar

#### Test Scenario:
```gherkin
Given I am on any page of the application
When I click different sidebar navigation items
Then the URL should update to reflect the current section
And the page content should change accordingly
And the active navigation item should be highlighted
```

### Story 4.2: Responsive Design
**As a** mobile user  
**I want to** access the application on my phone  
**So that** I can check shoot details while on location

#### Acceptance Criteria:
- [ ] Application is fully functional on mobile devices
- [ ] Navigation adapts to smaller screens
- [ ] Forms are touch-friendly
- [ ] Text and buttons are appropriately sized
- [ ] Horizontal scrolling is not required

#### Test Scenario:
```gherkin
Given I am using a mobile device
When I access the application
Then all features should be accessible
And the interface should adapt to my screen size
And I should be able to complete all main tasks
```

## 📝 Epic 5: Data Consistency & Error Handling

### Story 5.1: Offline Resilience
**As a** user  
**I want to** get clear feedback when network issues occur  
**So that** I know if my changes were saved

#### Acceptance Criteria:
- [ ] Loading states are shown during API calls
- [ ] Error messages are clear and actionable
- [ ] Failed requests can be retried
- [ ] User is notified when connectivity is restored
- [ ] Critical data is not lost during network issues

#### Test Scenario:
```gherkin
Given I am creating a shoot
When my network connection is interrupted
Then I should see a clear error message
And be given the option to retry
When my connection is restored
Then I should be able to complete the action successfully
```

### Story 5.2: Data Synchronization
**As a** team member  
**I want to** see real-time updates when others make changes  
**So that** I always have current information

#### Acceptance Criteria:
- [ ] Changes made by other team members appear automatically
- [ ] Resource assignments update in real-time
- [ ] Conflict detection when multiple users edit same resource
- [ ] Query invalidation works correctly across components

#### Test Scenario:
```gherkin
Given multiple team members are using the app
When one member creates a new shoot
Then other members should see the new shoot appear
Without needing to refresh their browsers
And with accurate, up-to-date information
```

## 🧪 Critical User Flows to Test

### Flow 1: Complete Shoot Creation Workflow
1. User logs in → Dashboard loads
2. Click "Create Shoot" → Navigate to /shoots/new
3. Fill shoot details → Form validation works
4. Add participants → Personnel picker works
5. Add equipment → Equipment assignment works
6. Save shoot → Redirects to shoot detail
7. Verify shoot appears in dashboard list

### Flow 2: Resource Management Workflow  
1. Navigate to Equipment page
2. Create new equipment item
3. Assign equipment to existing shoot
4. Verify equipment shows as "in use"
5. Remove equipment from shoot
6. Verify equipment shows as "available"

### Flow 3: Team Collaboration Workflow
1. User A creates a shoot
2. User B (same team) views shoot list
3. User B adds themselves as participant
4. User A sees updated participant list
5. Both users see consistent data

### Flow 4: Error Recovery Workflow
1. Start creating a shoot
2. Simulate network error during save
3. Verify error message appears
4. Retry save when network restored
5. Verify shoot was created successfully

## 🎯 Success Metrics

- [ ] **Navigation**: All sidebar links work and update URL correctly
- [ ] **CRUD Operations**: Create, Read, Update, Delete work for all resources
- [ ] **Data Consistency**: Team switching updates all relevant data
- [ ] **Error Handling**: Network errors show appropriate messages
- [ ] **Mobile Support**: App functions on mobile devices
- [ ] **Performance**: Pages load within 2 seconds
- [ ] **Authentication**: Login/logout flow works end-to-end

## 🔧 Test Implementation Priority

1. **High Priority**: Authentication, Shoot CRUD, Navigation
2. **Medium Priority**: Resource management, Team switching
3. **Low Priority**: Advanced features, Edge cases, Performance optimization

This comprehensive set of user stories ensures that we test not just individual features, but the complete user experience and workflow through the application.