# Production Cookie Configuration Guide

## Overview
This guide addresses common authentication cookie issues in production deployments, particularly on Vercel and other serverless platforms.

## Required Environment Variables

### Core Authentication
Set these in your production environment (Vercel Project Settings > Environment Variables):

```env
# Existing required variables
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NEW: Cookie domain configuration
COOKIE_DOMAIN=your-domain.com
```

### Cookie Domain Configuration

#### For Vercel Deployments
- **Production domain**: Set `COOKIE_DOMAIN=your-domain.com` (without www or subdomain)
- **Vercel preview domains**: Set `COOKIE_DOMAIN=.vercel.app` to allow cookies across preview deployments
- **Custom domains**: Use your root domain (e.g., `cosplay-tracker.com`)

#### For Other Platforms
- **Netlify**: Use your domain or `.netlify.app`
- **Railway**: Use your domain or `.railway.app`
- **Heroku**: Use your domain or `.herokuapp.com`

## Common Issues & Solutions

### Issue 1: Cookies Not Being Set
**Symptoms**: Login appears successful but user gets logged out on page refresh

**Solution**: 
1. Ensure `COOKIE_DOMAIN` is set correctly in production
2. Verify your domain matches the cookie domain setting
3. Check that HTTPS is enforced (cookies with `secure: true` only work over HTTPS)

### Issue 2: Cross-Origin Cookie Problems
**Symptoms**: Cookies work on main domain but not on preview/staging URLs

**Solution**: 
- For Vercel: Use `COOKIE_DOMAIN=.vercel.app` for preview deployments
- For production: Use your specific domain

### Issue 3: SameSite Issues
**Symptoms**: Cookies blocked in some browsers or cross-origin scenarios

**Current Setting**: `sameSite: "lax"` (recommended for most use cases)
**Alternative**: Change to `sameSite: "none"` if you need cross-origin support (requires `secure: true`)

## Testing Cookie Configuration

### 1. Check Cookie Settings in Browser
1. Open browser Developer Tools → Application/Storage → Cookies
2. Look for `sb-access-token` and `sb-refresh-token` cookies
3. Verify they have correct domain, secure, and httpOnly flags

### 2. Test Authentication Flow
```bash
# Test login endpoint
curl -X POST https://your-domain.com/api/auth/set-session \
  -H "Content-Type: application/json" \
  -d '{"access_token":"test","refresh_token":"test","expires_at":1234567890}' \
  -c cookies.txt -v

# Check if cookies were set
cat cookies.txt
```

### 3. Verify Server Logs
Look for these log messages in your production logs:
- `"Successfully set session cookies"` - cookies are being set correctly
- `"Failed to set session cookies"` - there's an issue with cookie configuration

## Environment-Specific Examples

### Vercel Production
```env
COOKIE_DOMAIN=your-production-domain.com
NODE_ENV=production
```

### Vercel Preview Deployments
```env
COOKIE_DOMAIN=.vercel.app
NODE_ENV=production
```

### Local Development
```env
# No COOKIE_DOMAIN needed - cookies will use localhost
NODE_ENV=development
```

## Security Considerations

1. **HTTPS Required**: Production cookies use `secure: true`, requiring HTTPS
2. **HttpOnly**: Prevents JavaScript access to auth cookies (XSS protection)
3. **Domain Scoping**: Limits cookie scope to your domain only
4. **SameSite Protection**: Prevents some CSRF attacks

## Troubleshooting Steps

1. **Check Environment Variables**:
   ```bash
   # In Vercel dashboard, verify all environment variables are set
   # Pay special attention to COOKIE_DOMAIN
   ```

2. **Verify Domain Configuration**:
   - Ensure production domain matches `COOKIE_DOMAIN`
   - Check that HTTPS is working
   - Verify no mixed content issues

3. **Test Cookie Behavior**:
   - Login and check browser dev tools for cookies
   - Refresh page to test cookie persistence
   - Check network tab for cookie headers

4. **Check Server Logs**:
   - Look for authentication-related errors
   - Monitor cookie setting success/failure messages
   - Check for CORS issues

## Migration from Development

When moving from development to production:

1. Add `COOKIE_DOMAIN` environment variable
2. Ensure HTTPS is configured
3. Update Supabase redirect URLs to use production domain
4. Test authentication flow thoroughly
5. Monitor production logs for cookie-related errors

## Need Help?

If you're still experiencing issues:
1. Check the production logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure your domain configuration matches the cookie settings
4. Test with a fresh browser session (incognito mode)