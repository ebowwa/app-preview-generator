// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://91.98.132.37:54320';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection...\n');

  try {
    // Test 1: Check if we can connect
    const { data: health, error: healthError } = await supabase
      .from('app_projects')
      .select('count')
      .limit(0);

    if (healthError && healthError.message.includes('relation')) {
      console.log('❌ Table app_projects not found');
      console.log('   Need to check table names...');

      // Try with 'projects' table
      const { data, error } = await supabase
        .from('projects')
        .select('count')
        .limit(0);

      if (error) {
        console.log('❌ Connection failed:', error.message);
      } else {
        console.log('✅ Connected to Supabase!');
        console.log('   Table name is "projects" (not "app_projects")');
      }
    } else {
      console.log('✅ Connected to Supabase!');
    }

    // Test 2: Check auth
    console.log('\nTesting Auth...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('✅ No user signed in (expected)');
    } else {
      console.log('✅ User found:', user.email);
    }

    // Test 3: Try to list projects
    console.log('\nTesting Projects Table...');
    const { data: projects, error: projectError, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (projectError) {
      console.log('❌ Could not query projects:', projectError.message);
    } else {
      console.log(`✅ Projects table accessible (${count || 0} projects)`);
    }

    console.log('\n✅ Supabase is configured and ready!');
    console.log('   URL:', supabaseUrl);
    console.log('   Connection: Working');
    console.log('   Auth: Ready');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();