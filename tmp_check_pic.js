import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oszuytcchfqclyrjuhmq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ozLY25gCI6-f45A_PMrr-A_4iXTKRI_";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

supabase.from('profiles').select('profile_pic').limit(1)
  .then(res => console.log('Result:', res))
  .catch(console.error);
