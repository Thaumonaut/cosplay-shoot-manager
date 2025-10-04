# OAuth Production Deployment Checklist

## 1. Supabase Configuration

### Required Environment Variables (Production)
```bash
# Client-side (usually set in build process)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth (Optional for Google integrations)
GOOGLE_OAUTH_CLIENT_ID=your-client-id.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
```

## 2. Supabase Dashboard Settings

### Authentication Settings
1. Go to Authentication → Settings
2. **Site URL**: Set to your production domain (e.g., `https://yourapp.com`)
3. **Additional redirect URLs**: Add `https://yourapp.com/auth/callback`

### Google OAuth Provider
1. Authentication → Providers → Google
2. **Enable Google provider**: ✅
3. **Client ID**: Your Google OAuth client ID
4. **Client Secret**: Your Google OAuth client secret
5. **Authorized redirect URIs**: Must include:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `https://yourapp.com/auth/callback` (your app's callback)

## 3. Google Cloud Console Setup

### OAuth Consent Screen
1. Configure OAuth consent screen
2. **Authorized domains**: Add your production domain
3. **Scopes**: Ensure proper scopes are requested

### OAuth 2.0 Client IDs
1. **Authorized JavaScript origins**: 
   - `https://yourapp.com`
   - `https://your-project.supabase.co`
2. **Authorized redirect URIs**:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `https://yourapp.com/auth/callback`

## 4. Common Production Issues

### Issue 1: "redirect_uri_mismatch"
**Cause**: Redirect URI doesn't match Google Cloud configuration
**Fix**: Ensure all redirect URIs are exactly matched in Google Cloud Console

### Issue 2: "origin_mismatch"
**Cause**: Domain not in authorized JavaScript origins
**Fix**: Add production domain to authorized origins

### Issue 3: "Session not persisting"
**Cause**: Cookie security settings in production
**Fix**: Check cookie `secure` and `sameSite` settings in server/routes.ts

### Issue 4: "CORS errors"
**Cause**: Missing CORS configuration for production domain
**Fix**: Configure Supabase CORS settings for your domain

## 5. Debugging Steps

### Check Network Tab
1. Look for failed OAuth requests
2. Check redirect URLs in network logs
3. Verify token exchange calls

### Server Logs
```bash
# Check for authentication errors
console.log('OAuth redirect URL:', redirectTo);
console.log('Token validation result:', { error, user });
```

### Browser Console
```javascript
// Check current origin
console.log('Current origin:', window.location.origin);

// Check Supabase client configuration
console.log('Supabase URL:', supabase.supabaseUrl);
```

## 6. Testing Checklist

- [ ] OAuth login works in production
- [ ] Redirect after login goes to correct page
- [ ] Session persists after page refresh
- [ ] Logout clears session properly
- [ ] Google integrations work (if using)