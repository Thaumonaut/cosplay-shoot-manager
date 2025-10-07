# Docker Deployment Guide

This guide shows how to deploy the Cosplay Shoot Manager using Docker for easy server deployment.

## Quick Start with Docker Hub

The easiest way to deploy is using the pre-built images from Docker Hub:

```bash
# Pull the latest image
docker pull rakoryn/cosplay-shoot-manager:latest

# Or pull a specific version
docker pull rakoryn/cosplay-shoot-manager:v1.1.0
```

## Docker Compose Deployment (Recommended)

### 1. Create docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    image: rakoryn/cosplay-shoot-manager:latest
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/cosplay
      # Required Supabase configuration
      - SUPABASE_URL=your_supabase_url
      - SUPABASE_ANON_KEY=your_supabase_anon_key
      - SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
      # Optional Google integrations
      - GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
      - GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
      - GOOGLE_MAPS_API_KEY=your_google_maps_api_key
    restart: unless-stopped
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cosplay
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  pgdata:
    driver: local
```

### 2. Create Environment File

Create a `.env` file with your configuration:

```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth (Optional - for social login)
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret

# Google Maps (Optional - for location features)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Database (if using external database)
DATABASE_URL=postgresql://user:password@host:port/database
```

### 3. Deploy

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop the application
docker-compose down
```

## Single Container Deployment

If you prefer to run just the app container (with external database):

```bash
docker run -d \
  --name cosplay-shoot-manager \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=your_database_url \
  -e SUPABASE_URL=your_supabase_url \
  -e SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key \
  --restart unless-stopped \
  rakoryn/cosplay-shoot-manager:latest
```

## Building from Source

If you want to build the image yourself:

```bash
# Clone the repository
git clone https://github.com/Thaumonaut/cosplay-shoot-manager.git
cd cosplay-shoot-manager

# Build the image
docker build -t cosplay-shoot-manager:local .

# Run with docker-compose (update image name in docker-compose.yml)
docker-compose up -d
```

## Environment Variables

### Required
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Optional
- `DATABASE_URL` - External PostgreSQL database (if not using docker-compose db)
- `GOOGLE_OAUTH_CLIENT_ID` - For Google OAuth login
- `GOOGLE_OAUTH_CLIENT_SECRET` - For Google OAuth login
- `GOOGLE_MAPS_API_KEY` - For location features
- `PORT` - Port to run on (default: 5000)

## Health Check

Once deployed, you can check if the application is running:

```bash
curl http://localhost:5000/api/health
```

## Updating

To update to a newer version:

```bash
# Pull the latest image
docker-compose pull app

# Restart with new image
docker-compose up -d app
```

## Troubleshooting

### Check logs
```bash
docker-compose logs -f app
```

### Database connection issues
- Ensure DATABASE_URL is correct
- Check if database is accessible
- Verify database credentials

### Supabase configuration issues
- Verify Supabase URL and keys
- Check Supabase project settings
- Ensure RLS policies are configured

### Performance tuning
- Increase memory limits if needed
- Use a reverse proxy (nginx) for SSL termination
- Set up database connection pooling for high traffic

## Production Considerations

1. **SSL/HTTPS**: Use a reverse proxy like nginx for SSL termination
2. **Database**: Consider using a managed PostgreSQL service
3. **Backups**: Set up regular database backups
4. **Monitoring**: Add health checks and monitoring
5. **Secrets**: Use Docker secrets or external secret management
6. **Updates**: Plan for zero-downtime deployments

## Available Tags

- `rakoryn/cosplay-shoot-manager:latest` - Latest stable release
- `rakoryn/cosplay-shoot-manager:v1.1.0` - Specific version tags

Check [Docker Hub](https://hub.docker.com/r/rakoryn/cosplay-shoot-manager) for all available tags.