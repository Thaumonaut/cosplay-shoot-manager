// Production OAuth Debugging Script
// Add this to your browser console on https://www.cosplans.com

console.log('🔍 OAuth Production Debug Report');
console.log('================================');

// Check current environment
console.log('1. Current Environment:');
console.log('   Origin:', window.location.origin);
console.log('   Host:', window.location.host);
console.log('   Protocol:', window.location.protocol);
console.log('   URL:', window.location.href);

// Check Supabase client configuration
console.log('\n2. Supabase Client Check:');
if (typeof supabase !== 'undefined') {
  console.log('   Supabase URL:', supabase.supabaseUrl);
  console.log('   Supabase Key:', supabase.supabaseKey?.substring(0, 20) + '...');
} else {
  console.log('   ❌ Supabase client not available');
}

// Test health check endpoint
console.log('\n3. Server Health Check:');
fetch('/api/health', { credentials: 'include' })
  .then(async (res) => {
    if (res.ok) {
      const health = await res.json();
      console.log('   ✅ Health check successful:');
      console.table(health);
    } else {
      console.log('   ❌ Health check failed:', res.status, res.statusText);
      const error = await res.text();
      console.log('   Error:', error);
    }
  })
  .catch(error => {
    console.log('   ❌ Health check network error:', error);
  });

// Test auth endpoint
console.log('\n4. Auth Endpoint Test:');
fetch('/api/auth/me', { credentials: 'include' })
  .then(async (res) => {
    console.log('   Auth me response:', res.status, res.statusText);
    if (!res.ok) {
      const error = await res.text();
      console.log('   Error details:', error);
    }
  })
  .catch(error => {
    console.log('   ❌ Auth me network error:', error);
  });

// Check for any Supabase auth state
console.log('\n5. Current Auth State:');
if (typeof supabase !== 'undefined') {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.log('   ❌ Session error:', error);
    } else {
      console.log('   Session exists:', !!data.session);
      if (data.session) {
        console.log('   User ID:', data.session.user?.id);
        console.log('   User email:', data.session.user?.email);
        console.log('   Expires at:', new Date(data.session.expires_at * 1000));
        console.log('   Time until expiry:', Math.round((data.session.expires_at * 1000 - Date.now()) / 1000), 'seconds');
      }
    }
  });
}

console.log('\n6. Clock Check:');
console.log('   Client time:', new Date().toISOString());
console.log('   Client timestamp:', Math.floor(Date.now() / 1000));

// Check cookies
console.log('\n7. Auth Cookies:');
const cookies = document.cookie.split(';').map(c => c.trim());
const authCookies = cookies.filter(c => c.startsWith('sb-'));
if (authCookies.length > 0) {
  console.log('   Found auth cookies:', authCookies.length);
  authCookies.forEach(cookie => {
    const [name] = cookie.split('=');
    console.log('   -', name);
  });
} else {
  console.log('   ❌ No auth cookies found');
}

console.log('\n📝 Next Steps:');
console.log('1. Check the health check results above');
console.log('2. Verify your production environment variables');
console.log('3. Check server logs for detailed error messages');
console.log('4. Ensure Supabase project settings are correct for production domain');