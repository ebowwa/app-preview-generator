const { createClient } = require('@supabase/supabase-js');

// Use environment variables from Doppler
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('Key:', supabaseAnonKey ? 'Set' : 'Missing');
  process.exit(1);
}

console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('Checking available tables...\n');

  const tableNames = [
    'projects',
    'app_projects',
    'profiles',
    'app_profiles',
    'user_preferences',
    'project_shares',
    'activity_log',
    'app_project_versions',
    'app_project_likes',
    'app_project_comments'
  ];

  let foundAny = false;

  for (const table of tableNames) {
    try {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${table}: Table does not exist`);
        } else {
          console.log(`❌ ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: Accessible (${count || 0} records)`);
        foundAny = true;
      }
    } catch (err) {
      console.log(`❌ ${table}: Error - ${err.message}`);
    }
  }

  if (!foundAny) {
    console.log('\n⚠️  No tables found. The database schema may not be set up yet.');
    console.log('   Run the SQL files in /v002/supabase/ to create the tables.');
  }
}

checkTables();