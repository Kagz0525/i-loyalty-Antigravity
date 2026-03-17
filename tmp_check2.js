import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oszuytcchfqclyrjuhmq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ozLY25gCI6-f45A_PMrr-A_4iXTKRI_";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function check() {
  console.log('--- All Profiles ---');
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log(profiles);

  console.log('\n--- All Customers ---');
  const { data: customers } = await supabase.from('customers').select('*');
  console.log(customers);

  console.log('\n--- All Loyalty Records ---');
  const { data: lr } = await supabase.from('loyalty_records').select('*');
  console.log(lr);
}

check().catch(console.error);
