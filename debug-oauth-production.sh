#!/bin/bash

# OAuth Production Debugging Script
# Run this to check your production OAuth configuration

echo "🔍 OAuth Production Configuration Check"
echo "========================================"

echo ""
echo "1. Current Environment Variables:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "SUPABASE_URL: ${SUPABASE_URL:-'not set'}"
echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..." 
echo "SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
echo "GOOGLE_OAUTH_CLIENT_ID: ${GOOGLE_OAUTH_CLIENT_ID:-'not set'}"
echo "GOOGLE_OAUTH_CLIENT_SECRET: ${GOOGLE_OAUTH_CLIENT_SECRET:0:10}..."

echo ""
echo "2. Production Domain Check:"
echo "Current domain should be configured in:"
echo "  - Supabase Auth Settings > Site URL"
echo "  - Supabase Auth Settings > Additional Redirect URLs"
echo "  - Google Cloud Console > OAuth 2.0 Client IDs"

echo ""
echo "3. Testing OAuth URLs:"
echo "Verify these URLs are accessible:"
echo "  - https://yourdomain.com/auth"
echo "  - https://yourdomain.com/auth/callback"
echo "  - https://yourdomain.com/api/auth/set-session"

echo ""
echo "4. Browser Console Debugging:"
echo "Open browser console and run:"
echo "  console.log('Current origin:', window.location.origin);"
echo "  console.log('Supabase client:', supabase);"

echo ""
echo "5. Common Fixes:"
echo "  ✅ Update Supabase Site URL to production domain"
echo "  ✅ Add production callback URL to Supabase redirect URLs"
echo "  ✅ Update Google Cloud Console authorized domains"
echo "  ✅ Check environment variables are set in production"
echo "  ✅ Verify HTTPS is enabled (required for OAuth)"
echo ""