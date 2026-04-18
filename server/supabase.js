const { createClient } = require('@supabase/supabase-js');

let supabase = null;
if (process.env.SUPABASE_URL && 
    process.env.SUPABASE_ANON_KEY && 
    process.env.SUPABASE_URL.trim() !== '' && 
    process.env.SUPABASE_URL.trim() !== 'your_supabase_url' &&
    process.env.SUPABASE_ANON_KEY.trim() !== '' &&
    process.env.SUPABASE_ANON_KEY.trim() !== 'your_supabase_anon_key') {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

module.exports = supabase;
