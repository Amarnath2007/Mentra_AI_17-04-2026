const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('User first record keys:', data ? Object.keys(data[0]) : 'No data');
  console.log('Full user data:', data ? data[0] : 'No data');
}

check();
