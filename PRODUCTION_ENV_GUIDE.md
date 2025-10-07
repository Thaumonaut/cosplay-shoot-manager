# Production Environment Variables Guide

## ✅ Fixed Issues

The production environment variable loading has been fixed with these changes:

### 1. Updated server/index.ts
```typescript
import 'dotenv/config'; // Added this line to load .env automatically
```

### 2. Updated package.json scripts
```json
{
  "start": "cross-env NODE_ENV=production node dist/index.js",
  "start:env": "cross-env NODE_ENV=production node --env-file=.env dist/index.js"
}
```

## Environment Files

### Development
- `.env` in project root - loaded by Vite and server
- `client/.env` - copied for Vite client build

### Production
- `.env` in project root - loaded by dotenv/config
- Alternatively, set environment variables directly in your deployment platform

## Required Environment Variables

### Supabase (Required)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co/
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://...
```

### Session Security (Required)
```env
SESSION_SECRET=your-secure-random-string
```

### Google Integrations (Optional)
```env
GOOGLE_MAPS_API_KEY=your-maps-api-key
GOOGLE_OAUTH_CLIENT_ID=your-oauth-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-oauth-client-secret
GOOGLE_SERVICE_ACCOUNT=base64-encoded-service-account-json
```

### Email (Optional)
```env
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Deployment Checklist

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Verify environment variables**
   ```bash
   node -e "require('dotenv/config'); console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');"
   ```

3. **Start production server**
   ```bash
   npm start
   ```

4. **Health check**
   Visit: `http://localhost:5000/api/health`

## Platform-Specific Notes

### Vercel
- Set environment variables in Vercel dashboard
- Use `vercel.json` configuration
- Run `npm run vercel-build`

### Docker
- Use `.env` file or Docker environment variables
- Ensure `.env` is copied to container if using file-based approach

### Traditional Hosting
- Ensure `.env` file exists in production directory
- Set proper file permissions (600)
- Consider using system environment variables instead

## Troubleshooting

### Environment Variables Not Loading
1. Check `.env` file exists in project root
2. Verify `dotenv` is installed: `npm list dotenv`
3. Test loading: `node -e "require('dotenv/config'); console.log(process.env.VITE_SUPABASE_URL);"`

### Client-Side Variables Missing
1. Ensure variables have `VITE_` prefix
2. Rebuild client: `vite build`
3. Check browser network tab for 404s on environment-dependent requests

### Authentication Issues
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
2. Check `SESSION_SECRET` is configured
3. Ensure cookies are working (check browser dev tools)