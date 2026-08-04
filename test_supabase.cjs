const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://oszuytcchfqclyrjuhmq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ozLY25gCI6-f45A_PMrr-A_4iXTKRI_";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function test() {
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    console.log('Data:', data);
    console.log('Error:', error);
  } catch(e) {
    console.log('Exception:', e);
  }
}
test();
