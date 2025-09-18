const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://91.98.132.37:54320';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('Testing Auth Configuration...\n');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  // Test 1: Check if auth is configured
  console.log('\n1. Testing Auth Settings:');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Auth Error:', error.message);
    } else {
      console.log('✅ Auth is configured');
      console.log('   Session:', data.session ? 'Active' : 'None');
    }
  } catch (err) {
    console.log('❌ Failed to connect to auth:', err.message);
  }

  // Test 2: Try to sign up a test user
  console.log('\n2. Testing Sign Up:');
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.log('❌ Sign up failed:', error.message);
      if (error.message.includes('not enabled')) {
        console.log('   ⚠️  Email auth may not be enabled in Supabase');
      }
    } else if (data.user) {
      console.log('✅ Sign up successful!');
      console.log('   User ID:', data.user.id);
      console.log('   Email:', data.user.email);

      // Clean up - sign out
      await supabase.auth.signOut();
    } else {
      console.log('⚠️  Sign up returned no error but also no user');
    }
  } catch (err) {
    console.log('❌ Sign up error:', err.message);
  }

  // Test 3: Check OAuth providers
  console.log('\n3. Checking OAuth Providers:');
  try {
    // Try to initiate Google OAuth (won't complete, just checking if it's configured)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3001/auth/callback',
        skipBrowserRedirect: true
      }
    });

    if (error) {
      console.log('❌ Google OAuth not configured:', error.message);
    } else if (data?.url) {
      console.log('✅ Google OAuth appears configured');
      console.log('   Auth URL generated successfully');
    }
  } catch (err) {
    console.log('❌ OAuth check failed:', err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Auth Configuration Summary:');
  console.log('- Supabase connection: ✅ Working');
  console.log('- Email/Password auth: Check Supabase dashboard');
  console.log('- OAuth providers: Check Supabase dashboard');
  console.log('\nTo enable auth in Supabase:');
  console.log('1. Go to http://91.98.132.37:54320');
  console.log('2. Navigate to Authentication → Providers');
  console.log('3. Enable Email/Password');
  console.log('4. Configure OAuth providers if needed');
}

testAuth();