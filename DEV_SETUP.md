# Development Setup Guide

## Quick Start for Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your configuration
# The default .env file is already configured for development with Supabase
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be available at: http://localhost:5000

## Database Options

### Option 1: Use Supabase (Recommended)
The default .env file is already configured to use the Supabase database. This is the easiest option for development.

### Option 2: Local PostgreSQL
If you want to use a local PostgreSQL database:

1. Install PostgreSQL locally
2. Create a database: `cosplay_shoot_manager`
3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/cosplay_shoot_manager
   ```
4. Run migrations:
   ```bash
   npm run db:push
   ```

### Option 3: Docker PostgreSQL
Run PostgreSQL in Docker:
```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=cosplay_shoot_manager \
  -p 5432:5432 \
  -d postgres
```

## Environment Variables

Required variables are documented in `.env.example`. The key ones for development are:

- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL  
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT token signing
- `PORT` - Development server port (default: 5000)

## Development Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm test` - Run tests

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running (if using local DB)
- Check `DATABASE_URL` in `.env` file
- Verify database credentials

### Port Already in Use
- Kill existing Node processes: `taskkill /F /IM node.exe` (Windows)
- Or change PORT in `.env` file

### Missing Environment Variables
- Copy `.env.example` to `.env`
- Fill in required values
- Restart development server

### WebSocket/HMR Issues
If you see WebSocket connection errors in the browser console:
- Ensure PORT is set correctly in `.env` 
- Restart the development server
- Check that no firewall is blocking port 5000
- For Windows: try running as administrator if needed

Common WebSocket errors and fixes:
```
WebSocket connection to 'ws://localhost:undefined' failed
```
**Fix**: Ensure PORT=5000 is set in your .env file

```
Failed to construct 'WebSocket': The URL is invalid
```
**Fix**: Restart the development server after updating .env

### Hot Module Reload Not Working
- Check browser console for WebSocket errors
- Verify Vite HMR is properly configured
- Restart development server
- Clear browser cache and reload

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared types and schemas
├── migrations/      # Database migrations
└── attached_assets/ # Static assets
```

## Development Tips

- The development server uses Vite for fast hot module replacement
- Changes to server files require a server restart
- Client-side changes should auto-reload in the browser
- Check the browser console and terminal for any errors