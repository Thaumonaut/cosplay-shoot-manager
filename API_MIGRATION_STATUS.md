# API Routes Migration Status

## ✅ Completed Routes

### Core Authentication & User Management
- `POST /api/auth` - User login with JWT token generation
- `DELETE /api/auth` - Account deletion endpoint
- `GET /api/user` - User info retrieval
- `POST /api/user` - User profile updates (TODO: avatar upload)

### Team Management
- `GET /api/team` - Get current team details
- `POST /api/team` - Create new team
- `PATCH /api/team` - Update team information
- `DELETE /api/team` - Delete team

### Shoot Management (Complete CRUD)
- `GET /api/shoots` - List team shoots
- `POST /api/shoots` - Create new shoot (with Zod validation)
- `GET /api/shoots/[id]` - Get individual shoot
- `PATCH /api/shoots/[id]` - Update shoot
- `DELETE /api/shoots/[id]` - Delete shoot

### Shoot Participants (Complete CRUD)
- `GET /api/shoots/[id]/participants` - List shoot participants
- `POST /api/shoots/[id]/participants` - Add participant to shoot
- `GET /api/shoots/[id]/participants/[participantId]` - Get participant details
- `PATCH /api/shoots/[id]/participants/[participantId]` - Update participant
- `DELETE /api/shoots/[id]/participants/[participantId]` - Remove participant

### Shoot References (Complete CRUD)
- `GET /api/shoots/[id]/references` - List shoot references
- `POST /api/shoots/[id]/references` - Add reference to shoot
- `GET /api/shoots/[id]/references/[referenceId]` - Get reference details
- `PATCH /api/shoots/[id]/references/[referenceId]` - Update reference
- `DELETE /api/shoots/[id]/references/[referenceId]` - Remove reference

## 🚧 Migrated with TODOs

### Resource Management Routes
- `GET/POST/PATCH/DELETE /api/objects` - File/image management (needs upload logic)
- `GET/POST/PATCH/DELETE /api/places` - Location/venue management (needs storage methods)
- `GET/POST/PATCH/DELETE /api/equipment` - Equipment/props management (needs storage methods)
- `GET/POST/PATCH/DELETE /api/costumes` - Costume/character management (needs storage methods)
- `GET/POST/PATCH/DELETE /api/personnel` - Personnel/staff management (needs storage methods)

### External API Integration
- `GET/POST /api/google` - Google APIs (Maps, Drive, Docs) integration (needs implementation)

### Utility Routes
- `GET /api/health` - Health check endpoint
- `GET /api/version` - API version info

## 🔧 Technical Implementation Details

### Authentication System
- JWT-based authentication with Bearer tokens
- `getUserIdFromRequest()` helper for token extraction/validation
- `getUserTeamId()` helper for team context resolution
- Automatic team creation if user has no teams

### Data Layer
- Comprehensive `Storage` class with Supabase integration
- Automatic camelCase ↔ snake_case conversion
- Type-safe CRUD operations with error handling
- Team-scoped data access patterns

### Route Structure
- Consistent error handling patterns
- Standardized HTTP status codes
- JWT authentication on all protected routes
- Team ownership validation for all resources

### Validation
- Zod schemas for request validation
- Type-safe data transformation
- Comprehensive error reporting

## 📋 Next Steps for Complete Migration

### High Priority
1. **Implement File Upload System**
   - Multipart form data parsing
   - Supabase Storage integration
   - Image processing and optimization
   - File type validation and security

2. **Complete Storage Layer Methods**
   - Add place management methods
   - Add equipment management methods
   - Add costume management methods
   - Add personnel management methods

3. **Google API Integration**
   - Google Maps API for location services
   - Google Drive integration for file storage
   - Google Docs for shoot documentation

### Medium Priority
4. **Enhanced Validation**
   - Complete Zod schemas for all resource types
   - File upload validation
   - Business logic validation

5. **Error Handling & Logging**
   - Comprehensive error logging
   - Rate limiting implementation
   - Request/response middleware

### Low Priority
6. **Performance Optimization**
   - Database query optimization
   - Caching layer implementation
   - CDN integration for static assets

## 💾 Database Schema Support

The current storage layer supports these tables:
- `user_profiles` - User profile information
- `teams` - Team information
- `team_members` - Team membership with roles
- `shoots` - Shoot information and planning
- `shoot_participants` - People involved in shoots
- `shoot_references` - Reference images and materials

Additional tables may be needed for:
- `places` - Location/venue information
- `equipment` - Equipment and props inventory
- `costumes` - Costume and character information
- `personnel` - Staff and crew directory
- `files` - File metadata and storage references

## 🔗 API Design Patterns

All routes follow these consistent patterns:

1. **Authentication Check**: Verify JWT token and extract user ID
2. **Team Context**: Resolve user's active team for scoped operations
3. **Input Validation**: Validate request data with Zod schemas
4. **Business Logic**: Execute core functionality via storage layer
5. **Response Formatting**: Return consistent JSON responses
6. **Error Handling**: Catch and format all errors appropriately

This ensures a predictable and maintainable API surface across all endpoints.