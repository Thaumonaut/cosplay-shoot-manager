# Cosplay Photo Shoot Tracker (AI Vibe Coding Experiment)

_This project was a test to see the current limitations and strengths to building a full application using nothing but AI. I tried to step in as little as possible and let the AI do most of the work to see what choices it would make. There were times I would need to correct the direction of the AI so that it would properly complete a task or to prevent it from undoing previous work. I was able to learn a lot and get a useful tool out of it. It may not be pretty or run well but I feel this project was still a sucess. It was initially built using replit but I eventually switch to using vscode and copilot to add the final features and fix the inevitable bugs it would create._

A comprehensive web application for managing and organizing cosplay photo shoots with team collaboration, resource management, and role-based permissions.

## Features

- **Team-based collaboration** with role-based permissions (Owner, Admin, Member)
- **Shoot management** with Kanban board and calendar views
- **Resource tracking** for crew, costumes, equipment, props, and locations
- **Google Calendar & Google Docs integration** for scheduling and collaboration
- **Enhanced UI** with detailed resource cards and role assignment
- **Image reference management** via Instagram links and cloud storage

## Deployment Options

### 🐳 Docker Deployment (Recommended for Production)

For easy server deployment using Docker:

```bash
# Pull and run with Docker Compose
docker-compose up -d
```

See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for complete Docker deployment instructions.

### 🔄 Running on Replit

This project is designed for Replit's environment:

1. Open the project in Replit
2. Set your environment secrets in the Replit Secrets panel
3. Click "Run" - the application starts automatically
4. Access your app via the provided Replit URL

## Running Locally

### Prerequisites

- **Node.js** (version 20 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** database - [Download here](https://www.postgresql.org/download/)

### Quick Start (Mac/Linux)

1. **Download and install:**
   ```bash
   npm install
   ```

2. **Set required environment variables** (in your terminal):
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/cosplay_tracker"
   export SUPABASE_URL="your_supabase_url"
   export SUPABASE_ANON_KEY="your_key"
   export SUPABASE_SERVICE_ROLE_KEY="your_key"
   ```
   
   Optional (for location search features):
   ```bash
   export GOOGLE_MAPS_API_KEY="your_key"
   ```

3. **Create database and run migrations:**
   ```bash
   createdb cosplay_tracker
   npm run db:push
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

The app will start on `http://localhost:5000`. The npm script automatically sets `NODE_ENV=development` which enables the Vite dev server for the frontend.

### Windows Setup

The npm scripts use Unix syntax (`NODE_ENV=value`) which doesn't work on Windows. You have two options:

#### Option A: Run without modifying repository (Quick test)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables in PowerShell:**
   ```powershell
   $env:DATABASE_URL="postgresql://user:password@localhost:5432/cosplay_tracker"
   $env:SUPABASE_URL="your_supabase_url"
   $env:SUPABASE_ANON_KEY="your_key"
   $env:SUPABASE_SERVICE_ROLE_KEY="your_key"
   ```
   
   Optional (for location search):
   ```powershell
   $env:GOOGLE_MAPS_API_KEY="your_key"
   ```

3. **Create database and run:**
   ```bash
   createdb cosplay_tracker
   npm run db:push
   npx --yes cross-env NODE_ENV=development tsx server/index.ts
   ```

**No repository changes** - `npx --yes` downloads and runs cross-env temporarily without installing it.

#### Option B: Modify package.json (For regular use)

1. **Install cross-env:**
   ```bash
   npm install --save-dev cross-env
   ```

2. **Update scripts in `package.json`:**
   ```json
   {
     "scripts": {
       "dev": "cross-env NODE_ENV=development tsx server/index.ts",
       "start": "cross-env NODE_ENV=production node dist/index.js"
     }
   }
   ```

3. **Then run:**
   ```bash
   npm run dev
   ```

**Note:** This modifies package.json and package-lock.json. Commit these changes if you want to keep them.

## Environment Variables Reference

### Required (must be set in your shell)
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL  
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Optional
- `GOOGLE_MAPS_API_KEY` - For location search features
- `RESEND_API_KEY` - For email invitations
- `PORT` - Server port (defaults to 5000)

**Note:** `NODE_ENV` is set automatically by the npm script - you don't need to set it manually.

## Supabase Setup

1. Create a free account at [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Project Settings > API
4. Copy your project URL and API keys (use them in environment variables above)
5. In Authentication > Providers, enable Email authentication

## Optional: Use .env File (Avoids setting variables each time)

The project doesn't include .env support by default. To add it:

1. **Install dotenv:**
   ```bash
   npm install dotenv
   ```

2. **Create `.env` file in project root:**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/cosplay_tracker
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key
   GOOGLE_MAPS_API_KEY=your_key
   ```

3. **Add to the very TOP of `server/index.ts` (before any other imports):**
   ```javascript
   import 'dotenv/config';
   ```

4. **Add `.env` to `.gitignore`:**
   ```
   .env
   ```

Now you can run `npm run dev` without setting variables each time.

## Troubleshooting

### Error: 'NODE_ENV' is not recognized (Windows)

**Problem:** The npm scripts don't work on Windows.

**Solutions:**
- **Quick test:** Use `npx --yes cross-env NODE_ENV=development tsx server/index.ts` (no code changes)
- **Regular use:** Install cross-env and modify package.json (see Windows Setup above)

### Error: DATABASE_URL environment variable is required

**Problem:** Required environment variables aren't set.

**Solutions:**
- Verify you set variables in your current terminal: `echo $DATABASE_URL` (Mac/Linux) or `echo $env:DATABASE_URL` (PowerShell)
- Make sure you're running `npm run dev` in the same terminal where you set the variables
- Variables only persist in the current terminal session - you need to set them again in new terminals
- Or use the optional .env file setup above

### Frontend Doesn't Start - Only Backend Runs

**Problem:** Vite dev server doesn't start, only Express.

**Cause:** Vite only starts when `NODE_ENV === "development"`.

**Check:**
- Are you running `npm run dev`? (This sets NODE_ENV automatically)
- Look for Vite startup messages in the console
- If using .env file, make sure dotenv import is at the top of server/index.ts

### Database Connection Errors

**Checklist:**
1. Is PostgreSQL running? Check with:
   - Windows: `pg_ctl status`
   - Mac: `brew services list`
   - Linux: `sudo systemctl status postgresql`
2. Is `DATABASE_URL` format correct? Should be: `postgresql://username:password@localhost:5432/database_name`
3. Does the database exist? List with: `psql -l`
4. Test connection: `psql "postgresql://user:password@localhost:5432/cosplay_tracker"`

### Port 5000 Already in Use

**Solutions:**
1. Set different port: `export PORT=3000` then `npm run dev`
2. Find what's using the port:
   - Windows: `netstat -ano | findstr :5000`
   - Mac/Linux: `lsof -i :5000`
3. Stop the conflicting process

## Project Structure

```
.
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database layer
│   └── middleware/      # Auth middleware
├── shared/              # Shared types
│   └── schema.ts        # Drizzle schema
└── package.json
```

## Scripts

- `npm run dev` - Development server (sets NODE_ENV=development automatically)
- `npm run build` - Production build
- `npm start` - Run production build
- `npm run check` - TypeScript type checking  
- `npm run db:push` - Apply database schema changes

## Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS, shadcn/ui, TanStack Query, Wouter
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Supabase Auth
- **Build Tools:** Vite, esbuild, tsx

## Platform Compatibility

| Platform | Compatibility | Notes |
|----------|--------------|-------|
| Replit | ✅ Full support | Designed for this environment |
| Mac/Linux | ✅ Works out of box | Just set environment variables |
| Windows | ⚠️ Requires workaround | Use `npx --yes cross-env` or modify package.json |

## License

MIT

## Docker

You can build and run the whole application in a Docker container. The provided multi-stage `Dockerfile` builds the client and bundles the server into `dist/`, then runs the production server.

Build the image locally:

```powershell
docker build -t cosplay-shoot-manager:latest .
```

Run the image (exposes port 5000):

```powershell
docker run --rm -p 5000:5000 \
   -e DATABASE_URL="postgresql://user:password@host:5432/db" \
   -e SUPABASE_URL="your_supabase_url" \
   -e SUPABASE_ANON_KEY="your_key" \
   -e SUPABASE_SERVICE_ROLE_KEY="your_key" \
   cosplay-shoot-manager:latest
```

Or use docker-compose (build + run):

```powershell
docker-compose up --build
```

The server will be available at `http://localhost:5000` (unless you change the `PORT` env var).

Notes:
- Supply any required environment variables for database and third-party services when running the container.
- For production deployments, consider using a managed Postgres service and secure secret management.

