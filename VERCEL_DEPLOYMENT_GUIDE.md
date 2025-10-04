# Vercel Deployment Checklist for OAuth Fixes

## 1. Monitor Deployment Status

### Option A: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find your `cosplay-shoot-manager` project
3. Check the latest deployment status
4. Look for any build errors or warnings

### Option B: Command Line (if you have Vercel CLI)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

## 2. Verify Environment Variables in Vercel

Go to your Vercel project settings and ensure these are set:

### Required Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NODE_ENV` - Should be set to `production` (usually auto-set by Vercel)

### Client-Side Variables (Build-time)
- `VITE_SUPABASE_URL` - Same as SUPABASE_URL
- `VITE_SUPABASE_ANON_KEY` - Same as SUPABASE_ANON_KEY

### Optional Variables
- `GOOGLE_OAUTH_CLIENT_ID` - For Google OAuth integration
- `GOOGLE_OAUTH_CLIENT_SECRET` - For Google OAuth integration
- `GOOGLE_MAPS_API_KEY` - For location features
- `RESEND_API_KEY` - For email functionality

## 3. Test After Deployment

### A. Test Health Check Endpoint
1. Wait for deployment to complete
2. Visit: `https://www.cosplans.com/api/health`
3. Check the response for any configuration issues

### B. Test OAuth Flow
1. Go to `https://www.cosplans.com/auth`
2. Try Google OAuth login
3. Open browser console to see the new debug logs

### C. Run Debug Script
1. Open browser console on `https://www.cosplans.com`
2. Copy and paste the debug script from `debug-oauth-production.js`
3. Review the output for issues

## 4. Common Vercel Deployment Issues

### Build Errors
- TypeScript errors: Check the build logs
- Missing dependencies: Verify package.json
- Environment variables: Ensure all required vars are set

### Runtime Errors
- 500 errors: Check function logs in Vercel dashboard
- Database connection: Verify Supabase credentials
- CORS issues: Check Supabase CORS settings

## 5. Debugging Commands

If you have Vercel CLI installed:

```bash
# View recent logs
vercel logs --since=10m

# Stream live logs
vercel logs --follow

# Check project info
vercel inspect [deployment-url]
```

## 6. Next Steps After Deployment

1. **Test the OAuth flow** - Try logging in with Google
2. **Check server logs** - Look for the new debug information
3. **Verify health check** - Ensure all systems are connected
4. **Monitor performance** - Check if issues are resolved

## 7. Rollback Plan

If the deployment causes issues:

```bash
# Rollback to previous deployment (if using CLI)
vercel rollback [previous-deployment-url]

# Or redeploy a specific commit
git reset --hard [previous-commit-hash]
git push origin main --force
```

## 8. Expected Improvements

After this deployment, you should see:
- ✅ More detailed error messages in browser console
- ✅ Better error handling for OAuth failures
- ✅ Health check endpoint for debugging
- ✅ Improved session handling with clock skew tolerance
- ✅ Enhanced cookie security for production